import base64
import datetime
from hashlib import sha256
import logging

from dateutil import tz
from werkzeug.security import generate_password_hash, check_password_hash

from sqlalchemy import Column, ForeignKey, String, union_all, literal_column

from sqlalchemy.sql.sqltypes import Boolean, Numeric, Integer, SmallInteger, Text, DateTime, Time, \
    LargeBinary, JSON, TEXT

from sqlalchemy.orm import relationship, backref

from flask_sqlalchemy import SQLAlchemy

from flask_login import current_user

from config import TIMEZONE, LOGFILE
from utils.SendData2 import SendData2

db = SQLAlchemy()

Base = db.Model

Base.__repr__ = Base.__str__ = lambda self: str({c.name: getattr(self, c.name) for c in self.__table__.columns})
Base.as_dict = lambda self: {c.name: getattr(self, c.name) for c in self.__table__.columns}


def get_logger(name):
    # получение пользовательского логгера и установка уровня логирования
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
    sender = SendData2(db, key, rro_id, "")

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
        sender = SendData2(db, key, 0, "")

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
            if not department.prro_key:
                department.prro_key_id = key.id
                db.session.commit()
    else:
        key = department.get_prro_key()

    return department, key


def fix_shift(registrar_state, department, sender):
    msg = ''
    if registrar_state:
        # if registrar_state['ShiftState'] == 0:
        shift, shift_opened = department.prro_open_shift(False)
        registrar_state = sender.TransactionsRegistrarState()
        print(registrar_state)
        if registrar_state:
            if registrar_state['ShiftState'] == 0:

                # msg = '{} {}'.format(msg, 'Смена есть, статус {}'.format(shift.operation_type))
                if shift.operation_type == 1:
                    operation_time = datetime.datetime.now()

                    msg = '{} {}'.format(msg, 'Смена открыта в оффлайн, но не открыта по налоговой, исправляем. ')
                    shift.p_offline = False
                    local_number = registrar_state['NextLocalNum']
                    sender.local_number = local_number
                    sender.open_shift(operation_time)
                    shift.pid = local_number
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
                        msg = '{} {}'.format(msg, 'Исправляем режим п-оффлайн')
                    # if shift.offline:
                    #     shift.offline = False
                    if shift.offline:
                        shift.offline = False
                        msg = '{} {}'.format(msg, 'Исправляем режим оффлайн')

                    # print('Исправляем номер {} на {}'.format(shift.pid, registrar_state['NextLocalNum']))
                    # if shift.pid != registrar_state['NextLocalNum']:
                    #     msg = '{} {}'.format(msg, 'Исправляем номер pid с {} на {}'.format(shift.pid, registrar_state['NextLocalNum']))
                    #     shift.pid = registrar_state['NextLocalNum']

                    if shift.prro_localnumber != registrar_state['NextLocalNum']:
                        msg = '{} {}'.format(msg,
                                             'Исправляем номер prro_localnumber {} на {}'.format(
                                                 shift.prro_localnumber,
                                                 registrar_state['NextLocalNum']))
                        shift.prro_localnumber = registrar_state['NextLocalNum']


                    NumLocal = int(
                        registrar_state['TaxObject']['TransactionsRegistrars'][0]['NumLocal'])

                    if shift.prro_zn:
                        shift_prro_zn = int(shift.prro_zn)
                    else:
                        shift_prro_zn = 0

                    if shift_prro_zn != NumLocal:
                        msg = '{} {}'.format(msg,
                                             'Исправляем заводской номер с {} на {}'.format(
                                                 shift.prro_zn,
                                                 NumLocal))
                        shift.prro_zn = NumLocal

                    address = registrar_state['TaxObject']['Address']
                    if shift.prro_address != address:
                        msg = '{} {}'.format(msg,
                                             'Исправляем адрес с {} на {}'.format(
                                                 shift.prro_address,
                                                 address))
                        shift.prro_address = address

                    Tin = registrar_state['TaxObject']['Tin']
                    if shift.prro_tn != Tin:
                        msg = '{} {}'.format(msg,
                                             'Исправляем TIN с {} на {}'.format(
                                                 shift.prro_tn,
                                                 Tin))
                        shift.prro_tn = Tin

                    Ipn = registrar_state['TaxObject']['Ipn']
                    if shift.prro_ipn != Ipn:
                        msg = '{} {}'.format(msg,
                                             'Исправляем IPN с {} на {}'.format(
                                                 shift.prro_ipn,
                                                 Ipn))
                    shift.prro_ipn = Ipn

                    OrgName = registrar_state['TaxObject']['OrgName']
                    if shift.prro_org_name != OrgName:
                        msg = '{} {}'.format(msg,
                                             'Исправляем назву с {} на {}'.format(
                                                 shift.prro_org_name,
                                                 OrgName))
                    shift.prro_org_name = OrgName

                    Name = registrar_state['TaxObject']['Name']
                    if shift.prro_department_name != Name:
                        msg = '{} {}'.format(msg,
                                             'Исправляем назву ПРРО с {} на {}'.format(
                                                 shift.prro_department_name,
                                                 Name))
                    shift.prro_department_name = Name

                    OfflineSessionId = registrar_state['OfflineSessionId']
                    if shift.prro_offline_session_id != OfflineSessionId:
                        msg = '{} {}'.format(msg,
                                             'Исправляем OfflineSessionId ПРРО с {} на {}'.format(
                                                 shift.prro_offline_session_id,
                                                 OfflineSessionId))

                    shift.prro_offline_session_id = OfflineSessionId

                    OfflineSeed = registrar_state['OfflineSeed']
                    if shift.prro_offline_seed != OfflineSeed:
                        msg = '{} {}'.format(msg,
                                             'Исправляем OfflineSeed ПРРО с {} на {}'.format(
                                                 shift.prro_offline_seed,
                                                 OfflineSeed))

                    shift.prro_offline_seed = OfflineSeed

                    Testing = registrar_state['Testing']
                    if shift.testing != Testing:
                        msg = '{} {}'.format(msg,
                                             'Исправляем Testing с {} на {}'.format(
                                                 shift.testing,
                                                 Testing))
                    shift.testing = Testing

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

    return msg


class Users(Base):
    ''' Таблица пользователей программного продукта '''
    __tablename__ = 'users'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    created = Column('created', DateTime, default=datetime.datetime.now,
                     comment='Время когда пользователь был зарегистрирован')

    last_login = Column('last_login', DateTime,
                        comment='Время когда пользователь заходил последний раз, используется для принудительной смены пароля')

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

    offline = Column('offline', SmallInteger, default=1, nullable=False, comment='Режим офлайн')

    offline_supported = Column('offline_supported', SmallInteger, default=1, nullable=True, comment='Дозвіл переходу в режим офлайн по податковій')

    next_local_number = Column('next_local_number', Integer, comment='Наступний локальний номер документа', nullable=True)

    org_name = Column('org_name', String(256), comment='Найменування продавця (256 символів)', nullable=True)

    name = Column('name', String(256), comment='Найменування точки продаж (256 символів)', nullable=True)

    prro_name = Column('prro_name', String(256), comment='Найменування ПРРО (256 символів)', nullable=True)

    tin = Column('tin', String(10), comment='ЄДРПОУ/ДРФО/№ паспорта продавця (10 символів)', nullable=True)

    ipn = Column('ipn', String(12),
                      comment='Податковий номер або Індивідуальний номер платника ПДВ (12 символів)', nullable=True)

    entity = Column('entity', Integer, comment='Ідентифікатор запису ГО', nullable=True)

    zn = Column('zn', Integer, comment='Локальний номер реєстратора розрахункових операцій (64 символи)', nullable=True)

    single_tax = Column('single_tax', Boolean, default=False, nullable=True, comment='Єдиний податок')

    tax_obj_guid = Column('tax_obj_guid', String(32), comment='Ідентифікатор запису ОО', nullable=True)

    tax_obj_id = Column('tax_obj_id', Integer, comment='Код запису ОО', nullable=True)

    shift_state = Column('shift_state', SmallInteger, default=0, nullable=True, comment='Стан зміни')

    closed = Column('closed', Boolean, default=False, nullable=True, comment='Стан ПРРО')

    chief_cashier = Column('chief_cashier', Boolean, comment='Старший касир', nullable=True)

    def __repr__(self):
        return '| {} | {} |'.format(self.id, self.full_name)

    def __str__(self):
        return self.full_name

    sender = None

    def set_signer_type(self):

        if self.taxform_key and self.prro_key:
            from utils.SendData2 import SendData2
            sender = SendData2(db, self.taxform_key, 0, "")

            operators = sender.post_data("cmd", {"Command": "Operators"})

            if operators:
                if 'Operators' in operators:
                    operators = operators['Operators']
                    if operators:
                        for operator in operators:
                            print(operator)
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

        # key = DepartmentKeys.query \
        #     .filter(DepartmentKeys.department_id == self.id) \
        #     .order_by(desc(DepartmentKeys.end_time)) \
        #     .first()

        key = self.prro_key

        return key

    @staticmethod
    def get_offine_operations(offline_session):

        offline_checks = db.session.query(literal_column('0').label('type'),
                                          OfflineChecks.id.label('id'),
                                          OfflineChecks.pid.label('pid'),
                                          OfflineChecks.operation_time.label(
                                              'operation_time'),
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
                                               Podkreps.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Podkreps.offline_session_id == offline_session.offline_session_id) \
            .filter(Podkreps.operation_time >= offline_session.operation_time) \
            .filter(Podkreps.fiscal_time != None) \
            .filter(Podkreps.server_time == None)

        sales_operations = db.session.query(literal_column('5').label('type'),
                                            Sales.id.label('id'),
                                            Sales.pid.label('pid'),
                                            Sales.operation_time.label('operation_time'),
                                            Sales.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Sales.offline_session_id == offline_session.offline_session_id) \
            .filter(Sales.operation_time >= offline_session.operation_time) \
            .filter(Sales.fiscal_time != None) \
            .filter(Sales.server_time == None)

        storno_operations = db.session.query(literal_column('6').label('type'),
                                             Stornos.id.label('id'),
                                             Stornos.pid.label('pid'),
                                             Stornos.operation_time.label('operation_time'),
                                             Stornos.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Stornos.offline_session_id == offline_session.offline_session_id) \
            .filter(Stornos.operation_time >= offline_session.operation_time) \
            .filter(Stornos.fiscal_time != None) \
            .filter(Stornos.server_time == None)

        # Зарезервировано:
        #   валютные операции  7

        # Зарезервировано:
        #   кредиты  8

        z_reports = db.session.query(literal_column('9').label('type'),
                                     ZReports.pid.label('id'),
                                     ZReports.pid.label('pid'),
                                     ZReports.operation_time.label(
                                         'operation_time'),
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
                                        Shifts.offline_fiscal_xml_signed.label('offline_fiscal_xml_signed')) \
            .filter(Shifts.offline_session_id == offline_session.offline_session_id) \
            .filter(Shifts.operation_type == 0) \
            .filter(Shifts.operation_time >= offline_session.operation_time) \
            .filter(Shifts.fiscal_time != None) \
            .filter(Shifts.server_time == None)

        sub = union_all(offline_checks, open_shifts, advances, inkasses_operations, podkreps_operations,
                        sales_operations, storno_operations, z_reports, close_shifts).alias(
            'sub')

        operations = db.session.query(sub.c.type, sub.c.id, sub.c.pid, sub.c.operation_time,
                                      sub.c.offline_fiscal_xml_signed) \
            .order_by(sub.c.pid) \
            .all()

        return operations

    def prro_open_shift(self, open_shift=True, shift_id=None, key=None, testing=False, cashier_name=None):

        operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
        server_time = None

        shift_opened = False

        if not key:
            key = self.get_prro_key()

        if not self.sender:
            # from utils.SendData2 import SendData2
            self.sender = SendData2(db, key, self.rro_id, cashier_name)

        if shift_id:
            last_shift = Shifts.query.get(shift_id)
        else:
            last_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .first()

        if last_shift:
            self.sender.org_name = last_shift.prro_org_name
            self.sender.department_name = last_shift.prro_department_name
            self.sender.address = last_shift.prro_address
            self.sender.tn = last_shift.prro_tn
            self.sender.ipn = last_shift.prro_ipn
            self.sender.entity = last_shift.prro_entity
            self.sender.zn = last_shift.prro_zn
            self.sender.cashier_name = last_shift.cashier

            if last_shift.operation_type == 1:
                self.sender.local_number = last_shift.prro_localnumber
                self.sender.local_check_number = last_shift.prro_localchecknumber
                self.sender.offline_session_id = last_shift.prro_offline_session_id
                self.sender.offline_seed = last_shift.prro_offline_seed
                return last_shift, False
            else:
                self.sender.local_number = last_shift.pid + 1
                self.sender.local_check_number = 1
                self.sender.offline_session_id = last_shift.prro_offline_session_id
                self.sender.offline_seed = last_shift.prro_offline_seed
                self.sender.last_ordernum = last_shift.pid + 1

            if not open_shift:
                return last_shift, False
        else:
            if not open_shift:
                raise Exception('{}'.format("Зміни у системі відсутні"))

        if not self.sender.org_name:
            prev_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .filter(Shifts.operation_type == 1) \
                .first()

            if prev_shift:
                self.sender.org_name = prev_shift.prro_org_name
                self.sender.department_name = prev_shift.prro_department_name
                self.sender.address = prev_shift.prro_address
                self.sender.tn = prev_shift.prro_tn
                self.sender.ipn = prev_shift.prro_ipn
                self.sender.entity = prev_shift.prro_entity
                self.sender.zn = prev_shift.prro_zn
                self.sender.offline_session_id = prev_shift.prro_offline_session_id
                self.sender.offline_seed = prev_shift.prro_offline_seed
                self.sender.cashier_name = prev_shift.cashier

        registrar_state = self.sender.TransactionsRegistrarState()

        p_offline = False

        if not registrar_state:
            # Ответ от налоговой не пришёл, переходим в псевдоофлайн режим
            p_offline = True
            # if not self.sender.org_name:
            #     self.sender.org_name = self.full_name
            #     self.sender.department_name = self.full_name
            #     self.sender.address = ''
            #     self.sender.tn = EDRPOU
            #     self.sender.ipn = None
            #     self.sender.entity = self.id
            #     self.sender.zn = self.id
            #     self.sender.offline_session_id = 0
            #     self.sender.offline_seed = 0
            #
            #     self.sender.local_number = 1
            #     self.sender.local_check_number = 1
            #     self.sender.last_ordernum = 1
        else:
            print('Ответ от налоговой есть')
            last_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .first()

            if last_shift:
                print('Смена есть, статус {}'.format(last_shift.operation_type))
                if last_shift.operation_type == 1:
                    if registrar_state['ShiftState'] == 0:
                        print('Смена открыта в БД, но не открыта по налоговой, исправляем')
                        last_shift.p_offline = False
                        local_number = registrar_state['FirstLocalNum']
                        self.sender.local_number = local_number
                        self.sender.open_shift(operation_time, testing=testing)
                        last_shift.pid = local_number
                        # last_shift.operation_type = 0
                        db.session.commit()
            if registrar_state['ShiftState'] == 1 and (not last_shift or last_shift.operation_type == 0):
                print('Смена открыта в налоговой, но не открыта в БД, исправляем')
                raise Exception('{}'.format("Смена открыта в налоговой, но не открыта в БД, исправляем"))
                # document = self.DocumentInfoByLocalNum(local_number)
                #
                # data = self.get_fiscal_data_by_local_number(self.local_number, data)
                # print(data)
                # if data:
                #     self.last_fiscal_error_txt = ''
                #     self.last_fiscal_error_code = 0
                #
                # self.sender.local_number

        if not p_offline:
            last_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .filter(Shifts.operation_type == 0) \
                .first()

            if last_shift:
                last_pid = last_shift.pid

                if registrar_state['ShiftState'] != 0:

                    local_number = registrar_state['FirstLocalNum']
                    self.sender.local_number = local_number
                    if last_pid + 1 != local_number:
                        last_shift.pid = local_number - 1
                        # raise Exception(
                        #     "Зміну не вдалося відкрити, некоректний номер запиту ({}/{}), зв'яжіться з тех.підтримкою".format(
                        #         last_pid + 1, local_number))
                else:
                    local_number = self.sender.local_number
                    if last_pid + 1 != local_number:
                        last_shift.pid = local_number - 1
                        # raise Exception(
                        #     "Зміну не вдалося відкрити, некоректний номер запиту ({}/{}), зв'яжіться з тех.підтримкою".format(last_pid + 1, local_number))
            else:
                self.sender.local_number = registrar_state['NextLocalNum']

            ret = self.sender.open_shift(operation_time, testing=testing)
            if ret == 9:
                registrar_state = self.sender.TransactionsRegistrarState()
                self.sender.open_shift(operation_time, testing=testing)

            if self.sender.server_time:
                server_time = self.sender.server_time

        if not server_time:

            p_offline = True

            fiscal_time = datetime.datetime.now(tz.gettz(TIMEZONE))

            self.sender.local_number += 1
            self.sender.local_check_number += 1
            self.sender.last_ordernum += 1

            self.sender.last_ordertaxnum = 0
            self.sender.last_fiscal_error_code = 1000
            self.sender.last_fiscal_error_txt = 'p_offline'

            # self.sender.local_check_number +=1
            xml = None
            fiscal_ticket = None

            print('{}: {} открыли смену в режиме псевдо-офлайн '.format(operation_time, self.full_name))

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

        operation_type = 1  # открытие смены

        pid = self.sender.local_number

        tax_id = self.sender.last_ordertaxnum

        fiscal_error_code = self.sender.last_fiscal_error_code
        fiscal_error_txt = self.sender.last_fiscal_error_txt

        prro_offline_session_id = self.sender.offline_session_id
        prro_offline_seed = self.sender.offline_seed

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
            pid=pid,
            tax_id=tax_id,
            xml=xml,
            fiscal_ticket=fiscal_ticket,
            fiscal_error_code=fiscal_error_code,
            fiscal_error_txt=fiscal_error_txt,
            prro_offline_session_id=prro_offline_session_id,
            prro_offline_seed=prro_offline_seed,
            prro_org_name=self.sender.org_name,
            prro_department_name=self.sender.department_name,
            prro_address=self.sender.address,
            prro_tn=self.sender.tn,
            prro_ipn=self.sender.ipn,
            prro_entity=self.sender.entity,
            prro_zn=self.sender.zn,
            prro_localnumber=self.sender.local_number,
            prro_localchecknumber=self.sender.local_check_number,
            fiscal_shift_id=self.sender.fiscal_shift_id,
            offline=False,
            p_offline=p_offline,
            testing=testing,
            cashier=cashier_name
        )

        db.session.add(shift)
        db.session.commit()

        return shift, True

    def prro_open_shift2(self, open_shift=True, shift_id=None, key=None, testing=False, cashier_name=None):

        operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
        server_time = None

        shift_opened = False

        offline = False

        if not key:
            key = self.get_prro_key()

        if not self.sender:
            # from utils.SendData2 import SendData2
            self.sender = SendData2(db, key, self.rro_id, cashier_name)

        if shift_id:
            last_shift = Shifts.query.get(shift_id)
        else:
            last_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .first()

        if last_shift:
            self.sender.org_name = last_shift.prro_org_name
            self.sender.department_name = last_shift.prro_department_name
            self.sender.address = last_shift.prro_address
            self.sender.tn = last_shift.prro_tn
            self.sender.ipn = last_shift.prro_ipn
            self.sender.entity = last_shift.prro_entity
            self.sender.zn = last_shift.prro_zn
            self.sender.cashier_name = last_shift.cashier

            if last_shift.operation_type == 1:
                self.sender.local_number = last_shift.prro_localnumber
                self.sender.local_check_number = last_shift.prro_localchecknumber
                self.sender.offline_session_id = last_shift.prro_offline_session_id
                self.sender.offline_seed = last_shift.prro_offline_seed
                return last_shift, False
            else:
                self.sender.local_number = last_shift.pid + 1
                self.sender.local_check_number = 1
                self.sender.offline_session_id = last_shift.prro_offline_session_id
                self.sender.offline_seed = last_shift.prro_offline_seed
                self.sender.last_ordernum = last_shift.pid + 1
                self.sender.offline_local_number = last_shift.prro_offline_local_number + 1

            if not open_shift:
                return last_shift, False

            if not last_shift.server_time:
                offline = True

        if not self.sender.org_name:
            prev_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .filter(Shifts.operation_type == 1) \
                .first()

            if prev_shift:
                self.sender.org_name = prev_shift.prro_org_name
                self.sender.department_name = prev_shift.prro_department_name
                self.sender.address = prev_shift.prro_address
                self.sender.tn = prev_shift.prro_tn
                self.sender.ipn = prev_shift.prro_ipn
                self.sender.entity = prev_shift.prro_entity
                self.sender.zn = prev_shift.prro_zn
                self.sender.offline_session_id = prev_shift.prro_offline_session_id
                self.sender.offline_seed = prev_shift.prro_offline_seed
                self.sender.cashier_name = prev_shift.cashier

        registrar_state = None

        if not offline:

            registrar_state = self.sender.TransactionsRegistrarState()

            if not registrar_state:
                # Ответ от налоговой не пришёл, переходим в офлайн режим
                offline = True

            else:
                print('Ответ от налоговой есть')
                last_shift = Shifts.query \
                    .order_by(Shifts.operation_time.desc()) \
                    .filter(Shifts.department_id == self.id) \
                    .first()

                if last_shift:
                    print('Смена есть, статус {}'.format(last_shift.operation_type))
                    if last_shift.operation_type == 1:
                        if registrar_state['ShiftState'] == 0:
                            print('Смена открыта в офлайн, но не открыта по налоговой, исправляем')
                            last_shift.p_offline = False
                            local_number = registrar_state['FirstLocalNum']
                            self.sender.local_number = local_number
                            self.sender.open_shift(operation_time, testing=testing)
                            last_shift.pid = local_number
                            # last_shift.operation_type = 0
                            db.session.commit()

        if not offline:
            last_shift = Shifts.query \
                .order_by(Shifts.operation_time.desc()) \
                .filter(Shifts.department_id == self.id) \
                .filter(Shifts.operation_type == 0) \
                .first()

            if last_shift:
                last_pid = last_shift.pid

                if registrar_state:
                    if 'ShiftState' in registrar_state:
                        if registrar_state['ShiftState'] != 0:

                            local_number = registrar_state['FirstLocalNum']
                            self.sender.local_number = local_number
                            if last_pid + 1 != local_number:
                                last_shift.pid = local_number - 1
                                # raise Exception(
                                #     "Зміну не вдалося відкрити, некоректний номер запиту ({}/{}), зв'яжіться з тех.підтримкою".format(
                                #         last_pid + 1, local_number))
                        else:
                            local_number = self.sender.local_number
                            if last_pid + 1 != local_number:
                                last_shift.pid = local_number - 1
                                # raise Exception(
                                #     "Зміну не вдалося відкрити, некоректний номер запиту ({}/{}), зв'яжіться з тех.підтримкою".format(last_pid + 1, local_number))
            else:
                self.sender.local_number = registrar_state['NextLocalNum']

            ret = self.sender.open_shift(operation_time, testing=testing)
            if not ret:
                offline = True

            if ret == 9:
                registrar_state = self.sender.TransactionsRegistrarState()
                ret = self.sender.open_shift(operation_time, testing=testing)
                if not ret:
                    offline = True

            server_time = self.sender.server_time

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
                user_id = None

        off = None

        if offline:

            offline_sessions = OfflineChecks.query \
                .filter(OfflineChecks.server_time == None) \
                .filter(OfflineChecks.department_id == self.id) \
                .first()

            fiscal_time = operation_time

            if not offline_sessions:

                # переход в офлайн
                self.sender.offline_local_number = 1
                offline = True

                # для офлайн нужно добавить номер, т.к. мы не знаем прошел чек или нет
                self.sender.local_number += 1
                self.sender.local_check_number += 1

                xml, signed_xml, offline_tax_id = self.sender.to_offline(operation_time, testing=testing, revoke=False)

                pid = self.sender.local_number
                # tax_id = self.sender.last_ordertaxnum

                off = OfflineChecks(
                    operation_type=1,
                    department_id=self.id,
                    user_id=user_id,
                    operation_time=operation_time,
                    shift_id=None,
                    fiscal_time=fiscal_time,
                    server_time=server_time,
                    pid=pid,
                    testing=testing,
                    offline_fiscal_xml_signed=signed_xml,
                    offline_tax_id=offline_tax_id,
                    offline_session_id=self.sender.offline_session_id
                )
                db.session.add(off)

                self.sender.local_number += 1
                self.sender.local_check_number += 1
                self.sender.offline_local_number += 1

            else:
                start_offline_sessions = offline_sessions.fiscal_time
                # start_offline_sessions

            fiscal_ticket = None

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

        operation_type = 1  # открытие смены

        pid = self.sender.local_number

        tax_id = self.sender.last_ordertaxnum

        fiscal_error_code = self.sender.last_fiscal_error_code
        fiscal_error_txt = self.sender.last_fiscal_error_txt

        prro_offline_session_id = self.sender.offline_session_id
        prro_offline_seed = self.sender.offline_seed

        shift = Shifts(
            department_id=self.id,
            user_id=user_id,
            operation_type=operation_type,
            operation_time=operation_time,
            fiscal_time=fiscal_time,
            server_time=server_time,
            pid=pid,
            tax_id=tax_id,
            # xml=xml,
            fiscal_ticket=fiscal_ticket,
            fiscal_error_code=fiscal_error_code,
            fiscal_error_txt=fiscal_error_txt,
            prro_offline_session_id=prro_offline_session_id,
            prro_offline_seed=prro_offline_seed,
            prro_org_name=self.sender.org_name,
            prro_department_name=self.sender.department_name,
            prro_address=self.sender.address,
            prro_tn=self.sender.tn,
            prro_ipn=self.sender.ipn,
            prro_entity=self.sender.entity,
            prro_zn=self.sender.zn,
            prro_localnumber=self.sender.local_number,
            prro_localchecknumber=self.sender.local_check_number,
            fiscal_shift_id=self.sender.fiscal_shift_id,
            offline=offline,
            testing=testing,
            cashier=cashier_name,
            offline_session_id=prro_offline_session_id
        )

        db.session.add(shift)
        db.session.commit()

        if off:
            off.shift_id = shift.id
            db.session.commit()

        return shift, True

    @staticmethod
    def check_prro_next_local_number(shift, fiscal_local_number):

        if shift.prro_localnumber:
            if fiscal_local_number != shift.prro_localnumber:
                shift.prro_localnumber = fiscal_local_number
                db.session.commit()
                # msg = "Не вдалося провести операцію, некоректний номер запиту ({}/{}), зв'яжіться з тех.підтримкою".format(
                #         fiscal_local_number, shift.prro_localnumber)
                # print(msg)
                # raise Exception(msg)

    '''Отправим авансы по остаткам'''

    def prro_advances(self, summa, key=None, testing=False):

        shift, shift_opened = self.prro_open_shift(True, key=key, testing=testing)
        if shift:

            operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
            server_time = None

            offline = shift.offline
            prev_hash = shift.prev_hash

            if not shift.offline:

                ret = self.sender.post_advances(summa, operation_time, testing=shift.testing)
                if not ret:
                    if self.offline:
                        offline = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    registrar_state = self.sender.TransactionsRegistrarState()
                    if registrar_state:
                        shift.prro_org_name = self.sender.org_name
                        shift.prro_department_name = self.sender.department_name
                        shift.prro_address = self.sender.address
                        shift.prro_tn = self.sender.tn
                        shift.prro_ipn = self.sender.ipn
                        shift.prro_entity = self.sender.entity
                        shift.prro_zn = self.sender.zn
                        db.session.commit()

                        ret = self.sender.post_advances(summa, operation_time, testing=shift.testing)
                        if not ret:
                            if self.offline:
                                offline = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

            fiscal_error_code = self.sender.last_fiscal_error_code
            fiscal_error_txt = self.sender.last_fiscal_error_txt

            if offline:

                fiscal_time = operation_time

                if not shift.offline:
                    # переход в офлайн
                    self.sender.offline_local_number = 1
                    shift.prro_offline_local_number = 1
                    shift.offline = True

                    # для офлайн нужно добавить номер, т.к. мы не знаем прошел чек или нет
                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number
                    self.sender.local_number = shift.prro_localnumber
                    self.sender.local_check_number = shift.prro_localchecknumber

                    xml, signed_xml, offline_tax_id = self.sender.to_offline(operation_time, testing=testing,
                                                                             revoke=False)

                    pid = self.sender.local_number
                    # tax_id = self.sender.last_ordertaxnum

                    off = OfflineChecks(
                        operation_type=1,
                        department_id=self.id,
                        user_id=shift.user_id,
                        operation_time=operation_time,
                        shift_id=shift.id,
                        fiscal_time=fiscal_time,
                        server_time=server_time,
                        pid=pid,
                        testing=shift.testing,
                        offline_fiscal_xml_signed=signed_xml,
                        offline_tax_id=offline_tax_id,
                        offline_session_id=shift.prro_offline_session_id
                    )
                    db.session.add(off)

                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number

                    shift.prro_offline_local_number += 1

                    self.sender.local_number += 1
                    self.sender.offline_local_number += 1
                    self.sender.local_check_number = shift.prro_localchecknumber

                else:
                    self.sender.offline_local_number = shift.prro_offline_local_number

                xml, signed_xml, offline_tax_id = self.sender.post_advances(summa,
                                                                            operation_time,
                                                                            testing=shift.testing,
                                                                            offline=True,
                                                                            prev_hash=shift.prev_hash)

                self.sender.local_check_number = shift.prro_localchecknumber
                self.sender.last_ordernum = self.sender.local_number
                self.sender.last_ordertaxnum = 0

                shift.prro_offline_local_number += 1

                shift.prev_hash = sha256(xml).hexdigest()

                fiscal_ticket = None

                print('{}: {} сохранили чек аванса в режиме офлайн '.format(fiscal_time, self.full_name))
            else:
                fiscal_time = datetime.datetime.strptime(
                    '{} {}'.format(self.sender.last_taxorderdate, self.sender.last_taxordertime), '%d%m%Y %H%M%S')

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

                print('{}: {} сохранили чек аванса в режиме онлайн '.format(fiscal_time, self.full_name))

            pid = self.sender.local_number
            tax_id = self.sender.last_ordertaxnum

            adv = Advances(
                department_id=self.id,
                user_id=shift.user_id,
                operation_time=operation_time,
                shift_id=shift.id,
                fiscal_time=fiscal_time,
                server_time=server_time,
                sum=summa,
                pid=pid,
                tax_id=tax_id,
                fiscal_ticket=fiscal_ticket,
                fiscal_error_code=fiscal_error_code,
                fiscal_error_txt=fiscal_error_txt,
                testing=shift.testing,
                offline_fiscal_xml_signed=signed_xml,
                offline=offline,
                offline_tax_id=offline_tax_id,
                offline_session_id=shift.prro_offline_session_id
            )
            db.session.add(adv)

            shift.prro_localnumber += 1  # = self.sender.local_number
            shift.prro_localchecknumber += 1  # = self.sender.local_check_number
            self.sender.local_number = shift.prro_localnumber

            db.session.commit()

            if offline:
                tax_id = offline_tax_id

                check_visual = '{}'.format(shift.prro_org_name)
                if shift.prro_department_name:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_department_name)
                if shift.prro_address:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_address)
                if shift.prro_tn:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, shift.prro_tn)
                if shift.prro_ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, shift.prro_ipn)

                check_visual = '{}\r\n		{}'.format(check_visual, "Службове внесення")
                check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")
                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, shift.prro_zn)
                check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, offline_tax_id, pid, "офлайн")
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

                if shift.prev_hash:
                    check_visual = '{}\r\nКонтрольне число:\r\n{}'.format(
                        check_visual, prev_hash)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))

            else:
                coded_string = self.sender.GetCheckExt(tax_id, 3)

            qr = 'https://cabinet.tax.gov.ua/cashregs/check?id={}&fn={}&date={}'.format(
                tax_id, self.rro_id, operation_time.strftime("%Y%m%d"))

            return tax_id, shift, shift_opened, qr, coded_string, offline
        else:
            raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

    '''Отправим подкрепления'''

    def prro_podkrep(self, summa, key=None, testing=False, balance=0, doc_uid=None):

        shift, shift_opened = self.prro_open_shift(True, key=key, testing=testing)
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
            prev_hash = shift.prev_hash

            offline = shift.offline

            if not shift.offline:

                ret = self.sender.post_podkrep(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)
                if not ret:
                    if self.offline:
                        offline = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    registrar_state = self.sender.TransactionsRegistrarState()
                    if registrar_state:
                        shift.prro_org_name = self.sender.org_name
                        shift.prro_department_name = self.sender.department_name
                        shift.prro_address = self.sender.address
                        shift.prro_tn = self.sender.tn
                        shift.prro_ipn = self.sender.ipn
                        shift.prro_entity = self.sender.entity
                        shift.prro_zn = self.sender.zn
                        db.session.commit()

                        ret = self.sender.post_podkrep(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)

                        if not ret:
                            if self.offline:
                                offline = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

            fiscal_error_code = self.sender.last_fiscal_error_code
            fiscal_error_txt = self.sender.last_fiscal_error_txt

            if offline:

                fiscal_time = operation_time

                if not shift.offline:
                    # переход в офлайн
                    self.sender.offline_local_number = 1
                    shift.prro_offline_local_number = 1
                    shift.offline = True

                    # для офлайн нужно добавить номер, т.к. мы не знаем прошел чек или нет
                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number
                    self.sender.local_number = shift.prro_localnumber
                    self.sender.local_check_number = shift.prro_localchecknumber

                    xml, signed_xml, offline_tax_id = self.sender.to_offline(operation_time, testing=testing,
                                                                             revoke=False)

                    pid = self.sender.local_number
                    # tax_id = self.sender.last_ordertaxnum

                    off = OfflineChecks(
                        operation_type=1,
                        department_id=self.id,
                        user_id=shift.user_id,
                        operation_time=operation_time,
                        shift_id=shift.id,
                        fiscal_time=fiscal_time,
                        server_time=server_time,
                        pid=pid,
                        testing=shift.testing,
                        offline_fiscal_xml_signed=signed_xml,
                        offline_tax_id=offline_tax_id,
                        offline_session_id=shift.prro_offline_session_id
                    )
                    db.session.add(off)

                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number

                    shift.prro_offline_local_number += 1

                    self.sender.local_number += 1
                    self.sender.offline_local_number += 1
                    self.sender.local_check_number = shift.prro_localchecknumber

                else:
                    self.sender.offline_local_number = shift.prro_offline_local_number

                xml, signed_xml, offline_tax_id = self.sender.post_podkrep(summa,
                                                                           operation_time,
                                                                           testing=shift.testing,
                                                                           offline=True,
                                                                           prev_hash=shift.prev_hash)

                self.sender.local_check_number = shift.prro_localchecknumber
                self.sender.last_ordernum = self.sender.local_number
                self.sender.last_ordertaxnum = 0

                shift.prro_offline_local_number += 1

                shift.prev_hash = sha256(xml).hexdigest()

                fiscal_ticket = None

                print('{}: {} сохранили чек инкассации в режиме офлайн '.format(fiscal_time, self.full_name))
            else:
                fiscal_time = datetime.datetime.strptime(
                    '{} {}'.format(self.sender.last_taxorderdate, self.sender.last_taxordertime), '%d%m%Y %H%M%S')

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

                print('{}: {} сохранили чек инкассации в режиме онлайн '.format(fiscal_time, self.full_name))

            pid = self.sender.local_number
            tax_id = self.sender.last_ordertaxnum

            adv = Podkreps(
                department_id=self.id,
                user_id=shift.user_id,
                operation_time=operation_time,
                shift_id=shift.id,
                fiscal_time=fiscal_time,
                server_time=server_time,
                sum=summa,
                pid=pid,
                tax_id=tax_id,
                fiscal_ticket=fiscal_ticket,
                fiscal_error_code=fiscal_error_code,
                fiscal_error_txt=fiscal_error_txt,
                testing=shift.testing,
                offline_fiscal_xml_signed=signed_xml,
                offline=offline,
                offline_tax_id=offline_tax_id,
                offline_session_id=shift.prro_offline_session_id,
                doc_uid=doc_uid
            )
            db.session.add(adv)

            shift.prro_localnumber += 1  # = self.sender.local_number
            shift.prro_localchecknumber += 1  # = self.sender.local_check_number
            self.sender.local_number = shift.prro_localnumber

            db.session.commit()

            if offline:
                tax_id = offline_tax_id

                check_visual = '{}'.format(shift.prro_org_name)
                if shift.prro_department_name:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_department_name)
                if shift.prro_address:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_address)
                if shift.prro_tn:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, shift.prro_tn)
                if shift.prro_ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, shift.prro_ipn)

                check_visual = '{}\r\n		{}'.format(check_visual, "Отримання підкріплення")
                check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")
                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, shift.prro_zn)
                check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, offline_tax_id, pid, "офлайн")
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

                if shift.prev_hash:
                    check_visual = '{}\r\nКонтрольне число:\r\n{}'.format(
                        check_visual, prev_hash)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))
            else:
                coded_string = self.sender.GetCheckExt(tax_id, 3)

            qr = 'https://cabinet.tax.gov.ua/cashregs/check?id={}&fn={}&date={}'.format(
                tax_id, self.rro_id, operation_time.strftime("%Y%m%d"))

            return tax_id, shift, shift_opened, qr, coded_string, offline, tax_id_advance, qr_advance, visual_advance

        else:
            raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

    '''Отправим инкассации'''

    def prro_inkass(self, summa, key=None, testing=False, balance=0, doc_uid=None):

        shift, shift_opened = self.prro_open_shift(True, key=key, testing=testing)
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

            offline = shift.offline
            prev_hash = shift.prev_hash

            if not shift.offline:

                ret = self.sender.post_inkass(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)
                if not ret:
                    if self.offline:
                        offline = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    registrar_state = self.sender.TransactionsRegistrarState()
                    if registrar_state:
                        shift.prro_org_name = self.sender.org_name
                        shift.prro_department_name = self.sender.department_name
                        shift.prro_address = self.sender.address
                        shift.prro_tn = self.sender.tn
                        shift.prro_ipn = self.sender.ipn
                        shift.prro_entity = self.sender.entity
                        shift.prro_zn = self.sender.zn
                        db.session.commit()

                        ret = self.sender.post_inkass(summa, operation_time, testing=shift.testing, doc_uid=doc_uid)
                        if not ret:
                            if self.offline:
                                offline = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

            fiscal_error_code = self.sender.last_fiscal_error_code
            fiscal_error_txt = self.sender.last_fiscal_error_txt

            if offline:

                fiscal_time = operation_time

                if not shift.offline:
                    # переход в офлайн
                    self.sender.offline_local_number = 1
                    shift.prro_offline_local_number = 1
                    shift.offline = True

                    # для офлайн нужно добавить номер, т.к. мы не знаем прошел чек или нет
                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number
                    self.sender.local_number = shift.prro_localnumber
                    self.sender.local_check_number = shift.prro_localchecknumber

                    xml, signed_xml, offline_tax_id = self.sender.to_offline(operation_time, testing=testing,
                                                                             revoke=False)

                    pid = self.sender.local_number
                    # tax_id = self.sender.last_ordertaxnum

                    off = OfflineChecks(
                        operation_type=1,
                        department_id=self.id,
                        user_id=shift.user_id,
                        operation_time=operation_time,
                        shift_id=shift.id,
                        fiscal_time=fiscal_time,
                        server_time=server_time,
                        pid=pid,
                        testing=shift.testing,
                        offline_fiscal_xml_signed=signed_xml,
                        offline_tax_id=offline_tax_id,
                        offline_session_id=shift.prro_offline_session_id
                    )
                    db.session.add(off)

                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number

                    shift.prro_offline_local_number += 1

                    self.sender.local_number += 1
                    self.sender.offline_local_number += 1
                    self.sender.local_check_number = shift.prro_localchecknumber

                else:
                    self.sender.offline_local_number = shift.prro_offline_local_number

                xml, signed_xml, offline_tax_id = self.sender.post_inkass(summa,
                                                                          operation_time,
                                                                          testing=shift.testing,
                                                                          offline=True,
                                                                          prev_hash=shift.prev_hash)

                self.sender.local_check_number = shift.prro_localchecknumber
                self.sender.last_ordernum = self.sender.local_number
                self.sender.last_ordertaxnum = 0

                shift.prro_offline_local_number += 1

                shift.prev_hash = sha256(xml).hexdigest()

                fiscal_ticket = None

                print('{}: {} сохранили чек инкассации в режиме офлайн '.format(fiscal_time, self.full_name))
            else:
                fiscal_time = datetime.datetime.strptime(
                    '{} {}'.format(self.sender.last_taxorderdate, self.sender.last_taxordertime), '%d%m%Y %H%M%S')

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

                print('{}: {} сохранили чек инкассации в режиме онлайн '.format(fiscal_time, self.full_name))

            pid = self.sender.local_number
            tax_id = self.sender.last_ordertaxnum

            adv = Incasses(
                department_id=self.id,
                user_id=shift.user_id,
                operation_time=operation_time,
                shift_id=shift.id,
                fiscal_time=fiscal_time,
                server_time=server_time,
                sum=summa,
                pid=pid,
                tax_id=tax_id,
                fiscal_ticket=fiscal_ticket,
                fiscal_error_code=fiscal_error_code,
                fiscal_error_txt=fiscal_error_txt,
                testing=shift.testing,
                offline_fiscal_xml_signed=signed_xml,
                offline=offline,
                offline_tax_id=offline_tax_id,
                offline_session_id=shift.prro_offline_session_id,
                doc_uid=doc_uid
            )
            db.session.add(adv)

            shift.prro_localnumber += 1  # = self.sender.local_number
            shift.prro_localchecknumber += 1  # = self.sender.local_check_number
            self.sender.local_number = shift.prro_localnumber

            db.session.commit()

            if offline:
                tax_id = offline_tax_id

                check_visual = '{}'.format(shift.prro_org_name)
                if shift.prro_department_name:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_department_name)
                if shift.prro_address:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_address)
                if shift.prro_tn:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, shift.prro_tn)
                if shift.prro_ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, shift.prro_ipn)

                check_visual = '{}\r\n		{}'.format(check_visual, "Службова видача")
                check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")
                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, shift.prro_zn)
                check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, offline_tax_id, pid, "офлайн")
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

                if shift.prev_hash:
                    check_visual = '{}\r\nКонтрольне число:\r\n{}'.format(
                        check_visual, prev_hash)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))

            else:
                coded_string = self.sender.GetCheckExt(tax_id, 3)

            qr = 'https://cabinet.tax.gov.ua/cashregs/check?id={}&fn={}&date={}'.format(
                tax_id, self.rro_id, operation_time.strftime("%Y%m%d"))

            return tax_id, shift, shift_opened, qr, coded_string, offline, tax_id_advance, qr_advance, visual_advance
        else:
            raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

    '''Отправим сторно'''

    def prro_storno(self, tax_id, key=None, testing=False):

        shift, shift_opened = self.prro_open_shift(True, key=key, testing=testing)
        if shift:

            operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))
            server_time = None

            offline = shift.offline
            prev_hash = shift.prev_hash

            if not shift.offline:

                ret = self.sender.post_storno(tax_id, operation_time, testing=shift.testing)
                if not ret:
                    if self.offline:
                        offline = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    registrar_state = self.sender.TransactionsRegistrarState()
                    if registrar_state:
                        shift.prro_org_name = self.sender.org_name
                        shift.prro_department_name = self.sender.department_name
                        shift.prro_address = self.sender.address
                        shift.prro_tn = self.sender.tn
                        shift.prro_ipn = self.sender.ipn
                        shift.prro_entity = self.sender.entity
                        shift.prro_zn = self.sender.zn
                        db.session.commit()

                        ret = self.sender.post_storno(tax_id, operation_time, testing=shift.testing)
                        if not ret:
                            if self.offline:
                                offline = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

            fiscal_error_code = self.sender.last_fiscal_error_code
            fiscal_error_txt = self.sender.last_fiscal_error_txt

            if offline:

                fiscal_time = operation_time

                if not shift.offline:
                    # переход в офлайн
                    self.sender.offline_local_number = 1
                    shift.prro_offline_local_number = 1
                    shift.offline = True

                    # для офлайн нужно добавить номер, т.к. мы не знаем прошел чек или нет
                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number
                    self.sender.local_number = shift.prro_localnumber
                    self.sender.local_check_number = shift.prro_localchecknumber

                    xml, signed_xml, offline_tax_id = self.sender.to_offline(operation_time, testing=testing,
                                                                             revoke=False)

                    pid = self.sender.local_number
                    # tax_id = self.sender.last_ordertaxnum

                    off = OfflineChecks(
                        operation_type=1,
                        department_id=self.id,
                        user_id=shift.user_id,
                        operation_time=operation_time,
                        shift_id=shift.id,
                        fiscal_time=fiscal_time,
                        server_time=server_time,
                        pid=pid,
                        testing=shift.testing,
                        offline_fiscal_xml_signed=signed_xml,
                        offline_tax_id=offline_tax_id,
                        offline_session_id=shift.prro_offline_session_id
                    )
                    db.session.add(off)

                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number

                    shift.prro_offline_local_number += 1

                    self.sender.local_number += 1
                    self.sender.offline_local_number += 1
                    self.sender.local_check_number = shift.prro_localchecknumber

                else:
                    self.sender.offline_local_number = shift.prro_offline_local_number

                xml, signed_xml, offline_tax_id = self.sender.post_storno(tax_id,
                                                                          operation_time,
                                                                          testing=shift.testing,
                                                                          offline=True,
                                                                          prev_hash=shift.prev_hash)

                self.sender.local_check_number = shift.prro_localchecknumber
                self.sender.last_ordernum = self.sender.local_number
                self.sender.last_ordertaxnum = 0

                shift.prro_offline_local_number += 1

                shift.prev_hash = sha256(xml).hexdigest()

                fiscal_ticket = None

                storno_tax_id = None

                print('{}: {} сохранили чек аванса в режиме офлайн '.format(fiscal_time, self.full_name))
            else:
                fiscal_time = datetime.datetime.strptime(
                    '{} {}'.format(self.sender.last_taxorderdate, self.sender.last_taxordertime), '%d%m%Y %H%M%S')

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

                storno_tax_id = self.sender.last_ordertaxnum

                print('{}: {} сохранили чек сторно в режиме онлайн '.format(fiscal_time, self.full_name))

            pid = self.sender.local_number

            # fiscal_error_code = self.sender.last_fiscal_error_code
            # fiscal_error_txt = self.sender.last_fiscal_error_txt

            adv = Stornos(
                department_id=self.id,
                user_id=shift.user_id,
                operation_time=operation_time,
                shift_id=shift.id,
                fiscal_time=fiscal_time,
                server_time=server_time,
                original_tax_id=tax_id,
                pid=pid,
                tax_id=storno_tax_id,
                fiscal_ticket=fiscal_ticket,
                fiscal_error_code=fiscal_error_code,
                fiscal_error_txt=fiscal_error_txt,
                testing=shift.testing,
                offline_fiscal_xml_signed=signed_xml,
                offline=offline,
                offline_tax_id=offline_tax_id,
                offline_session_id=shift.prro_offline_session_id
            )
            db.session.add(adv)

            check = Sales.query \
                .filter(Sales.tax_id == tax_id) \
                .first()
            if check:
                check.storno_time = fiscal_time
                check.storno_tax_id = storno_tax_id
            else:
                check = Incasses.query \
                    .filter(Incasses.tax_id == tax_id) \
                    .first()
                if check:
                    check.storno_time = fiscal_time
                    check.storno_tax_id = storno_tax_id
                else:
                    check = Podkreps.query \
                        .filter(Podkreps.tax_id == tax_id) \
                        .first()
                    if check:
                        check.storno_time = fiscal_time
                        check.storno_tax_id = storno_tax_id
                    else:
                        check = Advances.query \
                            .filter(Advances.tax_id == tax_id) \
                            .first()
                        if check:
                            check.storno_time = fiscal_time
                            check.storno_tax_id = storno_tax_id
                        else:
                            print("Не нашел чек с фискальным номером {}".format(tax_id))

            shift.prro_localnumber += 1  # = self.sender.local_number
            shift.prro_localchecknumber += 1  # = self.sender.local_check_number
            self.sender.local_number = shift.prro_localnumber

            db.session.commit()

            if offline:
                storno_tax_id = offline_tax_id

                check_visual = '{}'.format(shift.prro_org_name)
                if shift.prro_department_name:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_department_name)
                if shift.prro_address:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_address)
                if shift.prro_tn:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, shift.prro_tn)
                if shift.prro_ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, shift.prro_ipn)

                check_visual = '{}\r\n		{}'.format(check_visual, "Сторнування попереднього чека")
                check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")
                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, shift.prro_zn)
                check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, offline_tax_id, pid, "офлайн")
                if shift.cashier:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, shift.cashier)
                else:
                    check_visual = '{}\r\nКасир {}'.format(check_visual, self.prro_key.ceo_fio)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\nСторнується документ № {}'.format(check_visual, tax_id)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                if shift.prev_hash:
                    check_visual = '{}\r\nКонтрольне число:\r\n{}'.format(
                        check_visual, prev_hash)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))

            else:
                coded_string = self.sender.GetCheckExt(storno_tax_id, 3)

            qr = 'https://cabinet.tax.gov.ua/cashregs/check?id={}&fn={}&date={}'.format(
                storno_tax_id, self.rro_id, operation_time.strftime("%Y%m%d"))

            return storno_tax_id, shift, shift_opened, qr, coded_string, offline
        else:
            raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

    '''Отправим чек'''

    def prro_sale(self, reals, taxes, pays, sales_ret=False, orderretnum=None, key=None, testing=False, totals=None,
                  balance=0, doc_uid=None):

        shift, shift_opened = self.prro_open_shift(True, key=key, testing=testing)
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

            offline = shift.offline
            prev_hash = shift.prev_hash

            summa = 0
            discount = 0
            if reals:
                for real in reals:
                    summa += real['COST']
                    if 'DISCOUNTSUM' in real:
                        discount += real['DISCOUNTSUM']

            if not shift.offline:

                ret = self.sender.post_sale(summa, discount, reals, taxes, pays, operation_time, totals=totals,
                                            sales_ret=sales_ret, orderretnum=orderretnum, testing=shift.testing,
                                            doc_uid=doc_uid)
                if not ret:
                    if self.offline:
                        offline = True
                    else:
                        raise Exception('{}'.format(
                            "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                if ret == 9:
                    registrar_state = self.sender.TransactionsRegistrarState()
                    if registrar_state:
                        shift.prro_org_name = self.sender.org_name
                        shift.prro_department_name = self.sender.department_name
                        shift.prro_address = self.sender.address
                        shift.prro_tn = self.sender.tn
                        shift.prro_ipn = self.sender.ipn
                        shift.prro_entity = self.sender.entity
                        shift.prro_zn = self.sender.zn
                        db.session.commit()

                        ret = self.sender.post_sale(summa, discount, reals, taxes, pays, operation_time, totals=totals,
                                                    sales_ret=sales_ret, orderretnum=orderretnum, testing=shift.testing,
                                                    doc_uid=doc_uid)
                        if not ret:
                            if self.offline:
                                offline = True
                            else:
                                raise Exception('{}'.format(
                                    "Виникла помилка відправки документів - відсутній зв'язок з сервером податкової"))

                server_time = self.sender.server_time

            fiscal_error_code = self.sender.last_fiscal_error_code
            fiscal_error_txt = self.sender.last_fiscal_error_txt

            if offline:

                fiscal_time = operation_time

                if not shift.offline:
                    # переход в офлайн
                    self.sender.offline_local_number = 1
                    shift.prro_offline_local_number = 1
                    shift.offline = True

                    # Для офлайн нужно добавить номер, т.к. мы не знаем прошел чек или нет
                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number
                    self.sender.local_number = shift.prro_localnumber
                    self.sender.local_check_number = shift.prro_localchecknumber

                    xml, signed_xml, offline_tax_id = self.sender.to_offline(operation_time, testing=testing,
                                                                             revoke=False)

                    pid = self.sender.local_number
                    # tax_id = self.sender.last_ordertaxnum

                    off = OfflineChecks(
                        operation_type=1,
                        department_id=self.id,
                        user_id=shift.user_id,
                        operation_time=operation_time,
                        shift_id=shift.id,
                        fiscal_time=fiscal_time,
                        server_time=server_time,
                        pid=pid,
                        testing=shift.testing,
                        offline_fiscal_xml_signed=signed_xml,
                        offline_tax_id=offline_tax_id,
                        offline_session_id=shift.prro_offline_session_id
                    )
                    db.session.add(off)

                    shift.prro_localnumber += 1  # = self.sender.local_number
                    shift.prro_localchecknumber += 1  # = self.sender.local_check_number

                    shift.prro_offline_local_number += 1

                    self.sender.local_number += 1
                    self.sender.offline_local_number += 1
                    self.sender.local_check_number = shift.prro_localchecknumber

                else:
                    self.sender.offline_local_number = shift.prro_offline_local_number

                xml, signed_xml, offline_tax_id = self.sender.post_sale(summa,
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
                                                                        prev_hash=shift.prev_hash)

                self.sender.local_check_number = shift.prro_localchecknumber
                self.sender.last_ordernum = self.sender.local_number
                self.sender.last_ordertaxnum = 0

                shift.prro_offline_local_number += 1

                shift.prev_hash = sha256(xml).hexdigest()

                fiscal_ticket = None

                print('{}: {} сохранили чек продажи в режиме офлайн '.format(fiscal_time, self.full_name))
            else:
                fiscal_time = datetime.datetime.strptime(
                    '{} {}'.format(self.sender.last_taxorderdate, self.sender.last_taxordertime), '%d%m%Y %H%M%S')

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

                print('{}: {} сохранили чек продажи в режиме онлайн '.format(fiscal_time, self.full_name))

            pid = self.sender.local_number
            tax_id = self.sender.last_ordertaxnum

            sale = Sales(
                department_id=self.id,
                user_id=shift.user_id,
                operation_time=operation_time,
                shift_id=shift.id,
                fiscal_time=fiscal_time,
                server_time=server_time,
                sum=summa,
                pid=pid,
                tax_id=tax_id,
                fiscal_ticket=fiscal_ticket,
                fiscal_error_code=fiscal_error_code,
                fiscal_error_txt=fiscal_error_txt,
                testing=shift.testing,
                offline_fiscal_xml_signed=signed_xml,
                offline=offline,
                offline_tax_id=offline_tax_id,
                offline_session_id=shift.prro_offline_session_id,
                doc_uid=doc_uid
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

            shift.prro_localnumber += 1  # = self.sender.local_number
            shift.prro_localchecknumber += 1  # = self.sender.local_check_number
            self.sender.local_number = shift.prro_localnumber

            db.session.commit()

            if offline:
                tax_id = offline_tax_id

                check_visual = '{}'.format(shift.prro_org_name)
                if shift.prro_department_name:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_department_name)
                if shift.prro_address:
                    check_visual = '{}\r\n{}'.format(check_visual, shift.prro_address)
                if shift.prro_tn:
                    check_visual = '{}\r\n		ІД {}'.format(check_visual, shift.prro_tn)
                if shift.prro_ipn:
                    check_visual = '{}\r\n		ПН {}'.format(check_visual, shift.prro_ipn)

                if sales_ret:
                    check_visual = '{}\r\n		{}'.format(check_visual, "Видатковий чек (повернення)")

                check_visual = '{}\r\n		{}'.format(check_visual, "Касовий чек")

                check_visual = '{}\r\nПРРО  ФН {}         ВН {}'.format(check_visual, self.rro_id, shift.prro_zn)
                check_visual = '{}\r\nЧЕК   ФН {}      ВН {} {}'.format(check_visual, offline_tax_id, pid, "офлайн")
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

                check_visual = '{}----------------------------------------------------------------------\r\n'.format(
                    check_visual)
                if discount > 0:
                    check_visual = '{}ДИСКОНТ:                                           {:.2f}\r\n'.format(
                        check_visual, discount)
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
                            check_visual = '{}{}: {: <40s}{:.2f}\r\n'.format(check_visual, pay['PAYFORMNM'], "",
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

                # check_visual = '{}\r\nСУМА:                                            {:.2f}'.format(check_visual, summa)

                check_visual = '{}----------------------------------------------------------------------\r\n'.format(
                    check_visual)

                if shift.prev_hash:
                    check_visual = '{}Контрольне число:\r\n{}'.format(
                        check_visual, prev_hash)

                check_visual = '{}\r\n----------------------------------------------------------------------'.format(
                    check_visual)

                check_visual = '{}\r\n{}'.format(check_visual, operation_time.strftime("%d-%m-%Y %H:%M:%S"))

                check_visual = '{}\r\n		ФІСКАЛЬНИЙ ЧЕК'.format(check_visual)

                check_visual = '{}\r\n		ФСКО ЄВПЕЗ'.format(check_visual)

                check_visual = '{}\r\nДержавна податкова служба України'.format(check_visual)

                coded_string = base64.b64encode(check_visual.encode('UTF-8'))

            else:
                coded_string = self.sender.GetCheckExt(tax_id, 3)

            qr = 'https://cabinet.tax.gov.ua/cashregs/check?id={}&fn={}&date={}'.format(
                tax_id, self.rro_id, operation_time.strftime("%Y%m%d"))

            ret = {
                "tax_id": tax_id,
                "shift": shift,
                "shift_opened": shift_opened,
                "qr": qr,
                "tax_visual": coded_string,
                "offline": offline,
                "tax_id_advance": tax_id_advance,
                "qr_advance": qr_advance,
                "tax_visual_advance": visual_advance,
                "fiscal_ticket": base64.b64encode(self.sender.last_fiscal_ticket)
            }
            return ret
        else:
            raise Exception("Зміна не відкрита, зв'яжіться з тех.підтримкою")

    def prro_close_shift(self, shift):

        operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))

        ret = self.sender.close_shift(testing=shift.testing)

        # Если чек не отправился
        if not self.sender.server_time:
            # Переводим смену в псевдо-офлайн
            shift.p_offline = True

            self.sender.local_check_number = shift.prro_localchecknumber
            self.sender.last_ordernum = self.sender.local_number
            self.sender.last_ordertaxnum = 0
            # self.sender.local_number = shift.prro_localnumber + 1

            self.sender.last_fiscal_error_code = 1000
            self.sender.last_fiscal_error_txt = 'p_offline'

        else:
            if ret == 9:
                registrar_state = self.sender.TransactionsRegistrarState()
                if registrar_state:
                    shift.prro_org_name = self.sender.org_name
                    shift.prro_department_name = self.sender.department_name
                    shift.prro_address = self.sender.address
                    shift.prro_tn = self.sender.tn
                    shift.prro_ipn = self.sender.ipn
                    shift.prro_entity = self.sender.entity
                    shift.prro_zn = self.sender.zn
                    db.session.commit()

                    self.sender.close_shift(testing=shift.testing)
                    # Если чек не отправился
                    if not self.sender.server_time:
                        # Переводим смену в псевдо-офлайн
                        shift.p_offline = True

                        self.sender.local_check_number = shift.prro_localchecknumber
                        self.sender.last_ordernum = self.sender.local_number
                        self.sender.last_ordertaxnum = 0
                        # self.sender.local_number = shift.prro_localnumber + 1

                        self.sender.last_fiscal_error_code = 1000
                        self.sender.last_fiscal_error_txt = 'p_offline'

        if self.sender.server_time:
            fiscal_time = datetime.datetime.strptime(
                '{} {}'.format(self.sender.last_taxorderdate,
                               self.sender.last_taxordertime),
                '%d%m%Y %H%M%S')
            print('{}: {} закрыли смену в режиме онлайн '.format(operation_time, self.full_name))
        else:
            fiscal_time = datetime.datetime.now(tz.gettz(TIMEZONE))
            print('{}: {} закрыли смену в режиме псевдо-офлайн '.format(operation_time, self.full_name))

        operation_type = 0

        server_time = self.sender.server_time

        pid = self.sender.local_number
        tax_id = self.sender.last_ordertaxnum

        if self.sender.last_xml:
            xml = base64.b64encode(self.sender.last_xml).decode()
        else:
            xml = None

        if self.sender.last_fiscal_ticket:
            fiscal_ticket = base64.b64encode(
                self.sender.last_fiscal_ticket).decode()
        else:
            fiscal_ticket = None

        # xml = base64.b64encode(self.sender.last_xml).decode()
        # fiscal_ticket = base64.b64encode(
        #     self.sender.last_fiscal_ticket).decode()

        fiscal_error_code = self.sender.last_fiscal_error_code
        fiscal_error_txt = self.sender.last_fiscal_error_txt

        close_shift = Shifts(
            department_id=self.id,
            user_id=shift.user_id,
            operation_type=operation_type,
            operation_time=operation_time,
            fiscal_time=fiscal_time,
            server_time=server_time,
            pid=pid,
            tax_id=tax_id,
            xml=xml,
            fiscal_ticket=fiscal_ticket,
            fiscal_error_code=fiscal_error_code,
            fiscal_error_txt=fiscal_error_txt,
            prro_address=shift.prro_address,
            prro_org_name=shift.prro_org_name,
            prro_department_name=shift.prro_department_name,
            prro_tn=shift.prro_tn,
            prro_ipn=shift.prro_ipn,
            prro_entity=shift.prro_entity,
            prro_zn=shift.prro_zn,
            prro_localnumber=self.sender.local_number,
            prro_localchecknumber=self.sender.local_check_number,
            fiscal_shift_id=shift.fiscal_shift_id,
            prro_offline_seed=shift.prro_offline_seed,
            prro_offline_session_id=shift.prro_offline_session_id,
            shift_id=shift.id,
            testing=shift.testing,
            offline_session_id=shift.prro_offline_session_id
        )

        shift.prro_localnumber += 1  # = self.sender.local_number
        shift.prro_localchecknumber += 1  # = self.sender.local_check_number
        self.sender.local_number = shift.prro_localnumber

        db.session.add(close_shift)
        db.session.commit()

        return tax_id

    def prro_get_xz(self, send_z=False, key=None, testing=False, balance=0):

        last_shift = Shifts.query \
            .order_by(Shifts.operation_time.desc()) \
            .filter(Shifts.department_id == self.id) \
            .first()

        if last_shift:
            if last_shift.operation_type == 0:
                raise Exception('Зміна не відкрита. Вона автоматично відкривається при проведені першої операції!')

        shift, shift_opened = self.prro_open_shift(False, key=key, testing=testing)

        if shift:

            if shift.offline:
                '''
                {'UID': '43ada995-e8e5-483c-be33-d040c52ffbae', 'ShiftState': 1, 'ZRepPresent': False, 'Testing': False, 'Totals': {'Real': {'Sum': 13170.0, 'PwnSumIssued': 0.0, 'PwnSumReceived': 0.0, 'RndSum': 0.0, 'NoRndSum': 0.0, 'TotalCurrencySum': 0.0, 'TotalCurrencyCommission': 0.0, 'OrdersCount': 62, 'TotalCurrencyCost': 0, 'PayForm': [{'PayFormCode': 0, 'PayFormName': 'ГОТІВКА', 'Sum': 13170.0}], 'Tax': [{'Type': 0, 'Name': 'ПДВ 20%', 'Letter': 'A', 'Prc': 20.0, 'Sign': False, 'Turnover': 17500.0, 'TurnoverDiscount': 0.0, 'SourceSum': 12370.0, 'Sum': 2474.0}, {'Type': 3, 'Name': 'ПДВ 0%', 'Letter': 'Б', 'Prc': 0.0, 'Sign': False, 'Turnover': 800.0, 'TurnoverDiscount': 0.0, 'SourceSum': 800.0, 'Sum': 0.0}]}, 'Ret': {'Sum': 840.0, 'PwnSumIssued': 0.0, 'PwnSumReceived': 0.0, 'RndSum': 0.0, 'NoRndSum': 0.0, 'TotalCurrencySum': 0.0, 'TotalCurrencyCommission': 0.0, 'OrdersCount': 4, 'TotalCurrencyCost': 0, 'PayForm': [{'PayFormCode': 0, 'PayFormName': 'ГОТІВКА', 'Sum': 840.0}], 'Tax': [{'Type': 0, 'Name': 'ПДВ', 'Letter': 'A', 'Prc': 20.0, 'Sign': False, 'Turnover': 1200.0, 'TurnoverDiscount': 0.0, 'SourceSum': 840.0, 'Sum': 168.0}]}, 'Cash': None, 'Currency': None, 'ServiceInput': 9000.0, 'ServiceOutput': 3000.0}}
                '''
                raise Exception('Зміну не можна закрити в режимі офлайн!')

            if balance > 0:
                tax_id_inkass, shift_inkass, shift_opened_inkass, qr_inkass, visual_inkass, offline_inkass, tax_id_advance, qr_advance, visual_advance = self.prro_inkass(
                    balance, key=key, testing=testing)
            else:
                qr_inkass = None
                visual_inkass = None
                tax_id_inkass = None

            operation_time = datetime.datetime.now(tz.gettz(TIMEZONE))

            # if shift.p_offline:
            #     x_data = self.prro_get_x_data_base(shift)
            # else:
            x_data = self.sender.LastShiftTotals()

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

                    return x_data, None, None

                # x_data = self.prro_get_x_data_base(shift)
            # else:
            #     raise Exception('Поточний звіт недоступний!')

            z_number = 0

            if 'Totals' in x_data:
                # totals = x_data['Totals']
                #
                # if totals:
                #
                #     currency_list = x_data['Totals']['Currency']
                #     #
                #     # """
                #     # {'TotalInAdvance': 1000.0, 'TotalInAttach': 0.0, 'TotalSurrCollection': 0.0, 'Commission': 0.0, 'CalcDocsCnt': 6, 'AcceptedN': 0.0, 'IssuedN': 0.0, 'CommissionN': 0.0, 'TransfersCnt': 0, 'Details': [{'ValCd': 840, 'ValSymCd': 'USD', 'BuyValI': 3.0, 'SellValI': 0.0, 'BuyValN': 0.0, 'SellValN': 84.0, 'StorBuyValI': 3.0, 'StorSellValI': 0.0, 'StorBuyValN': 0.0, 'StorSellValN': 84.0, 'CInValI': 0.0, 'COutValI': 0.0, 'Commission': 0.0, 'InAdvance': 1000.0, 'InAttach': 0.0, 'SurrCollection': 0.0, 'StorCInValI': 0.0, 'StorCOutValI': 0.0, 'StorCommission': 0.0}]}, 'ServiceInput': 0.0, 'ServiceOutput': 0.0}}
                #     # """
                #     if currency_list:
                #     #
                #     #     fn = self.sender.rro_fn
                #     #     zn = self.sender.zn
                #     #     fsn = 'АСУ «О.С.А.»'
                #     #     tn = self.sender.tn
                #     #
                #     #     pid = 0
                #     #     qr = ''
                #     #
                #     #     #   <!--Кількість розрахункових документів за зміну (числовий)-->
                #         op_cnt = currency_list['CalcDocsCnt']  # CalcDocsCnt
                #     #
                #     #     # print(base_docs_cnt)
                #     #     # print(op_cnt)
                #     #     # if send_z:
                #     #     #     if op_cnt != base_docs_cnt:
                #     #     #         raise Exception(
                #     #     #             'Z-звіт неможливо сформувати! Кількість операцій не збігається! Зателефонуйте або напишіть у чат тех. підтримки ФК!')
                #     #
                #     #     #   <!--Отримано підкріплень національною валютою (15.2 цифри)-->
                #     #     sum_reinf = currency_list['TotalInAttach']
                #     #
                #     #     #   <!--Здано по інкасації національною валютою (15.2 цифри)-->
                #     #     sum_collect = currency_list['TotalSurrCollection']
                #     #
                #     #     #   <!--Отримано авансів національною валютою (15.2 цифри)-->
                #     #     sum_adv = currency_list['TotalInAdvance']
                #     #
                #     #     z_report = ZReports(
                #     #         operation_time=operation_time,
                #     #         department_id=self.id,
                #     #         operator_id=shift.user_id,
                #     #         rro_type=self.rro_type,
                #     #         rro_id=self.rro_id,
                #     #         z_number=z_number,
                #     #         fn=fn,
                #     #         zn=zn,
                #     #         fsn=fsn,
                #     #         tn=tn,
                #     #         pid=pid,
                #     #         qr=qr,
                #     #         fiscal_time=operation_time,
                #     #         op_cnt=op_cnt,
                #     #         sum_reinf=sum_reinf,
                #     #         sum_collect=sum_collect,
                #     #         sum_adv=sum_adv,
                #     #         printed=printed
                #     #     )
                #     #     db.session.add(z_report)
                #     #
                #     #     details = currency_list['Details']
                #     #
                #     #     '''
                #     #     [{'ValCd': 840, 'ValSymCd': 'USD', 'BuyValI': 3.0, 'SellValI': 0.0, 'BuyValN': 0.0, 'SellValN': 84.0, 'StorBuyValI': 3.0, 'StorSellValI': 0.0, 'StorBuyValN': 0.0, 'StorSellValN': 84.0, 'CInValI': 0.0, 'COutValI': 0.0, 'Commission': 0.0, 'InAdvance': 1000.0, 'InAttach': 0.0, 'SurrCollection': 0.0, 'StorCInValI': 0.0, 'StorCOutValI': 0.0, 'StorCommission': 0.0}]}
                #     #     '''
                #     #     if details:
                #     #         for detail in details:
                #     #             currency = Currencies.query.filter(
                #     #                 Currencies.numcode == detail['ValCd']).first()
                #     #
                #     #             nbu_rate = NBURates.query.filter(
                #     #                 NBURates.rates_time == startOperDate(operation_time)).filter(
                #     #                 NBURates.currency == currency).first()
                #     #
                #     #             z_report_currency = ZReportsCurrency(
                #     #                 z_report_id=z_report.id,
                #     #                 currency_id=currency.id,
                #     #                 nbu_rate=nbu_rate.rate,
                #     #                 advance=detail['InAdvance'],
                #     #                 bought=detail['BuyValI'],
                #     #                 bought_equivalent=detail['SellValN'],
                #     #                 sold=detail['SellValI'],
                #     #                 sold_equivalent=detail['BuyValN'],
                #     #                 bought_storno=detail['StorBuyValI'],
                #     #                 bought_storno_equivalent=detail['StorSellValN'],
                #     #                 sold_storno=detail['StorSellValI'],
                #     #                 sold_storno_equivalent=detail['StorBuyValN'],
                #     #                 reinforced=detail['InAttach'],
                #     #                 collected=detail['SurrCollection']
                #     #             )
                #     #             db.session.add(z_report_currency)
                #     # else:
                #     #     raise Exception('Поточний звіт недоступний!')
                # # else:
                # #     raise Exception('Поточний звіт недоступний!')
                #
                # else:
                #
                #     # if send_z:
                #     #     if base_docs_cnt > 0:
                #     #         raise Exception(
                #     #             'Z-звіт неможливо сформувати! Кількість операцій не збігається! Зателефонуйте або напишіть у чат тех. підтримки ФК!')

                fn = self.sender.rro_fn
                zn = self.sender.zn
                fsn = ''
                tn = self.sender.tn

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

                z_report = ZReports(
                    operation_time=operation_time,
                    department_id=self.id,
                    operator_id=shift.user_id,
                    rro_type="prro",
                    rro_id=self.rro_id,
                    z_number=z_number,
                    fn=fn,
                    zn=zn,
                    fsn=fsn,
                    tn=tn,
                    pid=pid,
                    qr=qr,
                    fiscal_time=operation_time,
                    op_cnt=op_cnt,
                    sum_reinf=sum_reinf,
                    sum_collect=sum_collect,
                    sum_adv=sum_adv,
                    testing=shift.testing,
                    offline_session_id=shift.prro_offline_session_id
                )
                db.session.add(z_report)

            if send_z:

                server_time = None

                last_z_report = ZReports.query.with_entities(ZReports.z_number) \
                    .order_by(ZReports.operation_time.desc()) \
                    .filter(ZReports.operation_time != None) \
                    .filter(ZReports.pid > 0) \
                    .filter(ZReports.rro_type == "prro") \
                    .filter(ZReports.department_id == self.id) \
                    .first()

                if last_z_report:
                    z_number = last_z_report.z_number + 1
                else:
                    z_number = 1

                self.sender.local_check_number = shift.prro_localchecknumber
                self.sender.local_number = shift.prro_localnumber

                response = self.sender.post_z(x_data, testing=shift.testing)
                # Если чек не отправился
                if not self.sender.server_time:
                    # Переводим смену в псевдо-офлайн
                    shift.p_offline = True
                else:
                    server_time = self.sender.server_time

                if not server_time:

                    self.sender.local_check_number = shift.prro_localchecknumber
                    self.sender.last_ordernum = self.sender.local_number
                    self.sender.last_ordertaxnum = 0
                    # self.sender.local_number = shift.prro_localnumber + 1

                    self.sender.last_fiscal_error_code = 1000
                    self.sender.last_fiscal_error_txt = 'p_offline'
                else:

                    if response == 9:
                        registrar_state = self.sender.TransactionsRegistrarState()
                        if registrar_state:
                            shift.prro_org_name = self.sender.org_name
                            shift.prro_department_name = self.sender.department_name
                            shift.prro_address = self.sender.address
                            shift.prro_tn = self.sender.tn
                            shift.prro_ipn = self.sender.ipn
                            shift.prro_entity = self.sender.entity
                            shift.prro_zn = self.sender.zn
                            db.session.commit()

                            response = self.sender.post_z(x_data, testing=shift.testing)

                            # Если чек не отправился
                            if not self.sender.server_time:
                                # Переводим смену в псевдо-офлайн
                                shift.p_offline = True

                                self.sender.local_check_number = shift.prro_localchecknumber
                                self.sender.last_ordernum = self.sender.local_number
                                self.sender.last_ordertaxnum = 0
                                # self.sender.local_number = shift.prro_localnumber + 1

                                self.sender.last_fiscal_error_code = 1000
                                self.sender.last_fiscal_error_txt = 'p_offline'

                if self.sender.server_time:
                    fiscal_time = datetime.datetime.strptime(
                        '{} {}'.format(self.sender.last_taxorderdate,
                                       self.sender.last_taxordertime),
                        '%d%m%Y %H%M%S')
                    print('{}: {} отправили Z отчет в режиме онлайн'.format(operation_time, self.full_name))
                else:
                    fiscal_time = datetime.datetime.now(tz.gettz(TIMEZONE))
                    print('{}: {} отправили Z отчет в режиме псевдо-офлайн'.format(operation_time, self.full_name))

                z_report.fiscal_time = fiscal_time
                z_report.z_number = z_number
                z_report.pid = self.sender.local_number
                z_report.tax_id = self.sender.last_ordertaxnum
                z_report.shift_id = shift.id

                z_report.server_time = self.sender.server_time

                if self.sender.last_xml:
                    z_report.xml = base64.b64encode(self.sender.last_xml).decode()

                if self.sender.last_fiscal_ticket:
                    z_report.fiscal_ticket = base64.b64encode(
                        self.sender.last_fiscal_ticket).decode()

                if self.sender.last_fiscal_error_code:
                    z_report.fiscal_error_code = self.sender.last_fiscal_error_code

                if self.sender.last_fiscal_error_txt:
                    z_report.fiscal_error_txt = self.sender.last_fiscal_error_txt

                shift.prro_localnumber += 1  # = self.sender.local_number
                shift.prro_localchecknumber += 1  # = self.sender.local_check_number
                self.sender.local_number = shift.prro_localnumber

                db.session.commit()

                close_shift_tax_id = self.prro_close_shift(shift)

                z_visual_data = self.sender.GetZReportEx(self.rro_id, z_report.tax_id, 3)

                return x_data, z_report.tax_id, close_shift_tax_id, z_visual_data, tax_id_inkass, qr_inkass, visual_inkass
            else:
                return x_data, None, None, None, None, None, None
            # if send_z:
            #     raise Exception(
            #         'Неможливо зробити Z-звіт. Робота йде у автономному режимі, спробуйте пізніше або роздрукуєте його копію наступного дня!')
            # else:
            #     raise Exception('Неможливо зробити Х-звіт. Робота йде у автономному режимі, спробуйте пізніше.')

        else:
            raise Exception('Зміна не відкрита. Вона автоматично відкривається при проведені першої операції.')


class DepartmentKeys(Base):
    '''Справочник ключей ЭЦП подразделений'''
    __tablename__ = 'department_keys'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    # department_id = Column(Integer, ForeignKey('departments.id'), comment='Отделение', nullable=True)

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

    key_role_tax_form = Column('key_role_tax_form', String(10), comment='Роль ключа для підписання податкових форм', nullable=True)

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
                    try:
                        # print(box_id)
                        infos = signer.info(box_id)
                        if not infos[0]:
                            if not b'privatbank' in self.key_data:
                                # print(self.key_data)
                                box_id = signer.update_bid(db, self)

                                urls = [
                                    'http://acskidd.gov.ua/services/cmp/',
                                    'http://uakey.com.ua/services/cmp/',
                                    'http://masterkey.ua/services/cmp/',
                                    'http://ca.informjust.ua/services/cmp/',
                                    # 'http://ca.oschadbank.ua/public/cmp/',
                                    # 'http://ca.csd.ua/public/x509/cmp/',
                                    # 'http://ca.gp.gov.ua/cmp/'
                                ]

                                try:
                                    certs = signer.cert_fetch(box_id, urls)

                                    if certs == 0:
                                        return False, 'Не вдалося автоматично отримати сертифікати з АЦСК', None
                                except Exception as e:
                                    return False, 'Не вдалося автоматично отримати сертифікати з АЦСК'.format(e), None

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
                                                    self.encrypt_content = unpacked_key['contents']

            # self.key_role = None
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

            self.key_password = ''
            self.key_data = None
            self.cert1_data = None
            self.cert2_data = None

            return True, 'Дані успішно зчитані з ключа та оновлені!', self.public_key

        else:
            return False, 'Немає інформації для оновлення!', None


class Shifts(Base):
    '''Таблица данных о сменах'''
    __tablename__ = 'shifts'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Отделение')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Пользователь')

    operation_type = Column('operation_type', SmallInteger,
                            comment='Тип операции: 1- открытие смены, 0 - закрытие смены', nullable=False)

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Время совершения операции')

    fiscal_time = Column('fiscal_time', DateTime, comment='Время принятия фискальным сервером (для пРРО)', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Время отправки на фискальный сервер (для пРРО)',
                         default=None, nullable=True)

    pid = Column('pid', Integer, comment='Локальный номер чека', nullable=True)

    fiscal_shift_id = Column('fiscal_shift_id', Integer, comment='Фискальный номер смены', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фискальный номер чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовое содержимое отправляемого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовое содержимое чека как его видит налоговая',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовое содержимое ответа налоговой',
                           nullable=True)

    fiscal_error_code = Column('fiscal_error_code', Integer, comment='Код ошибки', nullable=True)

    fiscal_error_txt = Column('fiscal_error_txt', TEXT, comment='Текст ошибки', nullable=True)

    prro_org_name = Column('prro_org_name', String(256), comment='Найменування продавця (256 символів)', nullable=True)

    prro_department_name = Column('prro_department_name', String(256),
                                  comment='Найменування точки продаж (256 символів)', nullable=True)

    prro_address = Column('prro_address', String(256), comment='Адреса точки продаж (256 символів)', nullable=True)

    prro_tn = Column('prro_tn', String(10), comment='ЄДРПОУ/ДРФО/№ паспорта продавця (10 символів)', nullable=True)

    prro_ipn = Column('prro_ipn', String(12),
                      comment='Податковий номер або Індивідуальний номер платника ПДВ (12 символів)', nullable=True)

    prro_entity = Column('prro_entity', String(10), comment='Ідентифікатор запису ГО', nullable=True)

    prro_zn = Column('prro_zn', String(64), comment='Локальний номер реєстратора розрахункових операцій (64 символи)',
                     nullable=True)

    prro_localnumber = Column('prro_localnumber', Integer, comment='Локальний номер документа', nullable=True)

    prro_localchecknumber = Column('prro_localchecknumber', Integer, comment='Локальний номер документа', nullable=True)

    prro_offline_session_id = Column('prro_offline_session_id', String(128), comment='Ідентифікатор офлайн сесії',
                                     nullable=True)

    prro_offline_seed = Column('prro_offline_seed', String(128),
                               comment='Секретне число для обчислення фіскального номера офлайн документа',
                               nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Отделение находится в режиме офлайн')

    p_offline = Column('p_offline', Boolean, nullable=True, comment='Отделение находится в режиме эмуляции офлайн')

    shift_id = Column("shift_id", Integer, comment='Идентификатор смены', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    cashier = Column('cashier', String(128), nullable=True, comment='ПИБ Касира')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фискальный номер чека офлайн', nullable=True)

    prro_offline_local_number = Column('prro_offline_local_number', Integer,
                                       comment='Локальний номер офлайн документа', nullable=True)

    prev_hash = Column('prev_hash', String(64), comment='Хэш предыдущего офлайн документа', nullable=True)

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)


class OfflineChecks(Base):
    '''Таблица данных о чеках открытия / закрытия офлайн режима'''
    __tablename__ = 'offline_checks'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Отделение')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Пользователь')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Время совершения операции')

    operation_type = Column('operation_type', SmallInteger,
                            comment='Тип операции: 1- открытие офлайн, 0 - закрытие офлайн', nullable=False)

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Идентификатор смены', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Время принятия фискальным сервером (для пРРО)', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Время отправки на фискальный сервер (для пРРО)',
                         default=None, nullable=True)

    pid = Column('pid', Integer, comment='Локальный номер чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовое содержимое отправляемого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовое содержимое чека как его видит налоговая',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовое содержимое ответа налоговой',
                           nullable=True)

    fiscal_error_code = Column('fiscal_error_code', Integer, comment='Код ошибки', nullable=True)

    fiscal_error_txt = Column('fiscal_error_txt', TEXT, comment='Текст ошибки', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фискальный номер чека офлайн', nullable=True)

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)


class Advances(Base):
    '''Таблица данных о полученных авансах'''
    __tablename__ = 'advances'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Отделение')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Пользователь')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Время совершения операции')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Идентификатор смены', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Время принятия фискальным сервером (для пРРО)', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Время отправки на фискальный сервер (для пРРО)',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    pid = Column('pid', Integer, comment='Локальный номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фискальный номер чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовое содержимое отправляемого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовое содержимое чека как его видит налоговая',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовое содержимое ответа налоговой',
                           nullable=True)

    fiscal_error_code = Column('fiscal_error_code', Integer, comment='Код ошибки', nullable=True)

    fiscal_error_txt = Column('fiscal_error_txt', TEXT, comment='Текст ошибки', nullable=True)

    storno_time = Column('storno_time', DateTime, comment='Время сторно', default=None,
                         nullable=True)

    storno_tax_id = Column('storno_tax_id', Integer, comment='Фискальный номер чека сторно', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фискальный номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)


class Podkreps(Base):
    '''Таблица данных о подкреплениях'''
    __tablename__ = 'podkreps'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Отделение')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Пользователь')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Время совершения операции')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Идентификатор смены', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Время принятия фискальным сервером (для пРРО)', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Время отправки на фискальный сервер (для пРРО)',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    pid = Column('pid', Integer, comment='Локальный номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фискальный номер чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовое содержимое отправляемого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовое содержимое чека как его видит налоговая',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовое содержимое ответа налоговой',
                           nullable=True)

    fiscal_error_code = Column('fiscal_error_code', Integer, comment='Код ошибки', nullable=True)

    fiscal_error_txt = Column('fiscal_error_txt', TEXT, comment='Текст ошибки', nullable=True)

    storno_time = Column('storno_time', DateTime, comment='Время сторно', default=None,
                         nullable=True)

    storno_tax_id = Column('storno_tax_id', Integer, comment='Фискальный номер чека сторно', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фискальный номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)


class Incasses(Base):
    '''Таблица данных об инкассациях'''
    __tablename__ = 'inkasses'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Отделение')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Пользователь')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Время совершения операции')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Идентификатор смены', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Время принятия фискальным сервером (для пРРО)', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Время отправки на фискальный сервер (для пРРО)',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    pid = Column('pid', Integer, comment='Локальный номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фискальный номер чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовое содержимое отправляемого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовое содержимое чека как его видит налоговая',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовое содержимое ответа налоговой',
                           nullable=True)

    fiscal_error_code = Column('fiscal_error_code', Integer, comment='Код ошибки', nullable=True)

    fiscal_error_txt = Column('fiscal_error_txt', TEXT, comment='Текст ошибки', nullable=True)

    storno_time = Column('storno_time', DateTime, comment='Время сторно', default=None,
                         nullable=True)

    storno_tax_id = Column('storno_tax_id', Integer, comment='Фискальный номер чека сторно', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фискальный номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)


class Stornos(Base):
    '''Таблица данных о чеках сторно'''
    __tablename__ = 'stornos'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Отделение')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Пользователь')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Время совершения операции')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Идентификатор смены', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Время принятия фискальным сервером (для пРРО)', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Время отправки на фискальный сервер (для пРРО)',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    pid = Column('pid', Integer, comment='Локальный номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фискальный номер чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовое содержимое отправляемого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовое содержимое чека как его видит налоговая',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовое содержимое ответа налоговой',
                           nullable=True)

    fiscal_error_code = Column('fiscal_error_code', Integer, comment='Код ошибки', nullable=True)

    fiscal_error_txt = Column('fiscal_error_txt', TEXT, comment='Текст ошибки', nullable=True)

    # storno_time = Column('storno_time', DateTime, comment='Время сторно', default=None,
    #                      nullable=True)

    original_tax_id = Column('original_tax_id', String(32), comment='Фискальный номер сторнируемого чека',
                             nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фискальный номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)


class Sales(Base):
    '''Таблица данных о розничных продажах'''
    __tablename__ = 'sales'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, comment='Iдентифікатор')

    department_id = Column(Integer, ForeignKey('departments.id'), comment='Отделение')

    user_id = Column(Integer, ForeignKey("users.id"), comment='Пользователь')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Время совершения операции')

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Идентификатор смены', nullable=True)

    fiscal_time = Column('fiscal_time', DateTime, comment='Время принятия фискальным сервером (для пРРО)', default=None,
                         nullable=True)

    server_time = Column('server_time', DateTime, comment='Время отправки на фискальный сервер (для пРРО)',
                         default=None, nullable=True)

    sum = Column('sum', Numeric(precision=20, scale=2),
                 comment='Сумма')

    ret = Column('ret', Boolean, comment='Признак возврата', nullable=True, default=False)

    orderretnum = Column('orderretnum', Integer, comment='Фискальный номер чека возврата', nullable=True, default=None)

    pid = Column('pid', Integer, comment='Локальный номер чека', nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фискальный номер чека', nullable=True)

    xml = Column('xml', TEXT, default=None, comment='Текстовое содержимое отправляемого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовое содержимое чека как его видит налоговая',
                        nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовое содержимое ответа налоговой',
                           nullable=True)

    fiscal_error_code = Column('fiscal_error_code', Integer, comment='Код ошибки', nullable=True)

    fiscal_error_txt = Column('fiscal_error_txt', TEXT, comment='Текст ошибки', nullable=True)

    storno_time = Column('storno_time', DateTime, comment='Время сторно', default=None,
                         nullable=True)

    storno_tax_id = Column('storno_tax_id', Integer, comment='Фискальный номер чека сторно', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фискальный номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    doc_uid = Column('doc_uid', String(36), comment='UID', nullable=True)


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


class ZReports(Base):
    ''' Таблица фискальных данных Z отчетов '''
    __tablename__ = 'z_reports'
    __table_args__ = {"comment": __doc__}

    id = Column('id', Integer, primary_key=True, autoincrement=True, comment='Идентификатор')

    department_id = Column("department_id", Integer, ForeignKey("departments.id"), comment='Идентификатор отделения')

    operator_id = Column('operator_id', Integer, ForeignKey("users.id"), comment='Идентификатор оператора')

    operation_time = Column('operation_time', DateTime, default=datetime.datetime.now,
                            comment='Время совершения операции')

    rro_type = Column('rro_type', String(4), comment='Тип РРО, що зараз використовується(rro, rkks, prro, none)')

    rro_id = Column('rro_id', String(16), default=None, comment='Идентификатор РРО привязанного до отделения')

    z_number = Column('z_number', Integer, comment='Номер Z отчета')

    fn = Column('fn', String(10), comment='Фискальный номер регистратора')

    zn = Column('zn', String(64), comment='Заводской номер регистратора')

    fsn = Column('fsn', String(16), comment='Версия программы эквайера')

    tn = Column('tn', String(16), comment='Налоговый номер (EDRPOU)')

    pid = Column('pid', Integer, comment='Фискальный номер чека')

    qr = Column('qr', String(100), comment='Содержимое QR кода чека')

    fiscal_time = Column('fiscal_time', DateTime, comment='Фискальное время чека')

    op_cnt = Column('op_cnt', Integer, comment='Количество операций в чеке')

    sum_reinf = Column('sum_reinf', Numeric(precision=20, scale=2),
                       comment='Сумма подкреплений')

    sum_collect = Column('sum_collect', Numeric(precision=20, scale=2),
                         comment='Сумма инкассаций')

    sum_adv = Column('sum_adv', Numeric(precision=20, scale=2),
                     comment='Сумма авансов')

    xml = Column('xml', TEXT, default=None, comment='Текстовое содержимое отправляемого чека', nullable=True)

    fiscal_xml = Column('fiscal_xml', TEXT, default=None, comment='Текстовое содержимое чека как его видит налоговая',
                        nullable=True)

    server_time = Column('server_time', DateTime, comment='Время отправки на фискальный сервер (для пРРО)',
                         default=None, nullable=True)

    tax_id = Column('tax_id', Integer, comment='Фискальный номер чека', nullable=True)

    fiscal_ticket = Column('fiscal_ticket', TEXT, default=None, comment='Текстовое содержимое ответа налоговой',
                           nullable=True)

    fiscal_error_code = Column('fiscal_error_code', Integer, comment='Код ошибки', nullable=True)

    fiscal_error_txt = Column('fiscal_error_txt', TEXT, comment='Текст ошибки', nullable=True)

    shift_id = Column("shift_id", Integer, ForeignKey("shifts.id"), comment='Идентификатор смены', nullable=True)

    printed = Column('printed', Integer, comment='Напечатано, количество раз', nullable=True)

    testing = Column('testing', Boolean, nullable=True, comment='Ознака тестового нефіскального документа')

    offline_fiscal_xml_signed = Column('offline_fiscal_xml_signed', LargeBinary, default=None,
                                       comment='Вміст файлу XML з сертифікатом підпису', nullable=True)

    offline_check = Column('offline_check', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_tax_id = Column('offline_tax_id', String(32), comment='Фискальный номер чека офлайн', nullable=True)

    offline = Column('offline', Boolean, nullable=True, comment='Чек сохранен в режиме офлайн')

    offline_session_id = Column('offline_session_id', Integer, comment='Ідентифікатор офлайн сесії поточного чеку',
                                nullable=True)

    def __str__(self):
        return self.z_number

# ===================================
#       INDEXES & CONSTRAINS
# ===================================
