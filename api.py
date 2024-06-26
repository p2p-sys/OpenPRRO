import base64
import uuid

import dateutil.parser
from dateutil import tz
from flask import request, jsonify
from flask_classy import route, FlaskView
from lxml import etree

from config import TIMEZONE
from manage import csrf
from models import Departments, db, Shifts, DepartmentKeys, ZReports, get_sender, get_department, get_sender_by_key, \
    get_logger
from utils.taxforms import TaxForms

from datetime import datetime

logger = get_logger(__name__)


class ApiView(FlaskView):
    route_base = 'api'

    @route('/keys', methods=['GET', 'POST'], endpoint='keys')
    @csrf.exempt
    def keys(self):

        try:
            logger.info('Надійшов запит /keys')
            keys = DepartmentKeys.query.all()

            keys_arr = []
            for key in keys:
                k = {"key_id": key.id, "name": key.name, "public_key": key.public_key, "create_date": key.create_date,
                    "begin_time": key.begin_time, "end_time": key.end_time, "key_role": key.key_role,
                    "edrpou": key.edrpou, "ceo_fio": key.ceo_fio, "ceo_tin": key.ceo_tin, "sign": key.sign,
                    "encrypt": key.encrypt, "key_content": key.key_data_txt}
                keys_arr.append(k)

            answer = jsonify(status='success', keys=keys_arr, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/key', methods=['GET', 'POST'], endpoint='key')
    @csrf.exempt
    def key(self):

        try:

            data = request.get_json()
            logger.info(f'Надійшов запит /key: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key_id' in data:
                key_id = data['key_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: key_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            key = DepartmentKeys.query.get(key_id)
            if not key:
                msg = 'Ключ з ідентифікатором {} не існує'.format(key_id)
                answer = jsonify(status='error', message=msg, error_code=-1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            k = {"key_id": key.id, "name": key.name, "public_key": key.public_key, "create_date": key.create_date,
                "begin_time": key.begin_time, "end_time": key.end_time, "key_role": key.key_role, "edrpou": key.edrpou,
                "ceo_fio": key.ceo_fio, "ceo_tin": key.ceo_tin, "sign": key.sign, "encrypt": key.encrypt,
                "key_content": key.key_data_txt}

            answer = jsonify(status='success', key=k, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/rro', methods=['GET', 'POST'], endpoint='rro')
    @csrf.exempt
    def rro(self):

        try:
            logger.info('Надійшов запит /rro')
            departments = Departments.query.all()

            departments_arr = []
            for department in departments:
                d = {"department_id": department.id, "name": department.full_name, "rro_id": department.rro_id,
                    "taxform_key_id": department.taxform_key_id, "prro_key_id": department.prro_key_id,
                    "signer_type": department.signer_type, "key_tax_registered": department.key_tax_registered, }
                departments_arr.append(d)

            answer = jsonify(status='success', rro=departments_arr, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/add_department', methods=['POST', 'GET'], endpoint='add_department')
    @csrf.exempt
    def add_department(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /add_department: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json '
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'department_id' in data:
                department_id = data['department_id']
            else:
                department_id = None

            if 'name' in data:
                name = data['name']
            else:
                name = ''

            if 'address' in data:
                address = data['address']
            else:
                address = ''

            if 'rro_id' in data:
                rro_id = data['rro_id']

                try:
                    rro_id = int(rro_id)
                except:
                    msg = 'Невірний номер РРО {}, значення має бути числовим'.format(rro_id)
                    answer = jsonify(status='error', message=msg, error_code=-1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

                if len(str(rro_id)) != 10:
                    msg = 'Невірний номер РРО {}, довжина номера має бути 10 знаків'.format(rro_id)
                    answer = jsonify(status='error', message=msg, error_code=-1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

                if int(rro_id) < 4000000001:
                    msg = 'Невірний номер РРО {}, номер повинен починатися з цифри 4'.format(rro_id)
                    answer = jsonify(status='error', message=msg, error_code=-1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

                department = Departments.query.filter(Departments.rro_id == rro_id).first()
                if department:
                    # return jsonify(status='success', department_id=department.id, signer_type=department.signer_type,
                    #                error_code=0)
                    # #
                    msg = 'Підрозділ з rro {} вже існує!'.format(rro_id)
                    answer = jsonify(status='error', message=msg, error_code=3, department_id=department.id,
                                     signer_type=department.signer_type)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                rro_id = None

            if 'main_key_id' in data:
                taxform_key_id = data['main_key_id']
                key_id = DepartmentKeys.query.get(taxform_key_id)
                if not key_id:
                    msg = 'Ключ main_key_id з ідентифікатором {} не існує'.format(taxform_key_id)
                    answer = jsonify(status='error', message=msg, error_code=-1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                taxform_key_id = None

            if 'prro_key_id' in data:
                prro_key_id = data['prro_key_id']
                key_id = DepartmentKeys.query.get(prro_key_id)
                if not key_id:
                    msg = 'Ключ prro_key_id з ідентифікатором {} не існує'.format(prro_key_id)
                    answer = jsonify(status='error', message=msg, error_code=-1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                prro_key_id = None

            if 'offline' in data:
                offline = data['offline']
            else:
                offline = True

            if department_id:
                department = Departments.query.get(department_id)
                if not department:
                    department = Departments(id=department_id, full_name=name, address=address, rro_id=rro_id,
                        taxform_key_id=taxform_key_id, prro_key_id=prro_key_id, offline=offline)
                    db.session.add(department)
                    db.session.commit()
                else:
                    answer = jsonify(status='error', message=f'Підрозділ з department_id {department_id} вже існує!')
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                department = Departments(full_name=name, address=address, rro_id=rro_id, taxform_key_id=taxform_key_id,
                    prro_key_id=prro_key_id)
                db.session.add(department)
                db.session.commit()

            try:
                if department.taxform_key:
                    result = department.set_signer_type()
            except Exception as e:
                pass

            try:
                messages = department.prro_fix()
            except Exception as e:
                messages = [str(e)]

            answer = jsonify(status='success', department_id=department.id, signer_type=department.signer_type,
                             error_code=0, messages=messages)

            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e))
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/departments', methods=['GET', 'POST'], endpoint='departments')
    @csrf.exempt
    def departments(self):

        try:
            logger.info(f'Надійшов запит /departments')
            departments = Departments.query.all()

            departments_arr = []
            for department in departments:
                d = {"department_id": department.id, "name": department.full_name, "rro_id": department.rro_id,
                    "taxform_key_id": department.taxform_key_id, "prro_key_id": department.prro_key_id,
                    "signer_type": department.signer_type, "key_tax_registered": department.key_tax_registered, }
                departments_arr.append(d)

            logger.info(f'Відповідь: status=success, departments={departments_arr}, error_code=0')
            return jsonify(status='success', departments=departments_arr, error_code=0)

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/department', methods=['GET', 'POST'], endpoint='department')
    @csrf.exempt
    def department(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /department: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'department_id' in data:
                department_id = data['department_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: department_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department = Departments.query.get(department_id)
            if not department:
                msg = 'Об\'єкт з ідентифікатором {} не існує'.format(department_id)
                answer = jsonify(status='error', message=msg, error_code=-1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            d = {"department_id": department.id, "name": department.full_name, "rro_id": department.rro_id,
                "taxform_key_id": department.taxform_key_id, "prro_key_id": department.prro_key_id,
                "signer_type": department.signer_type, "key_tax_registered": department.key_tax_registered, }

            answer = jsonify(status='success', department=d, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/set_rro', methods=['POST', 'GET'], endpoint='set_rro')
    @csrf.exempt
    def set_rro(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /set_rro: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'department_id' in data:
                department_id = data['department_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: department_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'rro_id' in data:
                rro_id = data['rro_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: rro_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department = Departments.query.get(department_id)
            if department:
                department.rro_id = rro_id
                db.session.commit()
                answer = jsonify(status='success', error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer
            else:
                msg = 'Підрозділ з department_id {} не існує!'.format(department_id)
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e))
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/fix', methods=['POST', 'GET'], endpoint='fix')
    @csrf.exempt
    def fix(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /fix: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            messages, status = department.prro_fix()

            if status:
                answer = jsonify(status='success', messages=messages, error_code=0)
            else:
                answer = jsonify(status='error', messages=messages, error_code=3)

            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/set_department_keys', methods=['POST', 'GET'], endpoint='set_department_keys')
    @csrf.exempt
    def set_department_keys(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /set_department_keys: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'department_id' in data:
                department_id = data['department_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: department_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'main_key_id' in data:
                main_key_id = data['main_key_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: main_key_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'prro_key_id' in data:
                prro_key_id = data['prro_key_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: prro_key_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department = Departments.query.get(department_id)
            if department:
                department.taxform_key_id = main_key_id
                department.prro_key_id = prro_key_id
                db.session.commit()

                result = department.set_signer_type()

                answer = jsonify(status='success', signer_type=department.signer_type, error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer
            else:
                msg = 'Підрозділ з department_id {} не існує!'.format(department_id)
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e))
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/set_shift_auto_close', methods=['POST', 'GET'], endpoint='set_shift_auto_close')
    @csrf.exempt
    def set_shift_auto_close(self):

        try:

            data = request.get_json()
            logger.info(f'Надійшов запит /set_shift_auto_close: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            if 'auto_close_time' in data:
                auto_close_time = data['auto_close_time']
                if auto_close_time:
                    auto_close_time = datetime.strptime(auto_close_time, "%H:%M:%S")
            else:
                auto_close_time = None  # msg = 'Не вказано жодного з обов\'язкових параметрів: auto_close_time'  # return jsonify(status='error', message=msg, error_code=1)

            if auto_close_time:
                department.auto_close_time = auto_close_time
            else:
                department.auto_close_time = None

            db.session.commit()

            if department.auto_close_time:
                new_auto_close_time = '{}'.format(department.auto_close_time)
            else:
                new_auto_close_time = None

            answer = jsonify(status='success', message="ОК", error_code=0, new_auto_close_time=new_auto_close_time)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/open_shift', methods=['POST', 'GET'], endpoint='open_shift')
    @csrf.exempt
    def open_shift(self):

        try:

            data = request.get_json()
            logger.info(f'Надійшов запит /open_shift: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            if 'cashier' in data:
                cashier = data['cashier']
            else:
                cashier = None

            if 'auto_close_time' in data:
                auto_close_time = data['auto_close_time']
            else:
                auto_close_time = None

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            if 'cost' in data:
                cost = data['cost']
            else:
                cost = 0

            if 'balance' in data:
                balance = data['balance']
            else:
                balance = cost

            shift, shift_opened, messages, offline = department.prro_open_shift(True, testing=testing,
                                                                                cashier_name=cashier)

            if shift_opened:
                messages.append('Стан зміни: відкрита')

            if auto_close_time:
                department.auto_close_time = auto_close_time
                db.session.commit()

            advance_tax_id = None
            advance_qr = None
            advance_visual = None

            if offline:
                tax_id = shift.offline_tax_id
            else:
                tax_id = shift.tax_id

            if balance != 0:
                advance_tax_id, shift, shift_opened_adv, advance_qr, advance_visual, offline = department.prro_advances(
                    balance, key=key, testing=testing)
                advance_tax_id = '{}'.format(advance_tax_id)
                messages.append(
                    'Відправлено чек службового внесення (аванс), отримано фіскальний номер {}'.format(advance_tax_id))

            answer = jsonify(status='success', advance_tax_id='{}'.format(advance_tax_id), advance_qr=advance_qr,
                             messages=messages, shift_opened_datetime=shift.operation_time, shift_opened=shift_opened,
                             tax_id='{}'.format(tax_id), error_code=0, advance_tax_visual=advance_visual,
                             offline=bool(offline), testing=shift.testing)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/shift_status', methods=['POST', 'GET'], endpoint='shift_status')
    @csrf.exempt
    def shift_status(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /shift_status: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'rro_id' in data:

                rro_id = data['rro_id']

                key = None

                if 'key_id' in data:
                    key_id = data['key_id']
                    if key_id:
                        key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                        if not key:
                            msg = 'Ключ з key_id {} не існує!'.format(key_id)
                            answer = jsonify(status='error', message=msg, error_code=1)
                            logger.error(f'Відповідь: {answer.json}', exc_info=True)
                            return answer

                department = Departments.query.filter(Departments.rro_id == rro_id).first()

                if not department:
                    msg = 'Підрозділ з РРО {} не існує!'.format(rro_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

                else:

                    if not key and not department.prro_key:
                        msg = 'Не вказано жодного з обов\'язкових параметрів: key_id'
                        answer = jsonify(status='error', message=msg, error_code=1)
                        logger.error(f'Відповідь: {answer.json}', exc_info=True)
                        return answer

                    from utils.SendData2 import SendData2
                    sender = SendData2(db, key, department, department.rro_id, "")

                    registrar_state = sender.TransactionsRegistrarState()

                    if not registrar_state:
                        answer = jsonify(status='error', message='Виникла помилка запиту даних - відсутній зв\'язок з '
                                                                 'сервером податкової', error_code=-1)
                        logger.error(f'Відповідь: {answer.json}', exc_info=True)
                        return answer

                    last_shift = Shifts.query.order_by(Shifts.operation_time.desc()).filter(
                        Shifts.department_id == department.id).filter(Shifts.operation_type == 1).first()
                    if last_shift:
                        answer = jsonify(status='success', operation_time=last_shift.operation_time,
                                         registrar_state=registrar_state, error_code=0)
                        logger.info(f'Відповідь: {answer.json}')
                        return answer
                    else:
                        answer = jsonify(status='success', message='Зміни у системі відсутні', operation_time=None,
                                         registrar_state=registrar_state, error_code=0)
                        logger.info(f'Відповідь: {answer.json}')
                        return answer

            elif 'rro_ids' in data:
                rro_ids = data['rro_ids']

                departments = Departments.query.filter(Departments.rro_id.in_(rro_ids)).all()

                last_shists = []
                for department in departments:

                    rro_id = department.rro_id

                    from utils.SendData2 import SendData2
                    sender = SendData2(db, None, department, rro_id, "")

                    try:
                        registrar_state = sender.TransactionsRegistrarState()
                    except Exception as e:
                        registrar_state = None

                    last_shift = Shifts.query.order_by(Shifts.operation_time.desc()).filter(
                        Shifts.department_id == department.id).filter(Shifts.operation_type == 1).first()
                    if last_shift:
                        last_shists.append({'department_id': department.id, 'rro_id': department.rro_id,
                                            'operation_time': last_shift.operation_time, 'tax_id': last_shift.tax_id,
                                            'registrar_state': registrar_state})
                    else:
                        datamin = datetime.min
                        last_shists.append(
                            {'department_id': department.id, 'rro_id': department.rro_id, 'operation_time': datamin,
                             'tax_id': 0, 'registrar_state': registrar_state})

                answer = jsonify(status='success', last_shists=last_shists, error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/advance', methods=['POST', 'GET'], endpoint='advance')
    @csrf.exempt
    def advance(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /advance: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            if 'sum' in data:
                sum = data['sum']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: sum'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            tax_id, shift, shift_opened, qr, visual, offline = department.prro_advances(sum, key=key, testing=testing)

            if shift.tax_id == 0:
                shift_tax_id = shift.offline_tax_id
            else:
                shift_tax_id = shift.tax_id

            answer = jsonify(status='success', tax_id='{}'.format(tax_id), qr=qr,
                             message='Відправлено чек службового внесення (аванс), отримано фіскальний номер {}'.format(
                                 tax_id), shift_opened_datetime=shift.operation_time, shift_opened=shift_opened,
                             shift_tax_id=str(shift_tax_id), error_code=0, tax_visual=visual, offline=offline)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/podkrep', methods=['POST', 'GET'], endpoint='podkrep')
    @csrf.exempt
    def podkrep(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /podkrep: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            if 'sum' in data:
                sum = data['sum']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: sum'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            if 'balance' in data:
                balance = data['balance']
            else:
                balance = 0

            if 'UID' in data:
                doc_uid = data['UID']
            else:
                doc_uid = None

            tax_id, shift, shift_opened, qr, visual, offline, tax_id_advance, qr_advance, visual_advance = department.prro_podkrep(
                sum, key=key, testing=testing, balance=balance, doc_uid=doc_uid)

            message = 'Відправлено підкріплення, отримано фіскальний номер {}'.format(tax_id)

            if shift.tax_id == 0:
                shift_tax_id = shift.offline_tax_id
            else:
                shift_tax_id = shift.tax_id

            answer = jsonify(status='success', tax_id='{}'.format(tax_id), qr=qr, message=message,
                             shift_opened_datetime=shift.operation_time, shift_opened=shift_opened,
                             shift_tax_id=str(shift_tax_id), error_code=0, tax_visual=visual, offline=bool(offline),
                             tax_id_advance=tax_id_advance, qr_advance=qr_advance, visual_advance=visual_advance)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/inkass', methods=['POST', 'GET'], endpoint='inkass')
    @csrf.exempt
    def inkass(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /inkass: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json '
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            if 'sum' in data:
                sum = data['sum']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: sum!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            if 'balance' in data:
                balance = data['balance']
            else:
                balance = 0

            if 'UID' in data:
                doc_uid = data['UID']
            else:
                doc_uid = None

            tax_id, shift, shift_opened, qr, visual, offline, tax_id_advance, qr_advance, visual_advance = department.prro_inkass(
                sum, key=key, testing=testing, balance=balance, doc_uid=doc_uid)

            message = 'Відправлено інкасацію, отримано фіскальний номер {}'.format(tax_id)

            if shift.tax_id == 0:
                shift_tax_id = shift.offline_tax_id
            else:
                shift_tax_id = shift.tax_id

            answer = jsonify(status='success', tax_id='{}'.format(tax_id), qr=qr, message=message,
                             shift_opened_datetime=shift.operation_time, shift_opened=shift_opened,
                             shift_tax_id=str(shift_tax_id), error_code=0, tax_visual=visual, offline=bool(offline),
                             tax_id_advance=tax_id_advance, qr_advance=qr_advance, visual_advance=visual_advance)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/storno', methods=['POST', 'GET'], endpoint='storno')
    @csrf.exempt
    def storno(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /storno: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            if 'tax_id' in data:
                tax_id = data['tax_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: tax_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            storno_tax_id, shift, shift_opened, qr, visual, offline = department.prro_storno(tax_id, key=key,
                                                                                             testing=testing)

            if offline:
                shift_tax_id = shift.offline_tax_id
            else:
                shift_tax_id = shift.tax_id

            answer = jsonify(status='success', tax_id='{}'.format(tax_id), qr=qr,
                             message=f'Відправлено сторно документа {tax_id}, отримано фіскальний номер {storno_tax_id}',
                             shift_opened_datetime=shift.operation_time, shift_opened=shift_opened,
                             shift_tax_id=str(shift_tax_id), error_code=0, tax_visual=visual, offline=bool(offline))
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/real', methods=['POST', 'GET'], endpoint='real')
    @csrf.exempt
    def real(self):

        start = datetime.now(tz.gettz(TIMEZONE))

        try:
            data = request.get_json()
            print('{} {}'.format(start, 'Надійшов чек продажу через API: {}'.format(data)))
            logger.info(f'Надійшов запит /real: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json '
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            if 'totals' in data:
                totals = data['totals']
            else:
                totals = None

            if 'reals' in data:
                reals = data['reals']
            else:
                reals = None

            if 'pays' in data:
                pays = data['pays']
            else:
                pays = None

            if 'taxes' in data:
                taxes = data['taxes']
            else:
                taxes = None

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            if 'balance' in data:
                balance = data['balance']
            else:
                balance = 0

            if 'UID' in data:
                doc_uid = data['UID']
            else:
                doc_uid = uuid.uuid1()

            check = department.prro_sale(reals, taxes, pays, totals=totals, key=key, testing=testing, balance=balance,
                doc_uid=doc_uid)

            stop = datetime.now(tz.gettz(TIMEZONE))

            message = 'Відправлено чек продажу, отримано фіскальний номер {}'.format(check["tax_id"])

            if check["shift"].tax_id == 0:
                shift_tax_id = check["shift"].offline_tax_id
            else:
                shift_tax_id = check["shift"].tax_id

            if department.tin:
                merchant_tax_id = department.tin
            else:
                merchant_tax_id = department.ipn

            answer = jsonify(status='success', tax_id='{}'.format(check["tax_id"]), local_id=check["local_id"],
                             tax_id_advance=check["tax_id_advance"], qr=check["qr"], qr_advance=check["qr_advance"],
                             message=message, shift_opened_datetime=check["shift_opened_datetime"],
                             shift_opened=check["shift_opened"], shift_tax_id=str(shift_tax_id), error_code=0,
                             tax_visual=check["tax_visual"], tax_visual_advance=check["tax_visual_advance"],
                             offline=bool(check["offline"]), fiscal_ticket=check["fiscal_ticket"],
                             testing=check["testing"], uid=check['uid'], org_name=department.org_name,
                             merchant_tax_id=merchant_tax_id, registrar_id=int(department.rro_id),
                             merchant_address=department.address)

            print('{} {} Віддали дані чека продажу через API, все зайняло {} секунд'.format(stop, department.rro_id, (
                    stop - start).total_seconds()))

            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/return', methods=['POST', 'GET'], endpoint='ret')
    @csrf.exempt
    def ret(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /return: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            if 'totals' in data:
                totals = data['totals']
            else:
                totals = None

            if 'reals' in data:
                reals = data['reals']
            else:
                reals = None

            if 'pays' in data:
                pays = data['pays']
            else:
                pays = None

            if 'taxes' in data:
                taxes = data['taxes']
            else:
                taxes = None

            if 'balance' in data:
                balance = data['balance']
            else:
                balance = 0

            # <!--Фіскальний номер чека, для якого здійснюється повернення (зазначається тільки для чеків повернення) (128 символів)-->
            if 'orderretnum' in data:
                orderretnum = data['orderretnum']
            elif 'tax_id' in data:
                orderretnum = data['tax_id']
            else:
                orderretnum = None

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            check = department.prro_sale(reals, taxes, pays, totals=totals, sales_ret=True, orderretnum=orderretnum,
                key=key, testing=testing, balance=balance)

            if check["shift"].tax_id == 0:
                shift_tax_id = check["shift"].offline_tax_id
            else:
                shift_tax_id = check["shift"].tax_id

            message = 'Відправлено чек повернення, отримано фіскальний номер {}'.format(check["tax_id"])

            if check["shift"].tax_id == 0:
                shift_tax_id = check["shift"].offline_tax_id
            else:
                shift_tax_id = check["shift"].tax_id

            if department.tin:
                merchant_tax_id = department.tin
            else:
                merchant_tax_id = department.ipn

            answer = jsonify(status='success', tax_id='{}'.format(check["tax_id"]), local_id=check["local_id"],
                             tax_id_advance=check["tax_id_advance"], qr=check["qr"], qr_advance=check["qr_advance"],
                             message=message, shift_opened_datetime=check["shift_opened_datetime"],
                             shift_opened=check["shift_opened"], shift_tax_id=str(shift_tax_id), error_code=0,
                             tax_visual=check["tax_visual"], tax_visual_advance=check["tax_visual_advance"],
                             offline=bool(check["offline"]), fiscal_ticket=check["fiscal_ticket"],
                             testing=check["testing"], uid=check['uid'], org_name=department.org_name,
                             merchant_tax_id=merchant_tax_id, registrar_id=int(department.rro_id),
                             merchant_address=department.address)

            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/totals', methods=['POST', 'GET'], endpoint='totals')
    @csrf.exempt
    def totals(self):

        try:

            data = request.get_json()
            logger.info(f'Надійшов запит /totals: {data}')

            sender, department = get_sender(request)

            x_data = sender.LastShiftTotals()

            registrar_state = sender.TransactionsRegistrarState()

            answer = jsonify(status='success', totals=x_data, registrar_state=registrar_state, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            msg = str(e)
            answer = jsonify(status='error', message=msg, error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/xrep', methods=['POST', 'GET'], endpoint='xrep')
    @csrf.exempt
    def xrep(self):

        try:
            logger.info('Надійшов запит /xrep')

            sender, department = get_sender(request)

            x_data = sender.LastShiftTotals()

            if x_data:
                if 'ShiftState' in x_data:
                    if x_data['ShiftState'] == 0:
                        answer = jsonify(status='error', totals=x_data, error_code=-1)
                        logger.error(f'Відповідь: {answer.json}', exc_info=True)
                        return answer

                operation_time = datetime.now(tz.gettz(TIMEZONE))

                shift, shift_opened = department.prro_open_shift(False, key=department.prro_key, testing=False)

                check_visual = '{}'.format(shift.prro_org_name)
                if shift.prro_department_name:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_department_name)
                if shift.prro_address:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_address)
                if shift.prro_tn:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, shift.prro_tn)
                if shift.prro_ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, shift.prro_ipn)

                # if sales_ret:
                #     check_visual = '{}\r\n		{}'.format(check_visual, "Видатковий чек (повернення)")
                #
                # check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")
                #
                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, department.rro_id, shift.prro_zn)
                check_visual = '{}\r\nX-ЗВІТ онлайн'.format(check_visual)
                if shift.cashier:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, shift.cashier)
                else:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, department.prro_key.ceo_fio)

                check_visual = '{}\r\n----------------------------------------------------------------------\r\n'.format(
                    check_visual)

                #
                # if sales_ret:
                #     check_visual = '{}Повернення для документу № {}'.format(check_visual, orderretnum)
                #     check_visual = '{}\r\n----------------------------------------------------------------------\r\n'.format(
                #         check_visual)
                #
                # if reals:
                #     for real in reals:
                #         if 'CODE' in real:
                #             check_visual = '{}АРТ.№ {} '.format(check_visual, real['CODE'])
                #         if 'NAME' in real:
                #             check_visual = '{}{}'.format(check_visual, real['NAME'])
                #         if 'AMOUNT' in real:
                #             check_visual = '{}\r\n{:.3f}         x         {:.2f} =                  {:.2f}'.format(
                #                 check_visual, real['AMOUNT'], real['PRICE'], real['COST'])
                #         if 'LETTERS' in real:
                #             check_visual = '{} {}\r\n'.format(check_visual, real['LETTERS'])
                #         if 'DISCOUNTSUM' in real:
                #             check_visual = '{}	Дисконт: {:.2f}\r\n'.format(check_visual, real['DISCOUNTSUM'])
                #         if 'DKPP' in real:
                #             check_visual = '{}	Код ДКПП: {}\r\n'.format(check_visual, real['DKPP'])
                #         if 'EXCISELABELS' in real:
                #             for labels_item in real['EXCISELABELS']:
                #                 check_visual = '{}	Акцизна марка: {}\r\n'.format(check_visual,
                #                                                                     labels_item['EXCISELABEL'])
                #         if 'COMMENT' in real:
                #             check_visual = '{}{}\r\n'.format(check_visual, real['COMMENT'])
                #
                # check_visual = '{}----------------------------------------------------------------------\r\n'.format(
                #     check_visual)
                # if discount > 0:
                #     check_visual = '{}ДИСКОНТ:                                           {:.2f}\r\n'.format(
                #         check_visual, discount)
                # if pays:
                #     paysum = 0
                #     for pay in pays:
                #         paysum = pay['SUM']
                #     if paysum > 0:
                #         check_visual = '{}СУМА ДО СПЛАТИ:                                           {:.2f}\r\n'.format(
                #             check_visual, paysum)
                #
                # if pays:
                #     for pay in pays:
                #         check_visual = '{}----------------------------------------------------------------------\r\n'.format(
                #             check_visual)
                #         if 'PAYFORMNM' in pay:
                #             check_visual = '{}{}: {: <40s}{:.2f}\r\n'.format(check_visual, pay['PAYFORMNM'], "",
                #                                                              pay['SUM'])
                #         if 'PROVIDED' in pay:
                #             check_visual = '{}Сплачено: {: <40s}{:.2f}\r\n'.format(check_visual, "", pay['PROVIDED'])
                #         if 'REMAINS' in pay:
                #             check_visual = '{}Решта: {: <40s}{:.2f}\r\n'.format(check_visual, "", pay['REMAINS'])
                #
                # if taxes:
                #     for tax in taxes:
                #         check_visual = '{}----------------------------------------------------------------------\r\n'.format(
                #             check_visual)
                #         if 'SOURCESUM' in tax:
                #             check_visual = '{}{} {}                {:.2f}% від    {:.2f}: {:.2f}\r\n'.format(
                #                 check_visual, tax['NAME'], tax['LETTER'], tax['PRC'], tax['SOURCESUM'], tax['SUM'])
                #         else:
                #             check_visual = '{}{} {}                {:.2f}% від    {:.2f}\r\n'.format(check_visual,
                #                                                                                      tax['NAME'],
                #                                                                                      tax['LETTER'],
                #                                                                                      tax['PRC'],
                #                                                                                      tax['SUM'])

                # check_visual = '{}\r\nСУМА:                                            {:.2f}'.format(check_visual, summa)

                check_visual = '{}----------------------------------------------------------------------\r\n'.format(
                    check_visual)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                check_visual = '{}\r\n		НЕФІСКАЛЬНИЙ X-ЗВІТ'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                print(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))

                answer = jsonify(status='success', x_report_visual=coded_string, error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer

            else:
                answer = jsonify(status='error', totals=None, error_code=-1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

        except Exception as e:
            msg = str(e)
            answer = jsonify(status='error', message=msg, error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/close_shift', methods=['POST', 'GET'], endpoint='close_shift')
    @csrf.exempt
    def close_shift(self):

        start = datetime.now(tz.gettz(TIMEZONE))
        print('{} {}'.format(start, 'Надійшла команда закриття зміни API'))

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /close_shift: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department, key = get_department(data)

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            if 'balance' in data:
                balance = data['balance']
            else:
                balance = 0

            z_report_data, z_report_tax_id, close_shift_tax_id, coded_string, tax_id_inkass, qr_inkass, visual_inkass = department.prro_get_xz(
                True, key=key, testing=testing, balance=balance)

            stop = datetime.now(tz.gettz(TIMEZONE))
            print(
                '{} Віддали дані Z звіту через API, все зайняло {} секунд'.format(stop, (stop - start).total_seconds()))

            if z_report_tax_id:

                answer = jsonify(status='success', data=z_report_data,
                                 message='Зміна успішно закрита, Z звіт надіслано', error_code=0,
                                 z_report_tax_id=z_report_tax_id, close_shift_tax_id=close_shift_tax_id,
                                 z_report_visual=coded_string, tax_id_inkass=tax_id_inkass, qr_inkass=qr_inkass,
                                 visual_inkass=visual_inkass)
                logger.info(f'Відповідь: {answer.json}')
                return answer

            else:
                answer = jsonify(status='error', message='Помилка закриття Z звіту', error_code=-1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

        except Exception as e:
            msg = str(e)
            if 'Зміна не відкрита' in msg:
                error_code = 4
            else:
                error_code = -1

            answer = jsonify(status='error', message=msg, error_code=error_code)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/set_local_id', methods=['POST', 'GET'], endpoint='set_local_id')
    @csrf.exempt
    def set_local_id(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /set_local_id: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json '
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            rro_id = data['rro_id']

            department = Departments.query.filter(Departments.rro_id == rro_id).first()

            if not department:
                msg = 'Підрозділ із РРО {} не існує!'.format(rro_id)
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            else:
                local_id = data['local_id']
                last_shift = Shifts.query.order_by(Shifts.operation_time.desc()).filter(
                    Shifts.department_id == department.id).first()

                if last_shift:
                    last_shift.prro_localnumber = local_id
                    db.session.commit()

                    answer = jsonify(status='success', error_code=0)
                    logger.info(f'Відповідь: {answer.json}')
                    return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/add_key', methods=['POST', 'GET'], endpoint='add_key')
    @csrf.exempt
    def add_key(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /add_key: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json '
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            key_data = None
            cert1_data = None
            cert2_data = None
            privatbank = False

            if not 'key_id' in data:

                if 'key' in data:
                    key = data['key']
                    key_file_content = base64.b64decode(key)
                    key_data = key_file_content

                # if 'key_file' in data:
                #     key_file_name = data['key_file']
                #     if '.jks' in key_file_name:
                #         privatbank = True
                # else:
                #     if b'privatbank' in key_data:
                #         privatbank = True

                if not privatbank:
                    if 'cert1_file' in data:
                        cert1_file_name = data['cert1_file']
                        if not '.crt' in cert1_file_name and not '.cer' in cert1_file_name:
                            cert_msg = 'Неправильне розширення файлу сертифіката {}'.format(cert1_file_name)
                            answer = jsonify(status='error', message=cert_msg, error_code=1)
                            logger.error(f'Відповідь: {answer.json}', exc_info=True)
                            return answer

                    if 'cert2_file' in data:
                        cert2_file_name = data['cert2_file']
                        if not '.crt' in cert2_file_name and not '.cer' in cert2_file_name:
                            cert_msg = 'Неправильне розширення файлу сертифіката {}'.format(cert2_file_name)
                            answer = jsonify(status='error', message=cert_msg, error_code=1)
                            logger.error(f'Відповідь: {answer.json}', exc_info=True)
                            return answer

                    if 'cert1' in data:
                        cert1 = data['cert1']
                        cert1_data = base64.b64decode(cert1)

                    if 'cert2' in data:
                        cert2 = data['cert2']
                        cert2_data = base64.b64decode(cert2)

            if 'password' in data:
                key_password = data['password']
            else:
                key_password = ''

            if 'key_role' in data:
                key_role = data['key_role']
            else:
                key_role = None

            if 'key_id' in data:

                key_id = data['key_id']

                if not 'password' in data:
                    msg = 'Не вказано пароль ключа'
                    answer = jsonify(status='error', message=msg, error_code=3)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

                department_key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                if not department_key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

                department_key.key_password = key_password

            else:
                department_key = DepartmentKeys(key_data=key_data, cert1_data=cert1_data, cert2_data=cert2_data,
                    key_password=key_password, key_role=key_role)
                db.session.add(department_key)
            # db.session.commit()

            if key_password == '':
                db.session.commit()
                message = 'Дані створені для подальшої обробки. Надішліть ідентифікатор key_id та пароль для ' \
                          'завершення операції'
                answer = jsonify(status='success', message=message, key_id=department_key.id, error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer

            result, update_key_data_text, public_key = department_key.update_key_data()

            # db.session.commit()

            if result:
                status = 'success'
                error_code = 0

                if 'key_id' in data:
                    db.session.commit()
                else:
                    allow_duplicates = False
                    if 'allow_duplicates' in data:
                        allow_duplicates = data['allow_duplicates']
                        if allow_duplicates:
                            db.session.commit()

                    if not allow_duplicates:
                        old_key = DepartmentKeys.query.filter(DepartmentKeys.public_key == public_key).first()
                        if old_key:
                            if old_key.id != department_key.id:
                                department_key = old_key
                            else:
                                db.session.commit()

                if 'department_id' in data:
                    department_id = data['department_id']

                    department = Departments.query.get(department_id)
                    if department:
                        department.prro_key_id = department_key.id
                        db.session.commit()

                    result = department.set_signer_type()

            else:
                status = 'error'
                error_code = 1

            answer = jsonify(status=status, key_id=department_key.id, key_role=department_key.key_role,
                             key_content=department_key.key_data_txt, update_key_data_text=update_key_data_text,
                             public_key=public_key, error_code=error_code, message=update_key_data_text)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            e = 'Помилка ключа криптографії, можливо надані невірні сертифікати або пароль'
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/delete_key', methods=['POST', 'GET'], endpoint='delete_key')
    @csrf.exempt
    def delete_key(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /delete_key: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key_id' in data:

                key_id = data['key_id']

                departments = Departments.query.filter(Departments.prro_key_id == key_id).all()

                for department in departments:
                    department.prro_key_id = None
                db.session.commit()

                departments = Departments.query.filter(Departments.taxform_key_id == key_id).all()

                for department in departments:
                    department.taxform_key_id = None
                db.session.commit()

                key = DepartmentKeys.query.get(key_id)
                if key:
                    DepartmentKeys.query.filter_by(id=key_id).delete()
                    db.session.commit()
                    answer = jsonify(status='success', error_code=0)
                    logger.info(f'Відповідь: {answer.json}')
                    return answer
                else:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: key_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/sign', methods=['POST', 'GET'], endpoint='sign')
    @csrf.exempt
    def sign(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /sign: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key_id' in data:
                key_id = data['key_id']
                department_key = DepartmentKeys.query.get(key_id)
                if not department_key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                msg = 'Не вказано обов\'язковий параметр: key_id!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'unsigned_data' in data:
                unsigned_data_base64 = data['unsigned_data']
                unsigned_data = base64.b64decode(unsigned_data_base64)
            else:
                msg = 'Не вказано обов\'язковий параметр: unsigned_data!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'tsp' in data:
                tsp = data['tsp']
                tsp_dict = {'signature', 'content', 'all'}
                if tsp not in tsp_dict:
                    msg = 'Необов\'язковий параметр tsp має бути зі списку значень: signature, content, all!'
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                tsp = False

            if 'ocsp' in data:
                ocsp = data['ocsp']
                ocsp_dict = {True, False}
                if ocsp not in ocsp_dict:
                    msg = 'Необов\'язковий параметр ocsp має бути зі списку значень: true, false!'
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                ocsp = False

            from utils.Sign import Sign

            signer = Sign()

            try:
                signed_data = signer.sign(department_key.box_id, unsigned_data, role=department_key.key_role, tax=False,
                                          tsp=tsp, ocsp=ocsp)
            except Exception as e:
                box_id = signer.update_bid(db, department_key)
                signed_data = signer.sign(box_id, unsigned_data, role=department_key.key_role, tax=False, tsp=tsp,
                                          ocsp=ocsp)
                department_key.box_id = box_id
                db.session.commit()

            signed_data_base64 = base64.b64encode(signed_data)
            answer = jsonify(status='success', signed_data=signed_data_base64, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/encrypt', methods=['POST', 'GET'], endpoint='encrypt')
    @csrf.exempt
    def encrypt(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /encrypt: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key_id' in data:
                key_id = data['key_id']
                department_key = DepartmentKeys.query.get(key_id)
                if not department_key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                msg = 'Не вказано обов\'язковий параметр: key_id!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'unsigned_data' in data:
                unsigned_data_base64 = data['unsigned_data']
                unsigned_data = base64.b64decode(unsigned_data_base64)
            else:
                msg = 'Не вказано обов\'язковий параметр: unsigned_data!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'tsp' in data:
                tsp = data['tsp']
                tsp_dict = {'signature', 'content', 'all'}
                if tsp not in tsp_dict:
                    msg = 'Необов\'язковий параметр tsp має бути зі списку значень: signature, content, all!'
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                tsp = False

            if 'ocsp' in data:
                ocsp = data['ocsp']
                ocsp_dict = {True, False}
                if ocsp not in ocsp_dict:
                    msg = 'Необов\'язковий параметр ocsp має бути зі списку значень: true, false!'
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                ocsp = False

            from utils.Sign import Sign

            signer = Sign()

            try:
                signed_data = signer.encrypt(department_key.box_id, unsigned_data, role=department_key.key_role,
                                             tax=False, tsp=tsp, ocsp=ocsp)
            except Exception as e:
                box_id = signer.update_bid(db, department_key)
                signed_data = signer.encrypt(box_id, unsigned_data, role=department_key.key_role, tax=False, tsp=tsp,
                                             ocsp=ocsp)
                department_key.box_id = box_id
                db.session.commit()

            signed_data_base64 = base64.b64encode(signed_data)
            answer = jsonify(status='success', signed_data=signed_data_base64, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/unwrap', methods=['POST', 'GET'], endpoint='unwrap')
    @csrf.exempt
    def unwrap(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /unwrap: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key_id' in data:
                key_id = data['key_id']
                department_key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                if not department_key:
                    msg = 'Не найден ключ с кодом {}!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                msg = 'Не вказано обов\'язковий параметр: key_id!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'signed_data' in data:
                signed_data_base64 = data['signed_data']
                signed_data = base64.b64decode(signed_data_base64)
            else:
                msg = 'Не вказано обов\'язковий параметр: unsigned_data!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'tsp' in data:
                tsp = data['tsp']
                tsp_dict = {'signature', 'content', 'all'}
                if tsp not in tsp_dict:
                    msg = 'Необов\'язковий параметр tsp має бути зі списку значень: signature, content, all!'
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                tsp = False

            if 'ocsp' in data:
                ocsp = data['ocsp']
                ocsp_dict = {'strict', 'lax'}
                if ocsp not in ocsp_dict:
                    msg = 'Необов\'язковий параметр ocsp має бути зі списку значень: true, false!'
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                ocsp = False

            from utils.Sign import Sign

            signer = Sign()

            try:
                (rdata, metadata) = signer.unwrap(department_key.box_id, signed_data, tsp=tsp, ocsp=ocsp)
            except Exception as e:
                box_id = signer.update_bid(db, department_key)
                (rdata, metadata) = signer.unwrap(box_id, signed_data, tsp=tsp, ocsp=ocsp)
                department_key.box_id = box_id
                db.session.commit()

            unsigned_data_base64 = base64.b64encode(rdata)

            answer = jsonify(status='success', unsigned_data=unsigned_data_base64, metadata=metadata, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/server_state', methods=['POST', 'GET'], endpoint='server_state')
    @csrf.exempt
    def server_state(self):

        try:

            data = request.get_json()
            logger.info(f'Надійшов запит /server_state: {data}')

            sender = get_sender_by_key(request)

            server_state = sender.ServerState()

            answer = jsonify(status='success', time=server_state, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/objects', methods=['POST', 'GET'], endpoint='objects')
    @csrf.exempt
    def objects(self):

        try:

            data = request.get_json()
            logger.info(f'Надійшов запит /objects: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                raise Exception(msg)

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

                from utils.SendData2 import SendData2
                sender = SendData2(db, key, None, 0, "")

            else:
                sender, department = get_sender(request)

            """ Запит доступних об'єктів """
            cmd = {"Command": "Objects"}

            objects = sender.post_data("cmd", cmd)

            answer = jsonify(status='success', objects=objects, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/operations', methods=['POST', 'GET'], endpoint='operations')
    @csrf.exempt
    def operations(self):

        try:

            data = request.get_json()
            logger.info(f'Надійшов запит /operations: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            sender, department = get_sender(request)

            if 'from' in data:
                try:
                    datetime_from = dateutil.parser.isoparse(data['from'])
                except:
                    try:
                        datetime_from = datetime.strptime(data['from'], '%Y-%m-%dT%H:%M:%S')
                    except Exception as e:
                        msg = 'Обов\'язковий параметр from має невірний формат {}'.format(e)
                        answer = jsonify(status='error', message=msg, error_code=1)
                        logger.error(f'Відповідь: {answer.json}', exc_info=True)
                        return answer
            else:
                msg = 'Не вказано обов\'язковий параметр: from!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'to' in data:
                try:
                    datetime_to = dateutil.parser.isoparse(data['to'])
                except:
                    try:
                        datetime_to = datetime.strptime(data['to'], '%Y-%m-%dT%H:%M:%S')
                    except Exception as e:
                        msg = 'Обов\'язковий параметр to має невірний формат {}'.format(e)
                        answer = jsonify(status='error', message=msg, error_code=1)
                        logger.error(f'Відповідь: {answer.json}', exc_info=True)
                        return answer
            else:
                msg = 'Не вказано обов\'язковий параметр: to!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            shifts = sender.GetShifts(datetime_from, datetime_to)

            if 'formatted' in data:
                documents_arr = []
                for shift in shifts:
                    documents = sender.GetDocuments(shift['ShiftId'])
                    documents_arr.append(dict({'shift_id': shift['ShiftId'], 'documents': documents}))
            else:
                documents_arr = {}
                for shift in shifts:
                    documents = sender.GetDocuments(shift['ShiftId'])
                    # documents_arr.append(shift['ShiftId'])
                    documents_arr[int(shift['ShiftId'])] = documents

            answer = jsonify(status='success', shifts=shifts, documents=documents_arr, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/operators', methods=['POST', 'GET'], endpoint='operators')
    @csrf.exempt
    def operators(self):

        try:

            data = request.get_json()
            logger.info(f'Надійшов запит /operators: {data}')

            sender = get_sender_by_key(request)

            """ Запит переліку операторів (касирів) для суб’єкта господарювання """
            cmd = {"Command": "Operators"}

            operators = sender.post_data("cmd", cmd)

            answer = jsonify(status='success', operators=operators, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/check', methods=['POST', 'GET'], endpoint='check')
    @csrf.exempt
    def check(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /check: {data}')

            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json '
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'rro_id' in data:
                rro_id = data['rro_id']
            else:
                msg = 'Не вказано обов\'язковий параметр: rro_id!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'tax_id' in data:
                tax_id = data['tax_id']
            else:
                msg = 'Не вказано обов\'язковий параметр: tax_id!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            department = Departments.query.filter(Departments.rro_id == rro_id).first()

            if not department:
                msg = 'Підрозділ з РРО {} не існує!'.format(rro_id)
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            else:

                from utils.SendData2 import SendData2
                sender = SendData2(db, None, department, department.rro_id, "")

                tax_visual = sender.GetCheckExt(tax_id, 3)

                qr = None

                xml = sender.GetCheckExt(tax_id, 1)
                decoded_string = base64.b64decode(xml)

                root = etree.fromstring(decoded_string)

                tax_json = sender.xml2json(root)
                # tax_json = str(transform(error_code))

                checkhead = tax_json['CHECK'][0]['CHECKHEAD']
                for headelem in checkhead:
                    for key in headelem:
                        if key == 'ORDERDATE':
                            orderdate = headelem[key]['text']

                            operation_time = datetime.strptime(orderdate, '%d%m%Y')
                            qr = 'https://cabinet.tax.gov.ua/cashregs/check?id={}&fn={}&date={}'.format(tax_id, rro_id,
                                operation_time.strftime("%Y%m%d"))

                # check = tax_json['CHECK']
                # for checkelement in check:
                #     for checkkey in checkelement:
                #         if checkkey == 'CHECKBODY':
                #             checkbody = checkelement[checkkey]['ROW']
                #             for bodykey in checkbody:
                #                 for key in bodykey:
                #                     if key == 'NAME':
                #                         name = bodykey[key]['text']
                #                         print(name)

                # print(checkbody)
                #
                # [0]['CHECKBODY']['ROW']
                # for bodyelement in row:
                #     for key in bodyelement:
                #         if key == 'NAME':
                #             name = bodyelement[key]['text']
                #             print(name)

                answer = jsonify(status='success', tax_visual=tax_visual, tax_json=tax_json, qr=qr, xml=xml,
                                 error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/zrep', methods=['POST', 'GET'], endpoint='zrep')
    @csrf.exempt
    def zrep(self):

        try:

            data = request.get_json()
            logger.info(f'Надійшов запит /zrep: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json '
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            sender, department = get_sender(request)

            if 'tax_id' in data:
                tax_id = data['tax_id']
            else:
                msg = 'Не вказано обов\'язковий параметр: tax_id!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            z_visual_data = sender.GetZReportEx(department.rro_id, tax_id, 3)
            tax_json = None
            xml = None
            if z_visual_data:
                xml = sender.GetZReportEx(department.rro_id, tax_id, 1)
                decoded_string = base64.b64decode(xml)
                print(decoded_string.decode('windows-1251'))

                root = etree.fromstring(decoded_string)

                tax_json = sender.xml2json(root)

            if z_visual_data:
                answer = jsonify(status='success', z_visual_data=z_visual_data, tax_json=tax_json, xml=xml,
                                 error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer
            else:
                answer = jsonify(status='error', error_code=-1, message="Немає Z звітів для tax_id {}".format(tax_id))
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/last_z', methods=['POST', 'GET'], endpoint='last_z')
    @csrf.exempt
    def last_z(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /last_z: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'rro_id' in data:
                rro_id = data['rro_id']

                department = Departments.query.filter(Departments.rro_id == rro_id).first()

                if not department:
                    msg = 'Підрозділ з РРО {} не існує!'.format(rro_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

                else:
                    last_z = ZReports.query.order_by(ZReports.operation_time.desc()).filter(
                        ZReports.department_id == department.id).first()

                    if last_z:
                        answer = jsonify(status='success', operation_time=last_z.operation_time, tax_id=last_z.tax_id,
                                         error_code=0)
                        logger.info(f'Відповідь: {answer.json}')
                        return answer
                    else:
                        e = 'Немає Z звітів для department_id {}'.format(department.id)
                        answer = jsonify(status='error', message=str(e), error_code=-1)
                        logger.error(f'Відповідь: {answer.json}', exc_info=True)
                        return answer

            elif 'rro_ids' in data:
                rro_ids = data['rro_ids']

                departments = Departments.query.filter(Departments.rro_id.in_(rro_ids)).all()

                last_zets = []
                for department in departments:

                    last_z = ZReports.query.order_by(ZReports.operation_time.desc()).filter(
                        ZReports.department_id == department.id).first()

                    if last_z:
                        last_zets.append({'department_id': department.id, 'rro_id': department.rro_id,
                                          'operation_time': last_z.operation_time, 'tax_id': last_z.tax_id})
                    else:
                        datamin = datetime.min
                        last_zets.append(
                            {'department_id': department.id, 'rro_id': department.rro_id, 'operation_time': datamin,
                             'tax_id': 0})

                answer = jsonify(status='success', last_zets=last_zets, error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/tax_info', methods=['POST', 'GET'], endpoint='tax_info')
    @csrf.exempt
    def tax_info(self):
        # https://cabinet.tax.gov.ua/help/cabinet.pdf
        # https://cabinet.tax.gov.ua/help/api-registers-int.html
        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /tax_info: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

                '''
                    1 Ідентифікаційні дані
                    2 Реєстраційні дані
                    3 Відомості про керівників
                    4 Присвоєння ознаки неприбутковості
                    5 Дані про реєстрацію платником ПДВ
                    6 Дані про реєстрацію платником єдиного податку
                    7 Дані про реєстрацію платником ЄСВ
                    8 Відомості з Реєстру осіб, які здійснюють операції з товаром
                    9 Відомості про РРО
                    10 Інформація про книги ОРО
                    11 Відомості про ПРРО
                    12 Відомості про об’єкти оподаткування
                    13 Інформація про неосновні місця обліку
                    14 Дані про банківські рахунки
                    15 Дані про укладені договори згідно з журналом договорів
                    16 Види діяльності
                '''
                if 'group' in data:
                    group = data['group']
                else:
                    group = None

                if 'page' in data:
                    page = data['page']
                else:
                    page = 0

                if 'size' in data:
                    size = data['size']
                else:
                    size = 1000000

                sender = TaxForms(company_key=key)
                data = sender.tax_infos(group, page, size)
                answer = jsonify(status='success', data=data, error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer

            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: key_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/taxform_5prro', methods=['POST', 'GET'], endpoint='taxform_5prro')
    @csrf.exempt
    def taxform_5prro(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /taxform_5prro: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

            else:
                msg = 'Не вказано ключа для підпису податкових форм!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'public_key' in data:
                public_key = data['public_key']

            else:
                public_key = key.public_key

            if 'T1RXXXXG4S' in data:
                T1RXXXXG4S_text = data['T1RXXXXG4S']
            else:
                T1RXXXXG4S_text = 'Старший касир'

            sender = TaxForms(company_key=key)
            status, filename = sender.send_5PRRO(public_key, T1RXXXXG4S_text)
            if status:
                answer = jsonify(status='success', message='Форму 5-ПРРО відправлено', filename=filename, error_code=0)
                logger.info(f'Відповідь: {answer.json}')
                return answer
            else:
                msg = 'Помилка надсилання форми 5-ПРРО'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer
        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/taxform_1prro', methods=['POST', 'GET'], endpoint='taxform_1prro')
    @csrf.exempt
    def taxform_1prro(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /taxform_1prro: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            # sender, department = get_sender(request)

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

            else:
                msg = 'Не вказано ключа для підпису податкових форм!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            # назва ГО
            if 'R03G3S' in data:
                R03G3S = data['R03G3S']
            else:
                R03G3S = None

            # назва ПРРО
            if 'R04G11S' in data:
                R04G11S = data['R04G11S']
            else:
                R04G11S = None

            if 'R04G2S' in data:
                R04G2S_value = data['R04G2S']
            else:
                R04G2S_value = None

            if 'KATOTTG' in data:
                KATOTTG = data['KATOTTG']
            else:
                KATOTTG = None

            # ідентифікатор об’єкта оподаткування
            if 'dpi_id' in data:
                dpi_id = data['dpi_id']
                sender = TaxForms(company_key=key)
                status, filename = sender.send_1PRRO(dpi_id, R03G3S_value=R03G3S, R04G11S_value=R04G11S,
                                                     R04G2S_value=R04G2S_value, KATOTTG=KATOTTG)
                if status:
                    answer = jsonify(status='success', message='Форму 1-ПРРО відправлено', filename=filename,
                                     error_code=0)
                    logger.info(f'Відповідь: {answer.json}')
                    return answer
                else:
                    msg = 'Помилка надсилання форми 1-ПРРО'
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                msg = 'Не вказано ідентифікатор об’єкта оподаткування dpi_id'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/taxform_20opp', methods=['POST', 'GET'], endpoint='taxform_20opp')
    @csrf.exempt
    def taxform_20opp(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /taxform_20opp: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

            else:
                msg = 'Не вказано ключа для підпису податкових форм!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            # ідентифікатор об’єкта оподаткування
            if 'values' in data:
                values = data['values']
                for value in values:
                    if 'T1RXXXXG6' in value:
                        raise Exception('Параметр виключено у версії форми J1312005 від 10.07.2023,'
                                        ' використовуйте параметр T1RXXXXG6S')

                sender = TaxForms(company_key=key)
                status, filename = sender.send_20OPP(values)
                if status:
                    answer = jsonify(status='success', message='Форму 20-ОПП відправлено', filename=filename,
                                     error_code=0)
                    logger.info(f'Відповідь: {answer.json}')
                    return answer
                else:
                    msg = 'Помилка надсилання форми 20-ОПП'
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer
            else:
                msg = 'Не вказано масив даних values'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/taxform_messages', methods=['POST', 'GET'], endpoint='taxform_messages')
    @csrf.exempt
    def taxform_messages(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /taxform_messages: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    answer = jsonify(status='error', message=msg, error_code=1)
                    logger.error(f'Відповідь: {answer.json}', exc_info=True)
                    return answer

            else:
                msg = 'Не вказано ключа для підпису податкових форм!'
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'delete' in data:
                delete = data['delete']
            else:
                delete = True

            sender = TaxForms(company_key=key)
            messages = sender.tax_receive_all(delete)
            answer = jsonify(status='success', messages=messages, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer

    @route('/key_roles', methods=['POST', 'GET'], endpoint='key_roles')
    @csrf.exempt
    def key_roles(self):

        try:
            data = request.get_json()
            logger.info(f'Надійшов запит /key_roles: {data}')
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: ' \
                      'application/json '
                answer = jsonify(status='error', message=msg, error_code=1)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'key' in data:
                key = data['key']
                key_file_content = base64.b64decode(key)
                key_data = key_file_content
            else:
                msg = 'Не вказано ключ'
                answer = jsonify(status='error', message=msg, error_code=2)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            if 'password' in data:
                key_password = data['password']
            else:
                msg = 'Не вказано пароль ключа'
                answer = jsonify(status='error', message=msg, error_code=3)
                logger.error(f'Відповідь: {answer.json}', exc_info=True)
                return answer

            from utils.Sign import Sign

            signer = Sign()
            box_id = signer.add_key(key_data, key_password)
            roles = signer.get_roles(box_id)

            answer = jsonify(status='success', key_roles=roles, error_code=0)
            logger.info(f'Відповідь: {answer.json}')
            return answer

        except Exception as e:
            e = 'Помилка ключа криптографії, можливо надані невірні сертифікати або пароль'
            answer = jsonify(status='error', message=str(e), error_code=-1)
            logger.error(f'Відповідь: {answer.json}', exc_info=True)
            return answer
