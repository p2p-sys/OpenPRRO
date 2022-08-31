import datetime
import json

from flask import request, session, jsonify
from flask_classy import route, FlaskView
from lxml import etree

from manage import csrf
from models import Departments, db, Shifts, DepartmentKeys, ZReports, get_sender, get_department, get_sender_by_key

import base64

import dateutil.parser

from utils.taxforms import TaxForms


class ApiView(FlaskView):
    route_base = 'api'

    @route('/keys', methods=['GET', 'POST'],
           endpoint='keys')
    @csrf.exempt
    def keys(self):

        try:
            keys = DepartmentKeys.query \
                .all()

            keys_arr = []
            for key in keys:
                k = {
                    "key_id": key.id,
                    "name": key.name,
                    "public_key": key.public_key,
                    "create_date": key.create_date,
                    "begin_time": key.begin_time,
                    "end_time": key.end_time,
                    "key_role": key.key_role,
                    "edrpou": key.edrpou,
                    "ceo_fio": key.ceo_fio,
                    "ceo_tin": key.ceo_tin,
                    "sign": key.sign,
                    "encrypt": key.encrypt,
                    "key_content": key.key_data_txt
                }
                keys_arr.append(k)

            return jsonify(status='success', keys=keys_arr, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/key', methods=['GET', 'POST'],
           endpoint='key')
    @csrf.exempt
    def key(self):

        try:

            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'key_id' in data:
                key_id = data['key_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: key_id'
                return jsonify(status='error', message=msg, error_code=1)

            key = DepartmentKeys.query.get(key_id)
            if not key:
                msg = 'Ключ з ідентифікатором {} не існує'.format(key_id)
                return jsonify(status='error', message=msg, error_code=-1)

            k = {
                "key_id": key.id,
                "name": key.name,
                "public_key": key.public_key,
                "create_date": key.create_date,
                "begin_time": key.begin_time,
                "end_time": key.end_time,
                "key_role": key.key_role,
                "edrpou": key.edrpou,
                "ceo_fio": key.ceo_fio,
                "ceo_tin": key.ceo_tin,
                "sign": key.sign,
                "encrypt": key.encrypt,
                "key_content": key.key_data_txt
            }

            return jsonify(status='success', key=k, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/rro', methods=['GET', 'POST'],
           endpoint='rro')
    @csrf.exempt
    def rro(self):

        try:
            departments = Departments.query \
                .all()

            departments_arr = []
            for department in departments:
                d = {
                    "department_id": department.id,
                    "name": department.full_name,
                    "rro_id": department.rro_id,
                    "taxform_key_id": department.taxform_key_id,
                    "prro_key_id": department.prro_key_id,
                    "signer_type": department.signer_type,
                    "key_tax_registered": department.key_tax_registered,
                }
                departments_arr.append(d)

            return jsonify(status='success', rro=departments_arr, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/add_department', methods=['POST', 'GET'],
           endpoint='add_department')
    @csrf.exempt
    def add_department(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

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
                    return jsonify(status='error', message=msg, error_code=-1)

                if len(str(rro_id)) != 10:
                    msg = 'Невірний номер РРО {}, довжина номера має бути 10 знаків'.format(rro_id)
                    return jsonify(status='error', message=msg, error_code=-1)

                if int(rro_id) < 4000000001:
                    msg = 'Невірний номер РРО {}, номер повинен починатися з цифри 4'.format(rro_id)
                    return jsonify(status='error', message=msg, error_code=-1)

                department = Departments.query.filter(Departments.rro_id == rro_id).first()
                if department:
                    # return jsonify(status='success', department_id=department.id, signer_type=department.signer_type,
                    #                error_code=0)
                    # #
                    msg = 'Підрозділ з rro {} вже існує!'.format(rro_id)
                    return jsonify(status='error', message=msg, error_code=3, department_id=department.id,
                                   signer_type=department.signer_type)
            else:
                rro_id = None

            if 'main_key_id' in data:
                taxform_key_id = data['main_key_id']
                key_id = DepartmentKeys.query.get(taxform_key_id)
                if not key_id:
                    msg = 'Ключ main_key_id з ідентифікатором {} не існує'.format(taxform_key_id)
                    return jsonify(status='error', message=msg, error_code=-1)
            else:
                taxform_key_id = None

            if 'prro_key_id' in data:
                prro_key_id = data['prro_key_id']
                key_id = DepartmentKeys.query.get(taxform_key_id)
                if not key_id:
                    msg = 'Ключ prro_key_id з ідентифікатором {} не існує'.format(prro_key_id)
                    return jsonify(status='error', message=msg, error_code=-1)
            else:
                prro_key_id = None

            if department_id:
                department = Departments.query.get(department_id)
                if not department:
                    department = Departments(
                        id=department_id,
                        full_name=name,
                        address=address,
                        rro_id=rro_id,
                        taxform_key_id=taxform_key_id,
                        prro_key_id=prro_key_id
                    )
                    db.session.add(department)
                    db.session.commit()
                else:
                    return jsonify(status='error', message=str(
                        'Підрозділ з department_id {} вже існує!'.format(department_id)))
            else:
                department = Departments(
                    full_name=name,
                    address=address,
                    rro_id=rro_id,
                    taxform_key_id=taxform_key_id,
                    prro_key_id=prro_key_id
                )
                db.session.add(department)
                db.session.commit()

            if department.taxform_key:
                result = department.set_signer_type()

            return jsonify(status='success', department_id=department.id, signer_type=department.signer_type,
                           error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e))

    @route('/set_rro', methods=['POST', 'GET'],
           endpoint='set_rro')
    @csrf.exempt
    def set_rro(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'department_id' in data:
                department_id = data['department_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: department_id'
                return jsonify(status='error', message=msg, error_code=1)

            if 'rro_id' in data:
                rro_id = data['rro_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: rro_id'
                return jsonify(status='error', message=msg, error_code=1)

            department = Departments.query.get(department_id)
            if department:
                department.rro_id = rro_id
                db.session.commit()
                return jsonify(status='success', error_code=0)
            else:
                msg = 'Підрозділ з department_id {} не існує!'.format(department_id)
                return jsonify(status='error', message=msg, error_code=1)

        except Exception as e:
            return jsonify(status='error', message=str(e))

    @route('/fix', methods=['POST', 'GET'],
           endpoint='fix')
    @csrf.exempt
    def fix(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            department, key = get_department(data)

            from utils.SendData2 import SendData2
            sender = SendData2(db, key, department.rro_id, "")

            registrar_state = sender.TransactionsRegistrarState()

            msg = ''
            if not registrar_state:
                return jsonify(status='error',
                               message="Фіскального номера немає у доступі, або сервер податкової не працює",
                               error_code=-1)

            else:
                if registrar_state:
                    # if registrar_state['ShiftState'] == 0:
                    shift, shift_opened = department.prro_open_shift(False)
                    registrar_state = sender.TransactionsRegistrarState()
                    # print(registrar_state)
                    if registrar_state:
                        if registrar_state['ShiftState'] == 0:

                            # msg = '{} {}'.format(msg, 'Смена есть, статус {}'.format(shift.operation_type))
                            if shift.operation_type == 1:
                                operation_time = datetime.datetime.now()

                                msg = '{} {}'.format(msg,
                                                     'Смена открыта в базе, но не открыта по налоговой, исправляем. ')
                                shift.p_offline = False
                                local_number = registrar_state['NextLocalNum']
                                sender.local_number = local_number
                                sender.open_shift(operation_time)
                                # shift.pid = local_number
                                shift.local_number = sender.local_number
                                # last_shift.operation_type = 0
                                db.session.commit()

                            msg = '{} {}'.format(msg, "Стан зміни: закрита, сл. лок. ном. {}".format(
                                registrar_state["NextLocalNum"]))
                        else:
                            shift_state = "Стан зміни: відкрита, сл. лок. ном. {}".format(
                                registrar_state["NextLocalNum"])
                            if shift.operation_type == 1:
                                if shift.p_offline:
                                    shift.p_offline = False
                                    msg = '{} {}'.format(msg, 'Исправляем режим оффлайн')

                                # print('Исправляем номер {} на {}'.format(shift.pid, registrar_state['NextLocalNum']))
                                # if shift.pid != registrar_state['NextLocalNum']:
                                #     msg = '{} {}'.format(msg, 'Исправляем номер pid с {} на {}'.format(shift.pid,
                                #                                                                        registrar_state[
                                #                                                                            'NextLocalNum']))
                                #     shift.pid = registrar_state['NextLocalNum']

                                if shift.prro_localnumber != registrar_state['NextLocalNum']:
                                    msg = '{} {}'.format(msg,
                                                         'Исправляем номер prro_localnumber {} на {}'.format(
                                                             shift.prro_localnumber,
                                                             registrar_state['NextLocalNum']))
                                    shift.prro_localnumber = registrar_state['NextLocalNum']

                                NumLocal = int(registrar_state['TaxObject']['TransactionsRegistrars'][0]['NumLocal'])
                                shift_prro_zn = int(shift.prro_zn)

                                if shift_prro_zn != NumLocal:
                                    msg = '{} {}'.format(msg,
                                                         'Исправляем заводской номер с {} на {}'.format(shift.prro_zn,
                                                                                                        NumLocal))
                                    shift.prro_zn = NumLocal

                                db.session.commit()

                    else:
                        msg = "Стан зміни невідомо. "
                    # else:
                    #     shift_state = "Стан зміни: відкрита, сл. лок. ном. {}".format(
                    #         registrar_state["NextLocalNum"])
                else:
                    msg = "Стан зміни невідомо. "

                if msg == '':
                    msg = 'Все ОК'

            return jsonify(status='success', message=msg, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/set_department_keys', methods=['POST', 'GET'],
           endpoint='set_department_keys')
    @csrf.exempt
    def set_department_keys(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'department_id' in data:
                department_id = data['department_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: department_id'
                return jsonify(status='error', message=msg, error_code=1)

            if 'main_key_id' in data:
                main_key_id = data['main_key_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: main_key_id'
                return jsonify(status='error', message=msg, error_code=1)

            if 'prro_key_id' in data:
                prro_key_id = data['prro_key_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: prro_key_id'
                return jsonify(status='error', message=msg, error_code=1)

            department = Departments.query.get(department_id)
            if department:
                department.taxform_key_id = main_key_id
                department.prro_key_id = prro_key_id
                db.session.commit()

                result = department.set_signer_type()

                return jsonify(status='success', signer_type=department.signer_type, error_code=0)
            else:
                msg = 'Підрозділ з department_id {} не існує!'.format(department_id)
                return jsonify(status='error', message=msg, error_code=1)

        except Exception as e:
            return jsonify(status='error', message=str(e))

    @route('/set_shift_auto_close', methods=['POST', 'GET'],
           endpoint='set_shift_auto_close')
    @csrf.exempt
    def set_shift_auto_close(self):

        try:

            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            department, key = get_department(data)

            if 'auto_close_time' in data:
                auto_close_time = data['auto_close_time']
                if auto_close_time:
                    auto_close_time = datetime.datetime.strptime(auto_close_time, "%H:%M:%S")
            else:
                auto_close_time = None
                # msg = 'Не вказано жодного з обов\'язкових параметрів: auto_close_time'
                # return jsonify(status='error', message=msg, error_code=1)

            if auto_close_time:
                department.auto_close_time = auto_close_time
            else:
                department.auto_close_time = None

            db.session.commit()

            if department.auto_close_time:
                new_auto_close_time = '{}'.format(department.auto_close_time)
            else:
                new_auto_close_time = None

            return jsonify(status='success', message="ОК", error_code=0, new_auto_close_time=new_auto_close_time)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/open_shift', methods=['POST', 'GET'],
           endpoint='open_shift')
    @csrf.exempt
    def open_shift(self):

        try:

            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

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

            from utils.SendData2 import SendData2
            sender = SendData2(db, key, department.rro_id, "")

            try:
                registrar_state = sender.TransactionsRegistrarState()

                if not registrar_state:
                    msg = "{} номер {}. Фіскального номера немає у доступі, або сервер податкової не працює".format(
                        department.full_name, department.rro_id)
                    jsonify(status='error', message=msg, error_code=-1)
                else:
                    # access = "РРО в податкової: {} ".format(sender.department_name)

                    if registrar_state:
                        if registrar_state['ShiftState'] == 0:
                            shift, shift_opened = department.prro_open_shift(True, testing=testing,
                                                                             cashier_name=cashier)
                            registrar_state = sender.TransactionsRegistrarState()
                            if registrar_state:
                                if registrar_state['ShiftState'] == 0:
                                    shift_state = "Стан зміни: закрита, сл. лок. ном. {}".format(
                                        registrar_state["NextLocalNum"])
                                    return jsonify(status='error', message=shift_state, error_code=4)
                                else:
                                    shift_state = "Стан зміни: відкрита, сл. лок. ном. {}".format(
                                        registrar_state["NextLocalNum"])

                                    if auto_close_time:
                                        department.auto_close_time = auto_close_time
                                        db.session.commit()

                                    if balance != 0:
                                        tax_id, shift, shift_opened, qr, visual, offline = department.prro_advances(
                                            balance, key=key,
                                            testing=testing)

                                        return jsonify(status='success', advance_tax_id='{}'.format(tax_id), qr=qr,
                                                       message='{}. Відправлено чек службового внесення (аванс), отримано фіскальний номер {}'.format(
                                                           shift_state, tax_id),
                                                       shift_opened_datetime=shift.operation_time,
                                                       shift_opened=shift_opened,
                                                       tax_id='{}'.format(shift.tax_id),
                                                       error_code=0,
                                                       tax_visual=visual,
                                                       offline=offline)
                                    else:
                                        return jsonify(status='success', message=shift_state, error_code=0,
                                                       shift_opened_datetime=shift.operation_time,
                                                       shift_opened=shift_opened,
                                                       tax_id=shift.tax_id)
                            else:
                                shift_state = "Стан зміни невідомо. "
                                return jsonify(status='error', message=shift_state, error_code=-1)
                        else:
                            # shift_state = "Стан зміни: відкрита, сл. лок. ном. {}".format(
                            #     registrar_state["NextLocalNum"])
                            shift_state = "Стан зміни: уже відкрито"
                            return jsonify(status='error', message=shift_state, error_code=2)
                    else:
                        shift_state = "Стан зміни невідомо. "
                        return jsonify(status='error', message=shift_state, error_code=-1)

            except Exception as e:
                msg = '{}'.format(e)
                return jsonify(status='error', message=msg, error_code=3)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/shift_status', methods=['POST', 'GET'],
           endpoint='shift_status')
    @csrf.exempt
    def shift_status(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'rro_id' in data:

                rro_id = data['rro_id']

                if 'key_id' in data:
                    key_id = data['key_id']
                    key = DepartmentKeys.query \
                        .filter(DepartmentKeys.id == key_id) \
                        .first()
                    if not key:
                        msg = 'Ключ з key_id {} не існує!'.format(key_id)
                        return jsonify(status='error', message=msg, error_code=1)
                else:
                    key = None

                department = Departments.query.filter(Departments.rro_id == rro_id).first()

                if not department:
                    msg = 'Підрозділ з РРО {} не існує!'.format(rro_id)
                    return jsonify(status='error', message=msg, error_code=1)

                else:

                    rro_id = department.rro_id

                    if not key:
                        key = department.get_prro_key()

                    from utils.SendData2 import SendData2
                    sender = SendData2(db, key, rro_id, "")

                    # try:
                    registrar_state = sender.TransactionsRegistrarState()
                    # except Exception as e:
                    #     registrar_state = None

                    last_shift = Shifts.query \
                        .order_by(Shifts.operation_time.desc()) \
                        .filter(Shifts.department_id == department.id) \
                        .filter(Shifts.operation_type == 1) \
                        .first()
                    if last_shift:
                        return jsonify(status='success', operation_time=last_shift.operation_time,
                                       registrar_state=registrar_state, error_code=0)
                    else:
                        return jsonify(status='success', message='Зміни у системі відсутні',
                                       operation_time=None,
                                       registrar_state=registrar_state, error_code=0)

            elif 'rro_ids' in data:
                rro_ids = data['rro_ids']

                departments = Departments.query.filter(Departments.rro_id.in_(rro_ids)).all()

                last_shists = []
                for department in departments:

                    rro_id = department.rro_id

                    key = department.get_prro_key()

                    from utils.SendData2 import SendData2
                    sender = SendData2(db, key, rro_id, "")

                    try:
                        registrar_state = sender.TransactionsRegistrarState()
                    except Exception as e:
                        registrar_state = None

                    last_shift = Shifts.query \
                        .order_by(Shifts.operation_time.desc()) \
                        .filter(Shifts.department_id == department.id) \
                        .filter(Shifts.operation_type == 1) \
                        .first()
                    if last_shift:
                        last_shists.append({'department_id': department.id, 'rro_id': department.rro_id,
                                            'operation_time': last_shift.operation_time, 'tax_id': last_shift.tax_id,
                                            'registrar_state': registrar_state})
                    else:
                        datamin = datetime.datetime.min
                        last_shists.append(
                            {'department_id': department.id, 'rro_id': department.rro_id, 'operation_time': datamin,
                             'tax_id': 0, 'registrar_state': registrar_state})

                return jsonify(status='success', last_shists=last_shists, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/advance', methods=['POST', 'GET'],
           endpoint='advance')
    @csrf.exempt
    def advance(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            department, key = get_department(data)

            if 'sum' in data:
                sum = data['sum']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: sum'
                return jsonify(status='error', message=msg, error_code=1)

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            tax_id, shift, shift_opened, qr, visual, offline = department.prro_advances(sum, key=key, testing=testing)

            return jsonify(status='success', tax_id='{}'.format(tax_id), qr=qr,
                           message='Відправлено чек службового внесення (аванс), отримано фіскальний номер {}'.format(
                               tax_id),
                           shift_opened_datetime=shift.operation_time,
                           shift_opened=shift_opened,
                           shift_tax_id='{}'.format(shift.tax_id),
                           error_code=0,
                           tax_visual=visual,
                           offline=offline)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/podkrep', methods=['POST', 'GET'],
           endpoint='podkrep')
    @csrf.exempt
    def podkrep(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            department, key = get_department(data)

            if 'sum' in data:
                sum = data['sum']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: sum'
                return jsonify(status='error', message=msg, error_code=1)

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            if 'balance' in data:
                balance = data['balance']
            else:
                balance = 0

            tax_id, shift, shift_opened, qr, visual, offline, tax_id_advance, qr_advance, visual_advance = department.prro_podkrep(
                sum,
                key=key,
                testing=testing,
                balance=balance)

            message = 'Відправлено підкріплення, отримано фіскальний номер {}'.format(tax_id)

            if tax_id_advance:
                return jsonify(status='success',
                               tax_id='{}'.format(tax_id), qr=qr,
                               message=message,
                               shift_opened_datetime=shift.operation_time,
                               shift_opened=shift_opened,
                               shift_tax_id='{}'.format(shift.tax_id),
                               error_code=0,
                               tax_visual=visual,
                               offline=offline,
                               tax_id_advance=tax_id_advance,
                               qr_advance=qr_advance,
                               visual_advance=visual_advance)
            else:
                return jsonify(status='success',
                               tax_id='{}'.format(tax_id), qr=qr,
                               message=message,
                               shift_opened_datetime=shift.operation_time,
                               shift_opened=shift_opened,
                               shift_tax_id='{}'.format(shift.tax_id),
                               error_code=0,
                               tax_visual=visual,
                               offline=offline)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/inkass', methods=['POST', 'GET'],
           endpoint='inkass')
    @csrf.exempt
    def inkass(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            department, key = get_department(data)

            if 'sum' in data:
                sum = data['sum']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: sum!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            if 'balance' in data:
                balance = data['balance']
            else:
                balance = 0

            tax_id, shift, shift_opened, qr, visual, offline, tax_id_advance, qr_advance, visual_advance = department.prro_inkass(
                sum,
                key=key,
                testing=testing,
                balance=balance)

            message = 'Відправлено інкасацію, отримано фіскальний номер {}'.format(tax_id)

            if tax_id_advance:
                return jsonify(status='success',
                               tax_id='{}'.format(tax_id), qr=qr,
                               message=message,
                               shift_opened_datetime=shift.operation_time,
                               shift_opened=shift_opened,
                               shift_tax_id='{}'.format(shift.tax_id),
                               error_code=0,
                               tax_visual=visual,
                               offline=offline,
                               tax_id_advance=tax_id_advance,
                               qr_advance=qr_advance,
                               visual_advance=visual_advance)
            else:
                return jsonify(status='success',
                               tax_id='{}'.format(tax_id), qr=qr,
                               message=message,
                               shift_opened_datetime=shift.operation_time,
                               shift_opened=shift_opened,
                               shift_tax_id='{}'.format(shift.tax_id),
                               error_code=0,
                               tax_visual=visual,
                               offline=offline)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/storno', methods=['POST', 'GET'],
           endpoint='storno')
    @csrf.exempt
    def storno(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            department, key = get_department(data)

            if 'tax_id' in data:
                tax_id = data['tax_id']
            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: tax_id'
                return jsonify(status='error', message=msg, error_code=1)

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            storno_tax_id, shift, shift_opened, qr, visual, offline = department.prro_storno(tax_id, key=key,
                                                                                             testing=testing)

            return jsonify(status='success',
                           tax_id='{}'.format(tax_id), qr=qr,
                           message='Відправлено сторінку документа {}, отримано фіскальний номер {}'.format(tax_id,
                                                                                                            storno_tax_id),
                           shift_opened_datetime=shift.operation_time,
                           shift_opened=shift_opened,
                           shift_tax_id='{}'.format(shift.tax_id),
                           error_code=0,
                           tax_visual=visual,
                           offline=offline)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/real', methods=['POST', 'GET'],
           endpoint='real')
    @csrf.exempt
    def real(self):

        start = datetime.datetime.now()
        print('{} {}'.format(start, 'Поступил чек продажи через API'))

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

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

            tax_id, shift, shift_opened, qr, visual, offline, tax_id_advance, qr_advance, visual_advance = department.prro_sale(
                reals,
                taxes,
                pays,
                totals=totals,
                key=key,
                testing=testing,
                balance=balance)

            # from utils.SendData2 import SendData2
            # sender = SendData2(db, key, department.rro_id, "")
            # registrar_state = sender.TransactionsRegistrarState()
            # print(registrar_state)
            # shift_opened = registrar_state[]

            stop = datetime.datetime.now()
            print('{} Отдали данные чека продажи через API, все заняло по времени {} секунд'.format(stop, (
                    stop - start).total_seconds()))

            message = 'Відправлено чек продажу, отримано фіскальний номер {}'.format(tax_id)

            if tax_id_advance:
                return jsonify(status='success', tax_id='{}'.format(tax_id), tax_id_advance='{}'.format(tax_id_advance),
                               qr=qr, qr_advance=qr_advance,
                               message=message,
                               shift_opened_datetime=shift.operation_time,
                               shift_opened=shift_opened,
                               shift_tax_id='{}'.format(shift.tax_id),
                               error_code=0,
                               tax_visual=visual,
                               tax_visual_advance=visual_advance,
                               offline=offline,
                               )
            else:
                return jsonify(status='success', tax_id='{}'.format(tax_id), qr=qr,
                               message=message,
                               shift_opened_datetime=shift.operation_time,
                               shift_opened=shift_opened,
                               shift_tax_id='{}'.format(shift.tax_id),
                               error_code=0,
                               tax_visual=visual,
                               offline=offline)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/return', methods=['POST', 'GET'],
           endpoint='ret')
    @csrf.exempt
    def ret(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

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

            tax_id, shift, shift_opened, qr, visual, offline, tax_id_advance, qr_advance, visual_advance = department.prro_sale(reals, taxes, pays, totals=totals,
                                                                                    sales_ret=True,
                                                                                    orderretnum=orderretnum, key=key,
                                                                                    testing=testing, balance=balance)

            message = 'Відправлено чек повернення, отримано фіскальний номер {}'.format(tax_id)

            if tax_id_advance:
                return jsonify(status='success', tax_id='{}'.format(tax_id), tax_id_advance='{}'.format(tax_id_advance),
                               qr=qr, qr_advance=qr_advance,
                               message=message,
                               shift_opened_datetime=shift.operation_time,
                               shift_opened=shift_opened,
                               shift_tax_id='{}'.format(shift.tax_id),
                               error_code=0,
                               tax_visual=visual,
                               tax_visual_advance=visual_advance,
                               offline=offline,
                               )
            else:
                return jsonify(status='success', tax_id='{}'.format(tax_id), qr=qr,
                               message=message,
                               shift_opened_datetime=shift.operation_time,
                               shift_opened=shift_opened,
                               shift_tax_id='{}'.format(shift.tax_id),
                               error_code=0,
                               tax_visual=visual,
                               offline=offline)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/totals', methods=['POST', 'GET'],
           endpoint='totals')
    @csrf.exempt
    def totals(self):

        try:

            sender, department = get_sender(request)

            x_data = sender.LastShiftTotals()

            return jsonify(status='success', totals=x_data, error_code=0)

        except Exception as e:
            msg = str(e)
            return jsonify(status='error', message=msg, error_code=-1)

    @route('/close_shift', methods=['POST', 'GET'],
           endpoint='close_shift')
    @csrf.exempt
    def close_shift(self):

        start = datetime.datetime.now()
        print('{} {}'.format(start, 'Поступила команда закрытия смены API'))

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            department, key = get_department(data)

            if 'testing' in data:
                testing = data['testing']
            else:
                testing = False

            if 'balance' in data:
                balance = data['balance']
            else:
                balance = 0

            z_report_data, z_report_tax_id, close_shift_tax_id, coded_string, tax_id_inkass, qr_inkass, visual_inkass = department.prro_get_xz(True, key=key,
                                                                                                      testing=testing, balance=balance)

            stop = datetime.datetime.now()
            print('{} Отдали данные Z отчета через API, все заняло по времени {} секунд'.format(stop, (
                    stop - start).total_seconds()))

            if z_report_tax_id:

                if tax_id_inkass:
                    return jsonify(status='success', data=z_report_data, message='Зміна успішно закрита, Z звіт надіслано',
                                   error_code=0, z_report_tax_id=z_report_tax_id, close_shift_tax_id=close_shift_tax_id,
                                   z_report_visual=coded_string,
                                   tax_id_inkass=tax_id_inkass,
                                   qr_inkass=qr_inkass,
                                   visual_inkass=visual_inkass)
                else:
                    return jsonify(status='success', data=z_report_data, message='Зміна успішно закрита, Z звіт надіслано',
                                   error_code=0, z_report_tax_id=z_report_tax_id, close_shift_tax_id=close_shift_tax_id,
                                   z_report_visual=coded_string)
            else:
                return jsonify(status='error', message='Помилка закриття Z звіту',
                               error_code=-1)

        except Exception as e:
            msg = str(e)
            if 'Зміна не відкрита' in msg:
                error_code = 4
            else:
                error_code = -1

            return jsonify(status='error', message=msg, error_code=error_code)

    @route('/set_local_id', methods=['POST', 'GET'],
           endpoint='set_local_id')
    @csrf.exempt
    def set_local_id(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            rro_id = data['rro_id']

            department = Departments.query.filter(Departments.rro_id == rro_id).first()

            if not department:
                msg = 'Підрозділ із РРО {} не існує!'.format(rro_id)
                return jsonify(status='error', message=msg, error_code=1)

            else:
                local_id = data['local_id']
                last_shift = Shifts.query \
                    .order_by(Shifts.operation_time.desc()) \
                    .filter(Shifts.department_id == department.id) \
                    .first()

                if last_shift:
                    last_shift.prro_localnumber = local_id
                    db.session.commit()

                    return jsonify(status='success', error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/set_local_id', methods=['POST', 'GET'],
           endpoint='set_local_id')
    @csrf.exempt
    def set_local_id(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            rro_id = data['rro_id']

            department = Departments.query.filter(Departments.rro_id == rro_id).first()

            if not department:
                msg = 'Підрозділ із РРО {} не існує!'.format(rro_id)
                return jsonify(status='error', message=msg, error_code=1)

            else:
                local_id = data['local_id']
                last_shift = Shifts.query \
                    .order_by(Shifts.operation_time.desc()) \
                    .filter(Shifts.department_id == department.id) \
                    .first()

                if last_shift:
                    last_shift.prro_localnumber = local_id
                    db.session.commit()

                    return jsonify(status='success', error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/add_key', methods=['POST', 'GET'],
           endpoint='add_key')
    @csrf.exempt
    def add_key(self):
        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            key_data = None
            cert1_data = None
            cert2_data = None

            if not 'key_id' in data:

                if 'key' in data:
                    key = data['key']
                    key_file_content = base64.b64decode(key)
                    key_data = key_file_content

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
                    return jsonify(status='error', message=msg, error_code=3)

                department_key = DepartmentKeys.query \
                    .filter(DepartmentKeys.id == key_id) \
                    .first()
                if not department_key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)

                department_key.key_password = key_password

            else:
                department_key = DepartmentKeys(
                    key_data=key_data,
                    cert1_data=cert1_data,
                    cert2_data=cert2_data,
                    key_password=key_password,
                    key_role=key_role
                )
                db.session.add(department_key)
            # db.session.commit()

            if key_password == '':
                db.session.commit()
                message = 'Дані створені для подальшої обробки. Надішліть ідентифікатор key_id та пароль для завершення операції'
                return jsonify(status='success', message=message, key_id=department_key.id, error_code=0)

            result, update_key_data_text, public_key = department_key.update_key_data()

            # db.session.commit()

            if result:
                status = 'success'
                error_code = 0

                allow_duplicates = False
                if 'allow_duplicates' in data:
                    allow_duplicates = data['allow_duplicates']
                    if allow_duplicates:
                        db.session.commit()

                if not allow_duplicates:
                    old_key = DepartmentKeys.query \
                        .filter(DepartmentKeys.public_key == public_key) \
                        .first()
                    if old_key:
                        if old_key.id != department_key.id:
                            department_key = old_key
                        else:
                            db.session.commit()

            else:
                status = 'error'
                error_code = 1

            return jsonify(status=status, key_id=department_key.id,
                           key_role=department_key.key_role,
                           key_content=department_key.key_data_txt,
                           update_key_data_text=update_key_data_text,
                           public_key=public_key, error_code=error_code,
                           message=update_key_data_text)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/delete_key', methods=['POST', 'GET'],
           endpoint='delete_key')
    @csrf.exempt
    def delete_key(self):
        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'key_id' in data:

                key_id = data['key_id']

                departments = Departments.query \
                    .filter(Departments.prro_key_id == key_id) \
                    .all()

                for department in departments:
                    department.prro_key_id = None
                db.session.commit()

                departments = Departments.query \
                    .filter(Departments.taxform_key_id == key_id) \
                    .all()

                for department in departments:
                    department.taxform_key_id = None
                db.session.commit()

                key = DepartmentKeys.query.get(key_id)
                if key:
                    DepartmentKeys.query.filter_by(id=key_id).delete()
                    db.session.commit()
                    return jsonify(status='success', error_code=0)
                else:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)

            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: key_id'
                return jsonify(status='error', message=msg, error_code=1)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/sign', methods=['POST', 'GET'],
           endpoint='sign')
    @csrf.exempt
    def sign(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'key_id' in data:
                key_id = data['key_id']
                department_key = DepartmentKeys.query.get(key_id)
                if not department_key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                msg = 'Не вказано обов\'язковий параметр: key_id!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'unsigned_data' in data:
                unsigned_data_base64 = data['unsigned_data']
                unsigned_data = base64.b64decode(unsigned_data_base64)
            else:
                msg = 'Не вказано обов\'язковий параметр: unsigned_data!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'tsp' in data:
                tsp = data['tsp']
                tsp_dict = {'signature', 'content', 'all'}
                if tsp not in tsp_dict:
                    msg = 'Необов\'язковий параметр tsp має бути зі списку значень: signature, content, all!'
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                tsp = False

            if 'ocsp' in data:
                ocsp = data['ocsp']
                ocsp_dict = {True, False}
                if ocsp not in ocsp_dict:
                    msg = 'Необов\'язковий параметр ocsp має бути зі списку значень: true, false!'
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                ocsp = False

            from utils.Sign import Sign

            signer = Sign()

            try:
                signed_data = signer.sign(department_key.box_id, unsigned_data, role=department_key.key_role, tax=False,
                                          tsp=tsp, ocsp=ocsp)
            except Exception as e:
                box_id = signer.update_bid(db, department_key)
                signed_data = signer.sign(box_id, unsigned_data, role=department_key.key_role, tax=False,
                                          tsp=tsp, ocsp=ocsp)
                department_key.box_id = box_id
                db.session.commit()

            signed_data_base64 = base64.b64encode(signed_data)
            return jsonify(status='success', signed_data=signed_data_base64, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/encrypt', methods=['POST', 'GET'],
           endpoint='encrypt')
    @csrf.exempt
    def encrypt(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'key_id' in data:
                key_id = data['key_id']
                department_key = DepartmentKeys.query.get(key_id)
                if not department_key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                msg = 'Не вказано обов\'язковий параметр: key_id!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'unsigned_data' in data:
                unsigned_data_base64 = data['unsigned_data']
                unsigned_data = base64.b64decode(unsigned_data_base64)
            else:
                msg = 'Не вказано обов\'язковий параметр: unsigned_data!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'tsp' in data:
                tsp = data['tsp']
                tsp_dict = {'signature', 'content', 'all'}
                if tsp not in tsp_dict:
                    msg = 'Необов\'язковий параметр tsp має бути зі списку значень: signature, content, all!'
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                tsp = False

            if 'ocsp' in data:
                ocsp = data['ocsp']
                ocsp_dict = {True, False}
                if ocsp not in ocsp_dict:
                    msg = 'Необов\'язковий параметр ocsp має бути зі списку значень: true, false!'
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                ocsp = False

            from utils.Sign import Sign

            signer = Sign()

            try:
                signed_data = signer.encrypt(department_key.box_id, unsigned_data, role=department_key.key_role,
                                             tax=False, tsp=tsp, ocsp=ocsp)
            except Exception as e:
                signer.update_bid(db, department_key)
                signed_data = signer.encrypt(department_key.box_id, unsigned_data, role=department_key.key_role,
                                             tax=False, tsp=tsp, ocsp=ocsp)

            with open('encrypted_data.signed', 'wb') as file:
                file.write(signed_data)

            signed_data_base64 = base64.b64encode(signed_data)
            return jsonify(status='success', signed_data=signed_data_base64, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/unwrap', methods=['POST', 'GET'],
           endpoint='unwrap')
    @csrf.exempt
    def unwrap(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'key_id' in data:
                key_id = data['key_id']
                department_key = DepartmentKeys.query.filter(DepartmentKeys.id == key_id).first()
                if not department_key:
                    msg = 'Не найден ключ с кодом {}!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                msg = 'Не вказано обов\'язковий параметр: key_id!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'signed_data' in data:
                signed_data_base64 = data['signed_data']
                signed_data = base64.b64decode(signed_data_base64)
            else:
                msg = 'Не вказано обов\'язковий параметр: unsigned_data!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'tsp' in data:
                tsp = data['tsp']
                tsp_dict = {'signature', 'content', 'all'}
                if tsp not in tsp_dict:
                    msg = 'Необов\'язковий параметр tsp має бути зі списку значень: signature, content, all!'
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                tsp = False

            if 'ocsp' in data:
                ocsp = data['ocsp']
                ocsp_dict = {'strict', 'lax'}
                if ocsp not in ocsp_dict:
                    msg = 'Необов\'язковий параметр ocsp має бути зі списку значень: true, false!'
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                ocsp = False

            from utils.Sign import Sign

            signer = Sign()

            try:
                (rdata, metadata) = signer.unwrap(department_key.box_id, signed_data, tsp=tsp, ocsp=ocsp)
            except Exception as e:
                signer.update_bid(db, department_key)
                (rdata, metadata) = signer.unwrap(department_key.box_id, signed_data, tsp=tsp, ocsp=ocsp)

            unsigned_data_base64 = base64.b64encode(rdata)

            return jsonify(status='success', unsigned_data=unsigned_data_base64, metadata=metadata, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/server_state', methods=['POST', 'GET'],
           endpoint='server_state')
    @csrf.exempt
    def server_state(self):

        try:

            sender = get_sender_by_key(request)

            server_state = sender.ServerState()

            return jsonify(status='success', time=server_state, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/objects', methods=['POST', 'GET'],
           endpoint='objects')
    @csrf.exempt
    def objects(self):

        try:

            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                raise Exception(msg)

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query \
                    .filter(DepartmentKeys.id == key_id) \
                    .first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)

                from utils.SendData2 import SendData2
                sender = SendData2(db, key, 0, "")

            else:
                sender, department = get_sender(request)

            """ Запит доступних об'єктів """
            cmd = {"Command": "Objects"}

            objects = sender.post_data("cmd", cmd)

            return jsonify(status='success', objects=objects, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/operations', methods=['POST', 'GET'],
           endpoint='operations')
    @csrf.exempt
    def operations(self):

        try:

            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            sender, department = get_sender(request)

            if 'from' in data:
                datetime_from = dateutil.parser.isoparse(data['from'])
            else:
                msg = 'Не вказано обов\'язковий параметр: from!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'to' in data:
                datetime_to = dateutil.parser.isoparse(data['to'])
            else:
                msg = 'Не вказано обов\'язковий параметр: to!'
                return jsonify(status='error', message=msg, error_code=1)

            shifts = sender.GetShifts(datetime_from, datetime_to)

            if 'formatted' in data:
                documents_arr = []
                for shift in shifts:
                    documents = sender.GetDocuments(shift['ShiftId'])
                    documents_arr.append(dict({'shift_id':shift['ShiftId'], 'documents':documents}))
            else:
                documents_arr = {}
                for shift in shifts:
                    documents = sender.GetDocuments(shift['ShiftId'])
                    # documents_arr.append(shift['ShiftId'])
                    documents_arr[int(shift['ShiftId'])] = documents

            return jsonify(status='success', shifts=shifts, documents=documents_arr, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/operators', methods=['POST', 'GET'],
           endpoint='operators')
    @csrf.exempt
    def operators(self):

        try:

            sender = get_sender_by_key(request)

            """ Запит переліку операторів (касирів) для суб’єкта господарювання """
            cmd = {"Command": "Operators"}

            operators = sender.post_data("cmd", cmd)

            return jsonify(status='success', operators=operators, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/check', methods=['POST', 'GET'],
           endpoint='check')
    @csrf.exempt
    def check(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'rro_id' in data:
                rro_id = data['rro_id']
            else:
                msg = 'Не вказано обов\'язковий параметр: rro_id!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'tax_id' in data:
                tax_id = data['tax_id']
            else:
                msg = 'Не вказано обов\'язковий параметр: tax_id!'
                return jsonify(status='error', message=msg, error_code=1)

            department = Departments.query.filter(Departments.rro_id == rro_id).first()

            if not department:
                msg = 'Підрозділ з РРО {} не існує!'.format(rro_id)
                return jsonify(status='error', message=msg, error_code=1)

            else:

                key = department.get_prro_key()

                from utils.SendData2 import SendData2
                sender = SendData2(db, key, department.rro_id, "")

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

                            operation_time = datetime.datetime.strptime(orderdate, '%d%m%Y')
                            qr = 'https://cabinet.tax.gov.ua/cashregs/check?id={}&fn={}&date={}'.format(
                                tax_id, rro_id, operation_time.strftime("%Y%m%d"))

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

                return jsonify(status='success', tax_visual=tax_visual, tax_json=tax_json, qr=qr, xml=xml, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/zrep', methods=['POST', 'GET'],
           endpoint='zrep')
    @csrf.exempt
    def zrep(self):

        # try:

        data = request.get_json()
        if not data:
            msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
            return jsonify(status='error', message=msg, error_code=1)

        sender, department = get_sender(request)

        if 'tax_id' in data:
            tax_id = data['tax_id']
        else:
            msg = 'Не вказано обов\'язковий параметр: tax_id!'
            return jsonify(status='error', message=msg, error_code=1)

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
            return jsonify(status='success', z_visual_data=z_visual_data, tax_json=tax_json, xml=xml, error_code=0)
        else:
            return jsonify(status='error', error_code=-1, message="Немає Z звітів для tax_id {}".format(tax_id))

        # except Exception as e:
        #     return jsonify(status='error', message=str(e), error_code=-1)

    @route('/last_z', methods=['POST', 'GET'],
           endpoint='last_z')
    @csrf.exempt
    def last_z(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'rro_id' in data:
                rro_id = data['rro_id']

                department = Departments.query.filter(Departments.rro_id == rro_id).first()

                if not department:
                    msg = 'Підрозділ з РРО {} не існує!'.format(rro_id)
                    return jsonify(status='error', message=msg, error_code=1)

                else:
                    last_z = ZReports.query \
                        .order_by(ZReports.operation_time.desc()) \
                        .filter(ZReports.department_id == department.id) \
                        .first()

                    if last_z:
                        return jsonify(status='success', operation_time=last_z.operation_time, tax_id=last_z.tax_id,
                                       error_code=0)
                    else:
                        e = 'Немає Z звітів для department_id {}'.format(department.id)
                        return jsonify(status='error', message=str(e), error_code=-1)

            elif 'rro_ids' in data:
                rro_ids = data['rro_ids']

                departments = Departments.query.filter(Departments.rro_id.in_(rro_ids)).all()

                last_zets = []
                for department in departments:

                    last_z = ZReports.query \
                        .order_by(ZReports.operation_time.desc()) \
                        .filter(ZReports.department_id == department.id) \
                        .first()

                    if last_z:
                        last_zets.append({'department_id': department.id, 'rro_id': department.rro_id,
                                          'operation_time': last_z.operation_time, 'tax_id': last_z.tax_id})
                    else:
                        datamin = datetime.datetime.min
                        last_zets.append(
                            {'department_id': department.id, 'rro_id': department.rro_id, 'operation_time': datamin,
                             'tax_id': 0})

                return jsonify(status='success', last_zets=last_zets, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/tax_info', methods=['POST', 'GET'],
           endpoint='tax_info')
    @csrf.exempt
    def tax_info(self):
        # https://cabinet.tax.gov.ua/help/cabinet.pdf
        # https://cabinet.tax.gov.ua/help/api-registers-int.html
        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query \
                    .filter(DepartmentKeys.id == key_id) \
                    .first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)

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
                    size = None

                sender = TaxForms(company_key=key)
                data = sender.tax_infos(group, page, size)
                return jsonify(status='success', data=data, error_code=0)

            else:
                msg = 'Не вказано жодного з обов\'язкових параметрів: key_id'
                return jsonify(status='error', message=msg, error_code=1)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/taxform_5prro', methods=['POST', 'GET'],
           endpoint='taxform_5prro')
    @csrf.exempt
    def taxform_5prro(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query \
                    .filter(DepartmentKeys.id == key_id) \
                    .first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)

            else:
                msg = 'Не вказано ключа для підпису податкових форм!'
                return jsonify(status='error', message=msg, error_code=1)

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
                return jsonify(status='success', message='Форму 5-ПРРО відправлено', filename=filename, error_code=0)
            else:
                msg = 'Помилка надсилання форми 5-ПРРО'
                return jsonify(status='error', message=msg, error_code=1)
        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/taxform_1prro', methods=['POST', 'GET'],
           endpoint='taxform_1prro')
    @csrf.exempt
    def taxform_1prro(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            # sender, department = get_sender(request)

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query \
                    .filter(DepartmentKeys.id == key_id) \
                    .first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)

            else:
                msg = 'Не вказано ключа для підпису податкових форм!'
                return jsonify(status='error', message=msg, error_code=1)

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

            # ідентифікатор об’єкта оподаткування
            if 'dpi_id' in data:
                dpi_id = data['dpi_id']
                sender = TaxForms(company_key=key)
                status, filename = sender.send_1PRRO(dpi_id, R03G3S_value=R03G3S, R04G11S_value=R04G11S, R04G2S_value=R04G2S_value)
                if status:
                    return jsonify(status='success', message='Форму 1-ПРРО відправлено', filename=filename, error_code=0)
                else:
                    msg = 'Помилка надсилання форми 1-ПРРО'
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                msg = 'Не вказано ідентифікатор об’єкта оподаткування dpi_id'
                return jsonify(status='error', message=msg, error_code=1)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/taxform_20opp', methods=['POST', 'GET'],
           endpoint='taxform_20opp')
    @csrf.exempt
    def taxform_20opp(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query \
                    .filter(DepartmentKeys.id == key_id) \
                    .first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)

            else:
                msg = 'Не вказано ключа для підпису податкових форм!'
                return jsonify(status='error', message=msg, error_code=1)

            # ідентифікатор об’єкта оподаткування
            if 'values' in data:
                values = data['values']
                sender = TaxForms(company_key=key)
                status, filename = sender.send_20OPP(values)
                if status:
                    return jsonify(status='success', message='Форму 20-ОПП відправлено', filename=filename, error_code=0)
                else:
                    msg = 'Помилка надсилання форми 20-ОПП'
                    return jsonify(status='error', message=msg, error_code=1)
            else:
                msg = 'Не вказано масив даних values'
                return jsonify(status='error', message=msg, error_code=1)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)

    @route('/taxform_messages', methods=['POST', 'GET'],
           endpoint='taxform_messages')
    @csrf.exempt
    def taxform_messages(self):

        try:
            data = request.get_json()
            if not data:
                msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
                return jsonify(status='error', message=msg, error_code=1)

            if 'key_id' in data:
                key_id = data['key_id']
                key = DepartmentKeys.query \
                    .filter(DepartmentKeys.id == key_id) \
                    .first()
                if not key:
                    msg = 'Ключ з key_id {} не існує!'.format(key_id)
                    return jsonify(status='error', message=msg, error_code=1)

            else:
                msg = 'Не вказано ключа для підпису податкових форм!'
                return jsonify(status='error', message=msg, error_code=1)

            if 'delete' in data:
                delete = data['delete']
            else:
                delete = True

            sender = TaxForms(company_key=key)
            messages = sender.tax_receive_all(delete)
            return jsonify(status='success', messages=messages, error_code=0)

        except Exception as e:
            return jsonify(status='error', message=str(e), error_code=-1)
