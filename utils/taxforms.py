import base64
import json
from datetime import datetime

from lxml import etree
from lxml.builder import ElementMaker
import requests

from models import db
from utils.Sign import Sign


class TaxForms(object):

    def __init__(self, signer=None, company_key=None):

        if not signer:
            self.signer = Sign()
        else:
            self.signer = signer

        self.company_key = company_key

        self.TAX_EMAIL = '{}@tax.gov.ua'.format(company_key.edrpou)

        self.EDRPOU = self.company_key.edrpou

        if self.company_key.taxform_count:
            if self.company_key.taxform_count < 100000:
                self.company_key.taxform_count = 100000

        else:
            self.company_key.taxform_count = 100000

        self.company_key.taxform_count = self.company_key.taxform_count + 1

        db.session.commit()

        self.doc_cnt = company_key.taxform_count

    @staticmethod
    def get_send_xml(filename, signer_email, base64data):

        SOAP_ENV = "http://www.w3.org/2003/05/soap-envelope"
        XSD = "http://www.w3.org/2001/XMLSchema"
        XSI = "http://www.w3.org/2001/XMLSchema-instance"

        soap = ElementMaker(namespace=SOAP_ENV,
                            nsmap={
                                'xsi': XSI,
                                'xsd': XSD,
                                'soap12': SOAP_ENV,
                            })

        command = etree.Element("Send", {'xmlns': 'http://govgate/'})

        fileName = etree.SubElement(command, "fileName")
        fileName.text = filename

        senderEMail = etree.SubElement(command, "senderEMail")
        senderEMail.text = signer_email

        data = etree.SubElement(command, "data")
        data.text = base64data

        envelope = soap.Envelope(
            soap.Body(command)
        )

        xml_declaration = """<?xml version="1.0" encoding="utf-8"?>\n"""
        xml = xml_declaration + etree.tostring(envelope, xml_declaration=False, pretty_print=True,
                                               encoding='utf-8').decode('utf-8')

        print(xml)

        return xml.encode('utf-8')

    @staticmethod
    def get_receive_all_xml(signed_email, need_delete):

        need_delete = int(need_delete)

        SOAP_ENV = "http://www.w3.org/2003/05/soap-envelope"
        XSD = "http://www.w3.org/2001/XMLSchema"
        XSI = "http://www.w3.org/2001/XMLSchema-instance"

        soap = ElementMaker(namespace=SOAP_ENV,
                            nsmap={
                                'xsi': XSI,
                                'xsd': XSD,
                                'soap12': SOAP_ENV,
                            })

        command = etree.Element("ReceiveAll", {'xmlns': 'http://govgate/'})

        signedEmail = etree.SubElement(command, "signedEmail")  # base64Binary
        signedEmail.text = signed_email

        needDelete = etree.SubElement(command, "needDelete")
        needDelete.text = str(need_delete)  # unsignedByte

        envelope = soap.Envelope(
            soap.Body(command)
        )

        xml_declaration = """<?xml version="1.0" encoding="utf-8"?>\n"""
        xml = xml_declaration + etree.tostring(envelope, xml_declaration=False, pretty_print=True,
                                               encoding='utf-8').decode('utf-8')
        # print(xml)

        return xml.encode('utf-8')

    @staticmethod
    def get_messages_xml(signed_EDRPOU):

        SOAP_ENV = "http://www.w3.org/2003/05/soap-envelope"
        XSD = "http://www.w3.org/2001/XMLSchema"
        XSI = "http://www.w3.org/2001/XMLSchema-instance"

        soap = ElementMaker(namespace=SOAP_ENV,
                            nsmap={
                                'xsi': XSI,
                                'xsd': XSD,
                                'soap12': SOAP_ENV,
                            })

        command = etree.Element("GetMessages", {'xmlns': 'http://govgate/'})

        signedEDRPOU = etree.SubElement(command, "signedEDRPOU")  # base64Binary
        signedEDRPOU.text = signed_EDRPOU

        envelope = soap.Envelope(
            soap.Body(command)
        )

        xml_declaration = """<?xml version="1.0" encoding="utf-8"?>\n"""
        xml = xml_declaration + etree.tostring(envelope, xml_declaration=False, pretty_print=True,
                                               encoding='utf-8').decode('utf-8')
        # print(xml)

        return xml.encode('utf-8')

    def get_messages_ex_xml(self, signed_EDRPOU):

        SOAP_ENV = "http://www.w3.org/2003/05/soap-envelope"
        XSD = "http://www.w3.org/2001/XMLSchema"
        XSI = "http://www.w3.org/2001/XMLSchema-instance"

        soap = ElementMaker(namespace=SOAP_ENV,
                            nsmap={
                                'xsi': XSI,
                                'xsd': XSD,
                                'soap12': SOAP_ENV,
                            })

        command = etree.Element("GetMessagesEx", {'xmlns': 'http://govgate/'})

        signedEDRPOU = etree.SubElement(command, "signedEDRPOU")  # base64Binary
        signedEDRPOU.text = signed_EDRPOU

        senderEmail = etree.SubElement(command, "senderEmail")  # base64Binary
        senderEmail.text = self.TAX_EMAIL

        envelope = soap.Envelope(
            soap.Body(command)
        )

        xml_declaration = """<?xml version="1.0" encoding="utf-8"?>\n"""
        xml = xml_declaration + etree.tostring(envelope, xml_declaration=False, pretty_print=True,
                                               encoding='utf-8').decode('utf-8')

        return xml.encode('utf-8')

    @staticmethod
    def get_delete_xml(signed_id):

        SOAP_ENV = "http://www.w3.org/2003/05/soap-envelope"
        XSD = "http://www.w3.org/2001/XMLSchema"
        XSI = "http://www.w3.org/2001/XMLSchema-instance"

        soap = ElementMaker(namespace=SOAP_ENV,
                            nsmap={
                                'xsi': XSI,
                                'xsd': XSD,
                                'soap12': SOAP_ENV,
                            })

        command = etree.Element("Delete", {'xmlns': 'http://govgate/'})

        signedMsgId = etree.SubElement(command, "signedMsgId")  # base64Binary
        signedMsgId.text = signed_id

        envelope = soap.Envelope(
            soap.Body(command)
        )

        xml_declaration = """<?xml version="1.0" encoding="utf-8"?>\n"""
        xml = xml_declaration + etree.tostring(envelope, xml_declaration=False, pretty_print=True,
                                               encoding='utf-8').decode('utf-8')

        return xml.encode('utf-8')

    @staticmethod
    def get_receive_xml(signed_id):

        SOAP_ENV = "http://www.w3.org/2003/05/soap-envelope"
        XSD = "http://www.w3.org/2001/XMLSchema"
        XSI = "http://www.w3.org/2001/XMLSchema-instance"

        soap = ElementMaker(namespace=SOAP_ENV,
                            nsmap={
                                'xsi': XSI,
                                'xsd': XSD,
                                'soap12': SOAP_ENV,
                            })

        command = etree.Element("Receive", {'xmlns': 'http://govgate/'})

        signedMsgId = etree.SubElement(command, "signedMsgId")  # base64Binary
        signedMsgId.text = signed_id

        envelope = soap.Envelope(
            soap.Body(command)
        )

        xml_declaration = """<?xml version="1.0" encoding="utf-8"?>\n"""
        xml = xml_declaration + etree.tostring(envelope, xml_declaration=False, pretty_print=True,
                                               encoding='utf-8').decode('utf-8')

        return xml.encode('utf-8')

    @staticmethod
    def post_data(data):
        url = 'http://soap.tax.gov.ua/WebSrvGate/gate.asmx'
        headers = {'Content-Type': 'application/soap+xml; charset=utf-8'}

        # with open('send_data.raw', 'wb') as file:
        #     file.write(data)

        try:
            answer = requests.post(url, data=data, headers=headers)
            if answer.status_code == 200:
                return answer.content
            else:
                return False

        except Exception as e:
            raise Exception('Помилка: {}'.format(e))

    def tax_get_messages(self, m):

        box_id = self.signer.get_box_id(m.key_content.encode(), m.cert1_data, m.cert2_data)
        # signed_EDRPOU = self.signer.sign(box_id, '{:010.0f}'.format(int(EDRPOU)).encode('windows-1251'), "director", True)
        signed_EDRPOU = self.signer.sign(box_id, self.EDRPOU.encode('windows-1251'), "director", True)

        signed_EDRPOU_base64 = base64.b64encode(signed_EDRPOU)

        xml = self.get_messages_xml(signed_EDRPOU_base64)

        print(xml.decode('windows-1251'))

        answer = self.post_data(xml)

        print(answer.decode('windows-1251'))

        root = etree.fromstring(answer)

        status = root.find(".//{http://govgate/}GetMessagesResult")
        if status.text == 'GATE_OK':
            messages = root.find(".//{http://govgate/}GetMessagesResponse").xpath(
                '//*[local-name()="string"]')

            ret_messages = []
            for message in messages:
                print(message.text)
                ret_messages.append(message.text)

            return ret_messages
        else:
            return False

    def tax_get_messages_ex(self, m):

        box_id = self.signer.get_box_id(m.key_content.encode(), m.cert1_data, m.cert2_data)
        signed_EDRPOU = self.signer.sign(box_id, '{:010.0f}'.format(int(self.EDRPOU)).encode('windows-1251'),
                                         "director",
                                         True)

        signed_EDRPOU_base64 = base64.b64encode(signed_EDRPOU)

        # signed_email = self.signer.sign(box_id, TAX_EMAIL.encode('windows-1251'), "director", True)

        # signed_email_base64 = base64.b64encode(signed_email)

        xml = self.get_messages_ex_xml(signed_EDRPOU_base64)

        print(xml.decode('windows-1251'))

        answer = self.post_data(xml)

        print(answer.decode('windows-1251'))

        root = etree.fromstring(answer)

        status = root.find(".//{http://govgate/}GetMessagesExResult")
        if status.text == 'GATE_OK':
            messages = root.find(".//{http://govgate/}GetMessagesExResponse").xpath(
                '//*[local-name()="string"]')

            ret_messages = []
            for message in messages:
                print(message.text)
                ret_messages.append(message.text)

            return ret_messages
        else:
            return False

    def tax_delete(self, m, id):

        try:
            signed_id = self.signer.sign(self.company_key.box_id, str(id).encode('windows-1251'),
                                         role=self.company_key.key_role, tax=True)
        except Exception as e:
            box_id = self.signer.update_bid(db, self.company_key)
            signed_id = self.signer.sign(box_id, str(id).encode('windows-1251'), role=self.company_key.key_role,
                                         tax=True)
            self.company_key.box_id = box_id
            db.session.commit()

        signed_id_base64 = base64.b64encode(signed_id)

        xml = self.get_delete_xml(signed_id_base64)

        answer = self.post_data(xml)

        root = etree.fromstring(answer)

        status = root.find(".//{http://govgate/}DeleteResponse")
        if status.text == 'GATE_OK':
            return True
        else:
            return False

    def tax_receive_all(self, need_delete=True):

        try:
            signed_email = self.signer.sign(self.company_key.box_id, self.TAX_EMAIL.encode('windows-1251'),
                                            role=self.company_key.key_role, tax=True)
        except Exception as e:
            box_id = self.signer.update_bid(db, self.company_key)
            signed_email = self.signer.sign(box_id, self.TAX_EMAIL.encode('windows-1251'),
                                            role=self.company_key.key_role, tax=True)
            self.company_key.box_id = box_id
            db.session.commit()

        signed_email_base64 = base64.b64encode(signed_email)

        xml = self.get_receive_all_xml(signed_email_base64, need_delete)

        # with open('receive_all.txt', 'wb') as file:
        #     file.write(xml)

        answer = self.post_data(xml)

        # with open('receive_all_answer.txt', 'wb') as file:
        #     file.write(answer)

        root = etree.fromstring(answer)

        status = root.find(".//{http://govgate/}ReceiveAllResult")
        print(status.text)
        if status.text == 'GATE_OK':
            # messages = root.find(".//{http://govgate/}messages")

            messages = root.find(".//{http://govgate/}messages").xpath(
                '//*[local-name()="body"]')

            ret_messages = []
            for message in messages:

                message = base64.b64decode(message.text)
                s = message.find(b'TRANSPORTABLE')
                answer = message[s:]

                print(message)
                print('end message')

                # with open('receive_all_answer_b64decode_before_uwwrap.signed', 'wb') as file:
                #     file.write(answer)
                try:
                    (result, meta) = self.signer.unwrap(self.company_key.box_id, answer)
                except:
                    continue

                # with open('receive_all_answer_b64decode_unwrap2.txt', 'wb') as file:
                #     file.write(result)

                # print('result={}'.format(result.decode('windows-1251')))

                # filename = ''

                try:
                    filename = meta['meta']['pipe'][0]['headers']['FILENAME']
                except:
                    filename = ''

                try:
                    form_status = int(meta['meta']['pipe'][0]['headers']['RESULT'])
                except:
                    form_status = 0

                try:
                    status = meta['meta']['pipe'][0]['headers']['SUBJECT'].encode('ISO-8859-1').decode('windows-1251')
                except:
                    status = ''

                try:
                    if 'xml' in result.decode('windows-1251'):
                        try:

                            root = etree.fromstring(result)

                            status = ''

                            hdocname = root.find(".//DECLARBODY//HDOCNAME")
                            if hdocname.text:
                                status = '{} {}'.format(status, hdocname.text)

                            hresult = root.find(".//DECLARBODY//HRESULT")
                            if hresult.text:
                                status = '{} {}'.format(status, hresult.text)

                            HFILENAME = root.find(".//DECLARBODY//HFILENAME")
                            if HFILENAME.text:
                                filename = '{}'.format(HFILENAME.text)

                            text = root.find(".//DECLARBODY//TEXT")
                            # if text is not None:
                            if text.text:
                                # if 'інфографіки,' not in text.text and 'ДПС повідомляє про' in text.text:
                                txt = text.text
                                advpos = txt.find('Ексклюзивні')
                                if advpos > -1:
                                    status = '{} {}'.format(status, txt[:advpos])

                            t1 = root.findall(".//DECLARBODY//T1RXXXXG1S")

                            if t1 is not None:
                                for t in t1:
                                    # print(t.text)
                                    if t.text:
                                        status = '{} {}'.format(status, t.text)

                        except:
                            status = result.decode('windows-1251')
                    else:
                        status = result.decode('windows-1251')
                        filename_pos = answer.find(b'FILENAME=')
                        if filename_pos > -1:
                            filename = answer[filename_pos + 9:]
                            filename_end_pos = filename.find(b'.XML\r\n')
                            filename = filename[:filename_end_pos + 4]
                            filename = filename.decode('windows-1251')

                        s = status.find('Файл оброблений')
                        if s > -1:
                            status = status[s:]

                    print('status={}'.format(status))

                    if status.find('ДОКУМЕНТ НЕ ПРИЙНЯТО') > -1:
                        form_status = -1
                    elif status.find('ДОКУМЕНТ ПРИЙНЯТО') > -1 or status.find('Документ опрацьовано') > -1:
                        form_status = 1
                    else:
                        form_status = 0

                    # lines = answer.strip('\r\n')
                    # for line in lines:
                    #     print(line)
                    status = status.strip()
                    if 'призначено фіскальний номер' in status:
                        str_arr = status.split("'")
                        # print(str_arr)
                        local_id = str_arr[3].strip()
                        rro_id = str_arr[5].strip()
                        # message['rro_id'] = rro_id
                        ret_messages.append(
                            {'filename': filename, 'message': status, 'status': form_status, 'local_id': int(local_id),
                             'rro_id': int(rro_id)})
                    elif 'з фіскальним номером' in status:
                        str_arr = status.split("'")
                        # print(str_arr)
                        # local_id = str_arr[3].strip()
                        rro_id = str_arr[1].strip()
                        # message['rro_id'] = rro_id
                        ret_messages.append(
                            {'filename': filename, 'message': status, 'status': form_status, 'rro_id': int(rro_id)})
                    else:
                        ret_messages.append({'filename': filename, 'message': status, 'status': form_status})
                except:
                    ret_messages.append({'filename': filename, 'message': status, 'status': form_status})

            return ret_messages

        else:
            return False

    def tax_receive(self, m, id):

        box_id = self.signer.get_box_id(m.key_content.encode(), m.cert1_data, m.cert2_data)

        signed_id = self.signer.sign(box_id, str(id).encode('windows-1251'), "director", True)

        signed_id_base64 = base64.b64encode(signed_id)

        xml = self.get_receive_xml(signed_id_base64)

        answer = self.post_data(xml)

        print(answer)

        root = etree.fromstring(answer)

        status = root.find(".//{http://govgate/}ReceiveAllResponse")
        print(status.text)
        if status.text == 'GATE_OK':
            return True
        else:
            return False

    def tax_send(self, form_xml, email, filename):

        # openssl x509 -inform der -in STS_2021_1.cer -out certificate1.pem
        # openssl x509 -inform der -in STS_2021_2.cer -out certificate2.pem
        key247221_pem = './utils/certificate2.pem'
        with open(key247221_pem, "r") as file:
            key247221_pem_cert = file.read()

        headers = {
            'PRG_TYPE': 'OpenPRRO',
            'PRG_VER': "20220204",
            'CERTYPE': 'UA1',
            'RCV_NAME': 'test',
            'FILENAME': filename,
            'EDRPOU': self.company_key.edrpou,
            'ENCODING': 'WIN'
        }
        # print(headers)

        # with open('{}'.format(filename), 'wb') as file:
        #     file.write(form_xml)

        # encrypted_form_xml = self.signer.tax_encrypt(box_id, form_xml, self.company_key.key_role, True, cert=key247221_pem_cert,
        #                                              headers=headers)

        try:
            # print(key247221_pem_cert)
            # print(form_xml)
            encrypted_form_xml = self.signer.tax_encrypt(self.company_key.box_id, form_xml,
                                                         role=self.company_key.key_role, tax=True,
                                                         cert=key247221_pem_cert,
                                                         headers=headers, tsp="all", ocsp=False)
        except Exception as e:
            print(e)
            box_id = self.signer.update_bid(db, self.company_key)
            self.company_key.box_id = box_id
            db.session.commit()
            encrypted_form_xml = self.signer.tax_encrypt(box_id, form_xml, role=self.company_key.key_role, tax=True,
                                                         cert=key247221_pem_cert,
                                                         headers=headers, tsp="all", ocsp=False)

        # print(encrypted_form_xml)

        # with open('{}.signed'.format(filename), 'wb') as file:
        #     file.write(encrypted_form_xml)

        # filename = '26550034554363J1391802100000000711220212655.XML'
        # with open('1.xml.sign', "rb") as file:
        #     encrypted_form_xml = file.read()

        # print(encrypted_form_xml)
        # return False

        signed_form_xml_base64 = base64.b64encode(encrypted_form_xml)

        xml = self.get_send_xml(filename, email, signed_form_xml_base64)

        # with open('{}.signed.xml'.format(filename), 'wb') as file:
        #     file.write(xml)

        # print(xml.decode('windows-1251'))
        # answer = None

        # return True

        answer = self.post_data(xml)

        print(answer.decode('windows-1251'))

        root = etree.fromstring(answer)

        status = root.find(".//{http://govgate/}SendResult")
        print(status.text)
        if status.text == 'GATE_OK':
            return True
        else:
            return False

    def tax_send2(self, form_xml, email, filename):

        cert = './utils/certificate_ek_2.pem'
        with open(cert, "r") as file:
            cert = file.read()
            # key247221_pem_cert = base64.b64encode(key247221_pem_cert).decode()

        '''
         node index.js --sign --crypt EK_C_NEW.cer --key test-feb-3/privat_key.jks:Makas5299006   --input test-feb-3/02222672521631F1391103100000000110220220222.xml --upload_url https://cabinet.tax.gov.ua/cabinet/public/api/exchange/report --tax --tsp=signature  --filename "02272672521631F1391802100000001811220220227.XML"
         
        '''

        headers = {
            'PRG_TYPE': 'OpenPRRO',
            'PRG_VER': "20220204",
            'CERTYPE': 'UA1',
            'RCV_NAME': 'test',
            'FILENAME': filename,
            'EDRPOU': self.company_key.edrpou,
            'ENCODING': 'WIN'
        }

        try:
            encrypted_form_xml = self.signer.tax_encrypt(self.company_key.box_id, form_xml,
                                                         role=self.company_key.key_role, tax=True, cert=cert,
                                                         tsp='signature', ocsp=False)
        except Exception as e:
            box_id = self.signer.update_bid(db, self.company_key)
            encrypted_form_xml = self.signer.tax_encrypt(box_id, form_xml, role=self.company_key.key_role, tax=True,
                                                         cert=cert, tsp="signature", ocsp=False)
            self.company_key.box_id = box_id
            db.session.commit()

        FISCAL_API_HOST = 'https://cabinet.tax.gov.ua'

        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        signed_form_xml_base64 = base64.b64encode(encrypted_form_xml)
        print(signed_form_xml_base64.decode())

        # with open('{}'.format(filename), 'wb') as file:
        #     file.write(form_xml)
        #
        # with open('{}.signed'.format(filename), 'wb') as file:
        #     file.write(encrypted_form_xml)

        response = requests.post(
            '{}/cabinet/public/api/exchange/report'.format(FISCAL_API_HOST),
            json=[{'contentBase64': signed_form_xml_base64.decode(), 'fname': filename}],
            headers=headers,
            timeout=10
        )

        print(response.status_code)
        print(response.content)
        print(response.text)
        return True

        # url = 'http://soap.tax.gov.ua/WebSrvGate/gate.asmx'
        # headers = {'Content-Type': 'application/soap+xml; charset=utf-8'}
        #
        # try:
        #     answer = requests.post(url, data=data, headers=headers)
        #     # print(answer)
        #     # print(answer.status_code)
        #     # print(answer.content)
        #     # print(answer.text)
        #     if answer.status_code == 200:
        #         return answer.content
        #     else:
        #         return False
        #
        # except Exception as e:
        #     raise Exception('Помилка: {}'.format(e))

    def tax_infos(self, group=None, page=None, size=None):

        import requests

        from utils.Sign import Sign

        signer = Sign()

        tsp = False
        ocsp = False

        unsigned_data = self.company_key.edrpou.encode()

        try:
            signed_data = signer.sign(self.company_key.box_id, unsigned_data, role=self.company_key.key_role, tax=False,
                                      tsp=tsp, ocsp=ocsp)
        except Exception as e:
            box_id = signer.update_bid(db, self.company_key)
            signed_data = signer.sign(box_id, unsigned_data, role=self.company_key.key_role, tax=False,
                                      tsp=tsp, ocsp=ocsp)
            self.company_key.box_id = box_id
            db.session.commit()

        signed_data_base64 = base64.b64encode(signed_data)

        url = 'https://cabinet.tax.gov.ua/ws/public_api/payer_card'
        if group:
            url = '{}/{}?page='.format(url, group, page)

        if size:
            url = '{}&size={}'.format(url, size)

        headers = {
            'Content-Type': 'application/json',
            'Authorization': signed_data_base64,
            'Accept': 'application/json',
        }

        answer = requests.get(url, headers=headers, timeout=100)

        data = json.loads(answer.content.decode())

        if answer.status_code == 200:
            return data
        else:
            raise Exception('{}'.format(data['error_description']))

    def tax_reg_doc(self, period_year, period_month):

        import requests

        from utils.Sign import Sign

        signer = Sign()

        tsp = False
        ocsp = False

        unsigned_data = self.company_key.edrpou.encode()

        try:
            signed_data = signer.sign(self.company_key.box_id, unsigned_data, role=self.company_key.key_role, tax=False,
                                      tsp=tsp, ocsp=ocsp)
        except Exception as e:
            box_id = signer.update_bid(db, self.company_key)
            signed_data = signer.sign(box_id, unsigned_data, role=self.company_key.key_role, tax=False,
                                      tsp=tsp, ocsp=ocsp)
            self.company_key.box_id = box_id
            db.session.commit()

        signed_data_base64 = base64.b64encode(signed_data)

        url = 'https://cabinet.tax.gov.ua/ws/public_api/reg_doc/list?periodYear={}&periodMonth={}'.format(period_year,
                                                                                                          period_month)

        headers = {
            'Content-Type': 'application/json',
            'Authorization': signed_data_base64,
            'Accept': 'application/json',
        }

        answer = requests.get(url, headers=headers, timeout=100)

        data = json.loads(answer.content.decode())

        # print(data)

        if answer.status_code == 200:
            return data
        else:
            raise Exception('{}'.format(data['error_description']))

    def get_last_number(self, period_year, period_month, doc, doc_sub, doc_ver):

        answer = self.tax_reg_doc(period_year, period_month)

        doc_cnt = 0
        if 'content' in answer:
            content = answer['content']
            for report in content:
                if 'cDoc' in report:
                    if doc == report['cDoc']:
                        if 'cdocSub' in report:
                            if doc_sub == report['cdocSub']:
                                if 'cdocVer' in report:
                                    if doc_ver == report['cdocVer']:
                                        print(report)
                                        if 'cdocCnt' in report:
                                            c_doc_cnt = report['cdocCnt']
                                            # print(c_doc_cnt)
                                            if c_doc_cnt > doc_cnt:
                                                doc_cnt = c_doc_cnt

        doc_cnt += 1

        return doc_cnt

    def send_5PRRO(self, public_key, T1RXXXXG4S_text=None):
        # https://tax.gov.ua/data/material/000/103/154157/Forms_servis_yur.htm
        # J1391802

        if 'ФОП' in self.company_key.name:
            doc = 'F13'
            xsdname = 'F1391802.xsd'
        else:
            doc = 'J13'
            xsdname = 'J1391802.xsd'

        data = self.tax_infos(2)

        C_STI_MAIN = data["values"][0]["C_STI_MAIN"]

        TAX_OBL = str(C_STI_MAIN)[:-2]
        if len(TAX_OBL) == 1:
            TAX_OBL = '0{}'.format(TAX_OBL)

        TAX_RAYON = str(C_STI_MAIN)[-2:]

        # department = Departments.query.get(m.department_id)

        dt = datetime.now()
        doc_date = dt.strftime("%d%m%Y")  # ddmmyyyy
        doc_mounth = dt.strftime("%m")
        doc_year = dt.strftime("%Y")

        doc_sub = '918'

        doc_ver = 2

        doc_stan = 1

        doc_type = 0

        # doc_cnt = self.get_last_number(doc_year, doc_mounth, doc, doc_sub, doc_ver)
        doc_cnt = self.doc_cnt

        period_type = 1

        # 2655 0039628794 J1391801 1 00000008 31122020 2655.XML
        # '{:010.0f}'.format(int(EDRPOU))
        '''
            1-4	C_REG C_RAJ	Код ГНИ получателя.
            5-14	TIN	Номер ЄДРПОУ, серия-номер паспорта. Дополняется слева нулями до 10 знаков.
            5-17	C_DOC	Код документа.
            18-20	C_DOC_SUB	Подтип документа
            21-22	C_DOC_VER	Номер версии документа. Дополняется слева нулями до 2 знаков.
            23	C_DOC_STAN	Состояние документа.
            24-25	C_DOC_TYPE	Номер нового отчётного (уточняющего) док-та в отчётном периоде. Дополняется слева нулями до 2 знаков
            26-32	C_DOC_CNT	Номер документа в периоде. Дополняется слева нулями до 7 знаков.
            33	PERIOD_TYPE	Код отчётного периода (1-месяц, 2-квартал, 3-полугодие, 4-девять мес., 5-год).
            34-35	PERIOD_MONTH	Отчётный месяц. Дополняется слева нулями до 2 знаков.
            36-39	PERIOD_YEAR	Отчётный год.
            40-43	C_STI_ORIG	Код инспекции, в которую подаётся оригинал документа
            44-47	.xml	Расширение файла.
        '''

        filename = '{}{}{:010.0f}{}{}{:02.0f}{}{:02.0f}{:07.0f}{}{:02.0f}{}{}{}.XML'.format(
            TAX_OBL,  # 1-2	C_REG 	Код ГНИ получателя.
            TAX_RAYON,  # 3-4	C_RAJ	Код ГНИ получателя.
            int(self.company_key.edrpou),
            # 5-14	TIN	Номер ЄДРПОУ, серия-номер паспорта. Дополняется слева нулями до 10 знаков.
            doc,  # 5-17	C_DOC	Код документа.
            doc_sub,  # 18-20	C_DOC_SUB	Подтип документа
            doc_ver,  # 21-22	C_DOC_VER	Номер версии документа. Дополняется слева нулями до 2 знаков.
            doc_stan,  # 23	C_DOC_STAN	Состояние документа.
            doc_type,
            # 24-25	C_DOC_TYPE	Номер нового отчётного (уточняющего) док-та в отчётном периоде. Дополняется слева нулями до 2 знаков
            doc_cnt,  # 26-32	C_DOC_CNT	Номер документа в периоде. Дополняется слева нулями до 7 знаков.
            period_type,
            # 33	PERIOD_TYPE	Код отчётного периода (1-месяц, 2-квартал, 3-полугодие, 4-девять мес., 5-год).
            int(doc_mounth),  # 34-35	PERIOD_MONTH	Отчётный месяц. Дополняется слева нулями до 2 знаков.
            doc_year,  # 36-39	PERIOD_YEAR	Отчётный год.
            TAX_OBL,  # 40-43	C_STI_ORIG	Код инспекции, в которую подаётся оригинал документа
            TAX_RAYON
        )

        attr_qname = etree.QName("http://www.w3.org/2001/XMLSchema-instance", "noNamespaceSchemaLocation")
        DECLAR = etree.Element("DECLAR", {attr_qname: xsdname},
                               nsmap={'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
                               )
        DECLARHEAD = etree.SubElement(DECLAR, "DECLARHEAD")

        ''' Код ЄДРПОУ либо серия-номер паспорта '''
        ''' Податковий номер (5-8 цифр з лідируючими нулями) або реєстраційний номер облікової картки платника податків (10 цифр з лідируючим нулем) або серія та номер паспорта або номер паспорта у вигляді ID картки (9 цифр з лідируючими нулями) '''
        TIN = etree.SubElement(DECLARHEAD, "TIN")
        TIN.text = '{}'.format(self.company_key.edrpou)

        ''' Код документа '''
        C_DOC = etree.SubElement(DECLARHEAD, "C_DOC")
        C_DOC.text = '{}'.format(doc)

        ''' Подтип документа '''
        C_DOC_SUB = etree.SubElement(DECLARHEAD, "C_DOC_SUB")
        C_DOC_SUB.text = '{}'.format(doc_sub)

        ''' Номер версии документа. Дополняется слева нулями до 2 знаков '''
        C_DOC_VER = etree.SubElement(DECLARHEAD, "C_DOC_VER")
        C_DOC_VER.text = '{}'.format(doc_ver)

        ''' Номер нового отчётного (уточняющего) док-та в отчётном периоде. Дополняется слева нулями до 2 знаков '''
        C_DOC_TYPE = etree.SubElement(DECLARHEAD, "C_DOC_TYPE")
        C_DOC_TYPE.text = '{}'.format(doc_type)

        '''
        Номер документа в периоде. Дополняется слева нулями до 7 знаков.
        Номер однотипного документа в періоді
        Якщо в одному звітному періоді подається кілька однотипних документів, то значення даного елемента містить порядковий номер для кожного документа в даному періоді. Перший (звітний) документ має номер 1. При формуванні електронного документа, що є новим звітним (уточнюючим) до поданого раніше (звітного) (значення елемента C_DOC_TYPE >0), нумерація однотипних документів в періоді (значення елемента C_DOC_CNT) повинна залишатись незмінною щодо нумерації звітного документа, показники якого виправляються
        '''
        C_DOC_CNT = etree.SubElement(DECLARHEAD, "C_DOC_CNT")
        C_DOC_CNT.text = '{}'.format(doc_cnt)

        ''' Код области '''
        ''' Код области, на территории которой расположена налоговая инспекция, в которую подаётся оригинал либо копия документа. Заполняется согласно справочнику SPR_STI.XML '''
        C_REG = etree.SubElement(DECLARHEAD, "C_REG")
        C_REG.text = '{}'.format(str(C_STI_MAIN)[:-2])

        ''' Код района '''
        ''' Код района, на территории которого расположена налоговая инспекция, в которую подаётся оригинал либо копия документа. Заполняется согласно справочнику SPR_STI.XML '''
        C_RAJ = etree.SubElement(DECLARHEAD, "C_RAJ")
        C_RAJ.text = '{}'.format(TAX_RAYON)

        ''' Отчётный месяц '''
        ''' Отчётным месяцем считается последний месяц в отчётном периоде (для месяцев - порядковый номер месяца, для квартала - 3,6,9,12 месяц, полугодия - 6 и 12, для года - 12)я 9 місяців – 9, для року – 12) '''
        PERIOD_MONTH = etree.SubElement(DECLARHEAD, "PERIOD_MONTH")
        PERIOD_MONTH.text = '{}'.format(doc_mounth)

        ''' Тип отчётного периода '''
        ''' 1-месяц, 2-квартал, 3-полугодие, 4-девять мес., 5-год '''
        PERIOD_TYPE = etree.SubElement(DECLARHEAD, "PERIOD_TYPE")
        PERIOD_TYPE.text = '{}'.format(period_type)

        ''' Отчётный год Формат YYYY'''
        PERIOD_YEAR = etree.SubElement(DECLARHEAD, "PERIOD_YEAR")
        PERIOD_YEAR.text = '{}'.format(doc_year)

        ''' Код инспекции, в которую подаётся оригинал документа '''
        ''' Код выбирается из справочника инспекций. вычисляется по формуле: C_REG*100+C_RAJ. '''
        C_STI_ORIG = etree.SubElement(DECLARHEAD, "C_STI_ORIG")
        C_STI_ORIG.text = '{}'.format(C_STI_MAIN)

        ''' Состояние документа '''
        ''' 1-отчётный документ, 2-новый отчётный документ ,3-уточняющий документ '''
        C_DOC_STAN = etree.SubElement(DECLARHEAD, "C_DOC_STAN")
        C_DOC_STAN.text = '{}'.format(doc_stan)

        ''' Перечень связанных документов. Элемент является узловым, в себе содержит элементы DOC '''
        ''' Для основного документа содержит ссылку на дополнение, для дополнения - ссылку на основной '''
        # attr_linked_docs_qname = etree.QName("http://www.w3.org/2001/XMLSchema-instance", "nil")
        # LINKED_DOCS = etree.Element("LINKED_DOCS", {attr_linked_docs_qname: 'J1391801.xsd'},
        #                       nsmap={'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
        #                       )

        ''' <LINKED_DOCS xsi:nil="true"/> '''
        LINKED_DOCS = etree.SubElement(DECLARHEAD, "LINKED_DOCS",
                                       {"{http://www.w3.org/2001/XMLSchema-instance}nil": "true"})

        ''' Дата заполнения документа Формат ddmmyyyy '''
        D_FILL = etree.SubElement(DECLARHEAD, "D_FILL")
        D_FILL.text = '{}'.format(doc_date)

        ''' Сигнатура программного обеспечения	Идентификатор ПО, с помощью которого сформирован отчёт '''
        SOFTWARE = etree.SubElement(DECLARHEAD, "SOFTWARE")
        SOFTWARE.text = '{}'.format("OpenPRRO 1.0")

        DECLARBODY = etree.SubElement(DECLAR, "DECLARBODY")

        ''' Дата виписки ПН '''
        HDATE = etree.SubElement(DECLARBODY, "HDATE")
        HDATE.text = '{}'.format(doc_date)

        ''' Порядковий номер ПН  '''
        HNUM = etree.SubElement(DECLARBODY, "HNUM")
        HNUM.text = '{}'.format(1)

        ''' Идентификационный (регистрационный) номер учетной карточки предприятия  или предпринимателя. Проще говоря - его ИНН (ИИН для предпринимателя) '''
        HTIN = etree.SubElement(DECLARBODY, "HTIN")
        HTIN.text = '{}'.format(self.company_key.edrpou)

        ''' ФИО плательщика налога или название предприятия, от имени которого подается отчет '''
        HNAME = etree.SubElement(DECLARBODY, "HNAME")
        HNAME.text = '{}'.format(self.company_key.ceo_fio.upper())

        ''' Прізвище, ім’я, по батькові (за наявності) відповідальної особи  '''
        T1RXXXXG1S = etree.SubElement(DECLARBODY, "T1RXXXXG1S", ROWNUM=str(1))
        T1RXXXXG1S.text = '{}'.format(self.company_key.ceo_fio)

        ''' Реєстраційний номер облікової картки платника податків або серія (за наявності), номер паспорта1 '''
        T1RXXXXG2S = etree.SubElement(DECLARBODY, "T1RXXXXG2S", ROWNUM=str(1))
        T1RXXXXG2S.text = '{:010.0f}'.format(int(self.company_key.edrpou))

        ''' Ідентифікатор ключа суб’єкта '''
        T1RXXXXG3S = etree.SubElement(DECLARBODY, "T1RXXXXG3S", ROWNUM=str(1))
        T1RXXXXG3S.text = '{}'.format(public_key)

        ''' Тип підпису. У графі зазначається: Касир / Старший касир / Припинення роботи '''
        # if department.status == 3:
        #     T1RXXXXG4S = etree.SubElement(DECLARBODY, "T1RXXXXG4S", ROWNUM=str(1))
        #     T1RXXXXG4S.text = '{}'.format('Припинення роботи')
        # else:

        if not T1RXXXXG4S_text:
            T1RXXXXG4S_text = 'Старший касир'

        T1RXXXXG4S = etree.SubElement(DECLARBODY, "T1RXXXXG4S", ROWNUM=str(1))
        T1RXXXXG4S.text = '{}'.format(T1RXXXXG4S_text)

        ''' Підписант: керівник '''
        M01 = etree.SubElement(DECLARBODY, "M01")
        M01.text = '{}'.format(1)

        ''' реєстраційний номер облікової картки платника податків або серія (за наявності) та номер паспорта '''
        HKBOS = etree.SubElement(DECLARBODY, "HKBOS")
        HKBOS.text = '{}'.format(self.company_key.ceo_tin)

        ''' ФИО первого лица предприятия (руководителя/директора) или предпринимателя '''
        HBOS = etree.SubElement(DECLARBODY, "HBOS")
        HBOS.text = '{}'.format(self.company_key.ceo_fio.upper())

        ''' Дата заполнения документа Формат ddmmyyyy '''
        HFILL = etree.SubElement(DECLARBODY, "HFILL")
        HFILL.text = '{}'.format(doc_date)

        xml = etree.tostring(DECLAR, pretty_print=True, encoding='windows-1251', standalone=False)

        print(xml.decode('windows-1251'))

        # return True
        print(filename)

        return self.tax_send(xml, self.TAX_EMAIL, filename), filename

    # Повідомлення про об’єкти оподаткування або об’єкти, пов’язані з оподаткуванням або через які провадиться діяльність. Форма № 20-ОПП
    def send_20OPP(self, values):
        # https://tax.gov.ua/data/material/000/103/154157/Forms_servis_yur.htm
        # J1312004
        # department = Departments.query.get(m.department_id)

        if 'ФОП' in self.company_key.name:
            doc = 'F13'
            xsdname = 'F1312004.xsd'
        else:
            doc = 'J13'
            xsdname = 'J1312004.xsd'

        data = self.tax_infos(2)

        C_STI_MAIN = data["values"][0]["C_STI_MAIN"]

        TAX_OBL = str(C_STI_MAIN)[:-2]
        if len(TAX_OBL) == 1:
            TAX_OBL = '0{}'.format(TAX_OBL)

        TAX_RAYON = str(C_STI_MAIN)[-2:]

        dt = datetime.now()
        doc_date = dt.strftime("%d%m%Y")  # ddmmyyyy
        doc_mounth = dt.strftime("%-m")
        doc_year = dt.strftime("%Y")

        # doc = 'J13'

        doc_sub = '120'

        # doc_ver = 3 # c 1 декабря 2021 г.
        doc_ver = 4  # c 19 января 2022 г.

        doc_stan = 1

        doc_type = 0

        # doc_cnt = self.get_last_number(doc_year, doc_mounth, doc, doc_sub, doc_ver)
        doc_cnt = self.doc_cnt

        period_type = 1

        # 2655 0039628794 J1391801 1 00000008 31122020 2655.XML
        # '{:010.0f}'.format(int(EDRPOU))
        '''
            1-4	C_REG C_RAJ	Код ГНИ получателя.
            5-14	TIN	Номер ЄДРПОУ, серия-номер паспорта. Дополняется слева нулями до 10 знаков.
            5-17	C_DOC	Код документа.
            18-20	C_DOC_SUB	Подтип документа
            21-22	C_DOC_VER	Номер версии документа. Дополняется слева нулями до 2 знаков.
            23	C_DOC_STAN	Состояние документа.
            24-25	C_DOC_TYPE	Номер нового отчётного (уточняющего) док-та в отчётном периоде. Дополняется слева нулями до 2 знаков
            26-32	C_DOC_CNT	Номер документа в периоде. Дополняется слева нулями до 7 знаков.
            33	PERIOD_TYPE	Код отчётного периода (1-месяц, 2-квартал, 3-полугодие, 4-девять мес., 5-год).
            34-35	PERIOD_MONTH	Отчётный месяц. Дополняется слева нулями до 2 знаков.
            36-39	PERIOD_YEAR	Отчётный год.
            40-43	C_STI_ORIG	Код инспекции, в которую подаётся оригинал документа
            44-47	.xml	Расширение файла.
        '''

        filename = '{}{}{:010.0f}{}{}{:02.0f}{}{:02.0f}{:07.0f}{}{:02.0f}{}{}{}.XML'.format(
            TAX_OBL,  # 1-2	C_REG 	Код ГНИ получателя.
            TAX_RAYON,  # 3-4	C_RAJ	Код ГНИ получателя.
            int(self.company_key.edrpou),
            # 5-14	TIN	Номер ЄДРПОУ, серия-номер паспорта. Дополняется слева нулями до 10 знаков.
            doc,  # 5-17	C_DOC	Код документа.
            doc_sub,  # 18-20	C_DOC_SUB	Подтип документа
            doc_ver,  # 21-22	C_DOC_VER	Номер версии документа. Дополняется слева нулями до 2 знаков.
            doc_stan,  # 23	C_DOC_STAN	Состояние документа.
            doc_type,
            # 24-25	C_DOC_TYPE	Номер нового отчётного (уточняющего) док-та в отчётном периоде. Дополняется слева нулями до 2 знаков
            doc_cnt,  # 26-32	C_DOC_CNT	Номер документа в периоде. Дополняется слева нулями до 7 знаков.
            period_type,
            # 33	PERIOD_TYPE	Код отчётного периода (1-месяц, 2-квартал, 3-полугодие, 4-девять мес., 5-год).
            int(doc_mounth),  # 34-35	PERIOD_MONTH	Отчётный месяц. Дополняется слева нулями до 2 знаков.
            doc_year,  # 36-39	PERIOD_YEAR	Отчётный год.
            TAX_OBL,  # 40-43	C_STI_ORIG	Код инспекции, в которую подаётся оригинал документа
            TAX_RAYON
        )

        attr_qname = etree.QName("http://www.w3.org/2001/XMLSchema-instance", "noNamespaceSchemaLocation")
        DECLAR = etree.Element("DECLAR", {attr_qname: xsdname},
                               nsmap={'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
                               )
        DECLARHEAD = etree.SubElement(DECLAR, "DECLARHEAD")

        ''' Код ЄДРПОУ либо серия-номер паспорта '''
        ''' Податковий номер (5-8 цифр з лідируючими нулями) або реєстраційний номер облікової картки платника податків (10 цифр з лідируючим нулем) або серія та номер паспорта або номер паспорта у вигляді ID картки (9 цифр з лідируючими нулями) '''
        TIN = etree.SubElement(DECLARHEAD, "TIN")
        TIN.text = '{}'.format(self.company_key.edrpou)

        ''' Код документа '''
        C_DOC = etree.SubElement(DECLARHEAD, "C_DOC")
        C_DOC.text = '{}'.format(doc)

        ''' Подтип документа '''
        C_DOC_SUB = etree.SubElement(DECLARHEAD, "C_DOC_SUB")
        C_DOC_SUB.text = '{}'.format(doc_sub)

        ''' Номер версии документа. Дополняется слева нулями до 2 знаков '''
        C_DOC_VER = etree.SubElement(DECLARHEAD, "C_DOC_VER")
        C_DOC_VER.text = '{}'.format(doc_ver)

        ''' Номер нового отчётного (уточняющего) док-та в отчётном периоде. Дополняется слева нулями до 2 знаков '''
        C_DOC_TYPE = etree.SubElement(DECLARHEAD, "C_DOC_TYPE")
        C_DOC_TYPE.text = '{}'.format(doc_type)

        '''
        Номер документа в периоде. Дополняется слева нулями до 7 знаков.
        Номер однотипного документа в періоді
        Якщо в одному звітному періоді подається кілька однотипних документів, то значення даного елемента містить порядковий номер для кожного документа в даному періоді. Перший (звітний) документ має номер 1. При формуванні електронного документа, що є новим звітним (уточнюючим) до поданого раніше (звітного) (значення елемента C_DOC_TYPE >0), нумерація однотипних документів в періоді (значення елемента C_DOC_CNT) повинна залишатись незмінною щодо нумерації звітного документа, показники якого виправляються
        '''
        C_DOC_CNT = etree.SubElement(DECLARHEAD, "C_DOC_CNT")
        C_DOC_CNT.text = '{}'.format(doc_cnt)

        ''' Код области '''
        ''' Код области, на территории которой расположена налоговая инспекция, в которую подаётся оригинал либо копия документа. Заполняется согласно справочнику SPR_STI.XML '''
        C_REG = etree.SubElement(DECLARHEAD, "C_REG")
        C_REG.text = '{}'.format(str(C_STI_MAIN)[:-2])

        ''' Код района '''
        ''' Код района, на территории которого расположена налоговая инспекция, в которую подаётся оригинал либо копия документа. Заполняется согласно справочнику SPR_STI.XML '''
        C_RAJ = etree.SubElement(DECLARHEAD, "C_RAJ")
        C_RAJ.text = '{}'.format(TAX_RAYON)

        ''' Отчётный месяц '''
        ''' Отчётным месяцем считается последний месяц в отчётном периоде (для месяцев - порядковый номер месяца, для квартала - 3,6,9,12 месяц, полугодия - 6 и 12, для года - 12)я 9 місяців – 9, для року – 12) '''
        PERIOD_MONTH = etree.SubElement(DECLARHEAD, "PERIOD_MONTH")
        PERIOD_MONTH.text = '{}'.format(doc_mounth)

        ''' Тип отчётного периода '''
        ''' 1-месяц, 2-квартал, 3-полугодие, 4-девять мес., 5-год '''
        PERIOD_TYPE = etree.SubElement(DECLARHEAD, "PERIOD_TYPE")
        PERIOD_TYPE.text = '{}'.format(period_type)

        ''' Отчётный год Формат YYYY'''
        PERIOD_YEAR = etree.SubElement(DECLARHEAD, "PERIOD_YEAR")
        PERIOD_YEAR.text = '{}'.format(doc_year)

        ''' Код инспекции, в которую подаётся оригинал документа '''
        ''' Код выбирается из справочника инспекций. вычисляется по формуле: C_REG*100+C_RAJ. '''
        C_STI_ORIG = etree.SubElement(DECLARHEAD, "C_STI_ORIG")
        C_STI_ORIG.text = '{}'.format(C_STI_MAIN)

        ''' Состояние документа '''
        ''' 1-отчётный документ, 2-новый отчётный документ ,3-уточняющий документ '''
        C_DOC_STAN = etree.SubElement(DECLARHEAD, "C_DOC_STAN")
        C_DOC_STAN.text = '{}'.format(doc_stan)

        ''' Перечень связанных документов. Элемент является узловым, в себе содержит элементы DOC '''
        ''' Для основного документа содержит ссылку на дополнение, для дополнения - ссылку на основной '''
        # attr_linked_docs_qname = etree.QName("http://www.w3.org/2001/XMLSchema-instance", "nil")
        # LINKED_DOCS = etree.Element("LINKED_DOCS", {attr_linked_docs_qname: 'J1391801.xsd'},
        #                       nsmap={'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
        #                       )

        ''' <LINKED_DOCS xsi:nil="true"/> '''
        LINKED_DOCS = etree.SubElement(DECLARHEAD, "LINKED_DOCS",
                                       {"{http://www.w3.org/2001/XMLSchema-instance}nil": "true"})

        ''' Дата заполнения документа Формат ddmmyyyy '''
        D_FILL = etree.SubElement(DECLARHEAD, "D_FILL")
        D_FILL.text = '{}'.format(doc_date)

        ''' Сигнатура программного обеспечения	Идентификатор ПО, с помощью которого сформирован отчёт '''
        SOFTWARE = etree.SubElement(DECLARHEAD, "SOFTWARE")
        SOFTWARE.text = '{}'.format("OpenPRRO 1.0")

        DECLARBODY = etree.SubElement(DECLAR, "DECLARBODY")

        ''' Наименование органа налоговой службы в которую подается отчет '''
        HSTI = etree.SubElement(DECLARBODY, "HSTI")
        HSTI.text = '{}'.format(data["values"][0]["C_STI_MAIN_NAME"])

        ''' Идентификационный (регистрационный) номер учетной карточки предприятия  или предпринимателя. Проще говоря - его ИНН (ИИН для предпринимателя) '''
        HTIN = etree.SubElement(DECLARBODY, "HTIN")
        HTIN.text = '{}'.format(self.company_key.edrpou)

        ''' ФИО плательщика налога или название предприятия, от имени которого подается отчет '''
        HNAME = etree.SubElement(DECLARBODY, "HNAME")
        HNAME.text = '{}'.format(self.company_key.ceo_fio.upper())

        line = 1
        for value in values:
            ''' Код ознаки надання інформації '''
            T1RXXXXG2 = etree.SubElement(DECLARBODY, "T1RXXXXG2", ROWNUM=str(line))
            # Статус отделения: 1 - активное, 2 - приостановленное, 3 - ликвидированное
            # if department.status != 3 and not department.rro_id:
            T1RXXXXG2.text = '{}'.format(value['T1RXXXXG2'])
            # elif department.status == 3:
            #     T1RXXXXG2.text = '{}'.format(6)
            # else:
            #     T1RXXXXG2.text = '{}'.format(3)

            ''' Тип об’єкта оподаткування '''
            T1RXXXXG3 = etree.SubElement(DECLARBODY, "T1RXXXXG3", ROWNUM=str(line))
            T1RXXXXG3.text = '{}'.format(value['T1RXXXXG3'])

            ''' Найменування об’єкта оподаткування (зазначити у разі наявності) '''
            T1RXXXXG4S = etree.SubElement(DECLARBODY, "T1RXXXXG4S", ROWNUM=str(line))
            T1RXXXXG4S.text = '{}'.format(value['T1RXXXXG4S'])

            ''' Ідентифікатор об’єкта оподаткування '''
            T1RXXXXG5 = etree.SubElement(DECLARBODY, "T1RXXXXG5", ROWNUM=str(line))
            T1RXXXXG5.text = '{}'.format(value['T1RXXXXG5'])

            if 'T1RXXXXG6' in value:
                ''' код за КОАТУУ '''
                T1RXXXXG6 = etree.SubElement(DECLARBODY, "T1RXXXXG6", ROWNUM=str(line))
                T1RXXXXG6.text = '{}'.format(value['T1RXXXXG6'])
            else:
                ''' код за КАТОТТГ '''
                T1RXXXXG6S = etree.SubElement(DECLARBODY, "T1RXXXXG6S", ROWNUM=str(line))
                T1RXXXXG6S.text = '{}'.format(value['T1RXXXXG6S'])

            ''' область, район, населений пункт '''
            T1RXXXXG7S = etree.SubElement(DECLARBODY, "T1RXXXXG7S", ROWNUM=str(line))
            T1RXXXXG7S.text = '{}'.format(value['T1RXXXXG7S'])

            ''' Місцезнаходження об’єкта оподаткування (вулицю, номер будинку/офіса/квартири) '''
            T1RXXXXG8S = etree.SubElement(DECLARBODY, "T1RXXXXG8S", ROWNUM=str(line))
            T1RXXXXG8S.text = '{}'.format(value['T1RXXXXG8S'])

            ''' Стан об’єкта оподаткування '''
            T1RXXXXG9 = etree.SubElement(DECLARBODY, "T1RXXXXG9", ROWNUM=str(line))
            T1RXXXXG9.text = '{}'.format(value['T1RXXXXG9'])

            ''' Вид права на об’єкт оподаткування'''
            T1RXXXXG10 = etree.SubElement(DECLARBODY, "T1RXXXXG10", ROWNUM=str(line))
            T1RXXXXG10.text = '{}'.format(value['T1RXXXXG10'])

            ''' Прошу взяти на облік за неосновним місцем обліку за місцезнаходженням об’єкта оподаткування '''
            if value['T1RXXXXG11']:
                etree.SubElement(DECLARBODY, "T1RXXXXG11",
                                 {"ROWNUM": str(line), "{http://www.w3.org/2001/XMLSchema-instance}nil": "true"})
            else:
                T1RXXXXG11 = etree.SubElement(DECLARBODY, "T1RXXXXG11", ROWNUM=str(line))
                T1RXXXXG11.text = '{}'.format(value['T1RXXXXG11'])

            ''' Реєстраційний номер об’єкта оподаткування '''
            if 'T1RXXXXG12S' in value:
                if value['T1RXXXXG12S'] == "":
                    etree.SubElement(DECLARBODY, "T1RXXXXG12S",
                                     {"ROWNUM": str(line), "{http://www.w3.org/2001/XMLSchema-instance}nil": "true"})
                else:
                    T1RXXXXG12S = etree.SubElement(DECLARBODY, "T1RXXXXG12S", ROWNUM=str(line))
                    T1RXXXXG12S.text = '{}'.format(value['T1RXXXXG12S'])

            line += 1

        ''' ФИО первого лица предприятия (руководителя/директора) или предпринимателя '''
        HBOS = etree.SubElement(DECLARBODY, "HBOS")
        HBOS.text = '{}'.format(self.company_key.ceo_fio.upper())

        ''' Дата заполнения документа Формат ddmmyyyy '''
        HFILL = etree.SubElement(DECLARBODY, "HFILL")
        HFILL.text = '{}'.format(doc_date)

        xml = etree.tostring(DECLAR, pretty_print=True, encoding='windows-1251', standalone=False)
        print(xml.decode('windows-1251'))

        # return True
        print(filename)

        # return True, filename

        return self.tax_send(xml, self.TAX_EMAIL, filename), filename

    # Заява про реєстрацію програмного реєстратора розрахункових операцій за формою № 1-ПРРО
    def send_1PRRO(self, dpi_id, R03G3S_value=None, R04G11S_value=None, R04G2S_value=None, values=None):
        # https://tax.gov.ua/data/material/000/103/154157/Forms_servis_yur.htm
        # J1316604

        if 'ФОП' in self.company_key.name:
            doc = 'F13'
            xsdname = 'F1316604.xsd'
        else:
            doc = 'J13'
            xsdname = 'J1316604.xsd'

        data = self.tax_infos(2)

        C_STI_MAIN = data["values"][0]["C_STI_MAIN"]
        TAX_OBL = str(C_STI_MAIN)[:-2]
        if len(TAX_OBL) == 1:
            TAX_OBL = '0{}'.format(TAX_OBL)

        TAX_RAYON = str(C_STI_MAIN)[-2:]

        data = self.tax_infos(11)
        values = data['values']

        local_number = 0
        for value in values:
            if R04G2S_value:
                if R04G2S_value == value["FNUM"]:
                    local_number = value["LNUM"]
                    break
            else:
                LNUM = value["LNUM"]
                if LNUM > local_number:
                    local_number = LNUM

        if R04G2S_value is None:
            local_number += 1

        data = self.tax_infos(12)
        values = data['values']

        C_TERRIT = None
        TYPE_OBJECT_NAME = None
        ADDRESS = None
        TO_CODE = None
        OBJECT_NAME_NAME = None

        print(values)
        for value in values:
            TO_CODE = value["TO_CODE"]
            if TO_CODE == int(dpi_id):
                C_TERRIT = value["C_TERRIT"]
                OBJECT_NAME_NAME = value["NAME"]
                TYPE_OBJECT_NAME = value["TYPE_OBJECT_NAME"]
                ADDRESS = value["ADDRESS"]
                break

        if C_TERRIT == None:
            msg = 'Не вдалося отримати дані податкового кабінету для заповнення форми з кодом {}, спробуйте надіслати форму ще раз'.format(
                dpi_id)
            print(msg)
            raise Exception(msg)

        dt = datetime.now()
        doc_date = dt.strftime("%d%m%Y")  # ddmmyyyy
        doc_mounth = dt.strftime("%-m")
        doc_year = dt.strftime("%Y")

        doc_sub = '166'

        doc_ver = 4  # с 1 декабря 2021 г.

        doc_stan = 1

        doc_type = 0

        # doc_cnt = self.get_last_number(doc_year, doc_mounth, doc, doc_sub, doc_ver)
        doc_cnt = self.doc_cnt

        period_type = 1

        # 2655 0039628794 J1391801 1 00000008 31122020 2655.XML
        # '{:010.0f}'.format(int(EDRPOU))
        '''
            1-4	C_REG C_RAJ	Код ГНИ получателя.
            5-14	TIN	Номер ЄДРПОУ, серия-номер паспорта. Дополняется слева нулями до 10 знаков.
            5-17	C_DOC	Код документа.
            18-20	C_DOC_SUB	Подтип документа
            21-22	C_DOC_VER	Номер версии документа. Дополняется слева нулями до 2 знаков.
            23	C_DOC_STAN	Состояние документа.
            24-25	C_DOC_TYPE	Номер нового отчётного (уточняющего) док-та в отчётном периоде. Дополняется слева нулями до 2 знаков
            26-32	C_DOC_CNT	Номер документа в периоде. Дополняется слева нулями до 7 знаков.
            33	PERIOD_TYPE	Код отчётного периода (1-месяц, 2-квартал, 3-полугодие, 4-девять мес., 5-год).
            34-35	PERIOD_MONTH	Отчётный месяц. Дополняется слева нулями до 2 знаков.
            36-39	PERIOD_YEAR	Отчётный год.
            40-43	C_STI_ORIG	Код инспекции, в которую подаётся оригинал документа
            44-47	.xml	Расширение файла.
        '''

        filename = '{}{}{:010.0f}{}{}{:02.0f}{}{:02.0f}{:07.0f}{}{:02.0f}{}{}{}.XML'.format(
            TAX_OBL,  # 1-2	C_REG 	Код ГНИ получателя.
            TAX_RAYON,  # 3-4	C_RAJ	Код ГНИ получателя.
            int(self.company_key.edrpou),
            # 5-14	TIN	Номер ЄДРПОУ, серия-номер паспорта. Дополняется слева нулями до 10 знаков.
            doc,  # 5-17	C_DOC	Код документа.
            doc_sub,  # 18-20	C_DOC_SUB	Подтип документа
            doc_ver,  # 21-22	C_DOC_VER	Номер версии документа. Дополняется слева нулями до 2 знаков.
            doc_stan,  # 23	C_DOC_STAN	Состояние документа.
            doc_type,
            # 24-25	C_DOC_TYPE	Номер нового отчётного (уточняющего) док-та в отчётном периоде. Дополняется слева нулями до 2 знаков
            doc_cnt,  # 26-32	C_DOC_CNT	Номер документа в периоде. Дополняется слева нулями до 7 знаков.
            period_type,
            # 33	PERIOD_TYPE	Код отчётного периода (1-месяц, 2-квартал, 3-полугодие, 4-девять мес., 5-год).
            int(doc_mounth),  # 34-35	PERIOD_MONTH	Отчётный месяц. Дополняется слева нулями до 2 знаков.
            doc_year,  # 36-39	PERIOD_YEAR	Отчётный год.
            TAX_OBL,  # 40-43	C_STI_ORIG	Код инспекции, в которую подаётся оригинал документа
            TAX_RAYON
        )

        attr_qname = etree.QName("http://www.w3.org/2001/XMLSchema-instance", "noNamespaceSchemaLocation")
        DECLAR = etree.Element("DECLAR", {attr_qname: xsdname},
                               nsmap={'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
                               )
        DECLARHEAD = etree.SubElement(DECLAR, "DECLARHEAD")

        ''' Код ЄДРПОУ либо серия-номер паспорта '''
        ''' Податковий номер (5-8 цифр з лідируючими нулями) або реєстраційний номер облікової картки платника податків (10 цифр з лідируючим нулем) або серія та номер паспорта або номер паспорта у вигляді ID картки (9 цифр з лідируючими нулями) '''
        TIN = etree.SubElement(DECLARHEAD, "TIN")
        TIN.text = '{}'.format(self.company_key.edrpou)

        ''' Код документа '''
        C_DOC = etree.SubElement(DECLARHEAD, "C_DOC")
        C_DOC.text = '{}'.format(doc)

        ''' Подтип документа '''
        C_DOC_SUB = etree.SubElement(DECLARHEAD, "C_DOC_SUB")
        C_DOC_SUB.text = '{}'.format(doc_sub)

        ''' Номер версии документа. Дополняется слева нулями до 2 знаков '''
        C_DOC_VER = etree.SubElement(DECLARHEAD, "C_DOC_VER")
        C_DOC_VER.text = '{}'.format(doc_ver)

        ''' Номер нового отчётного (уточняющего) док-та в отчётном периоде. Дополняется слева нулями до 2 знаков '''
        C_DOC_TYPE = etree.SubElement(DECLARHEAD, "C_DOC_TYPE")
        C_DOC_TYPE.text = '{}'.format(doc_type)

        '''
        Номер документа в периоде. Дополняется слева нулями до 7 знаков.
        Номер однотипного документа в періоді
        Якщо в одному звітному періоді подається кілька однотипних документів, то значення даного елемента містить порядковий номер для кожного документа в даному періоді. Перший (звітний) документ має номер 1. При формуванні електронного документа, що є новим звітним (уточнюючим) до поданого раніше (звітного) (значення елемента C_DOC_TYPE >0), нумерація однотипних документів в періоді (значення елемента C_DOC_CNT) повинна залишатись незмінною щодо нумерації звітного документа, показники якого виправляються
        '''
        C_DOC_CNT = etree.SubElement(DECLARHEAD, "C_DOC_CNT")
        C_DOC_CNT.text = '{}'.format(doc_cnt)

        ''' Код области '''
        ''' Код области, на территории которой расположена налоговая инспекция, в которую подаётся оригинал либо копия документа. Заполняется согласно справочнику SPR_STI.XML '''
        C_REG = etree.SubElement(DECLARHEAD, "C_REG")
        C_REG.text = '{}'.format(str(C_STI_MAIN)[:-2])

        ''' Код района '''
        ''' Код района, на территории которого расположена налоговая инспекция, в которую подаётся оригинал либо копия документа. Заполняется согласно справочнику SPR_STI.XML '''
        C_RAJ = etree.SubElement(DECLARHEAD, "C_RAJ")
        C_RAJ.text = '{}'.format(TAX_RAYON)

        ''' Отчётный месяц '''
        ''' Отчётным месяцем считается последний месяц в отчётном периоде (для месяцев - порядковый номер месяца, для квартала - 3,6,9,12 месяц, полугодия - 6 и 12, для года - 12)я 9 місяців – 9, для року – 12) '''
        PERIOD_MONTH = etree.SubElement(DECLARHEAD, "PERIOD_MONTH")
        PERIOD_MONTH.text = '{}'.format(doc_mounth)

        ''' Тип отчётного периода '''
        ''' 1-месяц, 2-квартал, 3-полугодие, 4-девять мес., 5-год '''
        PERIOD_TYPE = etree.SubElement(DECLARHEAD, "PERIOD_TYPE")
        PERIOD_TYPE.text = '{}'.format(period_type)

        ''' Отчётный год Формат YYYY'''
        PERIOD_YEAR = etree.SubElement(DECLARHEAD, "PERIOD_YEAR")
        PERIOD_YEAR.text = '{}'.format(doc_year)

        ''' Код инспекции, в которую подаётся оригинал документа '''
        ''' Код выбирается из справочника инспекций. вычисляется по формуле: C_REG*100+C_RAJ. '''
        C_STI_ORIG = etree.SubElement(DECLARHEAD, "C_STI_ORIG")
        C_STI_ORIG.text = '{}'.format(C_STI_MAIN)

        ''' Состояние документа '''
        ''' 1-отчётный документ, 2-новый отчётный документ ,3-уточняющий документ '''
        C_DOC_STAN = etree.SubElement(DECLARHEAD, "C_DOC_STAN")
        C_DOC_STAN.text = '{}'.format(doc_stan)

        ''' Перечень связанных документов. Элемент является узловым, в себе содержит элементы DOC '''
        ''' Для основного документа содержит ссылку на дополнение, для дополнения - ссылку на основной '''
        # attr_linked_docs_qname = etree.QName("http://www.w3.org/2001/XMLSchema-instance", "nil")
        # LINKED_DOCS = etree.Element("LINKED_DOCS", {attr_linked_docs_qname: 'J1391801.xsd'},
        #                       nsmap={'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
        #                       )

        ''' <LINKED_DOCS xsi:nil="true"/> '''
        LINKED_DOCS = etree.SubElement(DECLARHEAD, "LINKED_DOCS",
                                       {"{http://www.w3.org/2001/XMLSchema-instance}nil": "true"})

        ''' Дата заполнения документа Формат ddmmyyyy '''
        D_FILL = etree.SubElement(DECLARHEAD, "D_FILL")
        D_FILL.text = '{}'.format(doc_date)

        ''' Сигнатура программного обеспечения	Идентификатор ПО, с помощью которого сформирован отчёт '''
        SOFTWARE = etree.SubElement(DECLARHEAD, "SOFTWARE")
        SOFTWARE.text = '{}'.format("OpenPRRO 1.0")

        DECLARBODY = etree.SubElement(DECLAR, "DECLARBODY")

        # Статус отделения: 1 - активное, 2 - приостановленное, 3 - ликвидированное
        # if department.status != 3 and department.rro_id:
        #     ''' Дія: Зміни (крім перереєстрації) '''
        #     M015 = etree.SubElement(DECLARBODY, "M015")
        #     M015.text = '{}'.format(1)
        # elif department.status != 3 and not department.rro_id:

        # elif department.status == 3:
        #     ''' Дія: Скасування реєстрації '''
        #     M012 = etree.SubElement(DECLARBODY, "M012")
        #     M012.text = '{}'.format(1)

        if R04G2S_value:
            M012 = etree.SubElement(DECLARBODY, "M012")
            M012.text = '{}'.format(1)
        else:
            ''' Дія: Реєстрація '''
            M011 = etree.SubElement(DECLARBODY, "M011")
            M011.text = '{}'.format(1)

        ''' ФИО плательщика налога или название предприятия, от имени которого подается отчет '''
        HNAME = etree.SubElement(DECLARBODY, "HNAME")
        HNAME.text = '{}'.format(self.company_key.name.upper())

        ''' Идентификационный (регистрационный) номер учетной карточки предприятия  или предпринимателя. Проще говоря - его ИНН (ИИН для предпринимателя) '''
        HTIN = etree.SubElement(DECLARBODY, "HTIN")
        HTIN.text = '{}'.format(self.company_key.edrpou)

        ''' ідентифікатор об’єкта оподаткування '''
        if TO_CODE:
            R03G1S = etree.SubElement(DECLARBODY, "R03G1S")
            R03G1S.text = '{}'.format(TO_CODE)
        else:
            raise Exception(
                "Ну вдалося отримати дані з податкового кабінету, ідентифікатор об’єкта оподаткування {}".format(
                    dpi_id))

        ''' КОАТУУ '''
        HKOATUU = etree.SubElement(DECLARBODY, "HKOATUU")
        HKOATUU.text = '{}'.format(C_TERRIT)

        ''' назва ГО '''
        R03G3S = etree.SubElement(DECLARBODY, "R03G3S")
        if R03G3S_value:
            R03G3S.text = '{}'.format(R03G3S_value)
        else:
            R03G3S.text = '{}'.format(TYPE_OBJECT_NAME)

        ''' адреса розміщення ГО (програмно-технічного комплексу самообслуговування) '''
        R03G4S = etree.SubElement(DECLARBODY, "R03G4S")
        R03G4S.text = '{}'.format(ADDRESS)

        ''' Дані щодо ПРРО: стаціонарний '''
        M041 = etree.SubElement(DECLARBODY, "M041")
        M041.text = '{}'.format(1)

        ''' Дані щодо ПРРО: назва ПРРО '''
        R04G11S = etree.SubElement(DECLARBODY, "R04G11S")
        if R04G11S_value:
            R04G11S.text = '{}'.format(R04G11S_value)
        else:
            R04G11S.text = '{}'.format(OBJECT_NAME_NAME)

        ''' Дані щодо ПРРО: локальний номер '''
        R04G12S = etree.SubElement(DECLARBODY, "R04G12S")
        R04G12S.text = '{}'.format(local_number)

        print(R04G2S_value)
        if R04G2S_value:
            R04G2S = etree.SubElement(DECLARBODY, "R04G2S")
            R04G2S.text = '{}'.format(R04G2S_value)

        # if department.rro_id:
        #     ''' Дані щодо ПРРО: фіскальний номер '''
        #     R04G2S = etree.SubElement(DECLARBODY, "R04G2S")
        #     R04G2S.text = '{}'.format(department.rro_id)

        # elif department.status != 3 and not department.rro_id:
        #     ''' Дія: Реєстрація '''
        #     pass
        # elif department.status == 3:
        #     ''' Дія: Скасування реєстрації '''
        #     M012 = etree.SubElement(DECLARBODY, "M012")
        #     M012.text = '{}'.format(1)

        ''' У разі відсутності зв’язку між ПРРО та фіскальним сервером контролюючого органу '''
        M052 = etree.SubElement(DECLARBODY, "M052")
        M052.text = '{}'.format(1)

        ''' Підписант: керівник '''
        M11 = etree.SubElement(DECLARBODY, "M11")
        M11.text = '{}'.format(1)

        ''' реєстраційний номер облікової картки платника податків або серія (за наявності) та номер паспорта '''
        HKBOS = etree.SubElement(DECLARBODY, "HKBOS")
        HKBOS.text = '{}'.format(self.company_key.ceo_tin)

        ''' ФИО первого лица предприятия (руководителя/директора) или предпринимателя '''
        HBOS = etree.SubElement(DECLARBODY, "HBOS")
        HBOS.text = '{}'.format(self.company_key.ceo_fio.upper())

        ''' Дата заполнения документа Формат ddmmyyyy '''
        HFILL = etree.SubElement(DECLARBODY, "HFILL")
        HFILL.text = '{}'.format(doc_date)

        xml = etree.tostring(DECLAR, pretty_print=True, encoding='windows-1251', standalone=False)

        print(xml.decode('windows-1251'))

        print(filename)

        # return True, filename

        return self.tax_send(xml, self.TAX_EMAIL, filename), filename
