from wtforms import BooleanField, StringField, HiddenField, SubmitField
from wtforms.validators import DataRequired, ValidationError
from flask_wtf import FlaskForm


class LoginForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(meta={'csrf': True}, *args, **kwargs)

    usr = StringField('Логин:', [], render_kw={'readonly': False})
    pwd = StringField('Пароль:', [], render_kw={'readonly': False})
    visitor = HiddenField('visitor:', [], render_kw={'readonly': False})
    enter = SubmitField('Войти')


class CheckUserForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super(CheckUserForm, self).__init__(meta={'csrf': True}, *args, **kwargs)

    usr = StringField('Логін:', [], render_kw={'readonly': False})
    chn = BooleanField('If check neigh:', [], render_kw={'readonly': False}, default=False)


class ChangePasswordForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super(ChangePasswordForm, self).__init__(meta={'csrf': True}, *args, **kwargs)

    usr = StringField('Пользователь:', [DataRequired()], render_kw={'readonly': False})
    pwd = StringField('Пароль:', [DataRequired()], render_kw={'readonly': False})
    new_pwd = StringField('Новый пароль:', [DataRequired()], render_kw={'readonly': False})
    pwd_repeat = StringField('Повторить новый пароль:', [DataRequired()], render_kw={'readonly': False})
    change = SubmitField('Сменить')

    def validate_new_pwd(self, field):
        # SpecialSym=['$','@','#']
        passwd = field.data
        if len(passwd) < 6:
            raise ValidationError('Пароль должен быть не менее 6 символов в длину')
        if len(passwd) > 32:
            raise ValidationError('Длина пароля не должна быть длиннее 32 символов')
        if not any(char.isdigit() for char in passwd):
            raise ValidationError('Пароль должен содержать хотя бы одну цифру')
        if not any(char.isupper() for char in passwd):
            raise ValidationError('Пароль должен содержать хотя бы одну большую букву')
        if not any(char.islower() for char in passwd):
            raise ValidationError('Пароль должен содержать хотя бы одну маленькую букву')

    def validate_pwd_repeat(self, field):
        if not field.data == self.new_pwd.data:
            raise ValidationError('Пароли не совпадают')
