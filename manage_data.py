# -*- coding: utf-8 -*-
import time

import click
from flask_sqlalchemy import SQLAlchemy

from config import TELEGRAM_BOT, TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_CHAT
from manage import create_app

app = create_app()
db = SQLAlchemy(app)

from models import *

import telegram

db.app = app
db.init_app(app)


@click.group()
def fucli():
    """Tool to manipulate raw data in *.csv"""
    pass


@fucli.command('close_shifts')
def close_shifts():
    list_msgs = []

    try:

        now = datetime.datetime.now().time()

        departments = Departments.query \
            .filter(Departments.auto_close_time != None) \
            .all()

        for department in departments:

            if department.auto_close_time < now:

                last_shift = Shifts.query \
                    .order_by(Shifts.operation_time.desc()) \
                    .filter(Shifts.department_id == department.id) \
                    .first()

                if last_shift:

                    if last_shift.operation_type == 1 and last_shift.operation_time.time() < department.auto_close_time:

                        try:
                            department.prro_get_xz(True)

                            list_msgs.append(' {}: зміна закрита'.format(department.full_name))
                        except Exception as e:
                            list_msgs.append('{}: помилка закриття {}.'.format(department.full_name, e))

        print(list_msgs)

    except Exception as e:
        print('{}'.format(e))


@fucli.command('delete_offline_sessions')
def delete_offline_sessions():

    offline_sessions = OfflineChecks.query \
        .filter(OfflineChecks.server_time == None) \
        .order_by(OfflineChecks.server_time) \
        .all()

    for session in offline_sessions:
        department = Departments.query.get(session.department_id)
        session.server_time = datetime.datetime.now()
        db.session.commit()
        print('{} успішно видалили оффлайн сесію'.format(department.rro_id))


@fucli.command('to_online')
def to_online():
    from lxml import etree

    from utils.Sign import Sign
    from utils.SendData2 import SendData2

    list_msgs = []

    signer = Sign()

    offline_sessions = OfflineChecks.query \
        .filter(OfflineChecks.server_time == None) \
        .order_by(OfflineChecks.server_time) \
        .all()

    for session in offline_sessions:

        signed_docs = []

        department = Departments.query.get(session.department_id)
        print('Начали обработку {}'.format(department.rro_id))
        # continue

        # last_shift = Shifts.query \
        #     .order_by(Shifts.operation_time.desc()) \
        #     .filter(Shifts.department_id == department.id) \
        #     .first()

        # if last_shift:
            # if not last_shift.offline:
        # session.server_time = datetime.datetime.now()
        # db.session.commit()
        # print('{} успешно удалили оффлайн сессию'.format(department.rro_id))
        # continue

        try:

            # Необходимо определить последний чек отправился или нет

            sender = SendData2(db, department.prro_key, department, department.rro_id, "")

            registrar_state = sender.TransactionsRegistrarState()

            if not registrar_state:
                continue

            NextLocalNum = registrar_state['NextLocalNum']
            print(NextLocalNum)

            # cmd = {
            #     "Command": "TransactionsRegistrarState",
            #     "NumFiscal": department.rro_id,
            #     "IncludeTaxObject": True,
            # }
            # data = department.sender.post_data("cmd", cmd)
            print(registrar_state)

            if registrar_state:
                if 'ShiftState' in registrar_state:
                    NextLocalNum = registrar_state['NextLocalNum']
                    # print(NextLocalNum)
                    # 'TransactionsRegistrars': [{'NumFiscal': 4000154608, 'NumLocal':
                    NumLocal = 0
                    TransactionsRegistrars = registrar_state['TaxObject']['TransactionsRegistrars']
                    print(TransactionsRegistrars)

                    if TransactionsRegistrars:
                        for tr in TransactionsRegistrars:
                            # NumFiscal = tr['NumFiscal']
                            # if NumFiscal == department.rro_id:
                            NumLocal = tr['NumLocal']

                    # print('NumLocal = {}'.format(NumLocal))

                    shift, shift_opened, messages, offline = department.prro_open_shift(False)

                    department_key = department.prro_key

                    operations = department.get_offine_operations(session)

                    print('Операцій {}'.format(len(operations)))

                    for operation in operations:
                        print('operation.type = {} operation.pid = {} operation.offline_tax_id = {}'.format(operation.type, operation.pid, operation.offline_tax_id))
                        if operation.type == 0:
                            print('Початок оффлайн сесії у {}'.format(operation.operation_time))

                        if registrar_state['ShiftState'] == 1 and 1 < operation.type < 10:
                            if operation.type == 0 and NextLocalNum == operation.pid:
                                # якщо номери не збіглися, потрібно видалити останній чек
                                # переформуємо чек відкриття сесії офлайн
                                offline_check = OfflineChecks.query.get(operation.id)
                                operation_time = offline_check.operation_time
                                testing = offline_check.testing
                                # offline_check.pid = NextLocalNum
                                sender.local_number = offline_check.pid
                                sender.offline_session_id = registrar_state['OfflineSessionId']
                                sender.offline_seed = registrar_state['OfflineSeed']
                                sender.offline_local_number = 1

                                # якщо перший чек, не можна скасовувати відкриття зміни, інакше буде помилка
                                '''
                                Код помилки: 10 PackageValidationError
                                Помилка обробки документа за № 0 в пакеті, дислокація 4:
                                Останній документ поточної зміни (фіскальний номер 197242641) має тип 'OpenShift' і не може бути відкликаний
                                '''
                                # if NumLocal == 1:
                                #     revoke = False
                                # else:
                                #     revoke = True

                                revoke = True

                                xml, signed_xml, offline_tax_id = sender.to_offline(operation_time,
                                                                                    testing=testing, revoke=revoke)

                                offline_check.offline_fiscal_xml_signed = signed_xml
                                print('Переформували чек відкриття сесії офлайн')
                                if operation.pid >= NextLocalNum:
                                    print(operation.pid, operation.operation_time)
                                    signed_docs.append(signed_xml)
                            else:
                                print(operation.pid, operation.operation_time, NextLocalNum)
                                signed_docs.append(operation.offline_fiscal_xml_signed)

                        else:
                            print(operation.pid, operation.operation_time, NextLocalNum)
                            # if operation.pid >= NextLocalNum:
                            signed_docs.append(operation.offline_fiscal_xml_signed)

                    offline_dt = datetime.datetime.now(tz.gettz(TIMEZONE))

                    department.sender.local_number = department.next_local_number
                    department.sender.offline_local_number = department.next_offline_local_number
                    department.sender.offline_seed = department.prro_offline_seed
                    department.sender.offline_session_id = department.prro_offline_session_id

                    offline_tax_number = department.sender.calculate_offline_tax_number(offline_dt,
                                                                                        prev_hash=shift.prev_hash)

                    """ Коніц офлайн сесії """
                    CHECK = department.sender.get_check_xml(103, offline=True, dt=offline_dt, prev_hash=shift.prev_hash,
                                                            offline_tax_number=offline_tax_number)

                    '''
                    <!--Ознака відкликання останнього онлайн документа через дублювання офлайн документом-->
                    <REVOKELASTONLINEDOC>true</REVOKELASTONLINEDOC>
                    '''

                    xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
                    # print(xml.decode('windows-1251'))

                    # department.sender.local_number += 1
                    # department.sender.offline_local_number += 1

                    # department.next_offline_local_number = department.sender.local_number
                    # department.next_offline_local_number = department.sender.offline_local_number

                    # try:
                    #     signed_data = signer.sign(department_key.box_id, xml, role=department_key.key_role, tax=False,
                    #                               tsp=False, ocsp=False)
                    # except Exception as e:
                    #     signer.update_bid(db, department_key)
                    #     signed_data = signer.sign(department_key.box_id, xml, role=department_key.key_role, tax=False,
                    #                               tsp=False, ocsp=False)

                    try:
                        signed_data = signer.sign(department_key.box_id, xml, role=department_key.key_role)
                    except Exception as e:
                        print(e)
                        box_id = signer.update_bid(department_key.db, department_key)
                        signed_data = signer.sign(box_id, xml, role=department_key.key_role)
                        department_key.box_id = box_id
                        db.session.commit()

                    signed_docs.append(signed_data)

                    print('Усього чеків {}'.format(len(signed_docs)))

                    cnt = 0
                    packet = 0

                    # for signed_doc in signed_docs:
                    #
                    lngth = len(signed_docs)
                    # print(signed_docs)
                    for s in range(0, lngth, 100):

                        data = b''
                        for t in range(20):

                            if cnt < lngth:
                                signed_doc = signed_docs[cnt]
                                # print(signed_doc)
                                lenb = len(signed_doc).to_bytes(4, byteorder="little", signed=True)
                                # print(len(signed_doc))
                                data = data + lenb + signed_doc
                                cnt += 1
                                # print(cnt)

                        print('{} пакет {} розмір пакету {}'.format(department.rro_id, packet, len(data)))
                        packet += 1

                        command = 'pck'
                        ret = department.sender.post_data(command, data, return_cmd_data=False)
                        print(ret)
                        if ret:
                            if ret == 'OK':
                                continue

                            data = json.loads(ret)

                            # shift.prro_localnumber += 1
                            # shift.prro_localchecknumber += 1

                            shift.offline = False

                            server_time = datetime.datetime.now()

                            for operation in operations:
                                # print(operation.type, operation.pid)
                                signed_docs.append(operation.offline_fiscal_xml_signed)

                                if operation.type == 0:
                                    offline_check = OfflineChecks.query.get(operation.id)
                                    offline_check.server_time = server_time

                                elif operation.type == 1 or operation.type == 10:
                                    open_shift = Shifts.query.get(operation.id)
                                    open_shift.server_time = server_time

                                elif operation.type == 2:
                                    advance = Advances.query.get(operation.id)
                                    advance.server_time = server_time

                                elif operation.type == 3:
                                    inkasses_operation = Incasses.query.get(operation.id)
                                    inkasses_operation.server_time = server_time

                                elif operation.type == 4:
                                    podkreps_operation = Podkreps.query.get(operation.id)
                                    podkreps_operation.server_time = server_time

                                elif operation.type == 5:
                                    sales_operation = Sales.query.get(operation.id)
                                    sales_operation.server_time = server_time

                                elif operation.type == 9:
                                    z_report = ZReports.query.get(operation.id)
                                    z_report.server_time = server_time

                            # shift.prro_offline_session_id = data['OfflineSessionId']
                            # shift.prro_offline_seed = data['OfflineSeed']

                            # shift.prro_localnumber = registrar_state['NextLocalNum']
                            department.prro_offline_session_id = data['OfflineSessionId']
                            department.prro_offline_seed = data['OfflineSeed']

                            department.offline_status = False
                            department.offline_prev_hash = None

                            department.next_local_number += 1
                            department.next_offline_local_number = 1

                            db.session.commit()
                            msg = '{} успішно закрили оффлайн сесію'.format(department.rro_id)
                            print(msg)
                            list_msgs.append(msg)

                            msg, status = department.prro_fix()
                            if status:
                                print(msg)

        except Exception as e:
            msg = '{} помилка {}'.format(department.rro_id, e)
            print(msg)
            list_msgs.append(msg)

        print(list_msgs)

        # if TELEGRAM_BOT:
        #     bot = telegram.Bot(token=TELEGRAM_BOT_TOKEN)
        #     bot.sendMessage(chat_id=TELEGRAM_BOT_CHAT,
        #                     text='{}'.format(''.join(list_msgs)))

@fucli.command('fix_all')
def fix_all():
    departments = Departments.query \
        .filter(Departments.rro_id != None) \
        .filter(Departments.prro_key != None) \
        .all()

    for department in departments:
        try:
            msg = department.prro_fix()
            print(department.rro_id, msg)
        except Exception as e:
            print(department.rro_id, e)

@fucli.command('departments_offline_on')
def offline_on():
    departments = Departments.query \
        .filter(Departments.rro_id != None) \
        .filter(Departments.prro_key != None) \
        .all()

    for department in departments:
        department.offline = True
        db.session.commit()

@fucli.command('departments_offline_off')
def offline_off():
    departments = Departments.query \
        .filter(Departments.rro_id != None) \
        .filter(Departments.prro_key != None) \
        .all()

    for department in departments:
        department.offline = False
        db.session.commit()

@fucli.command('departments_set_signer_type')
def departments_set_signer_type():
    departments = Departments.query \
        .filter(Departments.rro_id != None) \
        .filter(Departments.prro_key != None) \
        .all()

    for department in departments:
        try:
            msg = department.set_signer_type()
            print(department.rro_id, msg)
        except Exception as e:
            print(department.rro_id, e)


if __name__ == '__main__':
    fucli()
