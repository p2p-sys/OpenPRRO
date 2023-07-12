import os

from flask_admin import Admin, BaseView, expose
from flask_wtf import FlaskForm

from flask import redirect, url_for, request, flash

from flask_admin.contrib.sqla import ModelView
from flask_admin.actions import action
from flask_admin.babel import lazy_gettext
from flask_admin.contrib.sqla import tools as sqla_tools
from sqlalchemy import func

from models import *
from utils.taxforms import TaxForms

from .translations import TRANSLATIONS

from wtforms import validators, PasswordField, StringField, ValidationError, FileField


class Filters():
    page_size = 50
    can_view_details = True
    column_labels = TRANSLATIONS

    dep_id_column_name = 'id'
    required_permissions = []

    def is_accessible(self):
        is_curator = not current_user.is_anonymous and current_user.role and current_user.is_permissions(8)
        is_admin = current_user.is_permissions(9)

        user_abilities = {x.name for x in current_user.role.permissions} if hasattr(current_user, 'role') else set([])
        has_required_permissions = (set(self.required_permissions) - user_abilities) == set([])

        return all([is_admin, is_curator, has_required_permissions])

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login.auth', next=request.url))


class adminOnly():
    page_size = 50
    can_view_details = True
    column_labels = TRANSLATIONS

    def is_accessible(self):
        try:
            is_admin = not current_user.is_anonymous and current_user.role and current_user.is_permissions(9)
            return is_admin
        except AttributeError:
            return False

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login.auth', next=request.url))


class RolesAdmin(adminOnly, ModelView):
    def __init__(self, session, name=None, **kwargs):
        super(RolesAdmin, self).__init__(Roles, session, name=name, **kwargs)

    form_excluded_columns = ('users')

    form_args = dict(
        permissions=dict(label='Доступи', validators=[]),
        name=dict(label='Назва ролі', validators=[validators.DataRequired()])
    )

    def is_accessible(self):
        if not current_user.is_anonymous and current_user.is_permissions(10):
            self.can_create = True
            self.can_edit = True
            self.can_delete = False
            return True
        else:
            return False

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login.auth', next=request.url))


class PermissionAdmin(adminOnly, ModelView):
    def __init__(self, session, name=None, **kwargs):
        super(PermissionAdmin, self).__init__(Permission, session, name=name, **kwargs)

    def is_accessible(self):
        if not current_user.is_anonymous and current_user.is_permissions(10):
            self.can_create = True
            self.can_edit = True
            self.can_delete = True
            return True
        else:
            return False

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login.auth', next=request.url))


class UsersAdmin(Filters, ModelView):
    form_base_class = FlaskForm

    def __init__(self, session, name=None, **kwargs):
        super(UsersAdmin, self).__init__(Users, session, name=name, **kwargs)

    column_display_pk = True

    column_list = ['id', 'login', 'role']

    column_filters = ('login',)
    can_delete = True  # disable model deletion
    can_create = True
    can_edit = True
    can_view_details = True

    column_searchable_list = ['login']
    column_sortable_list = ('login', 'id')
    edit_template = 'custom-edit.html'

    create_modal = False
    edit_modal = True

    form_excluded_columns = (
        'password_hash', 'actions', 'login', 'created', 'deactivated', 'last_login')

    def unique_login(form, field):
        if Users.query.filter(Users.login == form.login.data).count() > 1:
            raise ValidationError('Login is not unique')

    def get_next_login():
        last_entry = Users.query.order_by(Users.id.desc()).limit(1).one()
        last_login = last_entry.login
        head = last_login.rstrip('0123456789')
        try:
            last_num = int(last_login[len(head):]) + 1
        except:
            last_num = 0
        # new_login = 'user' + str(last_entry.id) if last_entry else 'user0'
        return head + str(last_num)

    form_args = dict(
        last_login=dict(label='Останній вхід', validators=[]),
        # login=dict(label='ІНН', validators=[validators.DataRequired()], default=get_next_login),
    )
    form_extra_fields = {
        'login': StringField('Логін', validators=[validators.DataRequired(), unique_login], default=get_next_login),
        # should be here to allow update on same login
        'password': PasswordField('Пароль', validators=[], render_kw={'placeholder': '********'}, default=123)}

    def on_model_change(self, form, model, is_created=None):
        if hasattr(form, 'password') and form.password.data not in [None, '', '********']:
            model.set_password(form.password.data)
        if is_created and Users.query.filter(Users.login == form.login.data).count() > 1:
            self.session.rollback()
            raise ValidationError('Login is not unique')

    def create_form(self):
        form = super(UsersAdmin, self).create_form()
        return form

    def get_query(self):
        return self.session.query(self.model)

    def get_count_query(self):
        return self.session.query(func.count(Users.id)).select_from(self.model)

    def is_accessible(self):
        if not current_user.is_anonymous and current_user.is_permissions(10):
            self.can_create = True
            self.can_edit = True
            self.can_delete = True
            return True
        else:
            return False

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login.auth', next=request.url))


class DepartmentsAdmin(Filters, ModelView):
    def __init__(self, session, name=None, **kwargs):
        super(DepartmentsAdmin, self).__init__(Departments, session, name=name, **kwargs)

    page_size = 100

    list_row_actions = []

    form_base_class = FlaskForm

    can_view_details = True

    column_filters = (
        'id', 'full_name', 'rro_id', 'taxform_key', 'prro_key', 'signer_type', 'key_tax_registered', 'offline')

    column_list = ['id', 'full_name', 'rro_id', 'taxform_key', 'prro_key', 'signer_type', 'key_tax_registered',
                   'offline']

    column_sortable_list = ('id', 'full_name', 'rro_id', 'signer_type', 'key_tax_registered', 'offline')

    column_searchable_list = ['id', 'full_name', 'rro_id', 'signer_type', 'key_tax_registered']

    form_columns = ('full_name', 'rro_id', 'taxform_key', 'prro_key', 'signer_type', 'offline')

    form_excluded_columns = ('key_tax_registered')

    column_exclude_list = form_excluded_columns

    column_details_exclude_list = form_excluded_columns

    column_export_exclude_list = form_excluded_columns

    column_default_sort = [('id', False)]

    column_editable_list = ['full_name']

    form_choices = {
        'signer_type': [
            ('Касир', 'Касир'),
            ('Старший касир', 'Старший касир'),
            ('Припинення роботи', 'Припинення роботи'),
            (None, 'Не вказано'),
        ],
        'offline': [
            (0, 'Відключений'),
            (1, 'Включений')
        ]
    }

    _signer_type_choices = [(choice, label) for choice, label in [
        ('Касир', 'Касир'),
        ('Старший касир', 'Старший касир'),
        ('Припинення роботи', 'Припинення роботи'),
        ('None', 'Не вказано'),
        (None, 'Не вказано'),
    ]]

    _offline_choices = [(choice, label) for choice, label in [
        (0, 'Відключений'),
        (1, 'Включений')
    ]]

    column_choices = {'signer_type': _signer_type_choices,
                      'offline': _offline_choices}

    def is_accessible(self):
        if not current_user.is_anonymous and current_user.is_permissions(10):
            self.can_create = True
            self.can_edit = True
            self.can_delete = True
            return True
        else:
            return False

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login.auth', next=request.url))

    def get_query(self):
        return self.session.query(self.model)

    def get_count_query(self):
        return self.session.query(func.count('*')).select_from(self.model)

    @action('set_signer_type',
            lazy_gettext('Оновити тип підпису ключів'),
            lazy_gettext(
                'Ви впевнені, що хочете оновити тип підпису ключів?'))
    def set_signer_type(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)

            for department in query.all():
                department = Departments.query.get(department.id)

                if not department.taxform_key:
                    flash('{} не заданий ключ для підпису податкових форм'.format(department.id), 'error')

                if not department.prro_key:
                    flash('{} не заданий ключ для підпису пРРО'.format(department.id), 'error')

                try:
                    result = department.set_signer_type()
                    if result:
                        flash('{} тип підпису ключів оновлено'.format(department.id))
                    else:
                        flash('{} не вдалося оновити тип підпису ключів'.format(department.id))

                except Exception as e:
                    flash('{} помилка: {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('tax_send_5PRRO',
            lazy_gettext(
                'Відправити форму про надання інформації щодо кваліфікованого сертифіката відкритого ключа 5-ПРРО'),
            lazy_gettext(
                'Ви впевнені, що хочете відправити форму про надання інформації щодо кваліфікованого сертифіката відкритого ключа 5-ПРРО?'))
    def tax_send_5PRRO(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)

            for department in query.all():
                department = Departments.query.get(department.id)

                if department.taxform_key_id:
                    company_key = department.taxform_key
                    sender = TaxForms(company_key=company_key)
                    status = sender.send_5PRRO(department)
                    if status:
                        flash('{}: форма отправлена!'.format(department.full_name))

                else:
                    flash('Не вказано ключа для підпису податкових форм!', 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('status_prro', lazy_gettext('Перевірити статус пРРО'),
            lazy_gettext('Ви впевнені, що хочете перевірити статус пРРО?'))
    def status_prro(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)

            for department in query.all():

                try:
                    rro_id = department.rro_id

                    from utils.SendData2 import SendData2
                    sender = SendData2(db, None, department, rro_id, "")

                    registrar_state = sender.TransactionsRegistrarState()

                    if not registrar_state:
                        flash(
                            "{} номер {}. Фіскального номера немає у доступі, або сервер податкової не працює".format(
                                department.full_name, rro_id), 'error')
                    else:
                        access = "РРО в податкової: {} ".format(registrar_state['TaxObject']['Name'])

                        if registrar_state:
                            if registrar_state['ShiftState'] == 0:
                                shift_state = "Стан зміни: закрита, сл. лок. ном. {}".format(
                                    registrar_state["NextLocalNum"])
                            else:
                                shift_state = "Стан зміни: відкрита, сл. лок. ном. {}".format(
                                    registrar_state["NextLocalNum"])

                            if department.offline_status == True:
                                print('{} знаходиться в режимі офлайн!'.format(department.full_name))

                        else:
                            shift_state = "Стан зміни невідомо. "

                        flash('{} номер {}. {}. {}'.format(department.full_name, rro_id, access, shift_state))

                except Exception as e:
                    flash('{} помилка: {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_open_shift', lazy_gettext('Відкрити зміну'),
            lazy_gettext('Ви впевнені, що хочете відкрити зміну?'))
    def prro_open_shift(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)

            for department in query.all():

                try:
                    rro_id = department.rro_id

                    from utils.SendData2 import SendData2
                    sender = SendData2(db, None, department, rro_id, "")

                    try:
                        registrar_state = sender.TransactionsRegistrarState()

                        if not registrar_state:
                            flash(
                                "{} номер {}. Фискального номера нет в доступе, либо сервер налоговой не работает".format(
                                    department.full_name, rro_id), 'error')
                        else:
                            if sender.department_name != sender.rro_department_name:
                                flash(
                                    '{} налоговый объект имеет название {}, но в самом РРО название {}'.format(
                                        department.full_name, sender.department_name,
                                        sender.rro_department_name),
                                    'warning')

                            access = "РРО в податкової: {} ".format(sender.department_name)

                            if registrar_state:
                                # if registrar_state['ShiftState'] == 0:
                                shift, shift_opened, messages, offline = department.prro_open_shift(True)
                                registrar_state = sender.TransactionsRegistrarState()
                                if registrar_state:
                                    if registrar_state['ShiftState'] == 0:

                                        print('Смена есть, статус {}'.format(shift.operation_type))
                                        if shift.operation_type == 1:
                                            operation_time = datetime.datetime.now()
                                            print(
                                                'Смена открыта в оффлайн, но не открыта по налоговой, исправляем')
                                            shift.offline = False
                                            local_number = registrar_state['NextLocalNum']
                                            sender.local_number = local_number
                                            sender.open_shift(operation_time)
                                            shift.pid = local_number
                                            shift.local_number = sender.local_number
                                            # last_shift.operation_type = 0
                                            db.session.commit()

                                        shift_state = "Стан зміни: закрита, сл. лок. ном. {}".format(
                                            registrar_state["NextLocalNum"])
                                    else:
                                        shift_state = "Стан зміни: відкрита, сл. лок. ном. {}".format(
                                            registrar_state["NextLocalNum"])
                                        if shift.operation_type == 1:
                                            # print('Исправляем номер {} на {}'.format(shift.pid, registrar_state['NextLocalNum']))
                                            print('Исправляем номер prro_localnumber {} на {}'.format(
                                                shift.prro_localnumber, registrar_state['NextLocalNum']))
                                            shift.pid = registrar_state['NextLocalNum']
                                            shift.prro_localnumber = registrar_state['NextLocalNum']
                                            db.session.commit()

                                else:
                                    shift_state = "Стан зміни невідомо. "
                                # else:
                                #     shift_state = "Стан зміни: відкрита, сл. лок. ном. {}".format(
                                #         registrar_state["NextLocalNum"])
                            else:
                                shift_state = "Стан зміни невідомо. "

                            flash('{} номер {}. {}. {}'.format(department.full_name, rro_id, access, shift_state))
                    except Exception as e:
                        flash('{} помилка, не удалось запросить состояние смены, возможно печать не имеет доступа к '
                              'фискальным данным'.format(
                            e), 'error')
                except Exception as e:
                    flash('{} помилка {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_fix_errors', lazy_gettext('Тестування та виправлення помилок'),
            lazy_gettext('Ви впевнені, що хочете зробити тестування та виправлення помилок?'))
    def prro_fix_errors(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)

            for department in query.all():

                try:
                    msg, status = department.prro_fix()

                    if not status:
                        flash('{} номер ПРРО {}. Помилка: {}'.format(department.full_name, department.rro_id, msg), 'error')
                    else:
                        flash('{} номер ПРРО {}. Повідомлення: {}'.format(department.full_name, department.rro_id, msg))

                except Exception as msg:
                    flash('{} номер ПРРО {}. Помилка: {}'.format(department.full_name, department.rro_id, msg), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_post_advance', lazy_gettext('Отправить тестовый аванс на 1000 грн'),
            lazy_gettext('Ви впевнені, що хочете отправить  тестовый аванс на 1000 грн?'))
    def prro_post_advance(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
            # count = 0
            for department in query.all():

                try:
                    tax_id, shift, shift_opened, qr, coded_string, offline = department.prro_advances(1000)
                    decoded_string = base64.b64decode(coded_string).decode('UTF-8')
                    flash(
                        '{} Відправлено чек службового внесення (аванс), отримано фіскальний номер {}, данные чека: {} ссылка QR кода {}'.format(
                            department.full_name, tax_id, decoded_string, qr))
                except Exception as e:
                    return flash('{} помилка: {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_post_podkrep', lazy_gettext('Отправить тестовое подкрепление на 1000 грн'),
            lazy_gettext('Ви впевнені, що хочете отправить тестовое подкрепление на 1000 грн?'))
    def prro_post_podkrep(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
            # count = 0
            for department in query.all():

                try:
                    tax_id, shift, shift_opened, qr, coded_string, offline, tax_id_advance, qr_advance, visual_advance = department.prro_podkrep(
                        1000)
                    decoded_string = base64.b64decode(coded_string).decode('UTF-8')
                    flash(
                        '{} отправлено подкрепление, получен фискальный номер {}, данные чека: {} ссылка QR кода {}'.format(
                            department.full_name, tax_id, decoded_string, qr))
                except Exception as e:
                    return flash('{} помилка: {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_post_storno', lazy_gettext('Сторнувати останній чек'),
            lazy_gettext('Ви впевнені, що хочете сторнувати останній чек?'))
    def prro_post_storno(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
            # count = 0
            for department in query.all():

                rro_id = department.rro_id

                from utils.SendData2 import SendData2
                sender = SendData2(db, None, department, rro_id, "")
                registrar_state = sender.TransactionsRegistrarState()

                if registrar_state:
                    if registrar_state['ShiftState'] == 0:
                        flash('Отделение {}, стан зміни: закрита. '.format(department.full_name),
                              'error')
                    else:
                        LastFiscalNum = int(registrar_state["LastFiscalNum"])
                        print(LastFiscalNum)

                        try:
                            tax_id, shift, shift_opened, qr, coded_string, offline = department.prro_storno(
                                LastFiscalNum)
                            decoded_string = base64.b64decode(coded_string).decode('UTF-8')
                            flash(
                                '{} отправлено сторно последнего чека, получен фискальный номер {}, данные чека: {} ссылка QR кода {}'.format(
                                    department.full_name, tax_id, decoded_string, qr))
                        except Exception as e:
                            return flash('{} помилка: {}'.format(department.full_name, e), 'error')
                else:
                    flash('{}: {}'.format(
                        department.full_name, "стан зміни невідомо"))

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_post_inkass', lazy_gettext('Отправить тестовую инкассацию на 1000 грн'),
            lazy_gettext('Ви впевнені, що хочете отправить тестовую инкассацию на 1000 грн?'))
    def prro_post_inkass(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
            # count = 0
            for department in query.all():

                try:
                    tax_id, shift, shift_opened, qr, coded_string, offline, tax_id_advance, qr_advance, visual_advance = department.prro_inkass(
                        1000)
                    decoded_string = base64.b64decode(coded_string).decode('UTF-8')
                    flash(
                        '{} отправлена инкассация, получен фискальный номер {}, данные чека: {} ссылка QR кода {}'.format(
                            department.full_name, tax_id, decoded_string, qr))
                except Exception as e:
                    return flash('{} помилка: {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_post_sale', lazy_gettext('Отправить тестовый чек продажи'),
            lazy_gettext('Ви впевнені, що хочете отправить тестовый чек продажи?'))
    def prro_post_sale(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
            # count = 0
            for department in query.all():

                try:
                    reals = []

                    '''
                    ДанныеТовара.Вставить("CODE", 98765); //<!--Внутрішній код товару (64 символи)-->
                    ДанныеТовара.Вставить("UKTZED", 876543); //<!--Код товару згідно з УКТЗЕД (15 цифр)-->
                    ДанныеТовара.Вставить("NAME", "Куряче Стегно"); //<!--Найменування товару, послуги або операції (текст)-->
                    ДанныеТовара.Вставить("UNITCD", 25); //<!--Код одиниці виміру згідно класифікатора (5 цифр)-->
                    ДанныеТовара.Вставить("UNITNM", "кг"); //<!--Найменування одиниці виміру (64 символи)-->
                    ДанныеТовара.Вставить("AMOUNT", 5.701); //<!--Кількість/об’єм товару (15.3 цифри)-->
                    ДанныеТовара.Вставить("PRICE", 52.30); //<!--Ціна за одиницю товару (15.2 цифри)-->
                    ДанныеТовара.Вставить("LETTERS", "A"); //<!--Літерні позначення видів і ставок податків/зборів (15 символів)-->
                    ДанныеТовара.Вставить("COST", 298.16); //<!--Сума операції (15.2 цифри)-->
                    '''
                    real = {
                        'CODE': 98765,
                        'UKTZED': 876543,
                        'NAME': "Куряче Стегно",
                        'UNITCD': 25,
                        'UNITNM': "кг",
                        'AMOUNT': 5.701,
                        'PRICE': 52.30,
                        'LETTERS': "A",
                        'COST': 298.16,
                    }
                    reals.append(real)

                    '''
                    	ДанныеОплаты = Новый Структура;
                        ДанныеОплаты.Вставить("PAYFORMCD", 0); // 	<!--Код форми оплати (числовий):--> <!--0–Готівка, 1–Банківська картка...-->
                        ДанныеОплаты.Вставить("PAYFORMNM", НаименованиеФормыОплаты);// 	<!--Найменування форми оплати (64 символи)-->
                        ДанныеОплаты.Вставить("SUM", СуммаИтоговая); // 	<!--Загальна сума (15.2 цифри)-->
                        ДанныеОплаты.Вставить("PROVIDED", СуммаИтоговая);// 	<!--Сума внесених коштів (15.2 цифри)-->
                        ДанныеОплаты.Вставить("REMAINS", 0); // 	<!--Решта (не зазначається, якщо решта відсутня) (15.2 цифри)-->
                    '''
                    pay = {
                        'PAYFORMCD': 0,
                        'PAYFORMNM': "ГОТІВКА",
                        'NAME': "Куряче Стегно",
                        'SUM': 298.16,
                        'PROVIDED': 298.16,
                        'REMAINS': 0,
                    }
                    pays = []
                    pays.append(pay)

                    '''
                     	ДанныеНалога.Вставить("TYPE", 0); // <!--Код виду податку/збору (числовий):--> // <!--0-ПДВ,1-Акциз,2-ПФ...-->
                        ДанныеНалога.Вставить("NAME", "ПДВ"); // <!--Найменування виду податку/збору (64 символи)-->
                        ДанныеНалога.Вставить("LETTER", "A"); //<!--Літерне позначення виду і ставки податку/збору (А,Б,В,Г,...) (1 символ)-->
                        ДанныеНалога.Вставить("PRC", 20); // <!--Відсоток податку/збору (15.2 цифри)-->
                        ДанныеНалога.Вставить("SIGN", Ложь);// <!--Ознака податку/збору, не включеного у вартість--> //false/true
                        ДанныеНалога.Вставить("TURNOVER", СуммаИтоговая);// <!--Сума для розрахування податку/збору (15.2 цифри)-->
                        ДанныеНалога.Вставить("SUM", СуммаИтоговая*0.20);// <!--Сума податку/збору (15.2 цифри)-->
                    '''
                    taxes = []
                    tax = {
                        'TYPE': 0,
                        'NAME': "ПДВ",
                        'LETTER': "A",
                        'PRC': 20,
                        'SIGN': False,
                        'TURNOVER': 298.16,
                        'SUM': 298.16 * 0.20,
                    }
                    taxes.append(tax)

                    # summa = 298.16

                    check = department.prro_sale(
                        reals, taxes, pays)
                    decoded_string = base64.b64decode(check["tax_visual"]).decode('UTF-8')
                    # print(decoded_string)
                    flash(
                        '{} отправлен чек, получен фискальный номер {}, данные чека: {} ссылка QR кода {}'.format(
                            department.full_name, check["tax_id"], decoded_string, check["qr"]))
                except Exception as e:
                    return flash('{} помилка: {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_post_z_post_close_shift', lazy_gettext('Надіслати Z звіт та закрити зміну'),
            lazy_gettext('Ви впевнені, що хочете надіслати Z звіт та закрити зміну?'))
    def prro_post_z_post_close_shift(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
            # count = 0
            for department in query.all():

                try:
                    z_report_data, z_report_tax_id, close_shift_tax_id, coded_string, tax_id_inkass, qr_inkass, visual_inkass = department.prro_get_xz(
                        True)
                    flash(
                        '{} надіслано Z звіт'.format(department.full_name))
                except Exception as e:
                    return flash('{} помилка: {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    # @action('prro_close_shift', lazy_gettext('Закрити зміну пРРО без Z звіту'),
    #         lazy_gettext('Ви впевнені, що хочете закрить смену пРРО без Z отчета?'))
    # def prro_close_shift(self, ids):
    #     if not current_user.is_anonymous and current_user.is_permissions(10):
    #
    #         query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
    #         # count = 0
    #         for department in query.all():
    #
    #             try:
    #                 rro_id = department.rro_id
    #
    #                 from utils.SendData2 import SendData2
    #                 # from utils.Sign import Sign
    #
    #                 # signer = Sign()
    #
    #                 # sender = SendData2(signer, m.box_id, rro_id, "")
    #                 sender = SendData2(db, department.prro_key, rro_id, "")
    #
    #                 # try:
    #                 #     server_state = sender.ServerState()
    #                 # except Exception as e:
    #                 #     if str(e) == 'ENOENT':
    #                 #         box_id = signer.get_box_id(m.key_content.encode(), m.cert1_data, m.cert2_data)
    #                 #         sender.set_box_id(box_id)
    #                 server_state = sender.ServerState()
    #                 #
    #                 #         m.box_id = box_id
    #                 #         db.session.commit()
    #                 #
    #                 #     else:
    #                 #         raise Exception(
    #                 #             'помилка криптографии {}'.format(e))
    #
    #                 if server_state:
    #
    #                     objects = sender.Objects()
    #
    #                     if not sender.zn:
    #                         access = "Фіскального номера немає в доступі"
    #                     else:
    #                         access = "Необхідний РРО є в базі податкової: {}, {}, {} ".format(sender.org_name,
    #                                                                                           sender.address,
    #                                                                                           sender.department_name)
    #
    #                         registrar_state = sender.TransactionsRegistrarState()
    #
    #                         if registrar_state:
    #                             if registrar_state['ShiftState'] == 0:
    #                                 shift_state = "Стан зміни: закрита. "
    #                             else:
    #                                 shift_state = "Стан зміни: відкрита. "
    #                                 sender.close_shift()
    #                                 registrar_state = sender.TransactionsRegistrarState()
    #
    #                                 if registrar_state:
    #                                     if registrar_state['ShiftState'] == 0:
    #                                         shift_state = "Стан зміни: успешно закрита. "
    #                                         flash(
    #                                             'Касовий апарат пРРО відділення {} номер {}. {}. {}. {}'.format(
    #                                                 department.full_name,
    #                                                 rro_id, server_state,
    #                                                 access, shift_state))
    #                                     else:
    #                                         shift_state = "Стан зміни: осталась відкрита. "
    #                                         flash(
    #                                             'Касовий апарат пРРО відділення {} номер {}. {}. {}. {}'.format(
    #                                                 department.full_name,
    #                                                 rro_id, server_state,
    #                                                 access, shift_state))
    #
    #                         else:
    #                             shift_state = "Стан зміни невідомо. "
    #                             flash('Касовий апарат пРРО відділення {} номер {}. {}. {}. {}'.format(
    #                                 department.full_name,
    #                                 rro_id, server_state,
    #                                 access, shift_state))
    #
    #                 else:
    #                     flash('Сервер податкової не працює', 'error')
    #             except Exception as e:
    #                 flash('{} помилка {}'.format(department.full_name, e), 'error')
    #     else:
    #         flash('У вас немає доступу для даної операції!', 'error')

    # @action('prro_fix_local_number', lazy_gettext('Исправить локальные номера'),
    #         lazy_gettext('Ви впевнені, що хочете исправить локальные номера?'))
    # def prro_fix_local_number(self, ids):
    #     if not current_user.is_anonymous and current_user.is_permissions(10):
    #
    #         query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
    #         # count = 0
    #         for department in query.all():
    #
    #             try:
    #
    #                 local_id = data['local_id']
    #                 last_shift = Shifts.query \
    #                     .order_by(Shifts.operation_time.desc()) \
    #                     .filter(Shifts.department_id == department.id) \
    #                     .first()
    #
    #                 if last_shift:
    #                     last_shift.prro_localnumber = local_id
    #                     db.session.commit()
    #
    #                 # tax_id = department.prro_inkass(1000)
    #                 # flash(
    #                 #     '{} отправлена инкассация, получен фискальный номер {}'.format(department.full_name, tax_id))
    #             except Exception as e:
    #                 return flash('{} помилка: {}'.format(department.full_name, e), 'error')
    #
    #     else:
    #         flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_get_fiscal_operations', lazy_gettext('Получить фискальные данные текущей смены пРРО'),
            lazy_gettext('Ви впевнені, що хочете получить фискальные данные текущей смены пРРО?'))
    def prro_get_fiscal_operations(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
            # count = 0
            for department in query.all():

                try:
                    rro_id = department.rro_id

                    from utils.SendData2 import SendData2
                    sender = SendData2(db, None, department, rro_id, "")

                    # try:
                    server_state = sender.ServerState()
                    # except Exception as e:
                    #     if str(e) == 'ENOENT':
                    #         box_id = signer.get_box_id(m.key_content.encode(), m.cert1_data, m.cert2_data)
                    #         sender.set_box_id(box_id)
                    #         server_state = sender.ServerState()
                    #
                    #         m.box_id = box_id
                    #         db.session.commit()
                    #
                    #     else:
                    #         raise Exception(
                    #             'помилка криптографии {}'.format(e))

                    shift_state = ""

                    if server_state:

                        objects = sender.Objects()
                        print(objects)

                        if not sender.zn:
                            access = "Фіскального номера немає в доступі"
                        else:
                            registrar_state = sender.TransactionsRegistrarState()

                            if registrar_state:
                                if registrar_state['ShiftState'] == 0:
                                    shift_state = "Стан зміни: закрита. "
                                else:
                                    ShiftId = registrar_state["ShiftId"]
                                    print(registrar_state)
                                    documents = sender.GetDocuments(ShiftId)
                                    print(documents)
                                    for document in documents:
                                        print(document)
                                        try:
                                            coded_string = sender.GetCheckExt(document['NumFiscal'], 3)
                                            decoded_string = base64.b64decode(coded_string)
                                            decoded_string = decoded_string.decode('UTF-8')
                                            # print(decoded_string)
                                            flash('{}'.format(decoded_string))

                                        except Exception as e:
                                            pass

                                    ZRepPresent = registrar_state["ZRepPresent"]
                                    if ZRepPresent:
                                        ZRepPresentStatus = "Z отчет отправлен"
                                    else:
                                        ZRepPresentStatus = "Z отчет не отправлен"

                                    shift_state = "Стан зміни: відкрита. Фискальный идентификатор смены {}, {}, " \
                                                  "название печати, открывшей смену {}, " \
                                                  "идентификатор ключа {}, " \
                                                  "первый локальный номер {}, " \
                                                  "следующий локальный номер {}, " \
                                                  "продолжительность оффлайн сессии {}, " \
                                                  "продолжительность оффлайн сессии с начала месяца {}" \
                                        .format(
                                        registrar_state["ShiftId"],
                                        ZRepPresentStatus,
                                        registrar_state["Name"],
                                        registrar_state["SubjectKeyId"],
                                        registrar_state["FirstLocalNum"],
                                        registrar_state["NextLocalNum"],
                                        registrar_state["OfflineSessionDuration"],
                                        registrar_state["OfflineSessionsMonthlyDuration"],
                                    )
                            else:
                                shift_state = "Стан зміни невідомо. "

                        flash('Касовий апарат пРРО відділення {} номер {}. {}. {}'.format(department.full_name,
                                                                                          rro_id, server_state,
                                                                                          shift_state))

                    else:
                        flash('Сервер податкової не працює', 'error')
                except Exception as e:
                    flash('{} помилка {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_get_last_fiscal_operations', lazy_gettext('Отримати фіскальні дані останньої операції'),
            lazy_gettext('Ви впевнені, що хочете отримати фіскальні дані останньої операції?'))
    def prro_get_last_fiscal_operations(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)
            # count = 0
            for department in query.all():

                # department = Departments.query.get(m.department_id)

                try:
                    rro_id = department.rro_id

                    from utils.SendData2 import SendData2
                    sender = SendData2(db, None, department, rro_id, "")
                    server_state = sender.ServerState()

                    if server_state:

                        objects = sender.Objects()
                        # print(objects)

                        if not sender.zn:
                            access = "Фіскального номера немає в доступі"
                        else:
                            registrar_state = sender.TransactionsRegistrarState()

                            if registrar_state:
                                if registrar_state['ShiftState'] == 0:
                                    flash('Отделение {}, стан зміни: закрита. '.format(department.full_name),
                                          'error')
                                else:
                                    LastFiscalNum = registrar_state["LastFiscalNum"]

                                    # try:
                                    # doc = sender.GetCheckExt(LastFiscalNum, 0)
                                    # print(doc)

                                    coded_string = sender.GetCheckExt(LastFiscalNum, 3)
                                    decoded_string = base64.b64decode(coded_string)
                                    decoded_string = decoded_string.decode('UTF-8')
                                    # print(decoded_string)
                                    # qr = 'https://cabinet.tax.gov.ua/cashregs/check?id={}&fn={}&date={}'.format(
                                    #     storno_tax_id, self.rro_id, operation_time.strftime("%Y%m%d"))
                                    #
                                    flash('{}'.format(decoded_string))

                    else:
                        flash('Сервер податкової не працює', 'error')
                except Exception as e:
                    flash('{} помилка {}'.format(department.full_name, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('prro_objects', lazy_gettext('Отримати всі доступні об\'єкти господарської діяльності'),
            lazy_gettext('Отримати всі доступні об\'єкти господарської діяльності?'))
    def prro_objects(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)

            for department in query.all():
                department = Departments.query.get(department.id)

                if not department.taxform_key:
                    flash('{} не заданий ключ для підпису податкових форм'.format(department.id), 'error')

                if not department.prro_key:
                    flash('{} не заданий ключ для підпису пРРО'.format(department.id), 'error')

                if department.taxform_key and department.prro_key:
                    from utils.SendData2 import SendData2
                    sender = SendData2(db, department.taxform_key, department, 0, "")

                    objects = sender.post_data("cmd", {"Command": "Objects"})

                    if objects:
                        if 'TaxObjects' in objects:
                            objects = objects['TaxObjects']
                            print(objects)
                            if objects:
                                for object in objects:
                                    print(object)
                            #         SubjectKeyId = operator['SubjectKeyId']
                            #         if SubjectKeyId == department.prro_key.public_key:
                            #
                            #             # RegNum = operator['RegNum'] # Реєстраційний номер особи оператора (ЄДРПОУ,ДРФО,Картка платника податків)
                            #             ChiefCashier = operator['ChiefCashier']
                            #
                            #             department.key_tax_registered = True
                            #             if ChiefCashier == True:
                            #                 department.signer_type = 'Старший касир'
                            #             else:
                            #                 department.signer_type = 'Касир'
                            #
                            #             db.session.commit()

        else:
            flash('У вас немає доступу для даної операції!', 'error')


class DepartmentKeysAdmin(Filters, ModelView):
    form_base_class = FlaskForm

    dep_id_column_name = 'id'

    form_extra_fields = {
        'key_file': FileField('Ключ (key-6.dat, *.zs2 або *.jks), обов\'язково, не зберігається'),
        'cert1_file': FileField('Сертифікат для підпису (не обов\'язково)'),
        'cert2_file': FileField('Сертифікат для шифрування (не обов\'язково)')
    }

    def __init__(self, session, **kwargs):
        super(DepartmentKeysAdmin, self).__init__(DepartmentKeys, session, **kwargs)

    column_list = ['id', 'name', 'key_role', 'ceo_fio', 'acsk', 'begin_time', 'end_time']
    column_sortable_list = ['id', 'name', 'key_role', 'ceo_fio', 'begin_time', 'end_time', 'acsk']
    column_default_sort = ('name', 'begin_time')

    column_filters = ('id', 'name', 'ceo_fio', 'begin_time', 'end_time', 'key_role', 'acsk')

    column_searchable_list = ['id', 'name', 'ceo_fio', 'public_key', 'key_data_txt', 'acsk']

    form_excluded_columns = (
        'name', 'key_data', 'key_data_txt', 'begin_time', 'end_time', 'path', 'type', 'create_date', 'public_key',
        'cert1_data', 'cert2_data', 'key_content', 'box_id', 'sign', 'encrypt', 'key_tax_registered',
        'edrpou', 'ceo_fio', 'ceo_tin', 'key_data', 'encrypt_content', 'cert1_content', 'cert2_content',
        'taxform_key_departments',
        'prro_key_departments')

    column_editable_list = ['key_password']

    form_choices = {
        'key_role': [
            ('personal', 'Особистий'),
            ('corporate', 'Корпоративний'),
            ('fop', 'ФОП'),
            ('director', 'Директор'),
            ('stamp', 'Печатка'),
            ('other', 'Інше'),
        ],
    }

    _key_role_type_choices = [(choice, label) for choice, label in [
        ('personal', 'Особистий'),
        ('corporate', 'Корпоративний'),
        ('fop', 'ФОП'),
        ('director', 'Директор'),
        ('stamp', 'Печатка'),
        ('other', 'Інше'),
        (None, 'Не вказано'),
        ('None', 'Не вказано'),
    ]]

    column_choices = {'key_role': _key_role_type_choices}

    # column_default_sort = [('full_name', False)]

    # column_default_sort = [[(cast(Departments.legal_number, Integer), False)]

    # column_editable_list = []

    can_create = True
    can_delete = True
    can_edit = True

    @action('tax_receive_all', lazy_gettext('Отримати повідомлення податкового кабінету'),
            lazy_gettext('Ви впевнені, що хочете отримати повідомлення податкового кабінету?'))
    def tax_receive_all(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)

            for company_key in query.all():
                try:
                    sender = TaxForms(company_key=company_key)
                    messages = sender.tax_receive_all(False)
                    if messages:
                        print(messages)
                        flash('{}: повідомлення {}'.format(company_key.id, messages))
                    else:
                        flash('{}: повідомлень немає'.format(company_key.id))
                except Exception as e:
                    flash('{} помилка {}'.format(company_key.id, e), 'error')

        else:
            flash('У вас немає доступу для даної операції!', 'error')

    @action('get_key_info', lazy_gettext('Оновити дані ключів'),
            lazy_gettext('Ви впевнені, що хочете оновити дані ключів?'))
    def get_key_info(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)

            for key in query.all():
                result, update_key_data_text, public_key = key.update_key_data()
                if result:
                    flash('{} {}'.format(key.id, update_key_data_text))
                    db.session.commit()
                else:
                    flash('{} {}'.format(key.id, update_key_data_text), 'error')

    @action('cert_fetch', lazy_gettext('Завантажити сертифікати ключів'),
            lazy_gettext('Ви впевнені, що хочете завантажити сертифікати ключів?'))
    def cert_fetch(self, ids):
        if not current_user.is_anonymous and current_user.is_permissions(10):

            query = sqla_tools.get_query_for_ids(self.get_query(), self.model, ids)

            for key in query.all():
                from utils.Sign import Sign

                signer = Sign()
                try:
                    box_id = signer.add_key(key.key_data, key.key_password)

                    urls = [
                        'http://acskidd.gov.ua/services/cmp/',
                        'http://uakey.com.ua/services/cmp/',
                        'http://masterkey.ua/services/cmp/',
                        'http://ca.informjust.ua/services/cmp/',
                        # 'http://ca.csd.ua/public/x509/cmp/',
                        # 'http://ca.gp.gov.ua/cmp/'
                    ]
                    if not b'privatbank' in key.key_data:
                        certs = signer.cert_fetch(box_id, urls)
                        if certs > 0:
                            # result, update_key_data_text, public_key = key.update_key_data()
                            if certs == 1:
                                flash('{} отримано сертифікатів {}'.format(key.id, certs))
                            else:
                                flash('{} отримано сертифікатів {}'.format(key.id, certs), 'warning')

                        else:
                            flash('{} {}'.format(key.id, 'не вийшло'), 'error')
                    else:
                        flash('{} ключ приватбанку'.format(key.id))

                    result, update_key_data_text, public_key = key.update_key_data()
                    if result:
                        # flash('{} {}'.format(key.id, update_key_data_text))
                        db.session.commit()
                    # else:
                    #     flash('{} {}'.format(key.id, update_key_data_text), 'error')

                except Exception as e:
                    flash('{} помилка {}'.format(key.id, e), 'error')

    def after_model_change(self, _form, model, is_created):

        if is_created:
            _id = model.id

            try:
                key_file = _form.key_file.data
                cert1_file = _form.cert1_file.data
                cert2_file = _form.cert2_file.data

                if key_file is not None:
                    model.key_data = key_file.read()

                    if cert1_file is not None:
                        model.cert1_data = cert1_file.read()
                    else:
                        model.cert1_file_content = None

                    if cert2_file is not None:
                        model.cert2_data = cert2_file.read()
                    else:
                        model.cert2_file_content = None

                    db.session.commit()

                    result, update_key_data_text, public_key = model.update_key_data()
                    if result:
                        flash('{} {}'.format(model.id, update_key_data_text))
                        db.session.commit()
                    else:
                        flash('{} {}'.format(model.id, update_key_data_text), 'error')
                    del _form.key_file

            except Exception as ex:
                flash('{}'.format(ex), 'error')
                pass

        return _form

    def filterDeps(self, query):
        return query

    def get_query(self):
        return self.session.query(self.model)

    def get_count_query(self):
        return self.session.query(func.count(self.model.id)).select_from(self.model)

    def is_accessible(self):
        if not current_user.is_anonymous and current_user.is_permissions(10):
            self.can_create = True
            self.can_edit = True
            self.can_delete = True
            return True
        else:
            return False

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login.auth', next=request.url))


def add_view(self, view, static_folder=None, template_folder=None, root_path=None):
    ''' Custom view adder to override blueprint.root_path '''
    # '/home/usb/GIT/Webex/blueprints/admin'
    blueprint = view.create_blueprint(self)
    if not root_path:
        root_path = os.path.dirname(__file__)
    blueprint.static_folder = view.static_folder if not static_folder else static_folder
    blueprint.template_folder = view.template_folder if not template_folder else template_folder
    # blueprint.static_url_path = '/admin/static'
    blueprint.root_path = root_path

    self._views.append(view)
    if self.app is not None:
        # print(blueprint.root_path)
        self.app.register_blueprint(blueprint)
    self._add_view_to_menu(view)


class IndexAdmin(Filters, BaseView):
    def __init__(self, name=None, category=None,
                 endpoint=None, url=None,
                 template='admin/index.html',
                 menu_class_name=None,
                 menu_icon_type=None,
                 menu_icon_value=None, session=None):
        super(IndexAdmin, self).__init__(
            name,
            category,
            endpoint,
            url,
            'static',
            menu_class_name=menu_class_name,
            menu_icon_type=menu_icon_type,
            menu_icon_value=menu_icon_value)
        self._template = template
        self.session = session

    @expose('/')
    def index(self):

        index_form = FlaskForm

        return self.render(self._template, form=index_form)

    def is_accessible(self):
        if not current_user.is_anonymous and current_user.is_permissions(9):
            return True
        else:
            return False

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login.auth', next=request.url))


def connect_admin_panel(app, db):
    index_view = IndexAdmin(session=db.session, name='Головна', url='/admin', endpoint='admin',
                            menu_icon_type='fa', menu_icon_value='fa-bar-chart')

    admin = Admin(app, 'АРМ', base_template='my_master.html', template_mode='bootstrap3',
                  category_icon_classes={
                      'Доступи': 'fa fa-users',
                      'пРРО': 'fa fa-lock',
                  }, url='/admin', endpoint='admin', index_view=index_view)

    admin.add_view(
        RolesAdmin(db.session, name='Ролі', category='Доступи', menu_icon_type='fa', menu_icon_value='fa-server'))

    admin.add_view(PermissionAdmin(db.session, name='Дозволи', category='Доступи', menu_icon_type='fa',
                                   menu_icon_value='fa-server'))

    add_view(admin, UsersAdmin(session=db.session, name='Користувачі', category='Доступи', menu_icon_type='fa',
                               menu_icon_value='fa-users'), template_folder='templates')

    admin.add_view(
        DepartmentsAdmin(db.session, name='Об\'єкти господарювання', category='Довідники', menu_icon_type='fa',
                         menu_icon_value='fa-building-o'))

    add_view(admin, DepartmentKeysAdmin(db.session, name='КЕП', category='Довідники', static_folder='static',
                                        endpoint='department_keys', menu_icon_type='fa',
                                        menu_icon_value='fa-sign-language'),
             template_folder='templates')

    # add_view(admin, CompanyKeysAdmin(db.session, name='КЕП компанії', category='пРРО', static_folder='static',
    #                                  endpoint='company_keys', menu_icon_type='fa',
    #                                  menu_icon_value='fa-address-card'),
    #          template_folder='templates')
