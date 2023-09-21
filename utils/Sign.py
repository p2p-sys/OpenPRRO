import hmac
import json
import os
import socket
from struct import pack, unpack_from

from config import REMOTE_SIGNER_SERVER_KEY, REMOTE_SIGNER_SERVER


class OperationError(Exception):
    def __init__(self, code):
        self.code = code


class ProtocolError(Exception):
    pass


class Connection:

    def __init__(self, socket, key):
        self.socket = socket
        self.key = key
        self.ohmac = hmac.new(key, digestmod='sha256')
        self.ihmac = hmac.new(key, digestmod='sha256')
        self.CONTROL_LEN = 32
        self.TYPES = {
            0x04: 'octstr',
            0x13: 'printstr',
            'printstr': 0x13,
            'octstr': 0x04
        }

    def reset_ohmac(self):
        digest = self.ohmac.digest()
        self.ohmac = hmac.new(self.key, digestmod='sha256')
        self.ohmac.update(digest)
        return digest

    def reset_ihmac(self):
        digest = self.ihmac.digest()
        self.ihmac = hmac.new(self.key, digestmod='sha256')
        self.ihmac.update(digest)
        return digest

    def encode_len(self, type_name, byte_len):
        type_code = self.TYPES[type_name]
        if byte_len < 0x80:
            return pack('BB', type_code, byte_len)
        if byte_len < 0x100:
            return pack('BBB', type_code, 0x81, byte_len)

        if byte_len < 0x10000:
            return pack('BBBB', type_code, 0x82, byte_len >> 8, byte_len & 0xFF)

        if byte_len < 0x1000000:
            return pack('BBBBB', type_code, 0x83, byte_len >> 16, (byte_len >> 8) & 0xFF, byte_len & 0xFF)

        raise ProtocolError('Length is too big {}'.format(byte_len))

    def read_header(self, read):
        (typ_code, byte_len) = unpack_from('BB', read(2))
        if (byte_len & 0x80) > 0:
            oct_len = byte_len ^ 0x80
            byte_len = 0
            off = 2
            while oct_len > 0:
                byte_len = byte_len << 8
                (len_byte,) = unpack_from('B', read(1))
                oct_len = oct_len - 1
                byte_len = byte_len | len_byte

        return self.TYPES.get(typ_code), byte_len

    def command(self, type_name, buf):

        header = self.encode_len(type_name, len(buf))
        self.ohmac.update(header)
        self.ohmac.update(buf)
        # print(header)
        # print(buf)
        self.socket.send(header)
        self.socket.send(buf)
        self.socket.send(self.reset_ohmac())

    def send_content(self, data):
        return self.command('octstr', data)

    def read_json(self, expect_op):
        type_name, response_body = self.read_type()
        # print(type_name, response_body)
        if type_name != 'printstr':
            raise ProtocolError('Unexpected data response, expect json')
        data = json.loads(response_body.decode('utf8'))
        # data = json.dumps(data, indent=4, sort_keys=True)
        # data = json.dump(item, writeJSON, ensure_ascii=False).encode('utf-8')
        # print(response_body.decode())
        # print(data)
        if data['op'] == 'ERROR':
            raise OperationError(data['code'])
        if data['op'] != expect_op:
            raise ProtocolError('Unexpected response op', data['op'])

        return data

    def command_json(self, data):
        # print(json.dumps(data).encode('utf8'))
        return self.command('printstr', json.dumps(data).encode('utf8'))

    def unpack_key(self, contents, password):
        self.send_content(contents)
        self.command_json({"op": "UNPROTECT", 'password': password})
        ret = self.read_json('CLEAR')
        return ret['keys']

    def read_type(self):
        def read(count):
            ret = b''
            while count > 0:
                part = self.socket.recv(count)
                self.ihmac.update(part)
                count -= len(part)
                ret += part
            return ret

        (type_name, byte_len) = self.read_header(read)
        data = read(byte_len)
        # control = self.socket.recv(self.CONTROL_LEN)
        control = b''
        while len(control) < self.CONTROL_LEN:
            control += self.socket.recv(self.CONTROL_LEN - len(control))

        dgst = self.reset_ihmac()
        if not hmac.compare_digest(control, dgst):
            raise ProtocolError('HMAC')

        return (type_name, data)

    def init_box(self):
        self.command_json({"op": "INIT"})
        return self.read_json('CREATED')['bid']

    def add_key(self, bid, contents, password=None):
        self.send_content(contents)
        self.command_json({"op": "ADD_KEY", 'password': password, 'bid': bid})
        self.read_json('DONE')

    def add_cert(self, bid, contents):
        self.send_content(contents)
        self.command_json({"op": "ADD_CERT", 'bid': bid})
        self.read_json('DONE')

    def read_data(self):
        type_name, response_body = self.read_type()
        if type_name == 'printstr':
            data = json.loads(response_body.decode('utf8'))
            if data['op'] == 'ERROR':
                raise OperationError(data['code'])
            else:
                raise ProtocolError('Unexpected json response, expected data', data['op'])

        return response_body

    def info(self, bid):
        self.command_json({'op': 'INFO', 'bid': bid})
        certs = self.read_json('CERTS')
        self.read_json('READY')
        return certs['certs']

    def cert_fetch(self, bid, urls):
        self.command_json({'op': 'CMP', 'bid': bid, 'urls': urls})
        data = self.read_json('RCMP')
        # print('found', data)
        return data['number']

    def pipe(self, bid, content, pipe, headers=None):
        # print(pipe)
        self.send_content(content)
        if headers:
            self.command_json({"op": "PIPE", "pipe": pipe, 'bid': bid, "opts": headers})
        else:
            self.command_json({"op": "PIPE", "pipe": pipe, 'bid': bid})
        response = self.read_data()
        self.read_json('RPIPE')
        return response

    def unwrap(self, bid, content, ocsp=None, tsp=None):
        self.send_content(content)
        self.command_json({"op": "UNWRAP", 'bid': bid, 'opts': {'ocsp': ocsp, 'tsp': tsp}})
        response = self.read_data()
        meta = self.read_json('META')
        return response, meta

    def evict_box(self, bid):
        self.command_json({"op": "EVICT", 'bid': bid})
        return self.read_json('GONE')


class Sign(object):

    def __init__(self):

        mode = 'ip4'
        key = REMOTE_SIGNER_SERVER_KEY
        path = REMOTE_SIGNER_SERVER

        if mode == 'unix':
            DEFAULT_NAME = '.dstu-agent.sock'
            home = os.getenv('HOME', '/tmp/')
            default_path = os.path.join(home, DEFAULT_NAME)
            s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM);
            s.connect(path or default_path)
        elif mode == 'ip6':
            s = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
            (host, port) = path.rsplit(':') if (':' in path and not path.startswith('[')) else (None, path)
            s.connect((host or '::', int(port) if port else 3100))
        else:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(30.0)
            (host, port) = path.rsplit(':') if (':' in path) else (None, path)
            try:
                s.connect((host or '127.0.0.1', int(port) if port else 3100))
            except Exception as e:
                raise ProtocolError('Connect to cryptoserver error: {}'.format(e))

        self.cn = Connection(s, bytes.fromhex(key) if key else (b'\x00' * 32))

        self.box_id = None
        self.key_content = None
        self.cert1_content = None
        self.cert2_content = None

    def update_bid(self, db, key):

        try:

            if key.key_content and key.cert1_content:

                if key.encrypt_content:
                    self.box_id = self.add_keys(
                        [key.key_content.encode('latin1'), key.encrypt_content.encode('latin1')])
                else:
                    self.box_id = self.add_key(key.key_content.encode('latin1'))

                if key.cert1_content:
                    self.add_cert(self.box_id, key.cert1_content.encode('latin1'))

                if key.cert2_content:
                    self.add_cert(self.box_id, key.cert2_content.encode('latin1'))

                return self.box_id

            else:

                if key.key_data and key.key_password:
                    self.box_id = self.add_key(key.key_data, key.key_password)
                    if key.cert1_data:
                        self.add_cert(self.box_id, key.cert1_data)

                    if key.cert2_data:
                        self.add_cert(self.box_id, key.cert2_data)

                    return self.box_id

                else:
                    print('CryproError update_bid no key/password data')
                    raise Exception('{}'.format(
                        'Помилка ключа криптографії'))

        except Exception as e:
            print('CryproError update_bid {}'.format(e))
            raise Exception('{}'.format(
                'Помилка ключа криптографії, можливо надані невірні сертифікати або пароль, або минув термін ключа'))

    def set_box_id(self, box_id):
        self.box_id = box_id

    def set_key_content(self, key_content):
        self.key_content = key_content

    def set_cert1_content(self, cert1_content):
        self.cert1_content = cert1_content

    def set_cert2_content(self, cert2_content):
        self.cert2_content = cert2_content

    def get_key_content_from_file(self, key_path, password):
        keys = self.cn.unpack_key(**self.read_key1(key_path, password))
        return keys[0]['contents'].encode('latin1')

    def get_key_content(self, content, password):
        keys = self.cn.unpack_key(**self.read_key_from_content(content, password))
        return keys[0]['contents'].encode('latin1')

    def get_key_contents(self, content, password):
        keys = self.cn.unpack_key(**self.read_key_from_content(content, password))
        return keys

    def get_box_id_from_files(self, key_content, certpath1, certpath2):

        box_id = self.cn.init_box()
        self.cn.add_key(box_id, key_content)

        certs = self.read_certs(certpath1, certpath2)
        self.cn.add_cert(box_id, certs[0])

        # for cert in self.read_certs(certpath1, certpath2):
        #     self.cn.add_cert(bid, cert)
        #     break

        return box_id

    def get_box_id(self, key_content, cert1_file_content, cert2_file_content):

        box_id = self.cn.init_box()
        self.cn.add_key(box_id, key_content)

        if cert1_file_content:
            self.cn.add_cert(box_id, cert1_file_content)

        if cert2_file_content:
            self.cn.add_cert(box_id, cert2_file_content)

        # for cert in self.read_certs(certpath1, certpath2):
        #     self.cn.add_cert(bid, cert)
        #     break

        return box_id

    def add_key(self, key_content, password=None):

        box_id = self.cn.init_box()
        self.cn.add_key(box_id, key_content, password)

        return box_id

    def add_keys(self, keys):

        box_id = self.cn.init_box()
        for key in keys:
            self.cn.add_key(box_id, key)

        return box_id

    def add_cert(self, box_id, cert1):
        self.cn.add_cert(box_id, cert1)

    def add_certs(self, box_id, cert1, cert2=None):
        self.cn.add_cert(box_id, cert1)
        if cert2:
            self.cn.add_cert(box_id, cert2)

    def get_role(self, box_id, roles=None):

        if not roles:
            roles = ['fop', 'director', 'stamp', 'corporate', 'personal', 'other']

        for role in roles:
            try:
                self.cn.pipe(box_id, b'test',
                             [{"op": "sign", "role": role, "tax": False}])  # , "role": "stamp"  , "tsp": "signature"
                return role

            except Exception as e:
                print(e)
                pass

        return False

    def get_roles(self, box_id):

        roles = [{'role': 'fop', 'description': 'ФОП'},
                 {'role': 'director', 'description': 'Директор'},
                 {'role': 'stamp', 'description': 'Печатка'},
                 {'role': 'corporate', 'description': 'Корпоративний'},
                 {'role': 'personal', 'description': 'Особистий'},
                 {'role': 'other', 'description': 'Інше'}]

        roles_arr = []

        for role in roles:
            try:
                self.cn.pipe(box_id, b'test',
                             [{"op": "sign", "role": role['role'], "tax": False}])
                roles_arr.append(role)

            except Exception as e:
                print(e)
                pass

        return roles_arr

    def check_role(self, box_id, role):

        unsigned_data = b'test'
        # print(role)
        try:
            # print(unsigned_data)
            signed_data = self.cn.pipe(box_id, unsigned_data, [
                {"op": "sign", "role": role, "tax": False}])  # , "role": "stamp"  , "tsp": "signature"
            rdata, meta = self.cn.unwrap(box_id, signed_data, ocsp=None)
            # print(role, rdata, unsigned_data)
            return rdata == unsigned_data

        except Exception as e:
            return False

    def sign(self, box_id, unsigned_data, role=None, tax=False, tsp=False, ocsp=False):
        try:
            return self.cn.pipe(box_id, unsigned_data,
                                [{"op": "sign", "role": role, "tax": tax, "tsp": tsp, "ocsp": ocsp}])

        except ProtocolError as e:
            # print(str(e))
            return self.cn.pipe(box_id, unsigned_data,
                                [{"op": "sign", "role": role, "tax": tax, "tsp": tsp, "ocsp": ocsp}])

    def encrypt(self, box_id, unsigned_data, role=None, tax=False, tsp=False, ocsp=False):
        return self.cn.pipe(box_id, unsigned_data,
                            [{"op": "encrypt", "role": role, "tax": tax, "tsp": tsp, "ocsp": ocsp}])

    def tax_encrypt(self, box_id, unsigned_data, role=None, tax=True, cert=None, headers=None, tsp=False,
                    ocsp=False):
        try:
            return self.cn.pipe(box_id, unsigned_data, [{"op": "sign", "role": role, "tax": tax, "tsp": tsp, "ocsp": ocsp},
                                                        {"op": "encrypt", "role": role, "forCert": cert, "addCert": True,
                                                         "tax": tax},
                                                        {"op": "sign", "role": role, "tax": tax, "tsp": tsp, "ocsp": ocsp}],
                                headers)
        except Exception as e:
            raise Exception('Помилка бібліотеки криптографії під час шифрування документа: {}'.format(e))

    def unwrap(self, box_id, signed_data, tsp=None, ocsp=None):
        try:
            rdata, meta = self.cn.unwrap(box_id, signed_data, ocsp=ocsp, tsp=tsp)
            return rdata, meta
        except ProtocolError as e:
            # print(str(e))
            rdata, meta = self.cn.unwrap(box_id, signed_data, ocsp=ocsp, tsp=tsp)
            return rdata, meta

    def info(self, box_id):
        return self.cn.info(box_id)

    def cert_fetch(self, box_id, urls=None):
        if not urls:
            urls = []

        return self.cn.cert_fetch(box_id, urls)

    def evict_box(self, box_id):
        return self.cn.evict_box(box_id)

    @staticmethod
    def read_key1(path, password):
        with open(path, 'rb') as key_file:
            return {'password': password, 'contents': key_file.read()}

    @staticmethod
    def read_key_from_content(content, password):
        return {'password': password, 'contents': content}

    @staticmethod
    def read_certs(certpath1, certpath2):
        with open(certpath1, 'rb') as cert_file:
            cert1 = cert_file.read()

        with open(certpath2, 'rb') as cert_file:
            cert2 = cert_file.read()

        return [cert1, cert2]

    def unpack_key(self, content, password):
        return self.cn.unpack_key(content, password)
