import base64
import datetime
import json
from hashlib import sha256
import logging

from dateutil import tz
from werkzeug.security import generate_password_hash, check_password_hash

from sqlalchemy import Column, ForeignKey, String, union_all, literal_column, or_, Index

from sqlalchemy.sql.sqltypes import Boolean, Numeric, Integer, SmallInteger, Text, DateTime, Time, \
    LargeBinary, JSON, TEXT

from sqlalchemy.orm import relationship, backref

from flask_sqlalchemy import SQLAlchemy

from flask_login import current_user

from config import TIMEZONE, LOGFILE, CMP_URLS
from utils.SendData2 import SendData2

db = SQLAlchemy()

Base = db.Model

Base.__repr__ = Base.__str__ = lambda self: str({c.name: getattr(self, c.name) for c in self.__table__.columns})
Base.as_dict = lambda self: {c.name: getattr(self, c.name) for c in self.__table__.columns}


def get_logger(name):
    # получение Користувачского логгера и установка уровня логирования
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # настройка обработчика и форматировщика
    # file_handler = logging.handlers.TimedRotatingFileHandler('{}'.format(LOGFILE), when='midnight', delay=True)
    file_handler = logging.FileHandler('{}-{}'.format(LOGFILE, datetime.date.today()), delay=True)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # добавление форматировщика к обработчику
    file_handler.setFormatter(formatter)
    # добавление обработчика к логгеру
    logger.addHandler(file_handler)

    return logger


def get_sender(req):
    data = req.get_json()
    if not data:
        msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
        raise Exception(msg)

    department = None
    key = None
    rro_id = 0

    if 'department_id' in data:
        department_id = data['department_id']
        department = Departments.query.get(department_id)
        if department:
            rro_id = department.rro_id
            key = department.prro_key
        else:
            msg = 'Підрозділ з department_id {} не існує!'.format(department_id)
            raise Exception(msg)

    elif 'rro_id' in data:
        rro_id = data['rro_id']
        department = Departments.query \
            .filter(Departments.rro_id == rro_id) \
            .first()
        if department:
            rro_id = department.rro_id
            key = department.prro_key
        else:
            msg = 'Підрозділ з rro_id {} не існує!'.format(rro_id)
            raise Exception(msg)

    if 'key_id' in data:
        key_id = data['key_id']
        key = DepartmentKeys.query.get(key_id)
        if not key:
            msg = 'Ключ key_id з ідентифікатором {} не існує'.format(key_id)
            raise Exception(msg)

    if not rro_id:
        msg = 'Не вказано жодного з обов\'язкових параметрів:department_id або rro_id!'
        raise Exception(msg)

    if not key:
        msg = 'Не вказано жодного з обов\'язкових параметрів: key_id!'
        raise Exception(msg)

    from utils.SendData2 import SendData2
    sender = SendData2(db, key, department, rro_id, "")

    return sender, department


def get_sender_by_key(req):
    data = req.get_json()
    if not data:
        msg = 'Не вказано жодного з обов\'язкових параметрів або не вказано заголовок Content-Type: application/json'
        raise Exception(msg)

    if 'key_id' in data:
        key_id = data['key_id']
        key = DepartmentKeys.query.get(key_id)
        if not key:
            msg = 'Ключ key_id з ідентифікатором {} не існує'.format(key_id)
            raise Exception(msg)

        from utils.SendData2 import SendData2
        sender = SendData2(db, key, None, 0, "")

        return sender
    else:
        sender, department = get_sender(req)
        return sender


def get_department(data):
    if 'department_id' in data:
        department_id = data['department_id']
        department = Departments.query.get(department_id)
        # rro_id = department.rro_id
        if not department:
            msg = 'Підрозділ з department_id {} не існує!'.format(department_id)
            raise Exception(msg)
    elif 'rro_id' in data:
        rro_id = data['rro_id']
        department = Departments.query.filter(Departments.rro_id == rro_id).first()
        if not department:
            msg = 'Підрозділ з rro_id {} не існує!'.format(rro_id)
            raise Exception(msg)
    else:
        msg = 'Не вказано жодного з обов\'язкових параметрів: department_id або rro_id'
        raise Exception(msg)

    if 'key_id' in data:
        key_id = data['key_id']
        key = DepartmentKeys.query \
            .filter(DepartmentKeys.id == key_id) \
            .first()
        if not key:
            msg = 'Ключ з key_id {} не існує!'.format(key_id)
            raise Exception(msg)

        if department:
            if key != department.prro_key:
                print("{} {} Отримано новий ключ, був {} став {}".format(datetime.datetime.now(tz.gettz(TIMEZONE)),
                                                                         department.rro_id, department.prro_key, key))
                department.prro_key_id = key.id
                db.session.commit()
            else:
                print("{} {} Ключ не змінювався, дані поточного ключа {}".format(
                    datetime.datetime.now(tz.gettz(TIMEZONE)), department.rro_id, department.prro_key))

    else:
        key = department.get_prro_key()

    if not department.next_local_number:
        department.prro_fix()

    return department, key


def close_offline_session(rro_id):
    from lxml import etree

    from utils.Sign import Sign
    from utils.SendData2 import SendData2

    signer = Sign()

    signed_docs = []

    department = Departments.query.filter(Departments.rro_id == rro_id).first()

    department_key = department.prro_key

    sender = SendData2(db, department.prro_key, department, department.rro_id, "")

    registrar_state = sender.TransactionsRegistrarState()

    print(registrar_state)

    offline_dt = datetime.datetime.now(tz.gettz(TIMEZONE))

    # sender.local_number = int(registrar_state['NextLocalNum'])
    # sender.offline_local_number = int(registrar_state['OfflineNextLocalNum'])
    # sender.offline_seed = registrar_state['OfflineSeed']
    # sender.offline_session_id = registrar_state['OfflineSessionId']
    department.next_local_number = int(registrar_state['NextLocalNum'])
    department.next_offline_local_number = int(registrar_state['OfflineNextLocalNum'])
    department.prro_offline_session_id = registrar_state['OfflineSessionId']
    department.prro_offline_seed = registrar_state['OfflineSeed']

    offline_tax_number = sender.calculate_offline_tax_number(offline_dt, prev_hash=None)

    """ Коніц офлайн сесії """
    CHECK = sender.get_check_xml(103, offline=True, dt=offline_dt, prev_hash=None,
                                 offline_tax_number=offline_tax_number)

    '''
    <!--Ознака відкликання останнього онлайн документа через дублювання офлайн документом-->
    <REVOKELASTONLINEDOC>true</REVOKELASTONLINEDOC>
    '''

    xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')

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
        ret = sender.post_data(command, data, return_cmd_data=False)
        try:
            return data
        except:
            print(ret)
            return False


class Users(Base):
    ''' Таблица пользователей программного продукта '''
    __tablename__ = 'users'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    created = Column('created', DateTime, default=datetime.datetime.now,
                     comment='Время когда Користувач был зарегистрирован')

    last_login = Column('last_login', DateTime,
                        comment='Время когда Користувач заходил последний раз, используется для принудительной смены пароля')

    deactivated = Column('deactivated', DateTime, comment='Время когда пользователя деактивировали')

    login = Column('login', String(32), comment='Логин пользователя для авторизации при входе в систему')

    password_hash = Column('password_hash', String(512), comment='Хэш пароля доступа в SHA-512')  # SHA-512

    role_id = Column('role_id', Integer, ForeignKey("roles.id"),
                     comment='Ідентификатор текущей роли пользователя в системе')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha512', salt_length=8)

    def check_password(self, password):
        try:
            return check_password_hash(self.password_hash, password)
        except:
            print('Failed to parse pwd hash:"{}"'.format(self.password_hash))
            return False

    @property
    def is_active(self):
        return True

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

    def is_permissions(self, value):
        q = False
        if not current_user.is_anonymous and current_user.role:
            q = Permission.query \
                .join(RolePermission, Permission.id == RolePermission.permission_id) \
                .join(Roles, Roles.id == RolePermission.role_id) \
                .filter(Roles.id == self.role_id) \
                .filter(Permission.id == value) \
                .limit(1) \
                .first()

        return True if q else False

    def __str__(self):
        return '{}'.format(self.login)


class Roles(Base):
    ''' Таблица ролей пользователей для разных уровней доступа до функционала программы '''
    __tablename__ = 'roles'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    name = Column('name', String(64), comment='Название роли')

    users = relationship(
        "Users",
        backref=backref('role', order_by='Roles.id')
    )

    permissions = relationship(
        'Permission',
        secondary='role_permission',
        backref='roles'
    )

    def __str__(self):
        return self.name


class Permission(Base):
    ''' Таблица названий различных прав для отдельных ролей '''
    __tablename__ = 'permission'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    name = Column('name', String(64), comment='Название права')

    def __str__(self):
        return self.name


class RolePermission(Base):
    ''' Промежуточная таблица которая показывает какие права доступны для какой роли '''
    __tablename__ = 'role_permission'
    __table_args__ = {"comment": __doc__}

    role_id = Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True, comment='Iдентифікатор')

    permission_id = Column("permission_id", Integer, ForeignKey("permission.id"), primary_key=True,
                           comment='no_comments_yet')

    def __repr__(self):
        return '| {} | {} |'.format(self.role_id, self.permission_id)


class Departments(Base):
    ''' Таблица содержащая информацию о текущих подразделениях компании '''
    __tablename__ = 'departments'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    full_name = Column('full_name', Text(),
                       comment='Полное наименование отделения')

    address = Column('address', String(300), comment='Адрес отделения')

    rro_id = Column('rro_id', String(128), default=None, comment='Идентификатор РРО привязанного до отделения',
                    nullable=True)

    taxform_key_id = Column('taxform_key_id', Integer, ForeignKey('department_keys.id'),
                            comment='Ключи для подписи налоговых форм', nullable=True)

    prro_key_id = Column('prro_key_id', ForeignKey('department_keys.id'),
                         comment='Основной ключ для подписи чеков ПРРО', nullable=True)

    taxform_key = relationship("DepartmentKeys", foreign_keys=[taxform_key_id], backref="taxform_key_departments")

    prro_key = relationship("DepartmentKeys", foreign_keys=[prro_key_id], backref="prro_key_departments")

    signer_type = Column('signer_type', String(20), comment='Тип підпису: Касир / Старший касир / Припинення роботи',
                         nullable=True)

    key_tax_registered = Column('key_tax_registered', Boolean, nullable=True,
                                comment='Ознака що ключ зареєстровано у податковій формою 5-ПРРО')

    auto_close_time = Column('auto_close_time', Time, comment='Час автоматичного закриття зміни', default=None,
                             nullable=True)

    offline = Column('offline', SmallInteger, default=1, nullable=False, comment='Режим офлайн вкл/викл')

    offline_supported = Column('offline_supported', SmallInteger, default=1, nullable=True,
                               comment='Дозвіл переходу в режим офлайн по податковій')

    offline_status = Column('offline_status', SmallInteger, default=0, nullable=False,
                            comment='Перейшли в режим офлайн')

    prro_offline_session_id = Column('prro_offline_session_id', String(128), comment='Ідентифікатор офлайн сесії',
                                     nullable=True)

    prro_offline_seed = Column('prro_offline_seed', String(128),
                               comment='Секретне число для обчислення фіскального номера офлайн документа',
                               nullable=True)

    next_local_number = Column('next_local_number', Integer,
                               comment='Наступний локальний номер документа', nullable=True)

    next_offline_local_number = Column('next_offline_local_number', Integer,
                                       comment='Наступний локальний оффлайн номер документа', nullable=True)

    org_name = Column('org_name', String(256), comment='Найменування продавця (256 символів)', nullable=True)

    name = Column('name', String(256), comment='Найменування точки продаж (256 символів)', nullable=True)

    prro_name = Column('prro_name', String(256), comment='Найменування ПРРО (256 символів)', nullable=True)

    tin = Column('tin', String(10), comment='ЄДРПОУ/ДРФО/№ паспорта продавця (10 символів)', nullable=True)

    ipn = Column('ipn', String(12),
                 comment='Податковий номер або Індивідуальний номер платника ПДВ (12 символів)', nullable=True)

    entity = Column('entity', Integer, comment='Ідентифікатор запису ГО', nullable=True)

    zn = Column('zn', String(32), comment='Локальний номер реєстратора розрахункових операцій (64 символи)',
                nullable=True)

    single_tax = Column('single_tax', Boolean, default=False, nullable=True, comment='Єдиний податок')

    tax_obj_guid = Column('tax_obj_guid', String(32), comment='Ідентифікатор запису ОО', nullable=True)

    tax_obj_id = Column('tax_obj_id', Integer, comment='Код запису ОО', nullable=True)

    shift_state = Column('shift_state', SmallInteger, default=0, nullable=True, comment='Стан зміни')

    closed = Column('closed', Boolean, default=False, nullable=True, comment='ПРРО відключений у податковій')

    chief_cashier = Column('chief_cashier', Boolean, comment='Старший касир', nullable=True)

    offline_session_duration = Column('offline_session_duration', Integer, comment='Тривалість оффлайн сесії',
                                      nullable=True)

    offline_session_monthly_duration = Column('offline_session_monthly_duration', Integer,
                                              comment='Тривалість оффлайн сесії з початку місяця', nullable=True)

    last_offline_session_start = Column('last_offline_session_start', DateTime,
                                        comment='Час початку оффлайн сесії',
                                        default=None, nullable=True)

    offline_prev_hash = Column('offline_prev_hash', String(64), comment='Геш попереднього офлайн документа',
                               nullable=True)

    telegram_offline_error_sended = Column('telegram_offline_error_sended', Boolean, nullable=True,
                                           comment='Ознака відправки помилки по телеграм боту')

    offline_checks = relationship(
        "OfflineChecks",
        backref=backref('department', order_by='OfflineChecks.id'),
        foreign_keys='OfflineChecks.department_id'
    )

    def __repr__(self):
        return '| {} | {} |'.format(self.id, self.full_name)

    def __str__(self):
        return self.full_name

    sender = None

    def set_signer_type(self):

        if self.prro_key:
            from utils.SendData2 import SendData2
            sender = SendData2(db, self.prro_key, self, 0, "")

            operators = sender.post_data("cmd", {"Command": "Operators"})

            if operators:
                if 'Operators' in operators:
                    operators = operators['Operators']
                    if operators:
                        for operator in operators:
                            # print(operator)
                            SubjectKeyId = operator['SubjectKeyId']
                            if SubjectKeyId == self.prro_key.public_key:

                                # RegNum = operator['RegNum'] # Реєстраційний номер особи оператора (ЄДРПОУ,ДРФО,Картка платника податків)
                                ChiefCashier = operator['ChiefCashier']

                                self.key_tax_registered = True
                                if ChiefCashier == True:
                                    self.signer_type = 'Старший касир'
                                else:
                                    self.signer_type = 'Касир'

                                db.session.commit()
                                return True

        return False

    def get_prro_key(self):
        key = self.prro_key
        return key

    def prro_fix(self):

        print('{} {} Почали тестування та виправлення'.format(datetime.datetime.now(tz.gettz(TIMEZONE)), self.rro_id))

        messages = []

        to_online_messages, to_online_status = self.prro_to_online()
        if to_online_status:
            return to_online_messages, True

        messages += to_online_messages

        from utils.SendData2 import SendData2
        sender = SendData2(db, None, self, self.rro_id, "")

        registrar_state = sender.TransactionsRegistrarState()

        if not registrar_state:
            messages.append("Не вдалося зв'язатися із сервером податкової")
            if self.offline_status:
                messages.append("ПРРО працює в режимі офлайн")

            return messages, False

        if self.next_local_number != int(registrar_state['NextLocalNum']):
            messages.append('Виправлено значення next_local_number з {} на {}'.format(
                self.next_local_number,
                registrar_state['NextLocalNum']))
            self.next_local_number = int(registrar_state['NextLocalNum'])

        zn = registrar_state['TaxObject']['TransactionsRegistrars'][0]['NumLocal']
        if '{}'.format(self.zn) != '{}'.format(zn):
            messages.append('Виправляємо заводський номер с {} на {}'.format(self.zn, zn))
            self.zn = zn

        address = registrar_state['TaxObject']['Address']
        if self.address != address:
            messages.append('Виправляємо адресу з {} на {}'.format(self.address, address))
            self.address = address

        tin = registrar_state['TaxObject']['Tin']
        if self.tin != tin:
            messages.append('Виправляємо TIN з {} на {}'.format(self.tin, tin))
            self.tin = tin

        ipn = registrar_state['TaxObject']['Ipn']
        if self.ipn != ipn:
            messages.append('Виправляємо IPN з {} на {}'.format(self.ipn, ipn))
            self.ipn = ipn

        org_name = registrar_state['TaxObject']['OrgName']
        if self.org_name != org_name:
            messages.append('Виправляємо назву OrgName з {} на {}'.format(self.org_name, org_name))
            self.org_name = org_name

        name = registrar_state['TaxObject']['Name']
        if self.name != name:
            messages.append('Виправляємо назву з {} на {}'.format(self.name, name))
            self.name = name

        prro_name = registrar_state['TaxObject']['TransactionsRegistrars'][0]['Name']
        if self.name != name:
            messages.append('Виправляємо назву ПРРО з {} на {}'.format(self.prro_name, prro_name))
            self.prro_name = prro_name

        self.entity = registrar_state['TaxObject']['Entity']
        self.single_tax = registrar_state['TaxObject']['SingleTax']
        self.tax_obj_guid = registrar_state['TaxObject']['TaxObjGuid']
        self.tax_obj_id = registrar_state['TaxObject']['TaxObjId']

        offline_supported = registrar_state['OfflineSupported']
        self.offline_supported = offline_supported

        if offline_supported:

            if 'OfflineNextLocalNum' in registrar_state:
                if int(registrar_state['OfflineNextLocalNum']) > 1:

                    print('{} {} Закриваємо відкриті офлайн сесії'.format(datetime.datetime.now(tz.gettz(TIMEZONE)),
                                                                          self.rro_id))

                    data = close_offline_session(self.rro_id)
                    if data:

                        data = json.loads(data)

                        self.prro_offline_session_id = data['OfflineSessionId']
                        self.prro_offline_seed = data['OfflineSeed']

                        self.offline_status = False
                        self.offline_prev_hash = None

                        self.next_local_number += 1
                        self.next_offline_local_number = 1

                        db.session.commit()
                        print('{} {} Успішно закрили оффлайн сесію'.format(datetime.datetime.now(tz.gettz(TIMEZONE)),
                                                                           self.rro_id))

                        messages.append('Успішно закрили оффлайн сесію')

                    else:
                        messages.append(
                            'Офлайн сесія відкрита, але не вдалося її коректно закрити. Зверніться до техпідтримки')
                        print('{} {} Офлайн сесія відкрита, але не вдалося її коректно закрити'.format(
                            datetime.datetime.now(tz.gettz(TIMEZONE)),
                            self.rro_id))
                        return messages, False

            if 'OfflineNextLocalNum' in registrar_state:
                if self.next_offline_local_number != int(registrar_state['OfflineNextLocalNum']):
                    messages.append('Виправлено значення next_offline_local_number з {} на {}'.format(
                        self.next_offline_local_number,
                        registrar_state['OfflineNextLocalNum']))
                    self.next_offline_local_number = int(registrar_state['OfflineNextLocalNum'])

            if 'OfflineSessionId' in registrar_state:
                OfflineSessionId = registrar_state['OfflineSessionId']
                if self.prro_offline_session_id != OfflineSessionId:
                    messages.append('Исправляем OfflineSessionId ПРРО с {} на {}'.format(self.prro_offline_session_id,
                                                                                         OfflineSessionId))
                    self.prro_offline_session_id = OfflineSessionId

            if 'OfflineSeed' in registrar_state:
                OfflineSeed = registrar_state['OfflineSeed']
                if self.prro_offline_seed != OfflineSeed:
                    messages.append(
                        'Исправляем OfflineSeed ПРРО с {} на {}'.format(self.prro_offline_seed, OfflineSeed))
                    self.prro_offline_seed = OfflineSeed

            self.offline_status = False

            offline_sessions = OfflineChecks.query \
                .filter(OfflineChecks.server_time == None) \
                .filter(OfflineChecks.department_id == self.id) \
                .order_by(OfflineChecks.server_time) \
                .all()

            for session in offline_sessions:
                department = Departments.query.get(session.department_id)
                session.server_time = datetime.datetime.now(tz.gettz(TIMEZONE))
                db.session.commit()
                messages.append('{} успішно видалили оффлайн сесію'.format(department.rro_id))
                print('{} {} Успішно видалили оффлайн сесію'.format(datetime.datetime.now(tz.gettz(TIMEZONE)),
                                                                   self.rro_id))

        # else:
        self.offline_status = False

        if 'OfflineSessionDuration' in registrar_state:
            self.offline_session_duration = registrar_state['OfflineSessionDuration']

        if 'OfflineSessionsMonthlyDuration' in registrar_state:
            self.offline_session_monthly_duration = registrar_state['OfflineSessionsMonthlyDuration']

        self.chief_cashier = registrar_state['ChiefCashier']

        self.shift_state = registrar_state['ShiftState']

        if 'Closed' in registrar_state:
            self.closed = registrar_state['Closed']

        if self.tin or self.ipn:
            shift, shift_opened, shift_messages, offline = self.prro_open_shift(False)
            messages += shift_messages

            if shift:
                if 'Testing' in registrar_state:
                    testing = registrar_state['Testing']
                    if shift.testing != testing:
                        messages.append('Исправляем testing с {} на {}'.format(shift.testing, testing))
                        shift.testing = testing

            if registrar_state['ShiftState'] == 0:

                if shift:
                    # msg = '{} {}'.format(msg, 'Смена есть, статус {}'.format(shift.operation_type))
                    if shift.operation_type == 1:
                        # last_shift.operation_type = 0

                        try:
                            last_shift = Shifts.query \
                                .order_by(Shifts.operation_time.desc()) \
                                .filter(Shifts.department_id == self.id) \
                                .first()

                            if last_shift:
                                Shifts.query.filter_by(id=last_shift.id).delete()

                                db.session.commit()
                                messages.append(
                                    'Зміна відкрита в базі, але не відкрита за податковою, видалили неправильну зміну')
                                print('{} {} Зміна відкрита в базі, але не відкрита за податковою, видалили неправильну зміну'.format(
                                    datetime.datetime.now(tz.gettz(TIMEZONE)),
                                    self.rro_id))
                        except:
                            operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))

                            messages.append('Зміна відкрита у базі, але не відкрита за податковою, виправлено')
                            print(
                                '{} {} Зміна відкрита у базі, але не відкрита за податковою, виправлено'.format(
                                    datetime.datetime.now(tz.gettz(TIMEZONE)),
                                    self.rro_id))

                            if 'Testing' in registrar_state:
                                testing = registrar_state['Testing']
                            else:
                                testing = False

                            shift = Shifts(
                                department_id=self.id,
                                operation_type=0,
                                operation_time=operation_time,
                                fiscal_time=operation_time,
                                server_time=operation_time,
                                pid=registrar_state['FirstLocalNum'],
                                tax_id=registrar_state['OpenShiftFiscalNum'],
                                fiscal_shift_id=registrar_state['ShiftId'],
                                offline=False,
                                testing=testing,
                                cashier=""
                            )

                            db.session.add(shift)
                            db.session.commit()

                messages.append("Стан зміни за податковою: закрита, наступний локальний номер {}".format(
                    registrar_state["NextLocalNum"]))
            else:
                messages.append('Стан зміни за податковою: відкрита, наступний локальний номер {}'.format(
                    registrar_state["NextLocalNum"]))

                if not shift or shift.operation_type == 0:
                    messages.append('Зміна відкрита у податковій, але не відкрита у БД, виправлено')

                    operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))

                    open_shift_fiscal_num = registrar_state['OpenShiftFiscalNum']

                    if open_shift_fiscal_num.find('.') != -1:
                        tax_id = None
                        offline_tax_id = open_shift_fiscal_num
                        offline = True
                    else:
                        tax_id = open_shift_fiscal_num
                        offline_tax_id = None
                        offline = False

                    shift = Shifts(
                        department_id=self.id,
                        operation_type=1,
                        operation_time=operation_time,
                        fiscal_time=operation_time,
                        server_time=operation_time,
                        pid=registrar_state['FirstLocalNum'],
                        tax_id=tax_id,
                        offline_tax_id=offline_tax_id,
                        fiscal_shift_id=registrar_state['ShiftId'],
                        offline=offline,
                        testing=registrar_state['Testing'],
                        cashier=""
                    )

                    db.session.add(shift)
                    db.session.commit()

                if shift.operation_type == 1:
                    if registrar_state['ZRepPresent']:
                        close_shift_tax_id = self.prro_close_shift(shift)
                        messages.append('Z звіт надіслано, але зміна не закрита, виправляємо. Відправлено закриття '
                                        'зміни, отримано фіскальний номер {}'.format(close_shift_tax_id))

        db.session.commit()

        if len(messages) < 4:
            if registrar_state and 'Testing' in registrar_state and registrar_state['Testing']:
                messages.append('ПРРО працює у тестовому режимі, всі ОК')
            else:
                messages.append('ПРРО працює в штатному режимі, всі ОК')

        print('{} {} Результат тестування {}'.format(datetime.datetime.now(tz.gettz(TIMEZONE)), self.rro_id, messages))

        return messages, True

    @staticmethod
    def get_offine_operations(offline_session):

        offline_checks = db.session.query(literal_column('0').label('type'),
                                          OfflineChecks.id.label('id'),
                                          OfflineChecks.pid.label('pid'),
                                          OfflineChecks.operation_time.label(
                                              'operation_time'),
                                          OfflineChecks.offline_tax_id.label(
                                              'offline_tax_id'),
                                          OfflineChecks.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(OfflineChecks.id == offline_session.id) \
            .filter(OfflineChecks.operation_type == 1) \
            .filter(OfflineChecks.operation_time >= offline_session.operation_time) \
            .filter(OfflineChecks.fiscal_time != None) \
            .filter(OfflineChecks.server_time == None)

        open_shifts = db.session.query(literal_column('1').label('type'),
                                       Shifts.id.label('id'),
                                       Shifts.pid.label('pid'),
                                       Shifts.operation_time.label(
                                           'operation_time'),
                                       Shifts.offline_tax_id.label(
                                           'offline_tax_id'),
                                       Shifts.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Shifts.offline_session_id == offline_session.offline_session_id) \
            .filter(Shifts.operation_type == 1) \
            .filter(Shifts.operation_time >= offline_session.operation_time) \
            .filter(Shifts.fiscal_time != None) \
            .filter(Shifts.server_time == None)

        advances = db.session.query(literal_column('2').label('type'),
                                    Advances.id.label('id'),
                                    Advances.pid.label('pid'),
                                    Advances.operation_time.label(
                                        'operation_time'),
                                    Advances.offline_tax_id.label(
                                        'offline_tax_id'),
                                    Advances.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Advances.offline_session_id == offline_session.offline_session_id) \
            .filter(Advances.operation_time >= offline_session.operation_time) \
            .filter(Advances.fiscal_time != None) \
            .filter(Advances.server_time == None)

        inkasses_operations = db.session.query(literal_column('3').label('type'),
                                               Incasses.id.label('id'),
                                               Incasses.pid.label('pid'),
                                               Incasses.operation_time.label(
                                                   'operation_time'),
                                               Incasses.offline_tax_id.label(
                                                   'offline_tax_id'),
                                               Incasses.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Incasses.offline_session_id == offline_session.offline_session_id) \
            .filter(Incasses.operation_time >= offline_session.operation_time) \
            .filter(Incasses.fiscal_time != None) \
            .filter(Incasses.server_time == None)

        podkreps_operations = db.session.query(literal_column('4').label('type'),
                                               Podkreps.id.label('id'),
                                               Podkreps.pid.label('pid'),
                                               Podkreps.operation_time.label(
                                                   'operation_time'),
                                               Podkreps.offline_tax_id.label(
                                                   'offline_tax_id'),
                                               Podkreps.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Podkreps.offline_session_id == offline_session.offline_session_id) \
            .filter(Podkreps.operation_time >= offline_session.operation_time) \
            .filter(Podkreps.fiscal_time != None) \
            .filter(Podkreps.server_time == None)

        sales_operations = db.session.query(literal_column('5').label('type'),
                                            Sales.id.label('id'),
                                            Sales.pid.label('pid'),
                                            Sales.operation_time.label('operation_time'),
                                            Sales.offline_tax_id.label('offline_tax_id'),
                                            Sales.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Sales.offline_session_id == offline_session.offline_session_id) \
            .filter(Sales.operation_time >= offline_session.operation_time) \
            .filter(Sales.fiscal_time != None) \
            .filter(Sales.server_time == None)

        storno_operations = db.session.query(literal_column('6').label('type'),
                                             Stornos.id.label('id'),
                                             Stornos.pid.label('pid'),
                                             Stornos.operation_time.label('operation_time'),
                                             Stornos.offline_tax_id.label('offline_tax_id'),
                                             Stornos.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Stornos.offline_session_id == offline_session.offline_session_id) \
            .filter(Stornos.operation_time >= offline_session.operation_time) \
            .filter(Stornos.fiscal_time != None) \
            .filter(Stornos.server_time == None)

        # Зарезервовано:
        #   валютні операції 7

        # Зарезервовано:
        #   кредити 8

        z_reports = db.session.query(literal_column('9').label('type'),
                                     ZReports.pid.label('id'),
                                     ZReports.pid.label('pid'),
                                     ZReports.operation_time.label(
                                         'operation_time'),
                                     ZReports.offline_tax_id.label(
                                         'offline_tax_id'),
                                     ZReports.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(ZReports.offline_session_id == offline_session.offline_session_id) \
            .filter(ZReports.operation_time >= offline_session.operation_time) \
            .filter(ZReports.fiscal_time != None) \
            .filter(ZReports.server_time == None)

        close_shifts = db.session.query(literal_column('10').label('type'),
                                        Shifts.id.label('id'),
                                        Shifts.pid.label('pid'),
                                        Shifts.operation_time.label(
                                            'operation_time'),
                                        Shifts.offline_tax_id.label(
                                            'offline_tax_id'),
                                        Shifts.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Shifts.offline_session_id == offline_session.offline_session_id) \
            .filter(Shifts.operation_type == 0) \
            .filter(Shifts.operation_time >= offline_session.operation_time) \
            .filter(Shifts.fiscal_time != None) \
            .filter(Shifts.server_time == None)

        sub = union_all(offline_checks, open_shifts, advances, inkasses_operations, podkreps_operations,
                        sales_operations, storno_operations, z_reports, close_shifts).alias(
            'sub')

        operations = db.session.query(sub.c.type, sub.c.id, sub.c.pid, sub.c.operation_time, sub.c.offline_tax_id,
                                      sub.c.offline_fiscal_xml_signed) \
            .order_by(sub.c.pid) \
            .all()

        return operations

    def prro_check_offline(self, operation_time):

        message = "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової."
        if not self.offline:
            raise Exception(message)

        if not self.offline_supported:
            raise Exception('{} Для цього номера РРО режим оффлайн заборонено'.format(message))

        if not self.prro_offline_session_id:
            raise Exception('{} Для переходу в режим офлайн немає всіх даних. '
                            'Дочекайтесь відновлення зв\'язку з податковою'.format(message))

        if self.offline_session_duration:
            if self.offline_session_duration > 36 * 60 \
                    or (self.last_offline_session_start
                        and (operation_time - self.last_offline_session_start) > datetime.timedelta(minutes=36 * 60)):
                raise Exception('{} Перевищення допустимого терміну роботи в офлайн режимі «36 годин»'
                                ' протягом офлайн сесії'.format(message))

        if self.offline_session_monthly_duration:
            if self.offline_session_monthly_duration > 168 * 60 \
                    or (self.last_offline_session_start
                        and (operation_time - self.last_offline_session_start) > datetime.timedelta(minutes=168 * 60)):
                raise Exception('{} Перевищення допустимого терміну роботи в офлайн режимі «168 годин»'
                                ' протягом календарного місяця'.format(message))

    def prro_to_offline(self, operation_time):

        self.prro_check_offline(operation_time)

        # Переходимо в офлайн режим
        if not self.offline_status:
            print('{} {} Переходимо в офлайн режим'.format(operation_time, self.rro_id))
            self.offline_status = True

            # Для офлайну потрібно додати номер, т.к. ми не знаємо пройшов чек чи ні
            self.next_local_number += 1

            xml, signed_xml, offline_tax_id = self.sender.to_offline(operation_time, testing=False,
                                                                     revoke=False)
            off = OfflineChecks(
                operation_type=1,
                department_id=self.id,
                user_id=None,
                operation_time=operation_time,
                shift_id=None,
                fiscal_time=operation_time,
                server_time=None,
                pid=self.next_local_number,
                testing=False,
                offline_fiscal_xml_signed=signed_xml,
                offline_tax_id=offline_tax_id,
                offline_session_id=self.prro_offline_session_id
            )
            db.session.add(off)

            self.offline_prev_hash = None
            db.session.commit()
            print('{} {} Зберегли новий документ відкриття оффлайн сесії'.format(operation_time, self.rro_id))

            self.prro_set_next_number()
        else:
            print('{} {} РРО перебуває в офлайн режимі'.format(operation_time, self.rro_id))

    def prro_to_online(self):

        from lxml import etree

        from utils.Sign import Sign
        from utils.SendData2 import SendData2

        list_msgs = []

        to_online_status = False

        signer = Sign()

        offline_sessions = OfflineChecks.query \
            .filter(OfflineChecks.server_time == None) \
            .filter(OfflineChecks.department_id == self.id) \
            .order_by(OfflineChecks.server_time) \
            .all()

        if len(offline_sessions) == 0:
            return ['Немає нових офлайн сесій'], False

        for session in offline_sessions:

            signed_docs = []

            print('{} {} Почали обробку'.format(datetime.datetime.now(tz.gettz(TIMEZONE)), self.rro_id))
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
                # Необхідно визначити останній чек відправився чи ні
                sender = SendData2(db, self.prro_key, self, self.rro_id, "")

                registrar_state = sender.TransactionsRegistrarState()

                if not registrar_state:
                    if len(sender.last_fiscal_error_txt) > 0:
                        list_msgs.append('Помилка {}'.format(sender.last_fiscal_error_txt))
                    continue

                if registrar_state:
                    if 'ShiftState' in registrar_state:
                        tax_next_local_num = registrar_state['NextLocalNum']

                        shift, shift_opened, messages, offline = self.prro_open_shift(False)

                        department_key = self.prro_key

                        operations = self.get_offine_operations(session)

                        print('{} {} Кількість офлайн операцій {}'.format(datetime.datetime.now(tz.gettz(TIMEZONE)),
                                                                          self.rro_id, len(operations)))

                        for operation in operations:
                            print('{} {} operation.type = {} operation.pid = {} operation.offline_tax_id = {}'.format(
                                datetime.datetime.now(tz.gettz(TIMEZONE)),
                                self.rro_id,
                                operation.type, operation.pid, operation.offline_tax_id))
                            if operation.type == 0:
                                print('{} {} Початок оффлайн сесії у {}'.format(
                                    datetime.datetime.now(tz.gettz(TIMEZONE)),
                                    self.rro_id,
                                    operation.operation_time))

                            if registrar_state['ShiftState'] == 1 and 1 < operation.type < 10:
                                if operation.type == 0 and tax_next_local_num == operation.pid:
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
                                    if operation.pid >= tax_next_local_num:
                                        # print(operation.pid, operation.operation_time)
                                        signed_docs.append(signed_xml)
                                else:
                                    # print(operation.pid, operation.operation_time, tax_next_local_num)
                                    signed_docs.append(operation.offline_fiscal_xml_signed)

                            else:
                                # print(operation.pid, operation.operation_time, tax_next_local_num)
                                # if operation.pid >= NextLocalNum:
                                signed_docs.append(operation.offline_fiscal_xml_signed)

                        offline_dt = datetime.datetime.now(tz.gettz(TIMEZONE))

                        self.sender.local_number = self.next_local_number
                        self.sender.offline_local_number = self.next_offline_local_number
                        self.sender.offline_seed = self.prro_offline_seed
                        self.sender.offline_session_id = self.prro_offline_session_id

                        offline_tax_number = self.sender.calculate_offline_tax_number(offline_dt,
                                                                                      prev_hash=shift.prev_hash)

                        """ Коніц офлайн сесії """
                        CHECK = self.sender.get_check_xml(103, offline=True, dt=offline_dt,
                                                          prev_hash=shift.prev_hash,
                                                          offline_tax_number=offline_tax_number)

                        '''
                        <!--Ознака відкликання останнього онлайн документа через дублювання офлайн документом-->
                        <REVOKELASTONLINEDOC>true</REVOKELASTONLINEDOC>
                        '''

                        xml = etree.tostring(CHECK, pretty_print=True, encoding='windows-1251')
                        # print(xml)

                        try:
                            signed_data = signer.sign(department_key.box_id, xml, role=department_key.key_role)
                        except Exception as e:
                            print('{] {} Помилка {}'.format(datetime.datetime.now(tz.gettz(TIMEZONE)), self.rro_id, e))
                            list_msgs.append('Помилка {}'.format(e))
                            box_id = signer.update_bid(department_key.db, department_key)
                            signed_data = signer.sign(box_id, xml, role=department_key.key_role)
                            department_key.box_id = box_id
                            db.session.commit()

                        signed_docs.append(signed_data)

                        print('{} {} Усього чеків {}'.format(datetime.datetime.now(tz.gettz(TIMEZONE)), self.rro_id,
                                                             len(signed_docs)))

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

                            print('{} {} Пакет {} розмір пакету {}'.format(datetime.datetime.now(tz.gettz(TIMEZONE)),
                                                                           self.rro_id, packet, len(data)))
                            packet += 1

                            command = 'pck'
                            ret = self.sender.post_data(command, data, return_cmd_data=False)
                            print('{} {} Відповідь сервера {}'.format(datetime.datetime.now(tz.gettz(TIMEZONE)),
                                                                      self.rro_id, ret))
                            if len(sender.last_fiscal_error_txt) > 0:
                                list_msgs.append('Відповідь сервера {}'.format(sender.last_fiscal_error_txt))

                            if ret:
                                if ret == 'OK':
                                    continue

                                try:
                                    data = json.loads(ret)
                                except:
                                    break

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

                                self.prro_offline_session_id = data['OfflineSessionId']
                                self.prro_offline_seed = data['OfflineSeed']

                                self.offline_status = False
                                self.offline_prev_hash = None

                                db.session.commit()

                                self.prro_set_next_number()

                                print('{} {} Успішно закрили оффлайн сесію'.format(
                                    datetime.datetime.now(tz.gettz(TIMEZONE)), self.rro_id))
                                list_msgs.append('Успішно закрили оффлайн сесію')

                                msg, status = self.prro_fix()
                                if status:
                                    print(msg)
                                    list_msgs += msg

                                to_online_status = True

            except Exception as e:
                print('{} {} {}'.format(datetime.datetime.now(tz.gettz(TIMEZONE)), self.rro_id, e))
                list_msgs.append('Помилка {}'.format(e))

            # print(list_msgs)

        return list_msgs, to_online_status

    def prro_open_shift(self, open_shift=True, shift_id=None, key=None, testing=False, cashier_name=None):

        operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
        server_time = None

        # shift_opened = False

        if not self.sender:
            self.sender = SendData2(db, None, self, self.rro_id, cashier_name)

        if shift_id:
            last_shift = Shifts.query.get(shift_id)
        else:
            last_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .first()

        if last_shift:

            if last_shift.operation_type == 1:
                self.sender.cashier_name = last_shift.cashier
                return last_shift, False, ['Стан зміни за БД: відкрита, наступний локальний номер {}'.format(
                    self.next_local_number)], last_shift.offline

            last_shift.prro_offline_local_number = 1
            db.session.commit()

            if not open_shift:
                self.shift_state = 0
                db.session.commit()
                return last_shift, False, ['Стан зміни за БД: закрита, наступний локальний номер {}'.format(
                    self.next_local_number)], last_shift.offline
        else:
            if not open_shift:
                self.shift_state = 0
                db.session.commit()
                # raise Exception('{}'.format("Зміни у системі відсутні"))
                return None, False, ['Зміни у системі відсутні, наступний локальний номер {}'.format(
                    self.next_local_number)], None

        if not self.offline_status:
            registrar_state = self.sender.TransactionsRegistrarState()
        else:
            registrar_state = None

        if not registrar_state:
            self.prro_to_offline(operation_time)
        else:
            print('{} {} Відповідь від податкової є'.format(operation_time, self.rro_id))
            last_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .first()

            if last_shift:
                print('{} {} Зміна є, статус {}'.format(operation_time, self.rro_id, last_shift.operation_type))
                if last_shift.operation_type == 1:
                    if registrar_state['ShiftState'] == 0:
                        print('{} {} Смена открыта в БД, но не открыта по налоговой, исправляем'.format(operation_time,
                                                                                                        self.rro_id))
                        last_shift.offline = False
                        local_number = registrar_state['FirstLocalNum']
                        # self.sender.local_number = local_number
                        self.sender.open_shift(operation_time, testing=testing)
                        last_shift.pid = local_number
                        # last_shift.operation_type = 0
                        db.session.commit()

        if not self.offline_status:

            ret = self.sender.open_shift(operation_time, testing=testing)
            if ret == 9:
                messages, status = self.prro_fix()
                if status:
                    self.sender.open_shift(operation_time, testing=testing)

            if self.sender.server_time:
                server_time = self.sender.server_time

        if not server_time:
            self.prro_to_offline(operation_time)
            fiscal_time = operation_time
            fiscal_ticket = None
            server_time = None

            xml, signed_xml, offline_tax_id, xml_hash = self.sender.open_shift(operation_time,
                                                                               testing=testing,
                                                                               offline=True,
                                                                               prev_hash=self.offline_prev_hash)

            self.offline_prev_hash = xml_hash

        else:
            fiscal_time = self.sender.fiscal_time

            if self.sender.last_xml:
                xml = base64.b64encode(self.sender.last_xml).decode()
            else:
                xml = None

            if self.sender.last_fiscal_ticket:
                fiscal_ticket = base64.b64encode(
                    self.sender.last_fiscal_ticket).decode()
            else:
                fiscal_ticket = None

            signed_xml = None
            offline_tax_id = None

        operation_type = 1  # открытие смены

        # pid = self.next_local_number

        tax_id = self.sender.last_ordertaxnum

        try:
            user_id = current_user.id
        except:
            prev_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .filter(Shifts.operation_type == 1) \
                .first()
            if prev_shift:
                user_id = prev_shift.user_id
            else:
                # raise Exception(
                #     "Зміну не вдалося відкрити, не вдалося визначити користувача, зв'яжіться з тех.підтримкою ФК")
                user_id = None

        shift = Shifts(
            department_id=self.id,
            user_id=user_id,
            operation_type=operation_type,
            operation_time=operation_time,
            fiscal_time=fiscal_time,
            server_time=server_time,
            pid=self.next_local_number,
            tax_id=tax_id,
            xml=xml,
            offline_fiscal_xml_signed=signed_xml,
            fiscal_ticket=fiscal_ticket,
            fiscal_shift_id=None,
            offline=self.offline_status,
            testing=testing,
            cashier=cashier_name,
            offline_tax_id=offline_tax_id,
            offline_session_id=self.prro_offline_session_id
        )

        db.session.add(shift)
        self.shift_state = 1

        db.session.commit()

        self.prro_set_next_number()

        messages = []

        if self.offline_status:
            msg = 'Зберегли відкриття зміни в режимі офлайн'
        else:
            msg = 'Зберегли відкриття зміни в режимі онлайн'

        messages.append(msg)
        print('{} {} {} '.format(fiscal_time, self.rro_id, msg))

        return shift, True, messages, self.offline_status

    ''' Відправимо аванси по залишкам '''

    def prro_advances(self, summa, key=None, testing=False, doc_uid=None):

        shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key, testing=testing)
        if shift:

            operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
            server_time = None

            offline_status = self.offline_status

            if not offline_status:

                ret = self.sender.post_advances(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)
                if not ret:
                    if self.offline:
                        offline_status = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    messages, status = self.prro_fix()
                    if status:
                        shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key, testing=testing)
                        ret = self.sender.post_advances(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)
                        if not ret:
                            if self.offline:
                                offline_status = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

            if offline_status:
                self.prro_to_offline(operation_time)
                fiscal_time = operation_time
                fiscal_ticket = None
                server_time = None
                prev_hash = self.offline_prev_hash

                xml, signed_xml, offline_tax_id, xml_hash = self.sender.post_advances(summa,
                                                                                      operation_time,
                                                                                      testing=shift.testing,
                                                                                      offline=True,
                                                                                      prev_hash=self.offline_prev_hash)

                self.offline_prev_hash = xml_hash

            else:
                if self.sender.fiscal_time:
                    fiscal_time = self.sender.fiscal_time
                else:
                    fiscal_time = operation_time

                # if self.sender.last_xml:
                #     xml = base64.b64encode(self.sender.last_xml).decode()
                # else:
                #     xml = None
                #
                if self.sender.last_fiscal_ticket:
                    fiscal_ticket = base64.b64encode(
                        self.sender.last_fiscal_ticket).decode()
                else:
                    fiscal_ticket = None

                signed_xml = None

                offline_tax_id = None

                prev_hash = None

            tax_id = self.sender.last_ordertaxnum

            adv = Advances(
                department_id=self.id,
                user_id=shift.user_id,
                operation_time=operation_time,
                shift_id=shift.id,
                fiscal_time=fiscal_time,
                server_time=server_time,
                sum=summa,
                pid=self.next_local_number,
                tax_id=tax_id,
                fiscal_ticket=fiscal_ticket,
                testing=shift.testing,
                offline_fiscal_xml_signed=signed_xml,
                offline=offline_status,
                offline_tax_id=offline_tax_id,
                offline_session_id=self.prro_offline_session_id,
                doc_uid=doc_uid,
                prev_hash=prev_hash
            )
            db.session.add(adv)

            db.session.commit()

            self.prro_set_next_number()

            cabinet_url = None

            if offline_status:
                tax_id = offline_tax_id

                check_visual = '{}'.format(self.org_name)
                if self.name:
                    check_visual = '{}\r\n{}'.format(check_visual, self.name)
                if self.address:
                    check_visual = '{}\r\n{}'.format(check_visual, self.address)
                if self.tin:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, self.tin)
                if self.ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, self.ipn)

                check_visual = '{}\r\n		{}'.format(check_visual, "Службове внесення")
                check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")
                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, self.zn)
                check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, offline_tax_id,
                                                                        adv.pid, "офлайн")
                if shift.testing:
                    check_visual = '{}\r\nТЕСТОВИЙ НЕФІСКАЛЬНИЙ ДОКУМЕНТ'.format(check_visual)
                if shift.cashier:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, shift.cashier)
                else:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, self.prro_key.ceo_fio)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\nСУМА:                                            {:.2f}'.format(check_visual,
                                                                                                      summa)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                if prev_hash:
                    check_visual = '{}\r\nКонтрольне число:\r\n{}'.format(
                        check_visual, prev_hash)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                if shift.testing:
                    check_visual = '{}\r\n		ТЕСТОВИЙ НЕФІСКАЛЬНИЙ ЧЕК'.format(check_visual)
                else:
                    check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))

            else:
                coded_string = None
                try:
                    coded_string, cabinet_url = self.sender.GetCheckExt(tax_id, 3)
                except Exception as e:
                    pass

            if not cabinet_url:
                cabinet_url = 'https://cabinet.tax.gov.ua/cashregs/check?fn={}&id={}&date={}&time={}&sm={:.2f}'.format(
                    self.rro_id, tax_id, operation_time.strftime("%Y%m%d"), operation_time.strftime("%H%M%S"), summa)

            messages = []
            if self.offline_status:
                msg = 'Зберегли чек авансу в режимі офлайн'
            else:
                msg = 'Зберегли чек авансу в режимі онлайн'

            messages.append(msg)
            print('{} {} {} '.format(fiscal_time, self.full_name, msg))

            return tax_id, shift, shift_opened, cabinet_url, coded_string, offline
        else:
            raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

    ''' Відправимо підкріплення '''

    def prro_podkrep(self, summa, key=None, testing=False, balance=0, doc_uid=None):

        shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key, testing=testing)
        if shift:

            if shift_opened and balance > 0:
                tax_id_advance, shift_advance, shift_opened_advance, qr_advance, visual_advance, offline_advance = self.prro_advances(
                    balance, key=key,
                    testing=testing)
            else:
                qr_advance = None
                visual_advance = None
                tax_id_advance = None

            operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
            server_time = None

            offline_status = self.offline_status

            if not offline_status:

                ret = self.sender.post_podkrep(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)
                if not ret:
                    if self.offline:
                        offline_status = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    messages, status = self.prro_fix()
                    if status:
                        shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key, testing=testing)
                        ret = self.sender.post_podkrep(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)

                        if not ret:
                            if self.offline:
                                offline_status = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

            if offline_status:
                self.prro_to_offline(operation_time)
                fiscal_time = operation_time
                fiscal_ticket = None
                server_time = None
                prev_hash = self.offline_prev_hash

                xml, signed_xml, offline_tax_id, xml_hash = self.sender.post_podkrep(summa,
                                                                                     operation_time,
                                                                                     testing=shift.testing,
                                                                                     offline=True,
                                                                                     prev_hash=self.offline_prev_hash)

                self.offline_prev_hash = xml_hash

            else:
                if self.sender.fiscal_time:
                    fiscal_time = self.sender.fiscal_time
                else:
                    fiscal_time = operation_time

                if self.sender.last_fiscal_ticket:
                    fiscal_ticket = base64.b64encode(
                        self.sender.last_fiscal_ticket).decode()
                else:
                    fiscal_ticket = None

                signed_xml = None

                offline_tax_id = None

                prev_hash = None

            tax_id = self.sender.last_ordertaxnum

            adv = Podkreps(
                department_id=self.id,
                user_id=shift.user_id,
                operation_time=operation_time,
                shift_id=shift.id,
                fiscal_time=fiscal_time,
                server_time=server_time,
                sum=summa,
                pid=self.next_local_number,
                tax_id=tax_id,
                fiscal_ticket=fiscal_ticket,
                testing=shift.testing,
                offline_fiscal_xml_signed=signed_xml,
                offline=offline_status,
                offline_tax_id=offline_tax_id,
                offline_session_id=self.prro_offline_session_id,
                doc_uid=doc_uid,
                prev_hash=prev_hash
            )
            db.session.add(adv)

            db.session.commit()

            self.prro_set_next_number()

            cabinet_url = None

            if offline_status:
                tax_id = offline_tax_id

                check_visual = '{}'.format(self.org_name)
                if self.name:
                    check_visual = '{}\r\n{}'.format(check_visual, self.name)
                if self.address:
                    check_visual = '{}\r\n{}'.format(check_visual, self.address)
                if self.tin:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, self.tin)
                if self.ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, self.ipn)

                check_visual = '{}\r\n		{}'.format(check_visual, "Отримання підкріплення")
                check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")
                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, self.zn)
                check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, offline_tax_id,
                                                                        adv.pid, "офлайн")

                if shift.testing:
                    check_visual = '{}\r\nТЕСТОВИЙ НЕФІСКАЛЬНИЙ ДОКУМЕНТ'.format(check_visual)

                if shift.cashier:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, shift.cashier)
                else:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, self.prro_key.ceo_fio)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\nСУМА:                                            {:.2f}'.format(check_visual,
                                                                                                      summa)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                if prev_hash:
                    check_visual = '{}\r\nКонтрольне число:\r\n{}'.format(
                        check_visual, prev_hash)

                    check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                        check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                if shift.testing:
                    check_visual = '{}\r\n		ТЕСТОВИЙ НЕФІСКАЛЬНИЙ ЧЕК'.format(check_visual)
                else:
                    check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))
            else:
                coded_string = None
                try:
                    coded_string, cabinet_url = self.sender.GetCheckExt(tax_id, 3)
                except Exception as e:
                    pass

            if not cabinet_url:
                cabinet_url = 'https://cabinet.tax.gov.ua/cashregs/check?fn={}&id={}&date={}&time={}&sm={:.2f}'.format(
                    self.rro_id, tax_id, operation_time.strftime("%Y%m%d"), operation_time.strftime("%H%M%S"), summa)

            messages = []

            if self.offline_status:
                msg = 'Зберегли чек підкріплення в режимі офлайн'
            else:
                msg = 'Зберегли чек підкріплення в режимі онлайн'

            messages.append(msg)
            print('{} {} {} '.format(fiscal_time, self.full_name, msg))

            return tax_id, shift, shift_opened, cabinet_url, coded_string, offline, tax_id_advance, qr_advance, visual_advance

        else:
            raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

    ''' Відправимо інкасації '''

    def prro_inkass(self, summa, key=None, testing=False, balance=0, doc_uid=None):

        shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key, testing=testing)
        if shift:

            if shift_opened and balance > 0:
                tax_id_advance, shift_advance, shift_opened_advance, qr_advance, visual_advance, offline_advance = self.prro_advances(
                    balance, key=key,
                    testing=testing)
            else:
                qr_advance = None
                visual_advance = None
                tax_id_advance = None

            operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
            server_time = None

            offline_status = self.offline_status

            if not offline_status:

                ret = self.sender.post_inkass(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)
                if not ret:
                    if self.offline:
                        offline_status = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    messages, status = self.prro_fix()
                    if status:
                        shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key, testing=testing)
                        ret = self.sender.post_inkass(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)
                        if not ret:
                            if self.offline:
                                offline_status = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

            if offline_status:
                self.prro_to_offline(operation_time)
                fiscal_time = operation_time
                fiscal_ticket = None
                server_time = None
                prev_hash = self.offline_prev_hash

                xml, signed_xml, offline_tax_id, xml_hash = self.sender.post_inkass(summa,
                                                                                    operation_time,
                                                                                    testing=shift.testing,
                                                                                    offline=True,
                                                                                    prev_hash=self.offline_prev_hash)
                self.offline_prev_hash = xml_hash

            else:
                if self.sender.fiscal_time:
                    fiscal_time = self.sender.fiscal_time
                else:
                    fiscal_time = operation_time

                if self.sender.last_fiscal_ticket:
                    fiscal_ticket = base64.b64encode(
                        self.sender.last_fiscal_ticket).decode()
                else:
                    fiscal_ticket = None

                signed_xml = None

                offline_tax_id = None

                prev_hash = None

            tax_id = self.sender.last_ordertaxnum

            adv = Incasses(
                department_id=self.id,
                user_id=shift.user_id,
                operation_time=operation_time,
                shift_id=shift.id,
                fiscal_time=fiscal_time,
                server_time=server_time,
                sum=summa,
                pid=self.next_local_number,
                tax_id=tax_id,
                fiscal_ticket=fiscal_ticket,
                testing=shift.testing,
                offline_fiscal_xml_signed=signed_xml,
                offline=offline_status,
                offline_tax_id=offline_tax_id,
                offline_session_id=self.prro_offline_session_id,
                doc_uid=doc_uid,
                prev_hash=prev_hash
            )
            db.session.add(adv)

            db.session.commit()

            self.prro_set_next_number()

            cabinet_url = None

            if offline_status:
                tax_id = offline_tax_id

                check_visual = '{}'.format(self.org_name)
                if self.name:
                    check_visual = '{}\r\n{}'.format(check_visual, self.name)
                if self.address:
                    check_visual = '{}\r\n{}'.format(check_visual, self.address)
                if self.tin:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, self.tin)
                if self.ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, self.ipn)

                check_visual = '{}\r\n		{}'.format(check_visual, "Службова видача")
                check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")
                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, self.zn)
                check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, offline_tax_id, adv.pid, "офлайн")
                if shift.testing:
                    check_visual = '{}\r\nТЕСТОВИЙ НЕФІСКАЛЬНИЙ ДОКУМЕНТ'.format(check_visual)
                if shift.cashier:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, shift.cashier)
                else:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, self.prro_key.ceo_fio)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\nСУМА:                                            {:.2f}'.format(check_visual,
                                                                                                      summa)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                if prev_hash:
                    check_visual = '{}\r\nКонтрольне число:\r\n{}'.format(
                        check_visual, prev_hash)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                if shift.testing:
                    check_visual = '{}\r\n		ТЕСТОВИЙ НЕФІСКАЛЬНИЙ ЧЕК'.format(check_visual)
                else:
                    check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))

            else:
                coded_string = None
                try:
                    coded_string, cabinet_url = self.sender.GetCheckExt(tax_id, 3)
                except Exception as e:
                    pass

            if not cabinet_url:
                cabinet_url = 'https://cabinet.tax.gov.ua/cashregs/check?fn={}&id={}&date={}&time={}&sm={:.2f}'.format(
                    self.rro_id, tax_id, operation_time.strftime("%Y%m%d"), operation_time.strftime("%H%M%S"), summa)

            messages = []

            if self.offline_status:
                msg = 'Зберегли чек інкасації в режимі офлайн'
            else:
                msg = 'Зберегли чек інкасації в режимі онлайн'

            messages.append(msg)
            print('{} {} {} '.format(fiscal_time, self.full_name, msg))

            return tax_id, shift, shift_opened, cabinet_url, coded_string, offline, tax_id_advance, qr_advance, visual_advance
        else:
            raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

    ''' Відправимо сторно '''

    def prro_storno(self, tax_id, key=None, testing=False, doc_uid=None):

        shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key, testing=testing)
        if shift:

            operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
            server_time = None

            offline_status = self.offline_status

            check = Sales.query \
                .filter(or_(Sales.tax_id == tax_id, Sales.offline_tax_id == tax_id)) \
                .first()

            if not check:
                check = Incasses.query \
                    .filter(or_(Incasses.tax_id == tax_id, Incasses.offline_tax_id == tax_id)) \
                    .first()

            if not check:
                check = Podkreps.query \
                    .filter(or_(Podkreps.tax_id == tax_id, Podkreps.offline_tax_id == tax_id)) \
                    .first()

            if not check:
                check = Advances.query \
                    .filter(or_(Advances.tax_id == tax_id, Advances.offline_tax_id == tax_id)) \
                    .first()

            if not check:
                raise ("Не знайшов чек із фіскальним номером {}".format(tax_id))

            if not offline_status:

                ret = self.sender.post_storno(tax_id, operation_time, testing=shift.testing)
                if not ret:
                    if self.offline:
                        offline_status = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    messages, status = self.prro_fix()
                    if status:
                        shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key, testing=testing)
                        ret = self.sender.post_storno(tax_id, operation_time, testing=shift.testing)
                        if not ret:
                            if self.offline:
                                offline_status = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

            if offline_status:
                self.prro_to_offline(operation_time)
                fiscal_time = operation_time
                fiscal_ticket = None
                server_time = None
                prev_hash = self.offline_prev_hash

                xml, signed_xml, offline_tax_id, xml_hash = self.sender.post_storno(tax_id,
                                                                                    operation_time,
                                                                                    testing=shift.testing,
                                                                                    offline=True,
                                                                                    prev_hash=self.offline_prev_hash)

                self.offline_prev_hash = xml_hash

                storno_tax_id = offline_tax_id

            else:
                if self.sender.fiscal_time:
                    fiscal_time = self.sender.fiscal_time
                else:
                    fiscal_time = operation_time

                if self.sender.last_fiscal_ticket:
                    fiscal_ticket = base64.b64encode(
                        self.sender.last_fiscal_ticket).decode()
                else:
                    fiscal_ticket = None

                signed_xml = None

                offline_tax_id = None

                prev_hash = None

                storno_tax_id = self.sender.last_ordertaxnum

            adv = Stornos(
                department_id=self.id,
                user_id=shift.user_id,
                operation_time=operation_time,
                shift_id=shift.id,
                fiscal_time=fiscal_time,
                server_time=server_time,
                original_tax_id=tax_id,
                pid=self.next_local_number,
                tax_id=storno_tax_id,
                fiscal_ticket=fiscal_ticket,
                testing=shift.testing,
                offline_fiscal_xml_signed=signed_xml,
                offline=offline_status,
                offline_tax_id=offline_tax_id,
                offline_session_id=self.prro_offline_session_id,
                doc_uid=doc_uid,
                prev_hash=prev_hash
            )
            db.session.add(adv)

            db.session.commit()

            check.storno_time = operation_time
            check.storno_tax_id = storno_tax_id

            self.prro_set_next_number()

            cabinet_url = None

            if offline_status:
                storno_tax_id = offline_tax_id

                check_visual = '{}'.format(self.org_name)
                if self.name:
                    check_visual = '{}\r\n{}'.format(check_visual, self.name)
                if self.address:
                    check_visual = '{}\r\n{}'.format(check_visual, self.address)
                if self.tin:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, self.tin)
                if self.ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, self.ipn)

                check_visual = '{}\r\n		{}'.format(check_visual, "Сторнування попереднього чека")
                check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")
                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, self.zn)
                check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, offline_tax_id,
                                                                        adv.pid, "офлайн")
                if shift.testing:
                    check_visual = '{}\r\nТЕСТОВИЙ НЕФІСКАЛЬНИЙ ДОКУМЕНТ'.format(check_visual)
                if shift.cashier:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, shift.cashier)
                else:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, self.prro_key.ceo_fio)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\nСторнується документ № {}'.format(check_visual, tax_id)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                if prev_hash:
                    check_visual = '{}\r\nКонтрольне число:\r\n{}'.format(
                        check_visual, prev_hash)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                if shift.testing:
                    check_visual = '{}\r\n		ТЕСТОВИЙ НЕФІСКАЛЬНИЙ ЧЕК'.format(check_visual)
                else:
                    check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))

            else:
                coded_string = None
                try:
                    coded_string, cabinet_url = self.sender.GetCheckExt(storno_tax_id, 3)
                except Exception as e:
                    pass

            if not cabinet_url:
                cabinet_url = 'https://cabinet.tax.gov.ua/cashregs/check?fn={}&id={}&date={}&time={}&sm={:.2f}'.format(
                    self.rro_id, storno_tax_id, operation_time.strftime("%Y%m%d"), operation_time.strftime("%H%M%S"), 0)

            messages = []

            if self.offline_status:
                msg = 'Зберегли чек сторно в режимі офлайн'
            else:
                msg = 'Зберегли чек сторно в режимі онлайн'

            messages.append(msg)
            print('{} {} {} '.format(fiscal_time, self.full_name, msg))

            return storno_tax_id, shift, shift_opened, cabinet_url, coded_string, offline
        else:
            raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

    ''' Відправимо чек продажу '''

    def prro_sale(self, reals, taxes, pays, sales_ret=False, orderretnum=None, key=None, testing=False, totals=None,
                  balance=0, doc_uid=None):

        qr_advance = None
        visual_advance = None
        tax_id_advance = None

        summa = 0
        discount = 0

        if doc_uid:
            sale = Sales.query.filter(Sales.doc_uid == doc_uid).first()
        else:
            sale = None

        if not sale:

            shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key, testing=testing)
            if not shift:
                raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

            if shift:
                if shift_opened and balance > 0:
                    tax_id_advance, shift_advance, shift_opened_advance, qr_advance, visual_advance, offline_advance = self.prro_advances(
                        balance, key=key,
                        testing=testing)
                else:
                    qr_advance = None
                    visual_advance = None
                    tax_id_advance = None

                operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
                server_time = None

                if reals:
                    for real in reals:
                        summa += real['COST']
                        if 'DISCOUNTSUM' in real:
                            discount += real['DISCOUNTSUM']

                offline_status = self.offline_status

                if not offline_status:

                    ret = self.sender.post_sale(summa, discount, reals, taxes, pays, operation_time, totals=totals,
                                                sales_ret=sales_ret, orderretnum=orderretnum, testing=shift.testing,
                                                doc_uid=doc_uid)
                    if not ret:
                        if self.offline:
                            offline_status = True
                        else:
                            raise Exception('{}'.format(
                                "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                    if ret == 9:
                        messages, status = self.prro_fix()
                        if status:
                            shift, shift_opened, messages, offline = self.prro_open_shift(True, key=key,
                                                                                          testing=testing)
                            ret = self.sender.post_sale(summa, discount, reals, taxes, pays, operation_time,
                                                        totals=totals,
                                                        sales_ret=sales_ret, orderretnum=orderretnum,
                                                        testing=shift.testing,
                                                        doc_uid=doc_uid)
                            if not ret:
                                if self.offline:
                                    offline_status = True
                                else:
                                    raise Exception('{}'.format(
                                        "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                    server_time = self.sender.server_time

                if offline_status:
                    self.prro_to_offline(operation_time)
                    fiscal_time = operation_time
                    fiscal_ticket = None
                    server_time = None
                    prev_hash = self.offline_prev_hash

                    xml, signed_xml, offline_tax_id, xml_hash = self.sender.post_sale(summa,
                                                                                      discount,
                                                                                      reals,
                                                                                      taxes,
                                                                                      pays,
                                                                                      operation_time,
                                                                                      totals=totals,
                                                                                      sales_ret=sales_ret,
                                                                                      orderretnum=orderretnum,
                                                                                      testing=shift.testing,
                                                                                      offline=True,
                                                                                      prev_hash=self.offline_prev_hash)

                    self.offline_prev_hash = xml_hash

                else:
                    if self.sender.fiscal_time:
                        fiscal_time = self.sender.fiscal_time
                    else:
                        fiscal_time = operation_time

                    if self.sender.last_fiscal_ticket:
                        fiscal_ticket = base64.b64encode(
                            self.sender.last_fiscal_ticket).decode()
                    else:
                        fiscal_ticket = None

                    signed_xml = None

                    offline_tax_id = None

                    prev_hash = None

                tax_id = self.sender.last_ordertaxnum

                sale = Sales(
                    department_id=self.id,
                    user_id=shift.user_id,
                    operation_time=operation_time,
                    shift_id=shift.id,
                    fiscal_time=fiscal_time,
                    server_time=server_time,
                    sum=summa,
                    discount=discount,
                    pid=self.next_local_number,
                    tax_id=tax_id,
                    fiscal_ticket=fiscal_ticket,
                    testing=shift.testing,
                    offline_fiscal_xml_signed=signed_xml,
                    offline=offline_status,
                    offline_tax_id=offline_tax_id,
                    offline_session_id=self.prro_offline_session_id,
                    doc_uid=doc_uid,
                    prev_hash=prev_hash
                )
                db.session.add(sale)
                db.session.commit()

                if taxes:
                    for tax in taxes:
                        sale_tax = SalesTaxes(
                            sales_id=sale.id,
                        )
                        if 'TYPE' in tax:
                            sale_tax.type = tax['TYPE']

                        # <!--Найменування виду податку/збору (64 символи)-->
                        if 'NAME' in tax:
                            sale_tax.name = tax['NAME']

                        # <!--Літерне позначення виду і ставки податку/збору (А,Б,В,Г,...) (1 символ)-->
                        if 'LETTER' in tax:
                            sale_tax.letter = tax['LETTER']

                        #  <!--Відсоток податку/збору (15.2 цифри)-->
                        if 'PRC' in tax:
                            sale_tax.prc = tax['PRC']

                        # <!--Ознака податку/збору, не включеного у вартість-->
                        if 'SIGN' in tax:
                            if tax['SIGN']:
                                sale_tax.sign = True

                        # <!--Сума для розрахування податку/збору (15.2 цифри)-->
                        if 'TURNOVER' in tax:
                            sale_tax.turnover = tax['TURNOVER']

                        # <!--Сума податку/збору (15.2 цифри)-->
                        if 'SUM' in tax:
                            sale_tax.sum = tax['SUM']

                        db.session.add(sale_tax)

                if pays:
                    for pay in pays:
                        sale_pay = SalesPays(
                            sales_id=sale.id,
                        )

                        if 'PAYFORMCD' in pay:
                            sale_pay.payformcd = pay['PAYFORMCD']
                        if 'PAYFORMNM' in pay:
                            sale_pay.payformname = pay['PAYFORMNM']
                        if 'SUM' in pay:
                            sale_pay.sum = pay['SUM']
                        if 'PROVIDED' in pay:
                            sale_pay.provided = pay['PROVIDED']
                        if 'REMAINS' in pay:
                            sale_pay.remains = pay['REMAINS']

                        db.session.add(sale_pay)

                if reals:
                    for real in reals:
                        sale_check = SalesCheck(
                            sales_id=sale.id,
                        )

                        # <!--Внутрішній код товару (64 символи)-->
                        if 'CODE' in real:
                            sale_check.code = real['CODE']

                        # <!--Код товару згідно з УКТЗЕД (15 цифр)-->
                        if 'UKTZED' in real:
                            sale_check.uktzed = real['UKTZED']

                        # <!--Найменування товару, послуги або операції (текст)-->
                        if 'NAME' in real:
                            sale_check.name = real['NAME']

                        # <!--Код одиниці виміру згідно класифікатора (5 цифр)-->
                        if 'UNITCD' in real:
                            sale_check.unitcd = real['UNITCD']

                        # <!--Найменування одиниці виміру (64 символи)-->
                        if 'UNITNM' in real:
                            sale_check.unitnm = real['UNITNM']

                        # <!--Кількість/об’єм товару (15.3 цифри)-->
                        if 'AMOUNT' in real:
                            sale_check.amount = real['AMOUNT']

                        # <!--Ціна за одиницю товару (15.2 цифри)-->
                        if 'PRICE' in real:
                            sale_check.price = real['PRICE']

                        # <!--Літерні позначення видів і ставок податків/зборів (15 символів)-->
                        if 'LETTERS' in real:
                            sale_check.letters = real['LETTERS']

                        # <!--Сума операції (15.2 цифри)-->
                        if 'COST' in real:
                            sale_check.cost = real['COST']

                        db.session.add(sale_check)

                db.session.commit()

                self.prro_set_next_number()

        else:
            shift_id = sale.shift_id
            shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.id == shift_id).first()

            if not shift:
                raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

            shift_opened = False

            offline_status = sale.offline

        if sale.offline:
            tax_id = sale.offline_tax_id
        else:
            tax_id = sale.tax_id

        cabinet_url = None

        coded_string = None
        if not self.offline_status:
            try:
                sender = SendData2(db, key, self, self.rro_id, "")
                coded_string, cabinet_url = sender.GetCheckExt(tax_id, 3)
            except Exception as e:
                pass

        if not coded_string:

            check_visual = '{}'.format(self.org_name)
            if self.name:
                check_visual = '{}\r\n{}'.format(check_visual, self.name)
            if self.address:
                check_visual = '{}\r\n{}'.format(check_visual, self.address)
            if self.tin:
                check_visual = '{}\r\n		ІД {}'.format(check_visual, self.tin)
            if self.ipn:
                check_visual = '{}\r\n		ПН {}'.format(check_visual, self.ipn)

            if sales_ret:
                check_visual = '{}\r\n		{}'.format(check_visual, "Видатковий чек (повернення)")

            check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")

            check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, self.zn)

            if sale.offline:
                off_on = "офлайн"
            else:
                off_on = "онлайн"

            check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, tax_id, sale.pid, off_on)
            if sale.testing:
                check_visual = '{}\r\nТЕСТОВИЙ НЕФІСКАЛЬНИЙ ДОКУМЕНТ'.format(check_visual)

            if shift.cashier:
                check_visual = '{}\r\nКасир {}'.format(check_visual, shift.cashier)
            else:
                check_visual = '{}\r\nКасир {}'.format(check_visual, self.prro_key.ceo_fio)

            check_visual = '{}\r\n----------------------------------------------------------------------\r\n'.format(
                check_visual)

            if sales_ret:
                check_visual = '{}Повернення для документу № {}'.format(check_visual, orderretnum)
                check_visual = '{}\r\n----------------------------------------------------------------------\r\n'.format(
                    check_visual)

            if reals:
                for real in reals:
                    if 'CODE' in real:
                        check_visual = '{}АРТ.№ {} '.format(check_visual, real['CODE'])
                    if 'NAME' in real:
                        check_visual = '{}{}'.format(check_visual, real['NAME'])
                    if 'AMOUNT' in real:
                        check_visual = '{}\r\n{:.3f}         x         {:.2f} =                  {:.2f}'.format(
                            check_visual, real['AMOUNT'], real['PRICE'], real['COST'])
                    if 'LETTERS' in real:
                        check_visual = '{} {}\r\n'.format(check_visual, real['LETTERS'])
                    if 'DISCOUNTSUM' in real:
                        check_visual = '{}	Дисконт: {:.2f}\r\n'.format(check_visual, real['DISCOUNTSUM'])
                    if 'DKPP' in real:
                        check_visual = '{}	Код ДКПП: {}\r\n'.format(check_visual, real['DKPP'])
                    if 'EXCISELABELS' in real:
                        for labels_item in real['EXCISELABELS']:
                            check_visual = '{}	Акцизна марка: {}\r\n'.format(check_visual,
                                                                                labels_item['EXCISELABEL'])
                    if 'COMMENT' in real:
                        check_visual = '{}{}\r\n'.format(check_visual, real['COMMENT'])

            check_visual = '{}\r\n----------------------------------------------------------------------\r\n'.format(
                check_visual)
            if sale.discount:
                if sale.discount > 0:
                    check_visual = '{}ДИСКОНТ:                                           {:.2f}\r\n'.format(
                        check_visual, sale.discount)
            if pays:
                paysum = 0
                for pay in pays:
                    paysum = pay['SUM']
                if paysum > 0:
                    check_visual = '{}СУМА ДО СПЛАТИ:                                           {:.2f}\r\n'.format(
                        check_visual, paysum)

            if pays:
                for pay in pays:
                    check_visual = '{}----------------------------------------------------------------------\r\n'.format(
                        check_visual)
                    if 'PAYFORMNM' in pay:
                        check_visual = '{}{} {: <40s}{:.2f}\r\n'.format(check_visual, pay['PAYFORMNM'].upper(), "",
                                                                        pay['SUM'])
                    if 'PROVIDED' in pay:
                        check_visual = '{}Сплачено: {: <40s}{:.2f}\r\n'.format(check_visual, "", pay['PROVIDED'])
                    if 'REMAINS' in pay:
                        check_visual = '{}Решта: {: <40s}{:.2f}\r\n'.format(check_visual, "", pay['REMAINS'])

            if taxes:
                for tax in taxes:
                    check_visual = '{}----------------------------------------------------------------------\r\n'.format(
                        check_visual)
                    if 'SOURCESUM' in tax:
                        check_visual = '{}{} {}                {:.2f}% від    {:.2f}: {:.2f}\r\n'.format(
                            check_visual, tax['NAME'], tax['LETTER'], tax['PRC'], tax['SOURCESUM'], tax['SUM'])
                    else:
                        check_visual = '{}{} {}                {:.2f}% від    {:.2f}\r\n'.format(check_visual,
                                                                                                 tax['NAME'],
                                                                                                 tax['LETTER'],
                                                                                                 tax['PRC'],
                                                                                                 tax['SUM'])
            else:
                check_visual = '{}----------------------------------------------------------------------\r\n'.format(
                    check_visual)
                check_visual = '{}Без ПДВ\r\n'.format(
                    check_visual)

            # check_visual = '{}\r\nСУМА:                                            {:.2f}'.format(check_visual, summa)

            if sale.prev_hash:
                check_visual = '{}\r\nКонтрольне число:\r\n{}'.format(
                    check_visual, sale.prev_hash)

            check_visual = '{}----------------------------------------------------------------------'.format(
                check_visual)

            check_visual = '{}\r\n{}'.format(check_visual, sale.operation_time.strftime("%d-%m-%Y %H:%M:%S"))

            if sale.testing:
                check_visual = '{}\r\n		ТЕСТОВИЙ НЕФІСКАЛЬНИЙ ЧЕК'.format(check_visual)
            else:
                check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

            check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

            check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

            coded_string = base64.b64encode(check_visual.encode('UTF-8'))

        if not cabinet_url:
            cabinet_url = 'https://cabinet.tax.gov.ua/cashregs/check?fn={}&id={}&date={}&time={}&sm={:.2f}'.format(
                self.rro_id, tax_id, sale.operation_time.strftime("%Y%m%d"), sale.operation_time.strftime("%H%M%S"),
                summa)

        messages = []

        if self.offline_status:
            msg = 'Зберегли чек продажу в режимі офлайн'
        else:
            msg = 'Зберегли чек продажу в режимі онлайн'

        messages.append(msg)
        print('{} {} {} '.format(sale.operation_time, self.rro_id, msg))

        ret = {
            "tax_id": tax_id,
            "local_id": sale.pid,
            "shift": shift,
            "shift_opened": shift_opened,
            "shift_opened_datetime": shift.operation_time,
            "qr": cabinet_url,
            "tax_visual": coded_string,
            "offline": sale.offline,
            "tax_id_advance": tax_id_advance,
            "qr_advance": qr_advance,
            "tax_visual_advance": visual_advance,
            "fiscal_ticket": sale.fiscal_ticket,
            "testing": sale.testing,
            "uid": sale.doc_uid,
        }
        return ret

    def prro_close_shift(self, shift):

        operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))

        server_time = None

        offline_status = self.offline_status

        if not offline_status:

            ret = self.sender.close_shift(dt=operation_time, testing=shift.testing)

            if not self.sender.server_time:
                if not ret:
                    if self.offline:
                        offline_status = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    messages, status = self.prro_fix()
                    if status:
                        ret = self.sender.close_shift(dt=operation_time, testing=shift.testing)
                        if not ret:
                            if self.offline:
                                offline_status = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

            # offline_status = True

            if offline_status:
                self.prro_to_offline(operation_time)
                fiscal_time = operation_time
                fiscal_ticket = None
                server_time = None

                xml, signed_xml, offline_tax_id, xml_hash = self.sender.close_shift(dt=operation_time,
                                                                                    testing=shift.testing,
                                                                                    offline=True,
                                                                                    prev_hash=self.offline_prev_hash)

                self.offline_prev_hash = xml_hash

                tax_id = None

            else:
                if self.sender.fiscal_time:
                    fiscal_time = self.sender.fiscal_time
                else:
                    fiscal_time = operation_time

                signed_xml = None

                offline_tax_id = None

                tax_id = self.sender.last_ordertaxnum

                server_time = self.sender.server_time

        if self.sender.last_xml:
            xml = base64.b64encode(self.sender.last_xml).decode()
        else:
            xml = None

        if self.sender.last_fiscal_ticket:
            fiscal_ticket = base64.b64encode(
                self.sender.last_fiscal_ticket).decode()
        else:
            fiscal_ticket = None

        close_shift = Shifts(
            department_id=self.id,
            user_id=shift.user_id,
            operation_type=0,
            operation_time=operation_time,
            fiscal_time=fiscal_time,
            server_time=server_time,
            pid=self.next_local_number,
            tax_id=tax_id,
            xml=xml,
            offline_fiscal_xml_signed=signed_xml,
            fiscal_ticket=fiscal_ticket,
            fiscal_shift_id=shift.fiscal_shift_id,
            shift_id=shift.id,
            testing=shift.testing,
            offline=offline_status,
            offline_session_id=self.prro_offline_session_id,
            offline_tax_id=offline_tax_id
        )

        if offline_status:
            tax_id = close_shift.offline_tax_id
        else:
            tax_id = close_shift.tax_id

        db.session.add(close_shift)

        self.shift_state = 0
        self.offline_prev_hash = None

        db.session.commit()

        messages = []
        if self.offline_status:
            msg = 'Зберегли закриття зміни в режимі офлайн'
        else:
            msg = 'Зберегли закриття зміни в режимі онлайн'

        messages.append(msg)
        print('{} {} {} '.format(fiscal_time, self.full_name, msg))

        self.prro_set_next_number()

        return tax_id

    def prro_get_xz(self, send_z=False, key=None, testing=False, balance=0):

        self.prro_fix()

        last_shift = Shifts.query \
            .order_by(Shifts.operation_time.desc()) \
            .filter(Shifts.department_id == self.id) \
            .first()

        if last_shift:
            if last_shift.operation_type == 0:
                raise Exception('Зміна не відкрита. Вона автоматично відкривається при проведені першої операції!')

        shift, shift_opened, messages, offline = self.prro_open_shift(False, key=key, testing=testing)

        if shift:

            operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))

            server_time = None

            offline = self.offline_status

            if offline:
                '''
                {'UID': '43ada995-e8e5-483c-be33-d040c52ffbae', 'ShiftState': 1, 'ZRepPresent': False, 'Testing': False, 'Totals': {'Real': {'Sum': 13170.0, 'PwnSumIssued': 0.0, 'PwnSumReceived': 0.0, 'RndSum': 0.0, 'NoRndSum': 0.0, 'TotalCurrencySum': 0.0, 'TotalCurrencyCommission': 0.0, 'OrdersCount': 62, 'TotalCurrencyCost': 0, 'PayForm': [{'PayFormCode': 0, 'PayFormName': 'ГОТІВКА', 'Sum': 13170.0}], 'Tax': [{'Type': 0, 'Name': 'ПДВ 20%', 'Letter': 'A', 'Prc': 20.0, 'Sign': False, 'Turnover': 17500.0, 'TurnoverDiscount': 0.0, 'SourceSum': 12370.0, 'Sum': 2474.0}, {'Type': 3, 'Name': 'ПДВ 0%', 'Letter': 'Б', 'Prc': 0.0, 'Sign': False, 'Turnover': 800.0, 'TurnoverDiscount': 0.0, 'SourceSum': 800.0, 'Sum': 0.0}]}, 'Ret': {'Sum': 840.0, 'PwnSumIssued': 0.0, 'PwnSumReceived': 0.0, 'RndSum': 0.0, 'NoRndSum': 0.0, 'TotalCurrencySum': 0.0, 'TotalCurrencyCommission': 0.0, 'OrdersCount': 4, 'TotalCurrencyCost': 0, 'PayForm': [{'PayFormCode': 0, 'PayFormName': 'ГОТІВКА', 'Sum': 840.0}], 'Tax': [{'Type': 0, 'Name': 'ПДВ', 'Letter': 'A', 'Prc': 20.0, 'Sign': False, 'Turnover': 1200.0, 'TurnoverDiscount': 0.0, 'SourceSum': 840.0, 'Sum': 168.0}]}, 'Cash': None, 'Currency': None, 'ServiceInput': 9000.0, 'ServiceOutput': 3000.0}}
                '''
                raise Exception('Виникла помилка відправки документів - відсутній зв\'язок з сервером податкової')

            if balance > 0:
                tax_id_inkass, shift_inkass, shift_opened_inkass, qr_inkass, visual_inkass, offline_inkass, tax_id_advance, qr_advance, visual_advance = self.prro_inkass(
                    balance, key=key, testing=testing)
            else:
                qr_inkass = None
                visual_inkass = None
                tax_id_inkass = None

            x_data = self.sender.LastShiftTotals()

            if not x_data:
                raise Exception('Виникла помилка відправки документів - відсутній зв\'язок з сервером податкової')

            # shift_state = x_data['ShiftState']
            z_rep_present = x_data['ZRepPresent']

            if z_rep_present:

                z_report = ZReports.query \
                    .order_by(ZReports.operation_time.desc()) \
                    .filter(ZReports.operation_time != None) \
                    .filter(ZReports.pid != 0) \
                    .filter(ZReports.department_id == self.id) \
                    .filter(ZReports.shift_id == shift.id) \
                    .first()

                if z_report:
                    self.prro_close_shift(shift)

                    return x_data, None, None, None, None, None, None

                # x_data = self.prro_get_x_data_base(shift)
            # else:
            #     raise Exception('Поточний звіт недоступний!')

            z_number = 0

            if 'Totals' in x_data:
                fsn = ''

                pid = 0
                qr = ''

                #   <!--Кількість розрахункових документів за зміну (числовий)-->
                op_cnt = 0  # CalcDocsCnt

                #   <!--Отримано підкріплень національною валютою (15.2 цифри)-->
                sum_reinf = 0

                #   <!--Здано по інкасації національною валютою (15.2 цифри)-->
                sum_collect = 0

                #   <!--Отримано авансів національною валютою (15.2 цифри)-->
                sum_adv = 0

            if send_z:

                server_time = None

                last_z_report = ZReports.query.with_entities(ZReports.z_number) \
                    .order_by(ZReports.operation_time.desc()) \
                    .filter(ZReports.operation_time != None) \
                    .filter(ZReports.pid > 0) \
                    .filter(ZReports.department_id == self.id) \
                    .first()

                if last_z_report:
                    z_number = last_z_report.z_number + 1
                else:
                    z_number = 1

                response = self.sender.post_z(operation_time, x_data, testing=shift.testing)
                if not response:
                    if self.offline:
                        offline = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if response == 9:
                    messages, status = self.prro_fix()
                    if status:
                        response = self.sender.post_z(operation_time, x_data, testing=shift.testing)
                        if not response:
                            if self.offline:
                                offline = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

                if offline:
                    raise Exception('{}'.format(
                        "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                    # self.prro_to_offline(operation_time)
                    # fiscal_time = operation_time
                    # fiscal_ticket = None
                    # server_time = None
                    #
                    # xml, signed_xml, offline_tax_id, xml_hash = self.sender.post_z(operation_time, x_data,
                    #                                                                testing=shift.testing,
                    #                                                                offline=True,
                    #                                                                prev_hash=self.offline_prev_hash)
                    #
                    # self.offline_prev_hash = xml_hash

                else:
                    if self.sender.fiscal_time:
                        fiscal_time = self.sender.fiscal_time
                    else:
                        fiscal_time = operation_time

                    signed_xml = None

                    offline_tax_id = None

                tax_id = self.sender.last_ordertaxnum

                z_report = ZReports(
                    operation_time=operation_time,
                    department_id=self.id,
                    operator_id=shift.user_id,
                    rro_id=self.rro_id,
                    tax_id=tax_id,
                    z_number=z_number,
                    fn=self.rro_id,
                    zn=self.zn,
                    fsn=fsn,
                    tn=self.tin,
                    pid=self.next_local_number,
                    qr=qr,
                    fiscal_time=fiscal_time,
                    op_cnt=op_cnt,
                    sum_reinf=sum_reinf,
                    sum_collect=sum_collect,
                    sum_adv=sum_adv,
                    testing=shift.testing,
                    shift_id=shift.id,
                    offline=offline,
                    server_time=server_time,
                    offline_session_id=self.prro_offline_session_id
                )
                db.session.add(z_report)

                if self.sender.last_xml:
                    z_report.xml = base64.b64encode(self.sender.last_xml).decode()

                if self.sender.last_fiscal_ticket:
                    z_report.fiscal_ticket = base64.b64encode(
                        self.sender.last_fiscal_ticket).decode()

                db.session.commit()

                messages = []
                if self.offline_status:
                    msg = 'Зберегли Z звiт в режимі офлайн'
                else:
                    msg = 'Зберегли Z звiт в режимі онлайн'

                messages.append(msg)
                print('{} {} {} '.format(fiscal_time, self.full_name, msg))

                self.prro_set_next_number()

                close_shift_tax_id = self.prro_close_shift(shift)

                try:
                    z_visual_data = self.sender.GetZReportEx(self.rro_id, z_report.tax_id, 3)
                except Exception as e:
                    z_visual_data = None

                self.prro_fix()

                return x_data, z_report.tax_id, close_shift_tax_id, z_visual_data, tax_id_inkass, qr_inkass, visual_inkass

            return x_data, None, None, None, None, None, None

        else:
            raise Exception('Зміна не відкрита. Вона автоматично відкривається при проведені першої операції.')

    def prro_set_next_number(self):

        if not self.next_local_number:
            self.prro_fix()

        if not self.next_local_number:
            raise Exception('{} Для для подальшої роботи немає всіх даних. '
                            'Дочекайтесь відновлення зв\'язку з податковою')

        print(
            '{} {} Збільшуємо локальний номер з {} на {}'.format(datetime.datetime.now(tz.gettz(TIMEZONE)), self.rro_id,
                                                                 self.next_local_number, self.next_local_number + 1))
        self.next_local_number += 1

        if self.offline_status:
            print(
                '{} {} Збільшуємо локальний номер оффлайн з {} на {}'.format(datetime.datetime.now(tz.gettz(TIMEZONE)),
                                                                             self.rro_id,
                                                                             self.next_offline_local_number,
                                                                             self.next_offline_local_number + 1))
            self.next_offline_local_number += 1
        else:
            self.next_offline_local_number = 1

        db.session.commit()

        if self.offline and not self.next_offline_local_number:
            try:
                self.prro_fix()
            except:
                pass


class DepartmentKeys(Base):
    '''Справочник ключей ЭЦП подразделений'''
    __tablename__ = 'department_keys'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    # department_id = Column(Integer, ForeignKey('departments.id'), comment='Відділення', nullable=True)

    name = Column('name', String(100), comment='Назва', nullable=True)

    # short_name = Column('short_name', String(100), comment='short_name', nullable=True)

    public_key = Column('public_key', String(100), comment='Ідентифікатор відкритого ключа', nullable=True)

    create_date = db.Column(db.DateTime, default=datetime.datetime.now)

    key_password = Column('key_password', String(100), comment='Пароль захисту ключа', nullable=True)

    begin_time = Column('begin_time', DateTime, default=None, comment='Время выдачи ключа', nullable=True)

    end_time = Column('end_time', DateTime, default=None, comment='Время окончания ключа', nullable=True)

    key_data = Column('key_data', LargeBinary, default=None, comment='Вміст файлу ключа', nullable=True)

    key_data_txt = Column('key_data_txt', JSON, default=None, comment='Текстовий вміст файлу ключа', nullable=True)

    cert1_data = Column('cert1_data', LargeBinary, default=None, comment='Вміст файлу сертифіката підпису',
                        nullable=True)

    cert2_data = Column('cert2_data', LargeBinary, default=None, comment='Вміст файлу сертифіката шифрування',
                        nullable=True)

    key_content = Column('key_content', String(1024), comment='Розпакований вміст ключа підпису', nullable=True)

    encrypt_content = Column('encrypt_content', String(1024), comment='Розпакований вміст ключа шифрування',
                             nullable=True)

    cert1_content = Column('cert1_content', String(4096), comment='Розпакований вміст сертифіката підпису',
                           nullable=True)

    cert2_content = Column('cert2_content', String(4096), comment='Розпакований вміст сертифіката шифрування',
                           nullable=True)

    box_id = Column('box_id', String(100), comment='Ідентифікатор крипто-сесії', nullable=True)

    key_role = Column('key_role', String(10), comment='Роль ключа', nullable=True)

    edrpou = Column('edrpou', String(16), comment='Код ЄДРПОУ', nullable=True)

    taxform_count = Column('taxform_count', Integer, default=0, nullable=False,
                           comment='Лічильник відправки форм до податкової')

    ceo_fio = Column('ceo_fio', String(128), comment='ПІБ', nullable=True)

    ceo_tin = Column('ceo_tin', String(16), comment='РНОКПП', nullable=True)

    sign = Column('sign', Boolean, nullable=True, comment='Ключ може підписувати')

    encrypt = Column('encrypt', Boolean, nullable=True, comment='Ключ для шифрування')

    key_role_tax_form = Column('key_role_tax_form', String(10), comment='Роль ключа для підписання податкових форм',
                               nullable=True)

    acsk = Column('acsk', String(100), comment='АЦСК', nullable=True)

    def __repr__(self):
        return '| {} | {} |'.format(self.id, self.name)

    def __str__(self):
        return '{} {} ({}) id {}'.format(self.name, self.ceo_fio, self.key_role, self.id)

    def update_key_data(self):

        from utils.Sign import Sign

        signer = Sign()

        box_id = None
        unpacked_keys = None

        if self.cert1_data:
            if self.cert1_data and self.cert2_data:
                # keys = self.get_key_contents(key.key_data, key.key_password)
                box_id = signer.add_key(self.key_data, self.key_password)
                signer.add_certs(box_id, self.cert1_data, self.cert2_data)
            elif self.cert1_data and not self.cert2_data:
                # keys = self.get_key_contents(key.key_data, key.key_password)
                box_id = signer.add_key(self.key_data, self.key_password)
                signer.add_cert(box_id, self.cert1_data)
            else:
                box_id = signer.add_key(self.key_data, self.key_password)

            unpacked_keys = signer.unpack_key(self.key_data, self.key_password)

        else:
            try:

                if self.key_password:

                    box_id = signer.add_key(self.key_data, self.key_password)

                    unpacked_keys = signer.unpack_key(self.key_data, self.key_password)

                    try:
                        infos = signer.info(box_id)
                        if not infos[0]:
                            if not b'privatbank' in self.key_data:
                                try:
                                    certs = signer.cert_fetch(box_id, CMP_URLS)
                                    if certs == 0:
                                        return False, 'Не вдалося автоматично отримати сертифікати з АЦСК', None
                                except Exception as e:
                                    return False, 'Не вдалося автоматично отримати сертифікати з АЦСК'.format(e), None
                            elif not self.key_role:
                                role = signer.get_role(self.box_id)
                                if role:
                                    self.key_role = role

                    except Exception as e:
                        print('CryproError update_key_data1 {}'.format(e))
                        return False, 'Помилка ключа криптографії, можливо надані невірні сертифікати або пароль'.format(
                            e), None

            except Exception as e:
                print('CryproError update_key_data2 {}'.format(e))
                return False, 'Помилка ключа криптографії, можливо надані невірні сертифікати або пароль', None

        try:
            # print(box_id)
            if not box_id:
                box_id = signer.update_bid(db, self)

            infos = signer.info(box_id)
            # print(infos)
            self.box_id = box_id
            self.key_data_txt = infos

        # print('{}'.format(infos))
        except Exception as e:
            print('CryproError update_key_data {}'.format(e))
            return False, 'Помилка ключа криптографії, можливо надані невірні сертифікати або пароль'.format(e), None

        key_content = []
        if infos:
            for info in infos:
                if info:
                    key_content.append(info)
                    if 'usage' in info:
                        if 'sign' in info['usage']:
                            if info['usage']['sign']:
                                self.sign = True
                                if 'subject' in info:
                                    self.key_data_txt = infos
                                    if "pem" in info:
                                        self.cert1_content = info["pem"]

                                    self.ceo_tin = ''
                                    self.edrpou = ''
                                    if "extension" in info:
                                        if "subjectKeyIdentifier" in info["extension"]:
                                            self.public_key = info["extension"]["subjectKeyIdentifier"]

                                            if unpacked_keys:
                                                for unpacked_key in unpacked_keys:
                                                    if unpacked_key['keyid'] == self.public_key:
                                                        if unpacked_key['contents']:
                                                            self.key_content = unpacked_key['contents']

                                        if "ipn" in info["extension"]:
                                            if info["extension"]["ipn"]:
                                                if "DRFO" in info["extension"]["ipn"]:
                                                    self.ceo_tin = info["extension"]["ipn"]["DRFO"]
                                                if "EDRPOU" in info["extension"]["ipn"]:
                                                    self.edrpou = info["extension"]["ipn"]["EDRPOU"]

                                    if "commonName" in info["subject"]:
                                        self.ceo_fio = info["subject"]["commonName"]
                                        # if "Печатка" in self.ceo_fio:
                                        #     self.key_role = "stamp"

                                    else:
                                        self.ceo_fio = ''

                                    if "organizationName" in info["subject"]:
                                        self.name = info["subject"]["organizationName"]
                                    else:
                                        self.name = self.ceo_fio

                                    begin_time = int(info["valid"]["from"] / 1000)
                                    end_time = int(info["valid"]["to"] / 1000)
                                    self.begin_time = datetime.datetime.fromtimestamp(begin_time)
                                    self.end_time = datetime.datetime.fromtimestamp(end_time)

                        if 'encrypt' in info['usage']:
                            if info['usage']['encrypt']:
                                self.acsk = info['issuer']['commonName']
                                self.encrypt = True
                                if "pem" in info:
                                    self.cert2_content = info["pem"]

                                if "extension" in info:
                                    if "subjectKeyIdentifier" in info["extension"]:
                                        public_key = info["extension"]["subjectKeyIdentifier"]

                                        if unpacked_keys:
                                            for unpacked_key in unpacked_keys:
                                                if unpacked_key['keyid'] == public_key:
                                                    if unpacked_key['contents']:
                                                        self.encrypt_content = unpacked_key['contents']

            self.key_data_txt = key_content

            if not self.key_role:
                role = signer.get_role(self.box_id)
                if role:
                    self.key_role = role
                else:
                    return False, 'Помилка читання даних ключа, можливо неправильний пароль або надані не всі файли', None
            else:
                if not signer.check_role(self.box_id, self.key_role):
                    role = signer.get_role(self.box_id)
                    if role:
                        self.key_role = role
                    else:
                        return False, 'Помилка читання даних ключа, можливо неправильний пароль або надані не всі файли', None
                        # return False, 'Помилка читання даних ключа, невірно зазначена роль {}'.format(self.key_role), None

            if not self.key_role:
                return False, 'Помилка читання даних ключа, можливо неправильний пароль або надані не всі файли', None

            if self.key_content and self.cert1_content:
                self.key_password = ''
                self.key_data = None
                self.cert1_data = None
                self.cert2_data = None

            return True, 'Дані успішно зчитані з ключа та оновлені!', self.public_key

        else:
            return False, 'Немає інформації для оновлення!', None


class Shifts(Base):
    ''' Таблиця даних про зміни '''
    __tablename__ = 'shifts'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Відділення')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Користувач')

    operation_type = Column('operation_type', SmallInteger,
                            comment='Тип операції: 1 - відкриття зміни, 0 - закриття зміни', nullable=False)

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Час здійснення операції')

    fiscal_time = Column('fiscal_time', DateTime, comment='Час прийняття фіскальним сервером', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Час відправки на фіскальний сервер',
                         default=None, nullable=True)

    pid = Column('pid', Integer, comment='Локальний номер чека', nullable=True)

    fiscal_shift_id = Column('fiscal_shift_id', Integer, comment='Фіскальний номер зміни', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фіскальний номер онлайн чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовий вміст надісланого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовий вміст чека як його бачить податкова',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовий вміст відповіді податкової',
                           nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='РРО  знаходиться в режимі офлайн')

    shift_id = Column("shift_id", Integer, comment='Ідентифікатор зміни', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    cashier = Column('cashier', String(128), nullable=True, comment='ПИБ Касира')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фіскальний номер чека офлайн', nullable=True)

    prev_hash = Column('prev_hash', String(64), comment='Хеш попереднього офлайн документа', nullable=True)

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)


class OfflineChecks(Base):
    ''' Таблиця даних про чеки відкриття/закриття офлайн режиму '''
    __tablename__ = 'offline_checks'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Відділення')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Користувач')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Час здійснення операції')

    operation_type = Column('operation_type', SmallInteger,
                            comment='Тип операції: 1 - відкриття офлайн, 0 - закриття офлайн', nullable=False)

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Ідентифікатор зміни', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Час прийняття фіскальним сервером', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Час відправки на фіскальний сервер',
                         default=None, nullable=True)

    pid = Column('pid', Integer, comment='Локальний номер чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовий вміст надісланого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовий вміст чека як його бачить податкова',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовий вміст відповіді податкової',
                           nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фіскальний номер чека офлайн', nullable=True)

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)


class Advances(Base):
    '''Таблица данных о полученных авансах'''
    __tablename__ = 'advances'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Відділення')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Користувач')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Час здійснення операції')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Ідентифікатор зміни', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Час прийняття фіскальним сервером', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Час відправки на фіскальний сервер',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    pid = Column('pid', Integer, comment='Локальний номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фіскальний номер онлайн чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовий вміст надісланого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовий вміст чека як його бачить податкова',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовий вміст відповіді податкової',
                           nullable=True)

    storno_time = Column('storno_time', DateTime, comment='Час сторно', default=None,
                         nullable=True)

    storno_tax_id = Column('storno_tax_id', Integer, comment='Фіскальний номер онлайн чека сторно', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фіскальний номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)

    prev_hash = Column('prev_hash', String(64), comment='Хеш попереднього офлайн документа', nullable=True)


class Podkreps(Base):
    '''Таблица данных о подкреплениях'''
    __tablename__ = 'podkreps'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Відділення')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Користувач')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Час здійснення операції')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Ідентифікатор зміни', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Час прийняття фіскальним сервером', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Час відправки на фіскальний сервер',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    pid = Column('pid', Integer, comment='Локальний номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фіскальний номер онлайн чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовий вміст надісланого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовий вміст чека як його бачить податкова',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовий вміст відповіді податкової',
                           nullable=True)

    storno_time = Column('storno_time', DateTime, comment='Час сторно', default=None,
                         nullable=True)

    storno_tax_id = Column('storno_tax_id', Integer, comment='Фіскальний номер онлайн чека сторно', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фіскальний номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)

    prev_hash = Column('prev_hash', String(64), comment='Хеш попереднього офлайн документа', nullable=True)


class Incasses(Base):
    '''Таблица данных об инкассациях'''
    __tablename__ = 'inkasses'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Відділення')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Користувач')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Час здійснення операції')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Ідентифікатор зміни', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Час прийняття фіскальним сервером', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Час відправки на фіскальний сервер',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    pid = Column('pid', Integer, comment='Локальний номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фіскальний номер онлайн чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовий вміст надісланого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовий вміст чека як його бачить податкова',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовий вміст відповіді податкової',
                           nullable=True)

    storno_time = Column('storno_time', DateTime, comment='Час сторно', default=None,
                         nullable=True)

    storno_tax_id = Column('storno_tax_id', Integer, comment='Фіскальний номер онлайн чека сторно', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фіскальний номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)

    prev_hash = Column('prev_hash', String(64), comment='Хеш попереднього офлайн документа', nullable=True)


class Stornos(Base):
    '''Таблица данных о чеках сторно'''
    __tablename__ = 'stornos'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Відділення')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Користувач')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Час здійснення операції')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Ідентифікатор зміни', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Час прийняття фіскальним сервером', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Час відправки на фіскальний сервер',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    pid = Column('pid', Integer, comment='Локальний номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фіскальний номер онлайн чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовий вміст надісланого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовий вміст чека як його бачить податкова',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовий вміст відповіді податкової',
                           nullable=True)

    original_tax_id = Column('original_tax_id', String(32), comment='Фискальный номер сторнируемого чека',
                             nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фіскальний номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)

    prev_hash = Column('prev_hash', String(64), comment='Хеш попереднього офлайн документа', nullable=True)


class Sales(Base):
    '''Таблица данных о розничных продажах'''
    __tablename__ = 'sales'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Відділення')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Користувач')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Час здійснення операції')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Ідентифікатор зміни', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Час прийняття фіскальним сервером', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Час відправки на фіскальний сервер',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    discount = Column('discount', Numeric(precision=20, scale=2), default=0, comment='Дисконт')

    ret = Column('ret', Boolean, comment='Признак возврата', nullable=True, default=False)

    orderretnum = Column('orderretnum', Integer, comment='Фіскальний номер онлайн чека возврата', nullable=True,
                         default=None)

    pid = Column('pid', Integer, comment='Локальний номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фіскальний номер онлайн чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовий вміст надісланого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовий вміст чека як його бачить податкова',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовий вміст відповіді податкової',
                           nullable=True)

    storno_time = Column('storno_time', DateTime, comment='Час сторно', default=None,
                         nullable=True)

    storno_tax_id = Column('storno_tax_id', Integer, comment='Фіскальний номер онлайн чека сторно', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фіскальний номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)

    prev_hash = Column('prev_hash', String(64), comment='Хеш попереднього офлайн документа', nullable=True)


class SalesTaxes(Base):
    '''Таблица данных о налогах в розничных продажах'''
    __tablename__ = 'sales_taxes'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    sales_id = Column("sales_id", Integer, ForeignKey("sales.id"), comment='Идентификатор операции')

    type = Column('type', SmallInteger, comment='Код виду податку/збору')

    name = Column('name', String(64), comment='Найменування виду податку/збору')

    letter = Column('letter', String(1), comment='Літерне позначення виду і ставки податку/збору')

    prc = Column('prc', Numeric(precision=15, scale=2), comment='Відсоток податку/збору')

    sign = Column('sign', Boolean, comment='Ознака податку/збору, не включеного у вартість')

    turnover = Column('turnover', Numeric(precision=15, scale=2), comment='Сума для розрахування податку/збору')

    sum = Column('sum', Numeric(precision=15, scale=2), comment='Сума податку/збору')


class SalesPays(Base):
    '''Таблица данных о платежах в розничных продажах'''
    __tablename__ = 'sales_pays'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    sales_id = Column("sales_id", Integer, ForeignKey("sales.id"), comment='Идентификатор операции')

    payformcd = Column('type', SmallInteger, comment='Код форми оплати (числовий): 0–Готівка, 1–Банківська картка')

    payformname = Column('name', String(64), comment='Найменування виду податку/збору')

    sum = Column('sum', Numeric(precision=15, scale=2), comment='Загальна сума')

    provided = Column('provided', Numeric(precision=15, scale=2), comment='Сума внесених коштів')

    remains = Column('remains', Numeric(precision=15, scale=2), comment='Решта')


class SalesCheck(Base):
    '''Таблица данных о платежах в розничных продажах'''
    __tablename__ = 'sales_check'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    sales_id = Column("sales_id", Integer, ForeignKey("sales.id"), comment='Идентификатор операции')

    code = Column('code', String(64), comment='Внутрішній код товару')

    uktzed = Column('uktzed', String(15), comment='Код товару згідно з УКТЗЕД')

    name = Column('name', String(512), comment='Найменування товару, послуги або операції')

    unitcd = Column('unitcd', String(5), comment='Код одиниці виміру згідно класифікатора')

    unitnm = Column('unitnm', String(64), comment='Найменування одиниці виміру')

    amount = Column('amount', Numeric(precision=15, scale=3), comment='Кількість/об’єм товару')

    price = Column('price', Numeric(precision=15, scale=2), comment='Ціна за одиницю товару')

    letters = Column('letters', String(15), comment='Літерні позначення видів і ставок податків/зборів')

    cost = Column('cost', Numeric(precision=15, scale=2), comment='Сума операції')

    discount = Column('discount', Numeric(precision=15, scale=2), default=0, comment='Дисконт операції')


class ZReports(Base):
    ''' Таблица фискальных данных Z отчетов '''
    __tablename__ = 'z_reports'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, autoincrement=True, comment='Идентификатор')

    department_id = Column("department_id", Integer, ForeignKey("departments.id"), comment='Идентификатор отделения')

    operator_id = Column('operator_id', Integer, ForeignKey("users.id"), comment='Идентификатор оператора')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Час здійснення операції')

    rro_type = Column('rro_type', String(4), comment='Тип РРО, що зараз використовується(rro, rkks, prro, none)')

    rro_id = Column('rro_id', String(16), default=None, comment='Идентификатор РРО привязанного до отделения')

    z_number = Column('z_number', Integer, comment='Номер Z отчета')

    fn = Column('fn', String(10), comment='Фискальный номер регистратора')

    zn = Column('zn', String(64), comment='Заводской номер регистратора')

    fsn = Column('fsn', String(16), comment='Версия программы эквайера')

    tn = Column('tn', String(16), comment='Налоговый номер (EDRPOU)')

    pid = Column('pid', Integer, comment='Фіскальний номер онлайн чека')

    qr = Column('qr', String(100), comment='Содержимое QR кода чека')

    fiscal_time = Column('fiscal_time', DateTime, comment='Фискальное время чека')

    op_cnt = Column('op_cnt', Integer, comment='Количество операций в чеке')

    sum_reinf = Column('sum_reinf', Numeric(precision=20, scale=2),
                       comment='Сумма подкреплений')

    sum_collect = Column('sum_collect', Numeric(precision=20, scale=2),
                         comment='Сумма инкассаций')

    sum_adv = Column('sum_adv', Numeric(precision=20, scale=2),
                     comment='Сумма авансов')

    xml = Column('xml', TEXT, default=None, comment='Текстовий вміст надісланого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовий вміст чека як його бачить податкова',
                        nullable=True)

    server_time = Column('server_time', DateTime, comment='Час відправки на фіскальний сервер',
                         default=None, nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фіскальний номер онлайн чека', nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовий вміст відповіді податкової',
                           nullable=True)

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Ідентифікатор зміни', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фіскальний номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек збережено в режимі офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    def __str__(self):
        return self.z_number


# ===================================
#       INDEXES & CONSTRAINS
# ===================================

shifts_doc_uid_idx = Index('shifts_doc_uid_idx', Shifts.doc_uid)
advances_doc_uid_idx = Index('advances_doc_uid_idx', Advances.doc_uid)
podkreps_doc_uid_idx = Index('podkreps_doc_uid_idx', Podkreps.doc_uid)
incasses_doc_uid_idx = Index('incasses_doc_uid_idx', Incasses.doc_uid)
stornos_doc_uid_idx = Index('stornos_doc_uid_idx', Stornos.doc_uid)
sales_doc_uid_idx = Index('sales_doc_uid_idx', Sales.doc_uid)
