# -*- coding: utf-8 -*-

import click
from flask_sqlalchemy import SQLAlchemy

from manage import create_app

app = create_app()
db = SQLAlchemy(app)

from models import *

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

        now = datetime.now().time()

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
        session.server_time = datetime.now()
        db.session.commit()
        print('{} успішно видалили оффлайн сесію'.format(department.rro_id))


@fucli.command('to_online')
def to_online():
    departments = Departments.query \
        .filter(Departments.rro_id != None) \
        .filter(Departments.prro_key != None) \
        .filter(Departments.next_local_number != None) \
        .filter(Departments.offline == True) \
        .filter(Departments.offline_status == True) \
        .all()

    print("{} Загальна кількість в офлайні {}".format(datetime.now(tz.gettz(TIMEZONE)),
                                                      len(departments)))

    for department in departments:
        print("{} {} Починаємо виводити з офлайн, ключ {}".format(datetime.now(tz.gettz(TIMEZONE)),
                                                                  department.rro_id, department.prro_key))
        messages, status = department.prro_to_online()
        print("{} {} Закінчили виводити з офлайн, отримано повідомлення {}".format(
            datetime.now(tz.gettz(TIMEZONE)),
            department.rro_id, messages))

    if len(departments) > 0:
        print("{} Всі {} РРО оброблені".format(datetime.now(tz.gettz(TIMEZONE)), len(departments)))

        # if TELEGRAM_BOT:
        #     bot = telegram.Bot(token=TELEGRAM_BOT_TOKEN)
        #     bot.sendMessage(chat_id=TELEGRAM_BOT_CHAT,
        #                     text='{}'.format(''.join(list_msgs)))


@fucli.command('fix_all')
def fix_all():
    departments = Departments.query \
        .filter(Departments.rro_id != None) \
        .filter(Departments.prro_key != None) \
        .filter(Departments.next_local_number == None) \
        .all()

    for department in departments:
        try:
            msg = department.prro_fix()
            print(department.rro_id, msg)
        except Exception as e:
            print(department.rro_id, e)


@fucli.command('departments_offline_on')
def departments_offline_on():
    departments = Departments.query \
        .filter(Departments.rro_id != None) \
        .filter(Departments.prro_key != None) \
        .all()

    for department in departments:
        department.offline = True
        db.session.commit()


@fucli.command('departments_offline_off')
def departments_offline_off():
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


@fucli.command('set_key_info')
def set_key_info():
    department_keys = DepartmentKeys.query \
        .filter(DepartmentKeys.acsk == None) \
        .all()

    for key in department_keys:
        try:
            result, update_key_data_text, public_key = key.update_key_data()
            if result:
                db.session.commit()
        except Exception as e:
            print(key.id, e)


if __name__ == '__main__':
    fucli()
