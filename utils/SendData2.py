import base64
import json
import struct
import uuid
import zlib
from datetime import datetime
from hashlib import sha256

import dateutil.parser
import requests
from dateutil import tz
from lxml import etree

from config import TIMEZONE, FS_URL, TESTING_OFFLINE
from utils.Sign import Sign


class SendData2(object):

    def __init__(self, db, key, department, rro_fn, cashier_name):

        if not key and department:
            self.key = department.get_prro_key()
        else:
            self.key = key

        if not self.key:
            raise Exception('Не задано ключ криптографії')

        self.department = department

        self.signer = Sign()

        self.db = db

        if rro_fn:
            self.rro_fn = rro_fn
        elif department:
            self.rro_fn = department.rro_id
        else:
            self.rro_fn = 0

        self.shift_state = 0

        self.cashier_name = cashier_name

        # self.fiscal_shift_id = None

        self.last_ordernum = 0
        self.last_ordertaxnum = 0
        self.last_taxorderdate = None
        self.last_taxordertime = None

        # self.offline_supported = False
        # self.chief_cashier = False

        # self.offline_local_number = 0

        # self.offline = False

        self.last_xml = None

        self.last_fiscal_ticket = None

        self.last_fiscal_error_code = 0

        self.last_fiscal_error_txt = ''

        self.server_time = None

        self.fiscal_time = None

        self.xsd_path = 'utils/tax_xsd/check01.xsd'

        self.xsd_path_z = 'utils/tax_xsd/zrep01.xsd'

        xmlschema_doc = etree.parse(self.xsd_path)
        self.xmlschema_check = etree.XMLSchema(xmlschema_doc)

    def xml2json(self, root):
        my = []
        if root.text:
            my.append({"text": root.text})
        if len(root):
            for elem in root:
                my = my + [self.xml2json(elem)]
                if elem.tail:
                    my = my + [{"text": elem.tail}]
        my = my[0] if len(my) == 1 else my
        return {root.tag: my}

    def calculate_offline_tax_number(self, offline_dt, doc_sum=None, prev_hash=None):
        ''' Для розрахунку контрольного числа, ПРРО створює текстову строку, що містить об’єднання значень, розділених символом «,»:
            • «Секретне число»
            • Дата документа (ДДММРР)
            • Час документа (ГГХХСС)
            • Локальний номер документа
            • Фіскальний номер реєстратора
            • Локальний номер реєстратора
            • Загальна сума оплати по документу класу «Чек» (формат «0.00») (якщо елемент присутній)
            • Геш попереднього документа (крім першого документа, створеного в межах офлайн сесії)
        '''

        if not self.department.prro_offline_session_id:
            raise Exception('Для цього номера РРО режим оффлайн заборонено')

        check_date = offline_dt.strftime("%d%m%Y")  # ddmmyyyy
        check_time = offline_dt.strftime("%H%M%S")  # hhmmss

        if prev_hash:
            if doc_sum:
                str = '{},{},{},{},{},{},{:.2f},{}'.format(self.department.prro_offline_seed, check_date, check_time,
                                                           self.department.next_local_number,
                                                           self.rro_fn, self.department.zn, doc_sum, prev_hash)
            else:
                str = '{},{},{},{},{},{},{}'.format(self.department.prro_offline_seed, check_date, check_time,
                                                    self.department.next_local_number,
                                                    self.rro_fn, self.department.zn, prev_hash)
        else:
            if doc_sum:
                str = '{},{},{},{},{},{},{:.2f}'.format(self.department.prro_offline_seed, check_date, check_time,
                                                        self.department.next_local_number,
                                                        self.rro_fn, self.department.zn, doc_sum)
            else:
                str = '{},{},{},{},{},{}'.format(self.department.prro_offline_seed, check_date, check_time,
                                                 self.department.next_local_number,
                                                 self.rro_fn, self.department.zn)

        print('{} {} Для розрахунку офлайн номера використовуються такі дані: {}, prev_hash={}, doc_sum={}'
              .format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, str, prev_hash, doc_sum))

        # Від текстового рядку розраховується геш за алгоритмом CRC32
        # (див. https://github.com/damieng/DamienGKit/blob/master/CSharp/DamienG.Library/Security/Cryptography/Crc32.cs),
        # як десяткове беззнаковое число

        bkd_crc = zlib.crc32(str.encode())
        bkd_crcb = bytearray(struct.pack("<L", bkd_crc))
        bkd_crcb.reverse()
        (crc32b,) = struct.unpack("<L", bkd_crcb)

        str_crc32b = '{}'.format(crc32b)

        # Із розрахованого гешу беруться 4 молодші розряди. Ведучі нулі відкидаються (наприклад, “0123” -> “123”).
        control_int = int(str_crc32b[-4:])

        if control_int == 0:
            # Контрольне число не може дорівнювати 0. Якщо у результаті розрахунку контрольного числа одержано 0, призначається значення 1.
            control_int = 1

        offline_tax_number = '{}.{}.{}'.format(self.department.prro_offline_session_id,
                                               self.department.next_offline_local_number, control_int)

        print('{} {} Розрахований фіскальний офлайн номер: {}'
              .format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, offline_tax_number))

        return offline_tax_number

    def get_fiscal_data_by_local_number(self, local_number, data):
        # print(self.department.next_local_number)
        document = self.DocumentInfoByLocalNum(local_number)
        if document:
            # print(document)
            # type = document['NumFiscal']
            ordertaxnum = document['NumFiscal']
            # print(data)
            taxorderdate = etree.fromstring(data).xpath('//ORDERDATE/text()')
            taxordertime = etree.fromstring(data).xpath('//ORDERTIME/text()')

            self.last_ordernum = self.department.next_local_number
            self.last_ordertaxnum = ordertaxnum
            self.last_taxorderdate = taxorderdate[0]
            self.last_taxordertime = taxordertime[0]
            # self.department.next_local_number += 1

            self.last_fiscal_error_code = 999

            self.server_time = datetime.now(tz.gettz(TIMEZONE))

            return True
        else:
            return False

    def post_data(self, command, data, return_cmd_data=False):

        self.last_fiscal_error_code = 0
        self.last_fiscal_error_txt = ''
        self.fiscal_time = None
        self.server_time = None

        if TESTING_OFFLINE:
            url = 'http://127.0.0.1:9999/'.format(FS_URL)
        else:
            url = '{}{}'.format(FS_URL, command)

        headers = {'Content-Type': 'application/octet-stream',
                   'Content-Encoding': 'gzip'}

        if command == "cmd":
            data = json.dumps(data).encode('utf8')
            print('{} {} JSON запит {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, data))

        # проверим актуальность ключа криптографии
        print('{} {} Починаю підписувати'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn))
        try:
            try:
                signed_data = self.signer.sign(self.key.box_id, data, role=self.key.key_role)
            except Exception as e:
                print(e)
                box_id = self.signer.update_bid(self.db, self.key)
                signed_data = self.signer.sign(box_id, data, role=self.key.key_role)
                self.key.box_id = box_id
                self.db.session.commit()

        except Exception as e:
            print('{} {} CryproError post_data 2 {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            self.last_fiscal_error_txt = str(e)
            # Переходимо до офлайну
            return False
            # raise Exception('{}'.format(
            #     'Помилка ключа криптографії, можливо надані невірні сертифікати або пароль, або минув термін ключа'))

        print('{} {} Перестав підписувати'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn))
        request_body = zlib.compress(signed_data)

        try:
            # if command != "cmd":
            #     return True
            # else:
            # return False
            start = datetime.now(tz.gettz(TIMEZONE))
            print('{} {} {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, 'Починаю відправляти до податкової'))
            answer = requests.post(url, data=request_body, headers=headers, timeout=15)
            print(
                '{} {} {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, 'Закінчив відправляти до податкової'))
            stop = datetime.now(tz.gettz(TIMEZONE))
            print('{} {} Операція зайняла за часом {} секунд'.format(stop, self.rro_fn, (stop - start).total_seconds()))

            ''' For tests offline uncomment '''
            # if command == "doc":
            #     return False

        except Exception as e:
            print('{} {} Помилка надсилання даних: {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            self.last_fiscal_error_code = 500
            self.last_fiscal_error_txt = str(e)
            # time.sleep(3)
            # if command != "cmd":
            #     data = self.get_fiscal_data_by_local_number(self.department.next_local_number, data)
            #     if data:
            #         return True
            #     else:
            #         return True
            # return False

            return False

        '''
            TransactionsRegistrarAbsent=1, ПРРО не зареєстрований
            OperatorAccessToTransactionsRegistrarNotGranted=2, Відсутній доступ до ПРРО для користувача
            InvalidTin = 3,  В документі зазначено реєстраційний код платника, що не дорівнює реєстраційному коду господарської одиниці
            ShiftAlreadyOpened = 4, Зміну для ПРРО наразі відкрито
            ShiftNotOpened = 5, Зміну для ПРРО наразі не відкрито
            LastDocumentMustBeZRep = 6, Останній документ, зареєстрований перед закриттям зміни, повинен бути Z-звітом
            CheckLocalNumberInvalid = 7, Некоректний локальний номер чека
            ZRepAlreadyRegistered = 8, Z-звіт наразі зареєстрований для поточної зміни
            DocumentValidationError = 9, Помилка валідації документа
            PackageValidationError = 10, Помилка валідації пакету офлайн документів
            InvalidQueryParameter = 11, Некоректний параметр запиту
            CryptographyError = 12 Помилка криптографічних функцій        
        '''
        print('{} {} Код відповіді {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, answer.status_code))

        message = answer.text
        if command == "cmd":
            print('{} {} Відповідь {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, message))

        if answer.status_code != 200:
            self.last_fiscal_error_code = answer.status_code
            self.last_fiscal_error_txt = str(message)

        if answer.status_code == 204:
            raise Exception('{}'.format(
                "Помилка 204. На фіскальному сервері немає об'єктів для роботи. Будь ласка, перевірте в"
                " Електронному кабінеті ДПС (Програмне РРО - Касири) наявність ідетифікатора вашого сертифіката."
                " Якщо Ви нещодавно подали форму №5-ПРРО для реєстрації ідентифікатора, зачекайте,"
                " потрібен час для синхронізації даних між серверами ДПС."))

        if answer.status_code == 500:
            print('{} {} Помилка надсилання даних на фіскальний сервер:  {}'.format(datetime.now(tz.gettz(TIMEZONE)),
                                                                                    self.rro_fn, message))
            return False

        if answer.status_code >= 400:
            print('{} {} Помилка надсилання даних на фіскальний сервер:  {}'.format(datetime.now(tz.gettz(TIMEZONE)),
                                                                                    self.rro_fn, message))

            if message.find('ShiftAlreadyOpened') != -1:
                error_rro_pos = message.find('наразі відкрито особою')
                if error_rro_pos > 0:
                    error_rro = message[error_rro_pos - 11:error_rro_pos - 1]

                    errr_key_pos = message.find("ідентифікатор ключа суб'єкта")
                    if error_rro_pos > 0:
                        error_key = message[errr_key_pos + 29:errr_key_pos + 93]

                        if error_rro == self.rro_fn and error_key == self.key.public_key:
                            data = self.get_fiscal_data_by_local_number(self.department.next_local_number, data)
                            # print(data)
                            if data:
                                self.last_fiscal_error_txt = ''
                                self.last_fiscal_error_code = 0
                                return True

                raise Exception("Помилка надсилання даних на фіскальний сервер: {}".format(message))

            if message.find('ZRepAlreadyRegistered') != -1:
                data = self.get_fiscal_data_by_local_number(self.department.next_local_number, data)
                # print(data)
                if data:
                    self.last_fiscal_error_txt = ''
                    self.last_fiscal_error_code = 0
                    return True

                raise Exception("Помилка надсилання даних на фіскальний сервер: {}".format(message))

            if message.find('Сторнуватись може лише останній документ') != -1:
                messages = message.split('\r\n')
                if len(messages) > 1:
                    message = messages[1]

                raise Exception("Помилка надсилання даних на фіскальний сервер: {}".format(message))

            if message.find('CryptographyError') != -1:
                # Переходимо до офлайну
                return False

            if message.find('DocumentValidationError') != -1:
                if message.find('реєстраційних') != -1:
                    # Код помилки для виклику процедури виправлення даних
                    return 9

            if message.find('CheckLocalNumberInvalid') != -1:
                # Код помилки для виклику процедури виправлення даних
                return 9

            if message.find('ShiftNotOpened') != -1:
                # Код помилки для виклику процедури виправлення даних
                return 9

            if message.find('ShiftAlreadyOpened') != -1:
                # Код помилки для виклику процедури виправлення даних
                return 9

            if message.find('InvalidTin') != -1:
                # Код помилки для виклику процедури виправлення даних
                return 9

            if message.find('Код помилки') != -1:
                raise Exception("Помилка надсилання даних на фіскальний сервер: {}".format(message))
            else:
                # Переходимо до офлайну
                return False

        elif answer.status_code == 204:
            print('{} {} {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, message))
            self.last_fiscal_error_txt = "no_content"
            raise Exception('{}'.format(answer.text))
            # return False
        else:
            # print(answer.status_code)
            # print(answer.content)
            if command == "cmd":
                if return_cmd_data:

                    try:
                        try:
                            (last_data, meta) = self.signer.unwrap(self.key.box_id, answer.content)
                        except Exception as e:
                            print('{} {} Помилка CryproError post_data 3 try 1:  {}'.format(
                                datetime.now(tz.gettz(TIMEZONE)),
                                self.rro_fn, e))
                            box_id = self.signer.update_bid(self.db, self.key)
                            (last_data, meta) = self.signer.unwrap(box_id, answer.content)
                            self.key.box_id = box_id
                            self.db.session.commit()

                    except Exception as e:
                        print('{} {} Помилка CryproError post_data 3 try 2:  {}'.format(
                            datetime.now(tz.gettz(TIMEZONE)),
                            self.rro_fn, e))
                        raise Exception('{}'.format(
                            'Помилка ключа криптографії, можливо надані невірні сертифікати або пароль, або минув термін ключа'))

                    # last_data = last_data.decode('windows-1251')
                    # print(last_data)
                    return last_data
                else:
                    try:
                        ret = json.loads(answer.text)
                        # print(ret)
                        return ret
                    except:
                        # print(answer.content)
                        # print(answer.text)
                        self.last_fiscal_error_txt = answer.text
                        raise Exception(
                            '{}'.format(answer.text))
            elif command == "pck":
                return answer.content.decode()
            else:
                try:
                    try:
                        (last_data, meta) = self.signer.unwrap(self.key.box_id, answer.content)
                    except Exception as e:
                        print('{} {} Помилка CryproError post_data 4 try 1:  {}'.format(
                            datetime.now(tz.gettz(TIMEZONE)),
                            self.rro_fn, e))

                        box_id = self.signer.update_bid(self.db, self.key)
                        (last_data, meta) = self.signer.unwrap(box_id, answer.content)
                        self.key.box_id = box_id
                        self.db.session.commit()

                except Exception as e:
                    print('{} {} Помилка CryproError post_data 3 try 2:  {}'.format(
                        datetime.now(tz.gettz(TIMEZONE)),
                        self.rro_fn, e))

                    raise Exception('{}'.format(
                        'Помилка ключа криптографії, можливо надані невірні сертифікати або пароль, або минув термін ключа'))

                print('{} {} Відповідь {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn,
                                                  last_data.decode('windows-1251')))
                error_code = etree.fromstring(last_data).xpath('//ERRORCODE/text()')
                error_text = etree.fromstring(last_data).xpath('//ERRORTEXT/text()')
                self.last_fiscal_ticket = last_data
                self.last_fiscal_error_code = error_code
                if len(error_code) > 0:
                    error_code = int(error_code[0])
                    if error_code == 0:
                        ordernum = etree.fromstring(last_data).xpath('//ORDERNUM/text()')
                        ordertaxnum = etree.fromstring(last_data).xpath('//ORDERTAXNUM/text()')
                        if len(ordernum) > 0:
                            ordernum = int(ordernum[0])
                        if len(ordertaxnum) > 0:
                            ordertaxnum = int(ordertaxnum[0])

                        offline_session_id = etree.fromstring(last_data).xpath('//OFFLINESESSIONID/text()')
                        offline_seed = etree.fromstring(last_data).xpath('//OFFLINESEED/text()')

                        taxorderdate = etree.fromstring(last_data).xpath('//ORDERDATE/text()')
                        taxordertime = etree.fromstring(last_data).xpath('//ORDERTIME/text()')

                        if len(offline_session_id) > 0:
                            self.department.prro_offline_session_id = offline_session_id[0]

                        if len(offline_seed) > 0:
                            self.department.prro_offline_seed = offline_seed[0]

                        print(
                            "{} {} Документ з локальним номером {} та фіскальним номером {} успішно відображено".format(
                                datetime.now(tz.gettz(TIMEZONE)),
                                self.rro_fn, ordernum, ordertaxnum))

                        if ordernum == self.department.next_local_number:
                            self.last_ordernum = ordernum
                            self.last_ordertaxnum = ordertaxnum
                            self.last_taxorderdate = taxorderdate[0]
                            self.last_taxordertime = taxordertime[0]
                            # self.department.next_local_number += 1

                            self.server_time = datetime.now(tz.gettz(TIMEZONE))

                            if self.last_taxorderdate and self.last_taxordertime:
                                self.fiscal_time = datetime.strptime(
                                    '{} {}'.format(self.last_taxorderdate, self.last_taxordertime),
                                    '%d%m%Y %H%M%S')
                            else:
                                self.fiscal_time = self.server_time

                            return True
                        else:
                            print(
                                "{} {} якась проблема з нумерацією, локальний номер у пам'яті {}, серверний локальний "
                                "номер {}, серверний фіскальний номер {}".format(datetime.now(tz.gettz(TIMEZONE)),
                                                                                 self.rro_fn,
                                                                                 self.department.next_local_number,
                                                                                 ordernum, ordertaxnum))
                    else:
                        raise Exception("{} {} Помилка, код {}: {}".format(datetime.now(tz.gettz(TIMEZONE)),
                                                                           self.rro_fn, error_code, error_text))

                return False

    def ServerState(self):

        cmd = {"Command": "ServerState"}
        data = self.post_data("cmd", cmd)
        if data:
            if 'Timestamp' in data:
                return data['Timestamp']

        return False

    def Objects(self, objects=None):
        """ Запит доступних об'єктів """
        cmd = {"Command": "Objects"}

        if not objects:
            data = self.post_data("cmd", cmd)
        else:
            data = objects

        if data:
            # print(data)

            if 'TaxObjects' in data:
                tax_objects = data['TaxObjects']

                if isinstance(tax_objects, list):
                    for tax_object in tax_objects:

                        registrars = tax_object['TransactionsRegistrars']

                        if isinstance(registrars, list):
                            for registrar in registrars:
                                if self.rro_fn == str(registrar['NumFiscal']):
                                    # self.department.address = tax_object['Address']
                                    # self.department.org_name = tax_object['OrgName']
                                    # self.department.name = tax_object['Name']
                                    # self.rro_department_name = registrar['Name']
                                    # self.department.tin = tax_object['Tin']
                                    # self.department.ipn = tax_object['Ipn']
                                    #
                                    # self.entity = tax_object['Entity']  # Ідентифікатор запису ГО - непонятное поле
                                    #
                                    # self.department.zn = registrar['NumLocal']
                                    # print("Требуемый РРО есть в базе налоговой")
                                    return data
        # else:
        #     print("Вернулся пустой массив объектов. Дальнейшая работа невозможна")

        return False

    def TransactionsRegistrarState(self):
        """ Запит стану ПРРО
            ShiftState = <0-зміну не відкрито, 1-зміну відкрито>,
            ShiftId = <Ідентифікатор зміни>,
            OpenShiftFiscalNum = <Фіскальний номер документа “Відкриття зміни”>,
            ZRepPresent = <Ознака присутності Z-звіту (false/true)>,
            Name = <П.І.Б. оператора, що відкрив зміну>,
            SubjectKeyId = <Ідентифікатор ключа суб’єкта сертифікату оператора, що відкрив зміну>,
            FirstLocalNum = <Перший внутрішній номер документа у зміні>,
            NextLocalNum = <Наступний внутрішній номер документа>,
            LastFiscalNum = <Останній фіскальний номер документа>,

            OfflineSupported = <Для ПРРО може використовуватись режим офлайн>,
            ChiefCashier = <Користувач є старшим касиром>,

            OfflineSessionId = <Ідентифікатор офлайн сесії (null – режим офлайн заборонений для ПРРО)>,
            OfflineSeed = <"Секретне число" для обчислення фіскального номера офлайн документа (null – режим офлайн заборонений для ПРРО)>,
            OfflineNextLocalNum = <Наступний локальний номер документа в офлайн сесії (null – режим офлайн заборонений для ПРРО)>,
            OfflineSessionDuration = <Тривалість офлайн сесії (хвилин) (null – режим офлайн заборонений для ПРРО)>,
            OfflineSessionsMonthlyDuration = <Сумарна тривалість офлайн сесій за поточний місяць (хвилин) (null – режим офлайн заборонений для ПРРО)>,

            Closed = <Ознака скасованої реєстрації ПРРО, на якому наразі не закрито зміну>,

            TaxObject = <Відомості об’єкту оподаткування (TaxObjectItem)>
        """
        cmd = {
            "Command": "TransactionsRegistrarState",
            "NumFiscal": self.rro_fn,
            "IncludeTaxObject": True,
        }
        data = self.post_data("cmd", cmd)

        return data

        # if data:
        # if 'ShiftState' in data:
        # self.shift_state = data['ShiftState']
        # self.department.next_local_number = data['NextLocalNum']
        # self.offline_supported = data['OfflineSupported']
        # self.chief_cashier = data['ChiefCashier']
        # if 'ShiftId' in data:
        #     self.fiscal_shift_id = data["ShiftId"]
        # if 'TaxObject' in data:
        #     tax_object = data['TaxObject']

        # registrars = tax_object['TransactionsRegistrars']
        # if isinstance(registrars, list):
        #     for registrar in registrars:
        #         if self.rro_fn == str(registrar['NumFiscal']):
        #             self.department.address = tax_object['Address']
        #             self.department.org_name = tax_object['OrgName']
        #             self.department.name = tax_object['Name']
        #             self.rro_department_name = registrar['Name']
        #             self.department.tin = tax_object['Tin']
        #             self.department.ipn = tax_object['Ipn']
        #
        #             self.entity = tax_object['Entity']  # Ідентифікатор запису ГО - непонятное поле
        #
        #             self.department.zn = registrar['NumLocal']
        # print("Требуемый РРО есть в базе налоговой")
        #     return data
        # else:
        #     return False

    def GetCheck(self, check_id, original=False):
        """ Запит чека """
        """ У відповідь надається XML документ чека, засвідчений КЕП сервера. """
        data = {
            "Command": "Check",
            "RegistrarNumFiscal": self.rro_fn,
            "NumFiscal": check_id,
            "Original": original,  # Признак запроса оригинала, направленного продавцом
        }
        data = self.post_data("cmd", data, True)
        return data
        # print(data)

    def GetCheckExt(self, check_id, type):
        """ Запит чека розширений """
        """ 
            “Data”:“<Результат запиту в кодуванні Base64>”,
            “ResultCode”: “<Код результату обробки запита документа>”,
            “ResultText”: “<Опис результату обробки запита документа>” 
        """
        ''' Типи даних запитів документів
            /// <summary>
            ///     Тип даних запита документа
            /// </summary>
            public enum DocumentRequestType {
                /// <summary>
                ///     Перевірка наявності документа
                /// </summary>
                Availability = 0,
            
                /// <summary>
                ///     Оригінальний XML
                /// </summary>
                OriginalXml = 1,
            
                /// <summary>
                ///     XML підписаний КЕП Фіскального Сервера
                /// </summary>
                SignedByServerXml = 2,
            
                /// <summary>
                ///     Документ в текстовому форматі для відображення (UTF-8)
                /// </summary>
                Visualization = 3,
            
                /// <summary>
                ///     XML підписаний КЕП відправника
                /// </summary>
                SignedBySenderXml = 4
            }'''
        # 0 {'Data': None, 'ResultCode': 0, 'ResultText': 'Ok'}
        # 1 {'Data': 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0id2luZG93cy0xMjUxIj8+DQo8Q0hFQ0sgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgeHNpOm5vTmFtZXNwYWNlU2NoZW1hTG9jYXRpb249ImNoZWNrMDEueHNkIj4NCiAgPENIRUNLSEVBRD4NCiAgICA8RE9DVFlQRT4xPC9ET0NUWVBFPg0KICAgIDxET0NTVUJUWVBFPjA8L0RPQ1NVQlRZUEU+DQogICAgPFVJRD4yMzI3NWZkMi1kYmQ5LTExZWEtYjMyOS04NWQzM2RkM2RkMWY8L1VJRD4NCiAgICA8VElOPjM0NTU0MzYyPC9USU4+DQogICAgPElQTj4xMjM0NTY3ODkwMTk8L0lQTj4NCiAgICA8T1JHTk0+0uXx8u7i6Okg7+vg8u3o6iAzPC9PUkdOTT4NCiAgICA8UE9JTlROTT7S5fHy7uLo6SDv6+Dy7ejqIDM8L1BPSU5UTk0+DQogICAgPFBPSU5UQUREUj7TytDAr83ALCDMLsrIr8Igz8XXxdDR3MrIySDQLc0sIMrov+IsIMTg7ffl7ergIDY8L1BPSU5UQUREUj4NCiAgICA8T1JERVJEQVRFPjExMDgyMDIwPC9PUkRFUkRBVEU+DQogICAgPE9SREVSVElNRT4xNjQ3MDM8L09SREVSVElNRT4NCiAgICA8T1JERVJOVU0+MjQzPC9PUkRFUk5VTT4NCiAgICA8Q0FTSERFU0tOVU0+NTwvQ0FTSERFU0tOVU0+DQogICAgPENBU0hSRUdJU1RFUk5VTT40MDAwMDIzMTAxPC9DQVNIUkVHSVNURVJOVU0+DQogICAgPFZFUj4xPC9WRVI+DQogICAgPE9SREVSVEFYTlVNPjc2MDA8L09SREVSVEFYTlVNPg0KICA8L0NIRUNLSEVBRD4NCiAgPENIRUNLVE9UQUw+DQogICAgPFNVTT40NzYuNTM8L1NVTT4NCiAgICA8Tk9UQVhTVU0+OTkuODg8L05PVEFYU1VNPg0KICAgIDxDT01NSVNTSU9OPjkuOTg8L0NPTU1JU1NJT04+DQogIDwvQ0hFQ0tUT1RBTD4NCiAgPENIRUNLUEFZPg0KICAgIDxST1cgUk9XTlVNPSIxIj4NCiAgICAgIDxQQVlGT1JNQ0Q+MDwvUEFZRk9STUNEPg0KICAgICAgPFBBWUZPUk1OTT7DztKywsrAPC9QQVlGT1JNTk0+DQogICAgICA8U1VNPjQ3Ni41MzwvU1VNPg0KICAgICAgPFBST1ZJREVEPjQ3Ni41MzwvUFJPVklERUQ+DQogICAgICA8UEFZU1lTPg0KICAgICAgICA8Uk9XIFJPV05VTT0iMSI+DQogICAgICAgICAgPE5BTUU+RkxBU0ggUEFZPC9OQU1FPg0KICAgICAgICAgIDxBQ1FVSVJFVFJBTlNJRD4xMjEyMTIxMjEyMTIxMjEyMTIxMjwvQUNRVUlSRVRSQU5TSUQ+DQogICAgICAgIDwvUk9XPg0KICAgICAgPC9QQVlTWVM+DQogICAgPC9ST1c+DQogIDwvQ0hFQ0tQQVk+DQogIDxDSEVDS1RBWD4NCiAgICA8Uk9XIFJPV05VTT0iMSI+DQogICAgICA8VFlQRT4wPC9UWVBFPg0KICAgICAgPE5BTUU+z8TCPC9OQU1FPg0KICAgICAgPExFVFRFUj5BPC9MRVRURVI+DQogICAgICA8UFJDPjIwLjAwPC9QUkM+DQogICAgICA8U0lHTj5mYWxzZTwvU0lHTj4NCiAgICAgIDxUVVJOT1ZFUj40NTAuMDA8L1RVUk5PVkVSPg0KICAgICAgPFNVTT4yMC4wMDwvU1VNPg0KICAgIDwvUk9XPg0KICA8L0NIRUNLVEFYPg0KICA8Q0hFQ0tQVEtTPg0KICAgIDxQVEtTTk0+QVZNUlBSVlo8L1BUS1NOTT4NCiAgICA8VEVSTUlOQUxOVU0+NTMzODgyNjk4PC9URVJNSU5BTE5VTT4NCiAgICA8VEVSTUlOQUxBRERSPtPK0MCvzcAsIMwuysivwiDPxdfF0NHcysjJINAtzSwgyui/4iwgxODt9+Xt6uAgNjwvVEVSTUlOQUxBRERSPg0KICAgIDxPUEVSTlVNPjI0MzwvT1BFUk5VTT4NCiAgICA8T1BFUlNZU05VTT4yNDM8L09QRVJTWVNOVU0+DQogIDwvQ0hFQ0tQVEtTPg0KICA8Q0hFQ0tCT0RZPg0KICAgIDxST1cgUk9XTlVNPSIxIj4NCiAgICAgIDxDT0RFPjE8L0NPREU+DQogICAgICA8TkFNRT7PxdDFysDHPC9OQU1FPg0KICAgICAgPEFNT1VOVD41LjAwMDwvQU1PVU5UPg0KICAgICAgPFBSSUNFPjUyLjMwPC9QUklDRT4NCiAgICAgIDxMRVRURVJTPkE8L0xFVFRFUlM+DQogICAgICA8Q09TVD40NzYuNTM8L0NPU1Q+DQogICAgICA8UkVDSVBJRU5UTk0+suLg7e7iIM/l8vDuILLi4O3u4uj3PC9SRUNJUElFTlROTT4NCiAgICAgIDxSRUNJUElFTlRJUE4+MTExMTExMTExMTExPC9SRUNJUElFTlRJUE4+DQogICAgICA8QkFOS0NEPjIyMjIyMjIyMjIyPC9CQU5LQ0Q+DQogICAgICA8QkFOS05NPs3g9rPu7eDr/O3o6SDh4O3qINPq8OC/7eg8L0JBTktOTT4NCiAgICAgIDxCQU5LUlM+VUEzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzwvQkFOS1JTPg0KICAgICAgPFBBWURFVEFJTFM+weDq4OkgSS7ALjwvUEFZREVUQUlMUz4NCiAgICAgIDxQQVlQVVJQT1NFPtHv6+Dy4CDj8O747uLu4+4g5+7h7uJg/+fg7e3/PC9QQVlQVVJQT1NFPg0KICAgICAgPFBBWUVSTk0+weDq4OkgSS6vLjwvUEFZRVJOTT4NCiAgICAgIDxQQVlFUklQTj43MDIxODkxMTgyODk8L1BBWUVSSVBOPg0KICAgICAgPFBBWURFVEFJTFNQPjA3NTk0MTA5MTUxMDgwODc8L1BBWURFVEFJTFNQPg0KICAgICAgPEJBU0lTUEFZPs3g6uDnILk2Nzc1NTQyPC9CQVNJU1BBWT4NCiAgICAgIDxQQVlPVVRUWVBFPjI8L1BBWU9VVFRZUEU+DQogICAgPC9ST1c+DQogICAgPFJPVyBST1dOVU09IjIiPg0KICAgICAgPENPREU+MTwvQ09ERT4NCiAgICAgIDxOQU1FPsrOzEnRSd88L05BTUU+DQogICAgICA8TEVUVEVSUz4xPC9MRVRURVJTPg0KICAgICAgPENPU1Q+ICAgICAgICAgICA1LjAwPC9DT1NUPg0KICAgIDwvUk9XPg0KICA8L0NIRUNLQk9EWT4NCjwvQ0hFQ0s+', 'ResultCode': 0, 'ResultText': 'Ok'}
        # 2 {
        #     'Data': 'MIIdlgYJKoZIhvcNAQcCoIIdhzCCHYMCAQExDjAMBgoqhiQCAQEBAQIBMIIKigYJKoZIhvcNAQcBoIIKewSCCnc8P3htbCB2ZXJzaW9uPSIxLjAiIGVuY29kaW5nPSJ3aW5kb3dzLTEyNTEiPz4NCjxDSEVDSyB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6bm9OYW1lc3BhY2VTY2hlbWFMb2NhdGlvbj0iY2hlY2swMS54c2QiPg0KICA8Q0hFQ0tIRUFEPg0KICAgIDxET0NUWVBFPjE8L0RPQ1RZUEU+DQogICAgPERPQ1NVQlRZUEU+MDwvRE9DU1VCVFlQRT4NCiAgICA8VUlEPjRkMmMxYzZmLWRiZDktMTFlYS1iMzI5LTg1ZDMzZGQzZGQxZjwvVUlEPg0KICAgIDxUSU4+MzQ1NTQzNjI8L1RJTj4NCiAgICA8SVBOPjEyMzQ1Njc4OTAxOTwvSVBOPg0KICAgIDxPUkdOTT7S5fHy7uLo6SDv6+Dy7ejqIDM8L09SR05NPg0KICAgIDxQT0lOVE5NPtLl8fLu4ujpIO/r4PLt6OogMzwvUE9JTlROTT4NCiAgICA8UE9JTlRBRERSPtPK0MCvzcAsIMwuysivwiDPxdfF0NHcysjJINAtzSwgyui/4iwgxODt9+Xt6uAgNjwvUE9JTlRBRERSPg0KICAgIDxPUkRFUkRBVEU+MTEwODIwMjA8L09SREVSREFURT4NCiAgICA8T1JERVJUSU1FPjE2NDgxNDwvT1JERVJUSU1FPg0KICAgIDxPUkRFUk5VTT4yNDc8L09SREVSTlVNPg0KICAgIDxDQVNIREVTS05VTT41PC9DQVNIREVTS05VTT4NCiAgICA8Q0FTSFJFR0lTVEVSTlVNPjQwMDAwMjMxMDE8L0NBU0hSRUdJU1RFUk5VTT4NCiAgICA8VkVSPjE8L1ZFUj4NCiAgICA8T1JERVJUQVhOVU0+NzYwNDwvT1JERVJUQVhOVU0+DQogIDwvQ0hFQ0tIRUFEPg0KICA8Q0hFQ0tUT1RBTD4NCiAgICA8U1VNPjQ3Ni41MzwvU1VNPg0KICAgIDxOT1RBWFNVTT45OS44ODwvTk9UQVhTVU0+DQogICAgPENPTU1JU1NJT04+OS45ODwvQ09NTUlTU0lPTj4NCiAgPC9DSEVDS1RPVEFMPg0KICA8Q0hFQ0tQQVk+DQogICAgPFJPVyBST1dOVU09IjEiPg0KICAgICAgPFBBWUZPUk1DRD4wPC9QQVlGT1JNQ0Q+DQogICAgICA8UEFZRk9STU5NPsPO0rLCysA8L1BBWUZPUk1OTT4NCiAgICAgIDxTVU0+NDc2LjUzPC9TVU0+DQogICAgICA8UFJPVklERUQ+NDc2LjUzPC9QUk9WSURFRD4NCiAgICAgIDxQQVlTWVM+DQogICAgICAgIDxST1cgUk9XTlVNPSIxIj4NCiAgICAgICAgICA8TkFNRT5GTEFTSCBQQVk8L05BTUU+DQogICAgICAgICAgPEFDUVVJUkVUUkFOU0lEPjEyMTIxMjEyMTIxMjEyMTIxMjEyPC9BQ1FVSVJFVFJBTlNJRD4NCiAgICAgICAgPC9ST1c+DQogICAgICA8L1BBWVNZUz4NCiAgICA8L1JPVz4NCiAgPC9DSEVDS1BBWT4NCiAgPENIRUNLVEFYPg0KICAgIDxST1cgUk9XTlVNPSIxIj4NCiAgICAgIDxUWVBFPjA8L1RZUEU+DQogICAgICA8TkFNRT7PxMI8L05BTUU+DQogICAgICA8TEVUVEVSPkE8L0xFVFRFUj4NCiAgICAgIDxQUkM+MjAuMDA8L1BSQz4NCiAgICAgIDxTSUdOPmZhbHNlPC9TSUdOPg0KICAgICAgPFRVUk5PVkVSPjQ1MC4wMDwvVFVSTk9WRVI+DQogICAgICA8U1VNPjIwLjAwPC9TVU0+DQogICAgPC9ST1c+DQogIDwvQ0hFQ0tUQVg+DQogIDxDSEVDS1BUS1M+DQogICAgPFBUS1NOTT5BVk1SUFJWWjwvUFRLU05NPg0KICAgIDxURVJNSU5BTE5VTT41MzM4ODI2OTg8L1RFUk1JTkFMTlVNPg0KICAgIDxURVJNSU5BTEFERFI+08rQwK/NwCwgzC7KyK/CIM/F18XQ0dzKyMkg0C3NLCDK6L/iLCDE4O335e3q4CA2PC9URVJNSU5BTEFERFI+DQogICAgPE9QRVJOVU0+MjQ3PC9PUEVSTlVNPg0KICAgIDxPUEVSU1lTTlVNPjI0NzwvT1BFUlNZU05VTT4NCiAgPC9DSEVDS1BUS1M+DQogIDxDSEVDS0JPRFk+DQogICAgPFJPVyBST1dOVU09IjEiPg0KICAgICAgPENPREU+MTwvQ09ERT4NCiAgICAgIDxOQU1FPs/F0MXKwMc8L05BTUU+DQogICAgICA8QU1PVU5UPjUuMDAwPC9BTU9VTlQ+DQogICAgICA8UFJJQ0U+NTIuMzA8L1BSSUNFPg0KICAgICAgPExFVFRFUlM+QTwvTEVUVEVSUz4NCiAgICAgIDxDT1NUPjQ3Ni41MzwvQ09TVD4NCiAgICAgIDxSRUNJUElFTlROTT6y4uDt7uIgz+Xy8O4gsuLg7e7i6Pc8L1JFQ0lQSUVOVE5NPg0KICAgICAgPFJFQ0lQSUVOVElQTj4xMTExMTExMTExMTE8L1JFQ0lQSUVOVElQTj4NCiAgICAgIDxCQU5LQ0Q+MjIyMjIyMjIyMjI8L0JBTktDRD4NCiAgICAgIDxCQU5LTk0+zeD2s+7t4Ov87ejpIOHg7eog0+rw4L/t6DwvQkFOS05NPg0KICAgICAgPEJBTktSUz5VQTMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzPC9CQU5LUlM+DQogICAgICA8UEFZREVUQUlMUz7B4Org6SBJLsAuPC9QQVlERVRBSUxTPg0KICAgICAgPFBBWVBVUlBPU0U+0e/r4PLgIOPw7vju4u7j7iDn7uHu4mD/5+Dt7f88L1BBWVBVUlBPU0U+DQogICAgICA8UEFZRVJOTT7B4Org6SBJLq8uPC9QQVlFUk5NPg0KICAgICAgPFBBWUVSSVBOPjcwMjE4OTExODI4OTwvUEFZRVJJUE4+DQogICAgICA8UEFZREVUQUlMU1A+MDc1OTQxMDkxNTEwODA4NzwvUEFZREVUQUlMU1A+DQogICAgICA8QkFTSVNQQVk+zeDq4OcguTY3NzU1NDI8L0JBU0lTUEFZPg0KICAgICAgPFBBWU9VVFRZUEU+MjwvUEFZT1VUVFlQRT4NCiAgICA8L1JPVz4NCiAgICA8Uk9XIFJPV05VTT0iMiI+DQogICAgICA8Q09ERT4xPC9DT0RFPg0KICAgICAgPE5BTUU+ys7MSdFJ3zwvTkFNRT4NCiAgICAgIDxMRVRURVJTPjE8L0xFVFRFUlM+DQogICAgICA8Q09TVD4gICAgICAgICAgIDUuMDA8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',
        #     'ResultCode': 0, 'ResultText': 'Ok'}
        # 3 {
        #     'Data': 'CQnQotC10YHRgtC+0LLQuNC5INC/0LvQsNGC0L3QuNC6IDMNCgkJ0KLQtdGB0YLQvtCy0LjQuSDQv9C70LDRgtC90LjQuiAzDQrQo9Ca0KDQkNCH0J3QkCwg0Jwu0JrQmNCH0JIg0J/QldCn0JXQoNCh0KzQmtCY0Jkg0KAt0J0sINCa0LjRl9CyLCDQlNCw0L3Rh9C10L3QutCwIDYNCgkJ0KDQtdCzLuKEliAzNDU1NDM2Mg0KCQnQpNGW0YHQutCw0LvRjNC90LjQuSDRh9C10LoNCtCf0KDQoNCeIDQwMDAwMjMxMDEvNSDQmtCQ0KHQkCANCtCn0JXQmiDQpNCdIDc2MDQv0JLQnSAyNDcNCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0NCjExLTA4LTIwMjAgMTY6NDg6MTQNCg==',
        #     'ResultCode': 0, 'ResultText': 'Ok'}
        # 4 {
        #     'Data': 'MIIv0wYJKoZIhvcNAQcCoIIvxDCCL8ACAQExDjAMBgoqhiQCAQEBAQIBMIIIuwYJKoZIhvcNAQcBoIIIrASCCKg8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSd3aW5kb3dzLTEyNTEnPz4KPENIRUNLIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTpub05hbWVzcGFjZVNjaGVtYUxvY2F0aW9uPSJjaGVjazAxLnhzZCI+CiAgPENIRUNLSEVBRD4KICAgIDxET0NUWVBFPjE8L0RPQ1RZUEU+CiAgICA8RE9DU1VCVFlQRT4wPC9ET0NTVUJUWVBFPgogICAgPFVJRD40ZDJjMWM2Zi1kYmQ5LTExZWEtYjMyOS04NWQzM2RkM2RkMWY8L1VJRD4KICAgIDxUSU4+MzQ1NTQzNjI8L1RJTj4KICAgIDxJUE4+MTIzNDU2Nzg5MDE5PC9JUE4+CiAgICA8T1JHTk0+0uXx8u7i6Okg7+vg8u3o6iAzPC9PUkdOTT4KICAgIDxQT0lOVE5NPtLl8fLu4ujpIO/r4PLt6OogMzwvUE9JTlROTT4KICAgIDxQT0lOVEFERFI+08rQwK/NwCwgzC7KyK/CIM/F18XQ0dzKyMkg0C3NLCDK6L/iLCDE4O335e3q4CA2PC9QT0lOVEFERFI+CiAgICA8T1JERVJEQVRFPjExMDgyMDIwPC9PUkRFUkRBVEU+CiAgICA8T1JERVJUSU1FPjE2NDgxNDwvT1JERVJUSU1FPgogICAgPE9SREVSTlVNPjI0NzwvT1JERVJOVU0+CiAgICA8Q0FTSERFU0tOVU0+NTwvQ0FTSERFU0tOVU0+CiAgICA8Q0FTSFJFR0lTVEVSTlVNPjQwMDAwMjMxMDE8L0NBU0hSRUdJU1RFUk5VTT4KICAgIDxWRVI+MTwvVkVSPgogICAgPE9SREVSVEFYTlVNPjc2MDQ8L09SREVSVEFYTlVNPgogIDwvQ0hFQ0tIRUFEPgogIDxDSEVDS1RPVEFMPjxTVU0+NDc2LjUzPC9TVU0+PE5PVEFYU1VNPjk5Ljg4PC9OT1RBWFNVTT48Q09NTUlTU0lPTj45Ljk4PC9DT01NSVNTSU9OPjwvQ0hFQ0tUT1RBTD4KICA8Q0hFQ0tQQVk+PFJPVyBST1dOVU09IjEiPjxQQVlGT1JNQ0Q+MDwvUEFZRk9STUNEPjxQQVlGT1JNTk0+w87SssLKwDwvUEFZRk9STU5NPjxTVU0+NDc2LjUzPC9TVU0+PFBST1ZJREVEPjQ3Ni41MzwvUFJPVklERUQ+PFBBWVNZUz48Uk9XIFJPV05VTT0iMSI+PE5BTUU+RkxBU0ggUEFZPC9OQU1FPjxBQ1FVSVJFVFJBTlNJRD4xMjEyMTIxMjEyMTIxMjEyMTIxMjwvQUNRVUlSRVRSQU5TSUQ+PC9ST1c+PC9QQVlTWVM+PC9ST1c+PC9DSEVDS1BBWT4KICA8Q0hFQ0tUQVg+PFJPVyBST1dOVU09IjEiPjxUWVBFPjA8L1RZUEU+PE5BTUU+z8TCPC9OQU1FPjxMRVRURVI+QTwvTEVUVEVSPjxQUkM+MjAuMDA8L1BSQz48U0lHTj5mYWxzZTwvU0lHTj48VFVSTk9WRVI+NDUwLjAwPC9UVVJOT1ZFUj48U1VNPjIwLjAwPC9TVU0+PC9ST1c+PC9DSEVDS1RBWD4KICA8Q0hFQ0tQVEtTPjxQVEtTTk0+QVZNUlBSVlo8L1BUS1NOTT48VEVSTUlOQUxOVU0+NTMzODgyNjk4PC9URVJNSU5BTE5VTT48VEVSTUlOQUxBRERSPtPK0MCvzcAsIMwuysivwiDPxdfF0NHcysjJINAtzSwgyui/4iwgxODt9+Xt6uAgNjwvVEVSTUlOQUxBRERSPjxPUEVSTlVNPjI0NzwvT1BFUk5VTT48T1BFUlNZU05VTT4yNDc8L09QRVJTWVNOVU0+PC9DSEVDS1BUS1M+CiAgPENIRUNLQk9EWT48Uk9XIFJPV05VTT0iMSI+PENPREU+MTwvQ09ERT48TkFNRT7PxdDFysDHPC9OQU1FPjxBTU9VTlQ+NS4wMDA8L0FNT1VOVD48UFJJQ0U+NTIuMzA8L1BSSUNFPjxMRVRURVJTPkE8L0xFVFRFUlM+PENPU1Q+NDc2LjUzPC9DT1NUPjxSRUNJUElFTlROTT6y4uDt7uIgz+Xy8O4gsuLg7e7i6Pc8L1JFQ0lQSUVOVE5NPjxSRUNJUElFTlRJUE4+MTExMTExMTExMTExPC9SRUNJUElFTlRJUE4+PEJBTktDRD4yMjIyMjIyMjIyMjwvQkFOS0NE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',
        #     'ResultCode': 0, 'ResultText': 'Ok'}

        data = {
            "Command": "CheckExt",
            "RegistrarNumFiscal": self.rro_fn,  # Фіскальний номер ПРРО
            "NumFiscal": check_id,  # Фіскальний номер чека
            "Type": type,  # Тип даних запита документа
            "AcquireCabinetUrl": True,
            # Ознака запиту посилання на сторінку візуалізації чека в Електронному кабінеті платника податків (false/true)
        }
        json_string = self.post_data("cmd", data, True)
        # print(json_string)
        if json_string:
            data = json.loads(json_string)
            # print(data)
            if data:
                if 'Data' in data:
                    coded_string = data['Data']
                    if coded_string:
                        return coded_string, data['CabinetUrl']
                    else:
                        message = data['ResultText']
                        # message = "Документ не знайдено"
                        raise Exception(message)

        return False, False

    def GetZReport(self, rro_id, check_id, original=False):
        """ Запит Z-звіту """
        """ 
            “Data”:“<Результат запиту в кодуванні Base64>”,
            “ResultCode”: “<Код результату обробки запита документа>”,
            “ResultText”: “<Опис результату обробки запита документа>” 
        """
        data = {
            "Command": "ZRep",
            "RegistrarNumFiscal": rro_id,  # Фіскальний номер ПРРО
            "NumFiscal": check_id,  # Фіскальний номер Z-звіту
            "Original": original,  # Признак запроса оригинала, направленного продавцом
        }
        data = self.post_data("cmd", data, True)
        return data

    def GetZReportEx(self, rro_id, check_id, type):
        """
            Тип даних запита документа

            Availability = 0, Перевірка наявності документа
            OriginalXml = 1, Оригінальний XML
            SignedByServerXml = 2, XML засвідчений КЕП Фіскального Сервера
            Visualization = 3, Документ в текстовому форматі для відображення (UTF-8)
            SignedBySenderXml = 4, XML засвідчений КЕП відправника
            SignedBySenderAndServerXml = 5 XML засвідчений КЕП відправника і КЕП Фіскального Сервера
        """

        """ ЗЗапит Z-звіту розширений """
        """ 
            “Data”:“<Результат запиту в кодуванні Base64>”,
            “ResultCode”: “<Код результату обробки запита документа>”,
            “ResultText”: “<Опис результату обробки запита документа>” 
        """
        data = {
            "Command": "ZRepExt",
            "RegistrarNumFiscal": rro_id,  # Фіскальний номер ПРРО
            "NumFiscal": check_id,  # Фіскальний номер Z-звіту
            "Type": type,  # Тип даних запита документа
        }
        json_string = self.post_data("cmd", data, True)
        # print(json_string)
        if json_string:
            data = json.loads(json_string)
            # print(data)
            if data:
                if 'Data' in data:
                    coded_string = data['Data']
                    if coded_string:
                        return coded_string
                    else:
                        message = data['ResultText']
                        # message = "Документ не знайдено"
                        raise Exception(message)

        return False

    def GetShifts(self, date_from, date_to):
        """ Запит переліку змін за період """
        """ 
            Дата і час представлені текстом у форматі ISO 8601 (наприклад, "2018-10-17T01:23:00+03:00" ) або JavaScript (наприклад, "/Date(1539723599000)/").
            ShiftId = <Ідентифікатор зміни>,
            OpenShiftFiscalNum = <Фіскальний номер документа “Відкриття зміни”>,
            CloseShiftFiscalNum = <Фіскальний номер документа “Закриття зміни”>,

            Opened = <Дата і час відкриття зміни>,
            OpenName = <П.І.Б. оператора, що відкрив зміну>,
            OpenSubjectKeyId = <Ідентифікатор ключа суб’єкта сертифікату оператора>,

            Closed = <Дата і час закриття зміни>,
            CloseName = <П.І.Б. оператора, що закрив зміну>,
            CloseSubjectKeyId = <Ідентифікатор ключа суб’єкта сертифікату оператора>,
            ZRepFiscalNum = <Фіскальний номер Z-звіту>
        """
        date_from = date_from.isoformat()
        date_to = date_to.isoformat()
        data = {
            "Command": "Shifts",
            "NumFiscal": self.rro_fn,  # Фіскальний номер ПРРО
            "From": date_from,  # Дата і час початку періоду
            "To": date_to,  # Дата і час завершення періоду
        }
        # print(data)
        data = self.post_data("cmd", data)
        if data:
            shifts_list = data['Shifts']
            # print(shifts_list)
            if isinstance(shifts_list, list):
                return shifts_list
        else:
            print("Список смен за период вернулся пустым")

        return []

    def GetDocuments(self, ShiftId, OpenShiftFiscalNum=None):
        """ Запит переліку документів зміни """
        """ Повинно бути заповненим або поле “ShiftId”, або поле “OpenShiftFiscalNum” """
        """ 
            NumFiscal = <Фіскальний номер документа>,
            NumLocal = <Локальний номер документа>,
            DocDateTime = <Дата і час операції, зафіксованої документом>,
            DocClass = <Клас документа (“Check”, “ZRep”)>,
            CheckDocType = <Тип чека (“SaleGoods”, …)>,
            Revoked = <Ознака відкликаного документа>,DOCTYPE
            Storned = <Ознака сторнованого документа>
        """
        data = {
            "Command": "Documents",
            "NumFiscal": self.rro_fn,  # Фіскальний номер ПРРО
            "ShiftId": ShiftId,  # Ідентифікатор зміни
            "OpenShiftFiscalNum": OpenShiftFiscalNum,  # Фіскальний номер документа “Відкриття зміни”
        }

        data = self.post_data("cmd", data)
        if data:
            documents_list = data['Documents']
            if isinstance(documents_list, list):
                return documents_list
        else:
            print("Список документов по номеру смены вернулся пустым")

        return []

    def LastShiftTotals(self):
        """ Запит підсумків останньої зміни """
        """ 
            ShiftState = <0-зміну не відкрито, 1-зміну відкрито>,
            ZRepPresent = <Ознака присутності Z-звіту (false/true)>,
            Totals = <Підсумки зміни (якщо зміну відкрито)>
        """
        data = {
            "Command": "LastShiftTotals",
            "NumFiscal": self.rro_fn,  # Фіскальний номер ПРРО
        }
        return self.post_data("cmd", data)

    def DocumentInfoByLocalNum(self, local_num):
        """ Запит відомостей про документ за локальним номером """
        """ 
            NumFiscal = <Фіскальний номер документа>,
            DocClass = <Клас документа (“Check”, “ZRep”)>,
            CheckDocType = <Тип чека (“SaleGoods”, …)>,
            Revoked = <Ознака відкликаного документа>,
            Storned = <Ознака сторнованого документа>
            {'NumFiscal': '7701', 'DocClass': 0, 'CheckDocType': 2, 'Revoked': False, 'Storned': False}
        """
        data = {
            "Command": "DocumentInfoByLocalNum",
            "NumFiscal": self.rro_fn,  # Фіскальний номер ПРРО
            "NumLocal": local_num,  # Локальний номер документа
        }
        data = self.post_data("cmd", data, False)
        # print(data)
        return data

    def send_doc(self, local_num):
        """ Запит відомостей про документ за локальним номером """
        """ 
            NumFiscal = <Фіскальний номер документа>,
            DocClass = <Клас документа (“Check”, “ZRep”)>,
            CheckDocType = <Тип чека (“SaleGoods”, …)>,
            Revoked = <Ознака відкликаного документа>,
            Storned = <Ознака сторнованого документа>
        """
        data = {
            "Command": "DocumentInfoByLocalNum",
            "NumFiscal": self.rro_fn,  # Фіскальний номер ПРРО
            "NumLocal": local_num,  # Локальний номер документа
        }
        return self.post_data("doc", data)

    def get_check_xml(self, doc_type, doc_sub_type=None, offline=False, dt=None, orderretnum=None, orderstornum=None,
                      prev_hash=None, offline_tax_number=None, revoke=None, testing=False, doc_uid=None):

        if not dt:
            dt = datetime.now(tz.gettz(TIMEZONE))

        check_date = dt.strftime("%d%m%Y")  # ddmmyyyy
        check_time = dt.strftime("%H%M%S")  # hhmmss

        attr_qname = etree.QName("http://www.w3.org/2001/XMLSchema-instance", "noNamespaceSchemaLocation")
        CHECK = etree.Element("CHECK", {attr_qname: 'check01.xsd'},
                              nsmap={'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
                              )
        CHECKHEAD = etree.SubElement(CHECK, "CHECKHEAD")

        #   <!--Тип документа (числовий):-->
        #   <!--0-Чек реалізації товарів/послуг, 1-Чек переказу коштів, 2–Чек операції обміну валюти, 3-Чек видачі готівки,
        #       100-Відкриття зміни, 101-Закриття зміни, 102-Початок офлайн сесії, 103-Завершення офлайн сесії-->

        DOCTYPE = etree.SubElement(CHECKHEAD, "DOCTYPE")
        DOCTYPE.text = str(doc_type)

        # 		<!--Розширений тип документа (числовий):-->
        # 		<!--0-Касовий чек (реалізація), 1-Видатковий чек (повернення), 2-Чек операції «службове внесення»/«отримання авансу»,
        # 			3-Чек операції «отримання підкріплення», 4–Чек операції «службова видача»/«інкасація»...-->
        if doc_sub_type != None:
            DOCSUBTYPE = etree.SubElement(CHECKHEAD, "DOCSUBTYPE")
            DOCSUBTYPE.text = str(doc_sub_type)

        if not doc_uid:
            doc_uid = uuid.uuid1()

        #   <!--Унікальний ідентифікатор документа (GUID)-->
        UID = etree.SubElement(CHECKHEAD, "UID")
        UID.text = '{}'.format(doc_uid)

        #   <!--ЄДРПОУ/ДРФО/№ паспорта продавця (10 символів)-->
        TIN = etree.SubElement(CHECKHEAD, "TIN")
        TIN.text = '{}'.format(self.department.tin)

        #   <!--Податковий номер або Індивідуальний номер платника ПДВ (12 символів)-->
        if self.department.ipn:
            IPN = etree.SubElement(CHECKHEAD, "IPN")
            IPN.text = '{}'.format(self.department.ipn)

        #   <!--Найменування продавця (256 символів)-->
        ORGNM = etree.SubElement(CHECKHEAD, "ORGNM")
        ORGNM.text = self.department.org_name

        #   <!--Найменування точки продаж (256 символів)-->
        POINTNM = etree.SubElement(CHECKHEAD, "POINTNM")
        POINTNM.text = self.department.name

        #   <!--Адреса точки продаж (256 символів)-->
        POINTADDR = etree.SubElement(CHECKHEAD, "POINTADDR")
        POINTADDR.text = self.department.address

        #   <!--Дата операції (ddmmyyyy)-->
        ORDERDATE = etree.SubElement(CHECKHEAD, "ORDERDATE")
        ORDERDATE.text = check_date

        #   <!--Час операції (hhmmss)-->
        ORDERTIME = etree.SubElement(CHECKHEAD, "ORDERTIME")
        ORDERTIME.text = check_time

        #   <!--Локальний номер документа (128 символів)-->
        ORDERNUM = etree.SubElement(CHECKHEAD, "ORDERNUM")
        ORDERNUM.text = str(self.department.next_local_number)

        #   <!--Локальний номер реєстратора розрахункових операцій (64 символи)-->
        CASHDESKNUM = etree.SubElement(CHECKHEAD, "CASHDESKNUM")
        CASHDESKNUM.text = str(self.department.zn)

        #   <!--Фіскальний номер реєстратора розрахункових операцій (128 символів)-->
        CASHREGISTERNUM = etree.SubElement(CHECKHEAD, "CASHREGISTERNUM")
        CASHREGISTERNUM.text = str(self.rro_fn)

        if revoke:
            #   <!--Ознака відкликання останнього онлайн документа через дублювання офлайн документом-->
            REVOKELASTONLINEDOC = etree.SubElement(CHECKHEAD, "REVOKELASTONLINEDOC")
            REVOKELASTONLINEDOC.text = 'true'

        if orderretnum:
            # <!--Фіскальний номер чека, для якого здійснюється повернення (зазначається тільки для чеків повернення) (128 символів)-->
            ORDERRETNUM = etree.SubElement(CHECKHEAD, "ORDERRETNUM")
            ORDERRETNUM.text = '{}'.format(orderretnum)

        if orderstornum:
            # <!--Фіскальний номер чека, для якого здійснюється сторнування (зазначається тільки для чеків сторнування) (128 символів)-->
            ORDERSTORNUM = etree.SubElement(CHECKHEAD, "ORDERSTORNUM")
            ORDERSTORNUM.text = '{}'.format(orderstornum)

        if self.cashier_name:
            #   <!--ПІБ касира (128 символів)-->
            CASHIER = etree.SubElement(CHECKHEAD, "CASHIER")
            CASHIER.text = '{}'.format(self.cashier_name)

        #   <!--Версія формату документа (числовий)-->
        VER = etree.SubElement(CHECKHEAD, "VER")
        VER.text = '1'

        if offline:

            #   <!--Фіскальний номер документа (128 символів)-->
            ORDERTAXNUM = etree.SubElement(CHECKHEAD, "ORDERTAXNUM")
            ORDERTAXNUM.text = '{}'.format(offline_tax_number)

            # <!--Ознака офлайн документа-->
            OFFLINE = etree.SubElement(CHECKHEAD, "OFFLINE")
            OFFLINE.text = 'true'

            if prev_hash:
                # <!--Геш попереднього документа в режимі офлайн (64 символи)-->
                PREVDOCHASH = etree.SubElement(CHECKHEAD, "PREVDOCHASH")
                PREVDOCHASH.text = '{}'.format(prev_hash)

        if testing:
            # <!--Ознака тестового нефіскального документа-->
            TESTING = etree.SubElement(CHECKHEAD, "TESTING")
            TESTING.text = 'true'

        return CHECK

    def open_shift(self, dt, testing=False, offline=False, prev_hash=None, doc_uid=None):
        """ Службовий чек відкриття зміни (форма №3-ПРРО) """

        if offline:
            offline_tax_number = self.calculate_offline_tax_number(dt, prev_hash=prev_hash)
        else:
            offline_tax_number = None

        CHECK = self.get_check_xml(100, dt=dt, testing=testing, offline=offline,
                                   prev_hash=prev_hash, offline_tax_number=offline_tax_number)

        xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
        print(xml.decode('windows-1251'))

        try:
            xmlschema_doc = etree.parse(self.xsd_path)
            xmlschema = etree.XMLSchema(xmlschema_doc)
            xmlschema.assertValid(CHECK)
        except etree.DocumentInvalid as e:
            print('{} {} Помилка XML (pretest): {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            return 9

        if offline:
            try:
                signed_data = self.signer.sign(self.key.box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
            except Exception as e:
                box_id = self.signer.update_bid(self.db, self.key)
                signed_data = self.signer.sign(box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
                self.key.box_id = box_id
                self.db.session.commit()

            return base64.b64encode(xml).decode(), signed_data, offline_tax_number, sha256(xml).hexdigest()

        ret = self.post_data("doc", xml)
        if ret:
            if ret == 9:
                return ret

            print("{} Зміна успішно відкрита".format(self.rro_fn))
            self.last_xml = xml
            return True

        return False

    def to_offline(self, dt, testing=False, revoke=True):
        """ Службовий чек (форма №3-ПРРО) """

        offline_tax_number = self.calculate_offline_tax_number(dt)

        CHECK = self.get_check_xml(102, offline=True, dt=dt, prev_hash=None, offline_tax_number=offline_tax_number,
                                   revoke=revoke, testing=False)

        xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
        print(xml.decode('windows-1251'))

        try:
            xmlschema_doc = etree.parse(self.xsd_path)
            xmlschema = etree.XMLSchema(xmlschema_doc)
            xmlschema.assertValid(CHECK)
        except etree.DocumentInvalid as e:
            print('{} {} Помилка XML (pretest): {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            return 9

        try:
            signed_data = self.signer.sign(self.key.box_id, xml, role=self.key.key_role, tax=False,
                                           tsp=False, ocsp=False)
        except Exception as e:
            box_id = self.signer.update_bid(self.db, self.key)
            signed_data = self.signer.sign(box_id, xml, role=self.key.key_role, tax=False,
                                           tsp=False, ocsp=False)
            self.key.box_id = box_id
            self.db.session.commit()

        return xml, signed_data, offline_tax_number

    def post_storno(self, tax_id, dt, testing=False, offline=False, prev_hash=None, doc_uid=None):
        """ Службовий чек сторно """

        if offline:
            offline_tax_number = self.calculate_offline_tax_number(dt, prev_hash=prev_hash)
        else:
            offline_tax_number = None

        CHECK = self.get_check_xml(0, 5, dt=dt, orderstornum=tax_id, testing=testing, offline=offline,
                                   prev_hash=prev_hash, offline_tax_number=offline_tax_number)

        xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
        print(xml.decode('windows-1251'))

        try:
            xmlschema_doc = etree.parse(self.xsd_path)
            xmlschema = etree.XMLSchema(xmlschema_doc)
            xmlschema.assertValid(CHECK)
        except etree.DocumentInvalid as e:
            print('{} {} Помилка XML (pretest): {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            return 9

        if offline:
            try:
                signed_data = self.signer.sign(self.key.box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
            except Exception as e:
                box_id = self.signer.update_bid(self.db, self.key)
                signed_data = self.signer.sign(box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
                self.key.box_id = box_id
                self.db.session.commit()

            return xml, signed_data, offline_tax_number, sha256(xml).hexdigest()

        ret = self.post_data("doc", xml)
        if ret:
            if ret == 9:
                return ret

            print("Сторно чека {} успешно отправлено".format(tax_id))
            self.last_xml = xml
            return True
        else:
            print("Ошибка отправки сторно чека {}".format(tax_id))

        return False

    def post_advances(self, summa, dt, testing=False, offline=False, prev_hash=None, doc_uid=None):
        """ Службовий чек (форма №3-ПРРО) """

        if offline:
            offline_tax_number = self.calculate_offline_tax_number(dt, doc_sum=summa, prev_hash=prev_hash)
        else:
            offline_tax_number = None

        CHECK = self.get_check_xml(0, 2, dt=dt, testing=testing, offline=offline, prev_hash=prev_hash,
                                   offline_tax_number=offline_tax_number)

        ''' <!--Підсумок по чеку--> '''
        CHECKTOTAL = etree.SubElement(CHECK, "CHECKTOTAL")
        CHECKTOTAL.text = ''

        ''' <!--Загальна сума (15.2 цифри)--> '''
        SUM = etree.SubElement(CHECKTOTAL, "SUM")
        SUM.text = "{:.2f}".format(summa)

        xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
        print(xml.decode('windows-1251'))

        try:
            xmlschema_doc = etree.parse(self.xsd_path)
            xmlschema = etree.XMLSchema(xmlschema_doc)
            xmlschema.assertValid(CHECK)
        except etree.DocumentInvalid as e:
            print('{} {} Помилка XML (pretest): {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            return 9

        if offline:
            try:
                signed_data = self.signer.sign(self.key.box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
            except Exception as e:
                box_id = self.signer.update_bid(self.db, self.key)
                signed_data = self.signer.sign(box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
                self.key.box_id = box_id
                self.db.session.commit()

            return xml, signed_data, offline_tax_number, sha256(xml).hexdigest()

        ret = self.post_data("doc", xml)
        if ret:
            if ret == 9:
                return ret

            print("Аванс успешно отправлен")
            self.last_xml = xml
            return True
        else:
            print("Ошибка отправки аванса")

        return False

    def post_inkass(self, summa, dt, testing=False, offline=False, prev_hash=None, doc_uid=None):
        """ Службовий чек (форма №3-ПРРО) """

        if offline:
            offline_tax_number = self.calculate_offline_tax_number(dt, doc_sum=summa, prev_hash=prev_hash)
        else:
            offline_tax_number = None

        CHECK = self.get_check_xml(0, 4, dt=dt, testing=testing, offline=offline, prev_hash=prev_hash,
                                   offline_tax_number=offline_tax_number, doc_uid=doc_uid)

        ''' <!--Підсумок по чеку--> '''
        CHECKTOTAL = etree.SubElement(CHECK, "CHECKTOTAL")
        CHECKTOTAL.text = ''

        ''' <!--Загальна сума (15.2 цифри)--> '''
        SUM = etree.SubElement(CHECKTOTAL, "SUM")
        SUM.text = "{:.2f}".format(summa)

        xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
        print(xml.decode('windows-1251'))

        try:
            xmlschema_doc = etree.parse(self.xsd_path)
            xmlschema = etree.XMLSchema(xmlschema_doc)
            xmlschema.assertValid(CHECK)
        except etree.DocumentInvalid as e:
            print('{} {} Помилка XML (pretest): {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            return 9

        if offline:
            try:
                signed_data = self.signer.sign(self.key.box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
            except Exception as e:
                box_id = self.signer.update_bid(self.db, self.key)
                signed_data = self.signer.sign(self.key.box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
                self.key.box_id = box_id
                self.db.session.commit()

            return xml, signed_data, offline_tax_number, sha256(xml).hexdigest()

        ret = self.post_data("doc", xml)
        if ret:
            if ret == 9:
                return ret

            print("Инкасс успешно отправлен")
            self.last_xml = xml
            return True
        else:
            print("Ошибка отправки инкасса")

        return False

    def post_podkrep(self, summa, dt, testing=False, offline=False, prev_hash=None, doc_uid=None):
        """ Службовий чек (форма №3-ПРРО) """

        if offline:
            offline_tax_number = self.calculate_offline_tax_number(dt, doc_sum=summa, prev_hash=prev_hash)
        else:
            offline_tax_number = None

        CHECK = self.get_check_xml(0, 3, dt=dt, testing=testing, offline=offline, prev_hash=prev_hash,
                                   offline_tax_number=offline_tax_number, doc_uid=doc_uid)

        ''' <!--Підсумок по чеку--> '''
        CHECKTOTAL = etree.SubElement(CHECK, "CHECKTOTAL")
        CHECKTOTAL.text = ''

        ''' <!--Загальна сума (15.2 цифри)--> '''
        SUM = etree.SubElement(CHECKTOTAL, "SUM")
        SUM.text = "{:.2f}".format(summa)

        xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
        print(xml.decode('windows-1251'))

        try:
            xmlschema_doc = etree.parse(self.xsd_path)
            xmlschema = etree.XMLSchema(xmlschema_doc)
            xmlschema.assertValid(CHECK)
        except etree.DocumentInvalid as e:
            print('{} {} Помилка XML (pretest): {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            return 9

        if offline:
            try:
                signed_data = self.signer.sign(self.key.box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
            except Exception as e:
                box_id = self.signer.update_bid(self.db, self.key)
                signed_data = self.signer.sign(box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
                self.key.box_id = box_id
                self.db.session.commit()

            return xml, signed_data, offline_tax_number, sha256(xml).hexdigest()

        ret = self.post_data("doc", xml)
        if ret:
            if ret == 9:
                return ret

            print("Подкрепление успешно отправлено")
            self.last_xml = xml
            return True
        else:
            print("Ошибка отправки подкрепления")

        return False

    def post_sale(self, summa, discount, reals, taxes, pays, dt, totals=None, sales_ret=False, orderretnum=None,
                  testing=False, offline=False, prev_hash=None, doc_uid=None):
        """ Службовий чек (форма №3-ПРРО) """

        op = 0
        if sales_ret:
            op = 1

        if offline:
            paysum = 0
            if pays:
                for pay in pays:
                    paysum = pay['SUM']

            offline_tax_number = self.calculate_offline_tax_number(dt, doc_sum=paysum, prev_hash=prev_hash)
        else:
            offline_tax_number = None

        CHECK = self.get_check_xml(0, op, dt=dt, orderretnum=orderretnum, testing=testing, offline=offline,
                                   prev_hash=prev_hash, offline_tax_number=offline_tax_number, doc_uid=doc_uid)

        ''' <!--Підсумок по чеку--> '''
        CHECKTOTAL = etree.SubElement(CHECK, "CHECKTOTAL")
        CHECKTOTAL.text = ''

        if totals:
            if 'SUM' in totals:
                ''' <!--Загальна сума (15.2 цифри)--> '''
                SUM = etree.SubElement(CHECKTOTAL, "SUM")
                SUM.text = "{:.2f}".format(totals['SUM'])

            if 'RNDSUM' in totals:
                ''' <!--Заокруглення (15.2 цифри) (наприклад, 0.71)--> '''
                SUM = etree.SubElement(CHECKTOTAL, "RNDSUM")
                SUM.text = "{:.2f}".format(totals['RNDSUM'])

            if 'NORNDSUM' in totals:
                ''' <!--Загальна сума без заокруглення (15.2 цифри) (наприклад, 1000.71)--> '''
                SUM = etree.SubElement(CHECKTOTAL, "NORNDSUM")
                SUM.text = "{:.2f}".format(totals['NORNDSUM'])

        else:
            ''' <!--Загальна сума (15.2 цифри)--> '''
            SUM = etree.SubElement(CHECKTOTAL, "SUM")
            SUM.text = "{:.2f}".format(summa - discount)

        if discount != 0:
            ''' <!--Загальна сума знижки/націнки (15.2 цифри)--> '''
            DISCOUNTSUM = etree.SubElement(CHECKTOTAL, "DISCOUNTSUM")
            DISCOUNTSUM.text = "{:.2f}".format(discount)

        if pays:
            rownum = 0
            ''' <!--Реалізація--> '''
            CHECKPAY = etree.SubElement(CHECK, "CHECKPAY")
            CHECKPAY.text = ''

            for pay in pays:
                rownum += 1

                ROW = etree.SubElement(CHECKPAY, "ROW", ROWNUM="{}".format(rownum))
                ROW.text = ''

                if 'PAYFORMCD' in pay:
                    # <!--Код форми оплати (числовий):-->
                    # <!--0–Готівка, 1–Банківська картка...-->
                    PAYFORMCD = etree.SubElement(ROW, "PAYFORMCD")
                    PAYFORMCD.text = '{:d}'.format(pay['PAYFORMCD'])

                if 'PAYFORMNM' in pay:
                    # <!--Найменування форми оплати (128 символів)-->
                    PAYFORMNM = etree.SubElement(ROW, "PAYFORMNM")
                    PAYFORMNM.text = '{}'.format(pay['PAYFORMNM'])

                if 'SUM' in pay:
                    # <!--Сума оплати (15.2 цифри)-->
                    SUM = etree.SubElement(ROW, "SUM")
                    SUM.text = '{:.2f}'.format(pay['SUM'])

                if 'PROVIDED' in pay:
                    # <!--Сума внесених коштів (15.2 цифри)-->
                    PROVIDED = etree.SubElement(ROW, "PROVIDED")
                    PROVIDED.text = '{:.2f}'.format(pay['PROVIDED'])

                if 'REMAINS' in pay:
                    # <!--Решта (не зазначається, якщо решта відсутня) (15.2 цифри)-->
                    REMAINS = etree.SubElement(ROW, "REMAINS")
                    REMAINS.text = '{:.2f}'.format(pay['REMAINS'])

                if 'PAYSYS' in pay:
                    # <!--Платіжні системи-->
                    PAYSYS = etree.SubElement(ROW, "PAYSYS")
                    PAYSYS.text = ''

                    rownum_paysys = 0
                    for pay_sys_item in pay['PAYSYS']:
                        rownum_paysys += 1

                        PAYSYSROW = etree.SubElement(PAYSYS, "ROW", ROWNUM="{}".format(rownum_paysys))
                        PAYSYSROW.text = ''

                        if 'TAXNUM' in pay_sys_item:
                            # <!--Податковий номер платіжної системи (64 символи)-->
                            TAXNUM = etree.SubElement(PAYSYSROW, "TAXNUM")
                            TAXNUM.text = '{}'.format(pay_sys_item['TAXNUM'])

                        if 'NAME' in pay_sys_item:
                            # <!--Найменування платіжної системи (текст)-->
                            NAME = etree.SubElement(PAYSYSROW, "NAME")
                            NAME.text = '{}'.format(pay_sys_item['NAME'])

                        if 'ACQUIREPN' in pay_sys_item:
                            # <!--Податковий номер еквайра торговця (64 символи)-->
                            ACQUIREPN = etree.SubElement(PAYSYSROW, "ACQUIREPN")
                            ACQUIREPN.text = '{}'.format(pay_sys_item['ACQUIREPN'])

                        if 'ACQUIRENM' in pay_sys_item:
                            # <!--Найменування еквайра торговця (текст)-->
                            ACQUIRENM = etree.SubElement(PAYSYSROW, "ACQUIRENM")
                            ACQUIRENM.text = '{}'.format(pay_sys_item['ACQUIRENM'])

                        if 'ACQUIRETRANSID' in pay_sys_item:
                            # <!--Ідентифікатор транзакції, що надається еквайром та ідентифікує операцію в платіжній системі (128 символів)-->
                            ACQUIRETRANSID = etree.SubElement(PAYSYSROW, "ACQUIRETRANSID")
                            ACQUIRETRANSID.text = '{}'.format(pay_sys_item['ACQUIRETRANSID'])

                        if 'POSTRANSDATE' in pay_sys_item:
                            # <!--POS-термінал. Дата та час транзакції (ддммррррггххсс)-->
                            POSTRANSDATE = etree.SubElement(PAYSYSROW, "POSTRANSDATE")
                            pos_dt = dateutil.parser.isoparse(pay_sys_item['POSTRANSDATE']).strftime("%d%m%Y%H%M%S")
                            POSTRANSDATE.text = '{}'.format(pos_dt)

                        if 'POSTRANSNUM' in pay_sys_item:
                            # <!--POS-термінал. Номер чека транзакції (128 символів)-->
                            POSTRANSNUM = etree.SubElement(PAYSYSROW, "POSTRANSNUM")
                            POSTRANSNUM.text = '{}'.format(pay_sys_item['POSTRANSNUM'])

                        if 'DEVICEID' in pay_sys_item:
                            # <!--Ідентифікатор платіжного пристрою (128 символів)-->
                            DEVICEID = etree.SubElement(PAYSYSROW, "DEVICEID")
                            DEVICEID.text = '{}'.format(pay_sys_item['DEVICEID'])

                        if 'EPZDETAILS' in pay_sys_item:
                            # <!--Реквізити електронного платіжного засобу (128 символів)-->
                            EPZDETAILS = etree.SubElement(PAYSYSROW, "EPZDETAILS")
                            EPZDETAILS.text = '{}'.format(pay_sys_item['EPZDETAILS'])

                        if 'AUTHCD' in pay_sys_item:
                            # <!--Код авторизації (64 символи)-->
                            AUTHCD = etree.SubElement(PAYSYSROW, "AUTHCD")
                            AUTHCD.text = '{}'.format(pay_sys_item['AUTHCD'])

                        if 'SUM' in pay_sys_item:
                            # <!--Сума оплати (15.2 цифри)-->
                            SUM = etree.SubElement(PAYSYSROW, "SUM")
                            SUM.text = '{:.2f}'.format(pay_sys_item['SUM'])

                        if 'COMMISSION' in pay_sys_item:
                            # <!--Сума комісії (15.2 цифри)-->
                            COMMISSION = etree.SubElement(PAYSYSROW, "COMMISSION")
                            COMMISSION.text = '{:.2f}'.format(pay_sys_item['COMMISSION'])

        if taxes:
            rownum = 0

            ''' <!--Податки/Збори--> '''
            CHECKTAX = etree.SubElement(CHECK, "CHECKTAX")
            CHECKTAX.text = ''

            for tax in taxes:
                rownum += 1

                ROW = etree.SubElement(CHECKTAX, "ROW", ROWNUM="{}".format(rownum))
                ROW.text = ''

                if 'TYPE' in tax:
                    # <!--Код виду податку/збору (числовий): 0-ПДВ,1-Акциз,2-ПФ...-->
                    TYPE = etree.SubElement(ROW, "TYPE")
                    TYPE.text = '{:d}'.format(tax['TYPE'])

                if 'NAME' in tax:
                    # <!--Найменування виду податку/збору (64 символи)-->
                    NAME = etree.SubElement(ROW, "NAME")
                    NAME.text = '{}'.format(tax['NAME'])

                if 'LETTER' in tax:
                    # <!--Літерне позначення виду і ставки податку/збору (А,Б,В,Г,...) (1 символ)-->
                    LETTER = etree.SubElement(ROW, "LETTER")
                    LETTER.text = '{}'.format(tax['LETTER'])

                if 'PRC' in tax:
                    #  <!--Відсоток податку/збору (15.2 цифри)-->
                    PRC = etree.SubElement(ROW, "PRC")
                    PRC.text = '{:.2f}'.format(tax['PRC'])

                if 'SIGN' in tax:
                    # <!--Ознака податку/збору, не включеного у вартість-->
                    if tax['SIGN']:
                        SIGN = etree.SubElement(ROW, "SIGN")
                        SIGN.text = 'true'

                if 'TURNOVER' in tax:
                    # <!--Сума для розрахування податку/збору (15.2 цифри)-->
                    TURNOVER = etree.SubElement(ROW, "TURNOVER")
                    TURNOVER.text = '{:.2f}'.format(tax['TURNOVER'])

                if 'TURNOVERDISCOUNT' in tax:
                    # <!--Сума обсягів для розрахування податку/збору з урахуванням знижки (15.2 цифри)-->
                    TURNOVERDISCOUNT = etree.SubElement(ROW, "TURNOVERDISCOUNT")
                    TURNOVERDISCOUNT.text = '{:.2f}'.format(tax['TURNOVERDISCOUNT'])

                if 'SOURCESUM' in tax:
                    # <!--Вихідна сума для розрахування податку/збору (15.2 цифри)-->
                    SOURCESUM = etree.SubElement(ROW, "SOURCESUM")
                    SOURCESUM.text = '{:.2f}'.format(tax['SOURCESUM'])

                if 'SUM' in tax:
                    # <!--Сума податку/збору (15.2 цифри)-->
                    SUM = etree.SubElement(ROW, "SUM")
                    SUM.text = '{:.2f}'.format(tax['SUM'])

        if reals:
            rownum = 0

            CHECKBODY = etree.SubElement(CHECK, "CHECKBODY")
            CHECKBODY.text = ''

            for real in reals:
                rownum += 1

                ROW = etree.SubElement(CHECKBODY, "ROW", ROWNUM="{}".format(rownum))
                ROW.text = ''

                if 'CODE' in real:
                    # <!--Внутрішній код товару (64 символи)-->
                    CODE = etree.SubElement(ROW, "CODE")
                    CODE.text = '{}'.format(real['CODE'])

                if 'BARCODE' in real:
                    # <!--Штриховий код товару (64 символи)-->
                    BARCODE = etree.SubElement(ROW, "BARCODE")
                    BARCODE.text = '{}'.format(real['BARCODE'])

                if 'UKTZED' in real:
                    # <!--Код товару згідно з УКТЗЕД (15 цифр)-->
                    UKTZED = etree.SubElement(ROW, "UKTZED")
                    UKTZED.text = '{}'.format(real['UKTZED'])

                if 'DKPP' in real:
                    # <!--Код послуги згідно з ДКПП (15 символів)-->
                    DKPP = etree.SubElement(ROW, "DKPP")
                    DKPP.text = '{}'.format(real['DKPP'])

                if 'NAME' in real:
                    # <!--Найменування товару, послуги або операції (текст)-->
                    NAME = etree.SubElement(ROW, "NAME")
                    NAME.text = '{}'.format(real['NAME'])

                if 'DESCRIPTION' in real:
                    # <!--Опис товару, послуги або операції (текст)-->
                    DESCRIPTION = etree.SubElement(ROW, "DESCRIPTION")
                    DESCRIPTION.text = '{}'.format(real['DESCRIPTION'])

                if 'UNITCD' in real:
                    # <!--Код одиниці виміру згідно класифікатора (5 цифр)-->
                    UNITCD = etree.SubElement(ROW, "UNITCD")
                    UNITCD.text = '{}'.format(real['UNITCD'])

                if 'UNITNM' in real:
                    # <!--Найменування одиниці виміру (64 символи)-->
                    UNITNM = etree.SubElement(ROW, "UNITNM")
                    UNITNM.text = '{}'.format(real['UNITNM'])

                if 'AMOUNT' in real:
                    # <!--Кількість/об’єм товару (15.3 цифри)-->
                    AMOUNT = etree.SubElement(ROW, "AMOUNT")
                    AMOUNT.text = '{:.3f}'.format(real['AMOUNT'])

                if 'PRICE' in real:
                    # <!--Ціна за одиницю товару (15.2 цифри)-->
                    PRICE = etree.SubElement(ROW, "PRICE")
                    PRICE.text = '{:.2f}'.format(real['PRICE'])

                if 'LETTERS' in real:
                    # <!--Літерні позначення видів і ставок податків/зборів (15 символів)-->
                    LETTERS = etree.SubElement(ROW, "LETTERS")
                    LETTERS.text = '{}'.format(real['LETTERS'])

                if 'COST' in real:
                    # <!--Сума операції (15.2 цифри)-->
                    COST = etree.SubElement(ROW, "COST")
                    COST.text = '{:.2f}'.format(real['COST'])

                # <!--Знижка/націнка-->
                if 'USAGETYPE' in real:
                    # <!--Тип застосування знижки/націнки (числовий): 0–Попередній продаж, 1–Проміжний підсумок, 2–Спеціальна...-->
                    USAGETYPE = etree.SubElement(ROW, "USAGETYPE")
                    USAGETYPE.text = '{:d}'.format(real['USAGETYPE'])

                if 'DISCOUNTTYPE' in real:
                    # <!--Тип знижки/націнки (числовий): 0–Сумова, 1–Відсоткова-->
                    DISCOUNTTYPE = etree.SubElement(ROW, "DISCOUNTTYPE")
                    DISCOUNTTYPE.text = '{:d}'.format(real['DISCOUNTTYPE'])

                if 'SUBTOTAL' in real:
                    # <!--Проміжна сума чеку, на яку нараховується знижка/націнка (15.2 цифри)-->
                    SUBTOTAL = etree.SubElement(ROW, "SUBTOTAL")
                    SUBTOTAL.text = '{:.2f}'.format(real['SUBTOTAL'])

                if 'DISCOUNTNUM' in real:
                    # <!--Порядковий номер операції, до якої відноситься знижка/націнка. Присутній, якщо знижка/націнка стосується лише однієї операції. (числовий)-->
                    DISCOUNTNUM = etree.SubElement(ROW, "DISCOUNTNUM")
                    DISCOUNTNUM.text = '{:d}'.format(real['DISCOUNTNUM'])

                if 'DISCOUNTTAX' in real:
                    # <!--Податок, якщо знижка/націнка стосується лише одного податку (1 символ)-->
                    DISCOUNTTAX = etree.SubElement(ROW, "DISCOUNTTAX")
                    DISCOUNTTAX.text = '{}'.format(real['DISCOUNTTAX'])

                if 'DISCOUNTPERCENT' in real:
                    # <!--Відсоток знижки/націнки, для відсоткових знижок/націнок (не зазначається при фіксованій сумі знижки/націнки) (15.2 цифри)-->
                    DISCOUNTPERCENT = etree.SubElement(ROW, "DISCOUNTPERCENT")
                    DISCOUNTPERCENT.text = '{:.2f}'.format(real['DISCOUNTPERCENT'])

                if 'DISCOUNTSUM' in real:
                    # <!--Загальна сума знижки/націнки (15.2 цифри)-->
                    DISCOUNTSUM = etree.SubElement(ROW, "DISCOUNTSUM")
                    DISCOUNTSUM.text = '{:.2f}'.format(real['DISCOUNTSUM'])

                if 'COMMENT' in real:
                    # <!--Коментар-->
                    COMMENT = etree.SubElement(ROW, "COMMENT")
                    COMMENT.text = '{}'.format(real['COMMENT'])

                if 'EXCISELABELS' in real:
                    # <!--Акцизні марки-->
                    EXCISELABELS = etree.SubElement(ROW, "EXCISELABELS")
                    EXCISELABELS.text = ''

                    rownum_labels = 0
                    for labels_item in real['EXCISELABELS']:
                        rownum_labels += 1

                        PAYSYSROW = etree.SubElement(EXCISELABELS, "ROW", ROWNUM="{}".format(rownum_labels))
                        PAYSYSROW.text = ''

                        if 'EXCISELABEL' in labels_item:
                            # <!--Серія та номер марки акцизного податку-->
                            EXCISELABEL = etree.SubElement(PAYSYSROW, "EXCISELABEL")
                            EXCISELABEL.text = '{}'.format(labels_item['EXCISELABEL'])

        xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
        print(xml.decode('windows-1251'))

        try:
            xmlschema_doc = etree.parse(self.xsd_path)
            xmlschema = etree.XMLSchema(xmlschema_doc)
            xmlschema.assertValid(CHECK)
        except etree.DocumentInvalid as e:
            print('{} {} Помилка XML (pretest): {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            return 9

        if offline:
            try:
                signed_data = self.signer.sign(self.key.box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
            except Exception as e:
                box_id = self.signer.update_bid(self.db, self.key)
                signed_data = self.signer.sign(box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
                self.key.box_id = box_id
                self.db.session.commit()

            return xml, signed_data, offline_tax_number, sha256(xml).hexdigest()

        else:
            ret = self.post_data("doc", xml)
            if ret:
                if ret == 9:
                    return ret

                self.last_xml = xml
                return True

            return False

    def post_z(self, dt, x_data, testing=False, offline=False, prev_hash=None, doc_uid=None):
        """ Службовий чек відкриття зміни (форма №3-ПРРО) """

        # x_data = self.LastShiftTotals()
        if x_data:
            print(x_data)

            dt = datetime.now(tz.gettz(TIMEZONE))
            check_date = dt.strftime("%d%m%Y")  # ddmmyyyy
            check_time = dt.strftime("%H%M%S")  # hhmmss

            attr_qname = etree.QName("http://www.w3.org/2001/XMLSchema-instance", "noNamespaceSchemaLocation")
            ZREP = etree.Element("ZREP", {attr_qname: 'check01.xsd'},
                                 nsmap={'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
                                 )
            ZREPHEAD = etree.SubElement(ZREP, "ZREPHEAD")

            #   <!--Унікальний ідентифікатор документа (GUID)-->
            UID = etree.SubElement(ZREPHEAD, "UID")
            UID.text = '{}'.format(uuid.uuid1())

            #   <!--ЄДРПОУ/ДРФО/№ паспорта продавця (10 символів)-->
            TIN = etree.SubElement(ZREPHEAD, "TIN")
            TIN.text = '{}'.format(self.department.tin)

            # <!--Податковий номер або Індивідуальний номер платника ПДВ (12 символів)-->
            if self.department.ipn:
                IPN = etree.SubElement(ZREPHEAD, "IPN")
                IPN.text = '{}'.format(self.department.ipn)

            #   <!--Найменування продавця (256 символів)-->
            ORGNM = etree.SubElement(ZREPHEAD, "ORGNM")
            ORGNM.text = self.department.org_name

            #   <!--Найменування точки продаж (256 символів)-->
            POINTNM = etree.SubElement(ZREPHEAD, "POINTNM")
            POINTNM.text = self.department.name

            #   <!--Адреса точки продаж (256 символів)-->
            POINTADDR = etree.SubElement(ZREPHEAD, "POINTADDR")
            POINTADDR.text = self.department.address

            #   <!--Дата операції (ddmmyyyy)-->
            ORDERDATE = etree.SubElement(ZREPHEAD, "ORDERDATE")
            ORDERDATE.text = check_date

            #   <!--Час операції (hhmmss)-->
            ORDERTIME = etree.SubElement(ZREPHEAD, "ORDERTIME")
            ORDERTIME.text = check_time

            #   <!--Локальний номер документа (128 символів)-->
            ORDERNUM = etree.SubElement(ZREPHEAD, "ORDERNUM")
            ORDERNUM.text = str(self.department.next_local_number)

            #   <!--Локальний номер реєстратора розрахункових операцій (64 символи)-->
            CASHDESKNUM = etree.SubElement(ZREPHEAD, "CASHDESKNUM")
            CASHDESKNUM.text = str(self.department.zn)

            #   <!--Фіскальний номер реєстратора розрахункових операцій (128 символів)-->
            CASHREGISTERNUM = etree.SubElement(ZREPHEAD, "CASHREGISTERNUM")
            CASHREGISTERNUM.text = str(self.rro_fn)

            if self.cashier_name:
                # <!--ПІБ касира (128 символів)-->
                CASHIER = etree.SubElement(ZREPHEAD, "CASHIER")
                CASHIER.text = self.cashier_name

            #   <!--Версія формату документа (числовий)-->
            VER = etree.SubElement(ZREPHEAD, "VER")
            VER.text = '1'

            #   <!--Фіскальний номер документа (128 символів)-->
            # ORDERTAXNUM = etree.SubElement(ZREPHEAD, "ORDERTAXNUM")
            # ORDERTAXNUM.text = '{}'.format(self.last_ordertaxnum+1)

            if testing:
                # <!--Ознака тестового нефіскального документа-->
                TESTING = etree.SubElement(ZREPHEAD, "TESTING")
                TESTING.text = 'true'

            if 'Totals' in x_data:

                totals = x_data['Totals']

                if totals:

                    if 'Real' in totals:

                        real = totals['Real']

                        if real:

                            ZREPREALIZ = etree.SubElement(ZREP, "ZREPREALIZ")

                            if 'Sum' in real:
                                #   <!--Загальна сума (15.2 цифри)-->
                                SUM = etree.SubElement(ZREPREALIZ, "SUM")
                                SUM.text = "{:.2f}".format(real['Sum'])

                            if 'PwnSumIssued' in real:
                                #   <!--Загальна сума коштів, виданих клієнту ломбарда (15.2 цифри)-->
                                PWNSUMISSUED = etree.SubElement(ZREPREALIZ, "PWNSUMISSUED")
                                PWNSUMISSUED.text = "{:.2f}".format(real['PwnSumIssued'])

                            if 'PwnSumReceived' in real:
                                #   <!--Загальна сума коштів, одержаних від клієнта ломбарда (15.2 цифри)-->
                                PWNSUMRECEIVED = etree.SubElement(ZREPREALIZ, "PWNSUMRECEIVED")
                                PWNSUMRECEIVED.text = "{:.2f}".format(real['PwnSumReceived'])

                            if 'RndSum' in real:
                                #   <!--Заокруглення (15.2 цифри) (наприклад, 0.71)-->
                                RNDSUM = etree.SubElement(ZREPREALIZ, "RNDSUM")
                                RNDSUM.text = "{:.2f}".format(real['RndSum'])

                            if 'NoRndSum' in real:
                                #   <!--Загальна сума без заокруглення (15.2 цифри) (наприклад, 1000.71)-->
                                NORNDSUM = etree.SubElement(ZREPREALIZ, "NORNDSUM")
                                NORNDSUM.text = "{:.2f}".format(real['NoRndSum'])

                            if 'OrdersCount' in real:
                                # <!--Кількість чеків (числовий)-->
                                ORDERSCNT = etree.SubElement(ZREPREALIZ, "ORDERSCNT")
                                ORDERSCNT.text = "{:d}".format(real['OrdersCount'])

                            if 'TotalCurrencyCost' in real:
                                # <!--Кількість операцій переказу коштів (числовий)-->
                                TOTALCURRENCYCOST = etree.SubElement(ZREPREALIZ, "TOTALCURRENCYCOST")
                                TOTALCURRENCYCOST.text = "{:d}".format(real['TotalCurrencyCost'])

                            if 'TotalCurrencySum' in real:
                                #   <!--Загальна сума переказів коштів (15.2 цифри)-->
                                TOTALCURRENCYSUM = etree.SubElement(ZREPREALIZ, "TOTALCURRENCYSUM")
                                TOTALCURRENCYSUM.text = "{:.2f}".format(real['TotalCurrencySum'])

                            if 'TotalCurrencyCommission' in real:
                                # <!--Загальна сума комісії від переказів (15.2 цифри)-->
                                TOTALCURRENCYCOMMISSION = etree.SubElement(ZREPREALIZ, "TOTALCURRENCYCOMMISSION")
                                TOTALCURRENCYCOMMISSION.text = "{:.2f}".format(real['TotalCurrencyCommission'])

                            if 'PayForm' in x_data['Totals']['Real']:

                                payforms_list = x_data['Totals']['Real']['PayForm']

                                if payforms_list:

                                    PAYFORMS = etree.SubElement(ZREPREALIZ, "PAYFORMS")

                                    n = 0
                                    if isinstance(payforms_list, list):
                                        for payform in payforms_list:
                                            n += 1
                                            ROW = etree.SubElement(PAYFORMS, "ROW", ROWNUM=str(n))
                                            ROW.text = ''

                                            if 'PayFormCode' in payform:
                                                # <!--Код форми оплати (числовий): 0–Готівка, 1–Банківська картка, 2-Попередня оплата, 3-Кредит, ...-->
                                                PAYFORMCD = etree.SubElement(ROW, "PAYFORMCD")
                                                PAYFORMCD.text = "{:d}".format(payform['PayFormCode'])

                                            if 'PayFormName' in payform:
                                                # <!--Найменування форми оплати (128 символів)-->
                                                PAYFORMNM = etree.SubElement(ROW, "PAYFORMNM")
                                                PAYFORMNM.text = "{}".format(payform['PayFormName'])

                                            if 'Sum' in payform:
                                                # <!--Сума оплати (15.2 цифри)-->
                                                SUM = etree.SubElement(ROW, "SUM")
                                                SUM.text = "{:.2f}".format(payform['Sum'])

                                tax_list = x_data['Totals']['Real']['Tax']

                                if tax_list:

                                    TAXES = etree.SubElement(ZREPREALIZ, "TAXES")

                                    n = 0
                                    if isinstance(tax_list, list):
                                        for tax in tax_list:
                                            n += 1
                                            ROW = etree.SubElement(TAXES, "ROW", ROWNUM=str(n))
                                            ROW.text = ''

                                            if 'Type' in tax:
                                                # <!--Код виду податку/збору (числовий): 0-ПДВ,1-Акциз,2-ПФ...-->
                                                TYPE = etree.SubElement(ROW, "TYPE")
                                                TYPE.text = '{}'.format(tax['Type'])

                                            if 'Name' in tax:
                                                # <!--Найменування виду податку/збору (64 символи)-->
                                                NAME = etree.SubElement(ROW, "NAME")
                                                NAME.text = '{}'.format(tax['Name'])

                                            if 'Letter' in tax:
                                                # <!--Літерне позначення виду і ставки податку/збору (А,Б,В,Г,...) (1 символ)-->
                                                LETTER = etree.SubElement(ROW, "LETTER")
                                                LETTER.text = '{}'.format(tax['Letter'])

                                            if 'Prc' in tax:
                                                # <!--Відсоток податку/збору (15.2 цифри)-->
                                                PRC = etree.SubElement(ROW, "PRC")
                                                PRC.text = '{:.2f}'.format(tax['Prc'])

                                            if 'Sign' in tax:
                                                # <!--Ознака податку/збору, не включеного у вартість-->
                                                SIGN = etree.SubElement(ROW, "SIGN")
                                                SIGN.text = '{}'.format(tax['Sign']).lower()

                                            if 'Turnover' in tax:
                                                # <!--Сума для розрахування податку/збору (15.2 цифри)-->
                                                TURNOVER = etree.SubElement(ROW, "TURNOVER")
                                                TURNOVER.text = '{:.2f}'.format(tax['Turnover'])

                                            if 'TurnoverDiscount' in tax:
                                                # <!--Сума обсягів для розрахування податку/збору з урахуванням знижки (15.2 цифри)-->
                                                TURNOVERDISCOUNT = etree.SubElement(ROW, "TURNOVERDISCOUNT")
                                                TURNOVERDISCOUNT.text = '{:.2f}'.format(tax['TurnoverDiscount'])

                                            if 'SourceSum' in tax:
                                                # <!--Вихідна сума для розрахування податку/збору (15.2 цифри)-->
                                                SOURCESUM = etree.SubElement(ROW, "SOURCESUM")
                                                SOURCESUM.text = '{:.2f}'.format(tax['SourceSum'])

                                            if 'Sum' in tax:
                                                # <!--Сума податку/збору (15.2 цифри)-->
                                                SUM = etree.SubElement(ROW, "SUM")
                                                SUM.text = "{:.2f}".format(tax['Sum'])

                        if 'Ret' in totals:
                            '''
                            'Ret': {'Sum': 210.0, 'PwnSumIssued': 0.0, 'PwnSumReceived': 0.0, 'RndSum': 0.0, 'NoRndSum': 0.0, 'TotalCurrencySum': 0.0, 'TotalCurrencyCommission': 0.0, 'OrdersCount': 1, 'TotalCurrencyCost': 0, 'PayForm': [{'PayFormCode': 0, 'PayFormName': 'ГОТІВКА', 'Sum': 210.0}], 'Tax': [{'Type': 0, 'Name': 'ПДВ', 'Letter': 'A', 'Prc': 20.0, 'Sign': False, 'Turnover': 300.0, 'SourceSum': 210.0, 'Sum': 42.0}]}
                            '''

                            ret = totals['Ret']

                            if ret:

                                ZREPRETURN = etree.SubElement(ZREP, "ZREPRETURN")

                                if 'Sum' in ret:
                                    # <!--Загальна сума (15.2 цифри)-->
                                    SUM = etree.SubElement(ZREPRETURN, "SUM")
                                    SUM.text = "{:.2f}".format(ret['Sum'])

                                if 'PwnSumIssued' in ret:
                                    # <!--Загальна сума коштів, виданих клієнту ломбарда (15.2 цифри)-->
                                    SUM = etree.SubElement(ZREPRETURN, "PWNSUMISSUED")
                                    SUM.text = "{:.2f}".format(ret['PwnSumIssued'])

                                if 'PwnSumReceived' in ret:
                                    #   <!--Загальна сума коштів, одержаних від клієнта ломбарда (15.2 цифри)-->
                                    PWNSUMRECEIVED = etree.SubElement(ZREPRETURN, "PWNSUMRECEIVED")
                                    PWNSUMRECEIVED.text = "{:.2f}".format(ret['PwnSumReceived'])

                                if 'RndSum' in ret:
                                    #   <!--Заокруглення (15.2 цифри) (наприклад, 0.71)-->
                                    RNDSUM = etree.SubElement(ZREPRETURN, "RNDSUM")
                                    RNDSUM.text = "{:.2f}".format(ret['RndSum'])

                                if 'NoRndSum' in ret:
                                    #   <!--Загальна сума без заокруглення (15.2 цифри) (наприклад, 1000.71)-->
                                    NORNDSUM = etree.SubElement(ZREPRETURN, "NORNDSUM")
                                    NORNDSUM.text = "{:.2f}".format(ret['NoRndSum'])

                                if 'OrdersCount' in ret:
                                    # <!--Кількість чеків (числовий)-->
                                    ORDERSCNT = etree.SubElement(ZREPRETURN, "ORDERSCNT")
                                    ORDERSCNT.text = "{:d}".format(ret['OrdersCount'])

                                if 'TotalCurrencyCost' in ret:
                                    # <!--Кількість операцій переказу коштів (числовий)-->
                                    TOTALCURRENCYCOST = etree.SubElement(ZREPRETURN, "TOTALCURRENCYCOST")
                                    TOTALCURRENCYCOST.text = "{:d}".format(ret['TotalCurrencyCost'])

                                if 'TotalCurrencySum' in ret:
                                    #   <!--Загальна сума переказів коштів (15.2 цифри)-->
                                    TOTALCURRENCYSUM = etree.SubElement(ZREPRETURN, "TOTALCURRENCYSUM")
                                    TOTALCURRENCYSUM.text = "{:.2f}".format(ret['TotalCurrencySum'])

                                if 'TotalCurrencyCommission' in ret:
                                    # <!--Загальна сума комісії від переказів (15.2 цифри)-->
                                    TOTALCURRENCYCOMMISSION = etree.SubElement(ZREPRETURN, "TOTALCURRENCYCOMMISSION")
                                    TOTALCURRENCYCOMMISSION.text = "{:.2f}".format(ret['TotalCurrencyCommission'])

                                ret_payforms = ret['PayForm']

                                if ret_payforms:

                                    if isinstance(ret_payforms, list):
                                        n = 0
                                        PAYFORMS = etree.SubElement(ZREPRETURN, "PAYFORMS")
                                        PAYFORMS.text = ''

                                        for ret_payform in ret_payforms:
                                            n += 1
                                            ROW = etree.SubElement(PAYFORMS, "ROW", ROWNUM=str(n))
                                            ROW.text = ''

                                            '''
                                            	<!--Код форми оплати (числовий):-->
                                                <!--0–Готівка, 1–Банківська картка...-->
                                            '''
                                            if 'PayFormCode' in ret_payform:
                                                PAYFORMCD = etree.SubElement(ROW, "PAYFORMCD")
                                                PAYFORMCD.text = "{:d}".format(ret_payform['PayFormCode'])

                                            if 'PayFormName' in ret_payform:
                                                PAYFORMNM = etree.SubElement(ROW, "PAYFORMNM")
                                                PAYFORMNM.text = '{}'.format(ret_payform['PayFormName'])

                                            if 'Sum' in ret_payform:
                                                SUM = etree.SubElement(ROW, "SUM")
                                                SUM.text = "{:.2f}".format(ret_payform['Sum'])

                                ret_taxes = ret['Tax']

                                if ret_taxes:

                                    if isinstance(ret_taxes, list):
                                        n = 0
                                        TAXES = etree.SubElement(ZREPRETURN, "TAXES")
                                        TAXES.text = ''

                                        for ret_tax in ret_taxes:
                                            n += 1
                                            ROW = etree.SubElement(TAXES, "ROW", ROWNUM=str(n))
                                            ROW.text = ''

                                            if 'Type' in ret_tax:
                                                TYPE = etree.SubElement(ROW, "TYPE")
                                                TYPE.text = '{}'.format(ret_tax['Type'])

                                            if 'Name' in ret_tax:
                                                NAME = etree.SubElement(ROW, "NAME")
                                                NAME.text = '{}'.format(ret_tax['Name'])

                                            if 'Letter' in ret_tax:
                                                LETTER = etree.SubElement(ROW, "LETTER")
                                                LETTER.text = '{}'.format(ret_tax['Letter'])

                                            if 'Prc' in ret_tax:
                                                PRC = etree.SubElement(ROW, "PRC")
                                                PRC.text = "{:.2f}".format(ret_tax['Prc'])

                                            if 'Sign' in ret_tax:
                                                SIGN = etree.SubElement(ROW, "SIGN")
                                                SIGN.text = '{}'.format(ret_tax['Sign']).lower()

                                            if 'Turnover' in ret_tax:
                                                TURNOVER = etree.SubElement(ROW, "TURNOVER")
                                                TURNOVER.text = "{:.2f}".format(ret_tax['Turnover'])

                                            if 'SourceSum' in ret_tax:
                                                SOURCESUM = etree.SubElement(ROW, "SOURCESUM")
                                                SOURCESUM.text = "{:.2f}".format(ret_tax['SourceSum'])

                                            if 'Sum' in ret_tax:
                                                SUM = etree.SubElement(ROW, "SUM")
                                                SUM.text = "{:.2f}".format(ret_tax['Sum'])

                        if 'Cash' in totals:

                            cash = totals['Cash']

                            if cash:
                                ZREPREALIZ = etree.SubElement(ZREP, "ZREPREALIZ")

                                if 'Sum' in real:
                                    #   <!--Загальна сума (15.2 цифри)-->
                                    SUM = etree.SubElement(ZREPREALIZ, "SUM")
                                    SUM.text = "{:.2f}".format(real['Sum'])

                                if 'OrdersCount' in real:
                                    ORDERSCNT = etree.SubElement(ZREPREALIZ, "ORDERSCNT")
                                    ORDERSCNT.text = "{:d}".format(real['OrdersCount'])

                                if 'TotalCurrencyCost' in real:
                                    ''' <!--Кількість операцій переказу коштів (числовий)--> '''
                                    TOTALCURRENCYCOST = etree.SubElement(ZREPREALIZ, "TOTALCURRENCYCOST")
                                    TOTALCURRENCYCOST.text = "{:d}".format(real['TotalCurrencyCost'])

                        currency_list = x_data['Totals']['Currency']

                        """
                        {'TotalInAdvance': 0.0, 'TotalInAttach': 0.0, 'TotalSurrCollection': 0.0, 'Commission': 0.0, 'CalcDocsCnt': 1, 'AcceptedN': 0.0, 'IssuedN': 0.0, 'CommissionN': 0.0, 'TransfersCnt': 0, 'Details': [{'ValCd': 840, 'ValSymCd': 'USD', 'BuyValI': 100.0, 'SellValI': 0.0, 'BuyValN': 0.0, 'SellValN': 2710.0, 'StorBuyValI': 0.0, 'StorSellValI': 0.0, 'StorBuyValN': 0.0, 'StorSellValN': 0.0, 'CInValI': 0.0, 'COutValI': 0.0, 'Commission': 0.0, 'InAdvance': 0.0, 'InAttach': 0.0, 'SurrCollection': 0.0, 'StorCInValI': 0.0, 'StorCOutValI': 0.0, 'StorCommission': 0.0}]}
                        """
                        if currency_list:
                            ZREPVAL = etree.SubElement(ZREP, "ZREPVAL")

                            if 'TotalInAdvance' in currency_list:
                                #   <!--Отримано авансів національною валютою (15.2 цифри)-->
                                TOTALINADVANCE = etree.SubElement(ZREPVAL, "TOTALINADVANCE")
                                TOTALINADVANCE.text = "{:.2f}".format(currency_list['TotalInAdvance'])

                            if 'TotalInAttach' in currency_list:
                                #   <!--Отримано підкріплень національною валютою (15.2 цифри)-->
                                TOTALINATTACH = etree.SubElement(ZREPVAL, "TOTALINATTACH")
                                TOTALINATTACH.text = "{:.2f}".format(currency_list['TotalInAttach'])

                            if 'TotalSurrCollection' in currency_list:
                                #   <!--Здано по інкасації національною валютою (15.2 цифри)-->
                                TOTALSURRCOLLECTION = etree.SubElement(ZREPVAL, "TOTALSURRCOLLECTION")
                                TOTALSURRCOLLECTION.text = "{:.2f}".format(currency_list['TotalSurrCollection'])

                            if 'Commission' in currency_list:
                                #   <!--Отримано комісії за операціями конвертації (15.2 цифри)-->
                                COMMISSION = etree.SubElement(ZREPVAL, "COMMISSION")
                                COMMISSION.text = "{:.2f}".format(currency_list['Commission'])

                            if 'CalcDocsCnt' in currency_list:
                                #   <!--Кількість розрахункових документів за зміну (числовий)-->
                                CALCDOCSCNT = etree.SubElement(ZREPVAL, "CALCDOCSCNT")
                                CALCDOCSCNT.text = "{:d}".format(currency_list['CalcDocsCnt'])

                            if 'AcceptedN' in currency_list:
                                #   <!--Прийнято національної валюти для переказу (15.2 цифри)-->
                                ACCEPTEDN = etree.SubElement(ZREPVAL, "ACCEPTEDN")
                                ACCEPTEDN.text = "{:.2f}".format(currency_list['AcceptedN'])

                            if 'IssuedN' in currency_list:
                                #   <!--Видано національної валюти при виплаті переказу (15.2 цифри)-->
                                ISSUEDN = etree.SubElement(ZREPVAL, "ISSUEDN")
                                ISSUEDN.text = "{:.2f}".format(currency_list['IssuedN'])

                            if 'CommissionN' in currency_list:
                                #   <!--Отримано комісії в національній валюті при здійсненні переказів (15.2 цифри)-->
                                COMMISSIONN = etree.SubElement(ZREPVAL, "COMMISSIONN")
                                COMMISSIONN.text = "{:.2f}".format(currency_list['CommissionN'])

                            if 'TransfersCnt' in currency_list:
                                #   <!--Кількість операцій (документів) переказів або виплат переказів (числовий)-->
                                TRANSFERSCNT = etree.SubElement(ZREPVAL, "TRANSFERSCNT")
                                TRANSFERSCNT.text = "{:d}".format(currency_list['TransfersCnt'])

                            details = currency_list['Details']

                            n = 0
                            if details:

                                DETAILS = etree.SubElement(ZREPVAL, "DETAILS")

                                for detail in details:

                                    n += 1
                                    ROW = etree.SubElement(DETAILS, "ROW", ROWNUM=str(n))
                                    ROW.text = ''

                                    if 'ValCd' in detail:
                                        #   <!--Код валюти (числовий)-->
                                        VALCD = etree.SubElement(ROW, "VALCD")
                                        VALCD.text = "{:d}".format(detail['ValCd'])

                                    if 'ValSymCd' in detail:
                                        #   <!--Символьний код валюти (64 символів)-->
                                        VALSYMCD = etree.SubElement(ROW, "VALSYMCD")
                                        VALSYMCD.text = "{}".format(detail['ValSymCd'])

                                    if 'BuyValI' in detail:
                                        #   <!--Загальна сума придбаної іноземної валюти (15.2 цифри)-->
                                        BUYVALI = etree.SubElement(ROW, "BUYVALI")
                                        BUYVALI.text = "{:.2f}".format(detail['BuyValI'])

                                    if 'SellValI' in detail:
                                        #   <!--Загальна сума проданої іноземної валюти (15.2 цифри)-->
                                        SELLVALI = etree.SubElement(ROW, "SELLVALI")
                                        SELLVALI.text = "{:.2f}".format(detail['SellValI'])

                                    if 'BuyValN' in detail:
                                        #   <!--Загальна сума придбаної національної валюти (15.2 цифри)-->
                                        BUYVALN = etree.SubElement(ROW, "BUYVALN")
                                        BUYVALN.text = "{:.2f}".format(detail['BuyValN'])

                                    if 'SellValN' in detail:
                                        #   <!--Загальна сума проданої національної валюти (15.2 цифри)-->
                                        SELLVALN = etree.SubElement(ROW, "SELLVALN")
                                        SELLVALN.text = "{:.2f}".format(detail['SellValN'])

                                    if 'StorBuyValI' in detail:
                                        #   <!--Загальна сума поверненої клієнтами іноземної валюти за операціями «сторно» (15.2 цифри)-->
                                        STORBUYVALI = etree.SubElement(ROW, "STORBUYVALI")
                                        STORBUYVALI.text = "{:.2f}".format(detail['StorBuyValI'])

                                    if 'StorSellValI' in detail:
                                        #   <!--Загальна сума виданої клієнтам іноземної валюти за операціями «сторно» (15.2 цифри)-->
                                        STORSELLVALI = etree.SubElement(ROW, "STORSELLVALI")
                                        STORSELLVALI.text = "{:.2f}".format(detail['StorSellValI'])

                                    if 'StorBuyValN' in detail:
                                        #   <!--Загальна сума поверненої клієнтами національної валюти за операціями «сторно» (15.2 цифри)-->
                                        STORBUYVALN = etree.SubElement(ROW, "STORBUYVALN")
                                        STORBUYVALN.text = "{:.2f}".format(detail['StorBuyValN'])

                                    if 'StorSellValN' in detail:
                                        #   <!--Загальна сума виданої клієнтам національної валюти за операціями «сторно» (15.2 цифри)-->
                                        STORSELLVALN = etree.SubElement(ROW, "STORSELLVALN")
                                        STORSELLVALN.text = "{:.2f}".format(detail['StorSellValN'])

                                    #   <!--Загальна сума прийнятої іноземної валюти за операціями конвертації (15.2 цифри)-->
                                    CINVALI = etree.SubElement(ROW, "CINVALI")
                                    CINVALI.text = "{:.2f}".format(detail['CInValI'])

                                    #   <!--Загальна сума виданої іноземної валюти за операціями конвертації (15.2 цифри)-->
                                    COUTVALI = etree.SubElement(ROW, "COUTVALI")
                                    COUTVALI.text = "{:.2f}".format(detail['COutValI'])

                                    #   <!--Загальна сума комісії за операціями конвертації (15.2 цифри)-->
                                    COMMISSION = etree.SubElement(ROW, "COMMISSION")
                                    COMMISSION.text = "{:.2f}".format(detail['Commission'])

                                    #   <!--Отримано авансів (15.2 цифри)-->
                                    INADVANCE = etree.SubElement(ROW, "INADVANCE")
                                    INADVANCE.text = "{:.2f}".format(detail['InAdvance'])

                                    #   <!--Отримано підкріплень (15.2 цифри)-->
                                    INATTACH = etree.SubElement(ROW, "INATTACH")
                                    INATTACH.text = "{:.2f}".format(detail['InAttach'])

                                    #   <!--Здано по інкасації (15.2 цифри)-->
                                    SURRCOLLECTION = etree.SubElement(ROW, "SURRCOLLECTION")
                                    SURRCOLLECTION.text = "{:.2f}".format(detail['SurrCollection'])

                                    #   <!--Видано іноземної валюти по сторно конвертації (15.2 цифри)-->
                                    STORCINVALI = etree.SubElement(ROW, "STORCINVALI")
                                    STORCINVALI.text = "{:.2f}".format(detail['StorCInValI'])

                                    #   <!--Повернуто іноземної валюти по сторно конвертації (15.2 цифри)-->
                                    STORCOUTVALI = etree.SubElement(ROW, "STORCOUTVALI")
                                    STORCOUTVALI.text = "{:.2f}".format(detail['StorCOutValI'])

                                    #   <!--Повернуто суму комісії з сторно конвертації (15.2 цифри)-->
                                    STORCOMMISSION = etree.SubElement(ROW, "STORCOMMISSION")
                                    STORCOMMISSION.text = "{:.2f}".format(detail['StorCommission'])

                        ZREPBODY = etree.SubElement(ZREP, "ZREPBODY")

                        #   <!--Службовий внесок (15.2 цифри)-->
                        SERVICEINPUT = etree.SubElement(ZREPBODY, "SERVICEINPUT")
                        SERVICEINPUT.text = "{:.2f}".format(x_data['Totals']['ServiceInput'])

                        #   <!--Службова видача (15.2 цифри)-->
                        SERVICEOUTPUT = etree.SubElement(ZREPBODY, "SERVICEOUTPUT")
                        SERVICEOUTPUT.text = "{:.2f}".format(x_data['Totals']['ServiceOutput'])
                else:
                    print("Массив подитогов пустой")

                    ZREPBODY = etree.SubElement(ZREP, "ZREPBODY")

                    #   <!--Службовий внесок (15.2 цифри)-->
                    SERVICEINPUT = etree.SubElement(ZREPBODY, "SERVICEINPUT")
                    SERVICEINPUT.text = "0.00"

                    #   <!--Службова видача (15.2 цифри)-->
                    SERVICEOUTPUT = etree.SubElement(ZREPBODY, "SERVICEOUTPUT")
                    SERVICEOUTPUT.text = "0.00"

            # print("Вернулся массив подитогов без X отчета")
            xml = etree.tostring(ZREP, pretty_print=True, encoding='windows-1251')
            print(xml.decode('windows-1251'))

            try:
                xmlschema_doc = etree.parse(self.xsd_path_z)
                xmlschema = etree.XMLSchema(xmlschema_doc)
                xmlschema.assertValid(ZREP)
            except etree.DocumentInvalid as e:
                print('{} {} Помилка XML (pretest): {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
                return 9

            print("Отправляем Z отчет")
            ret = self.post_data("doc", xml)
            if ret:
                if ret == 9:
                    return ret

                self.last_xml = xml
                print("Z отправлен")
                return x_data
            else:
                print("Ошибка отправки Z")

        else:
            print("Массив подитогов пустой, отправить Z отчет не получится")

        return False

    def close_shift(self, dt, testing=False, offline=False, prev_hash=None, doc_uid=None):
        """ Службовий чек відкриття зміни (форма №3-ПРРО) """

        if offline:
            offline_tax_number = self.calculate_offline_tax_number(dt, prev_hash=prev_hash)
        else:
            offline_tax_number = None

        CHECK = self.get_check_xml(101, dt=dt, testing=testing, offline=offline,
                                   prev_hash=prev_hash, offline_tax_number=offline_tax_number)
        xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
        print(xml.decode('windows-1251'))

        try:
            xmlschema_doc = etree.parse(self.xsd_path)
            xmlschema = etree.XMLSchema(xmlschema_doc)
            xmlschema.assertValid(CHECK)
        except etree.DocumentInvalid as e:
            print('{} {} Помилка XML (pretest): {}'.format(datetime.now(tz.gettz(TIMEZONE)), self.rro_fn, e))
            return 9

        if offline:
            try:
                signed_data = self.signer.sign(self.key.box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
            except Exception as e:
                box_id = self.signer.update_bid(self.db, self.key)
                signed_data = self.signer.sign(box_id, xml, role=self.key.key_role, tax=False,
                                               tsp=False, ocsp=False)
                self.key.box_id = box_id
                self.db.session.commit()

            return xml, signed_data, offline_tax_number, sha256(xml).hexdigest()

        ret = self.post_data("doc", xml)

        if ret:
            if ret == 9:
                return ret

            self.last_xml = xml
            # print("Смена закрыта")
            self.shift_state = 0

        # else:
        #     print("Ошибка закрытия смены")

        return ret
