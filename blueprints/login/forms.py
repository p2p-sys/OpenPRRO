from wtforms import BooleanField, StringField, HiddenField, SubmitField
from wtforms.validators import DataRequired, ValidationError
from flask_wtf import FlaskForm


class LoginForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(meta={'csrf': True}, *args, **kwargs)

    usr = StringField('Логін:', [], render_kw={'readonly': False})
    pwd = StringField('Пароль:', [], render_kw={'readonly': False})
    visitor = HiddenField('visitor:', [], render_kw={'readonly': False})
    enter = SubmitField('Увійти')


class CheckUserForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super(CheckUserForm, self).__init__(meta={'csrf': True}, *args, **kwargs)

    usr = StringField('Логін:', [], render_kw={'readonly': False})
    chn = BooleanField('If check neigh:', [], render_kw={'readonly': False}, default=False)


class ChangePasswordForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super(ChangePasswordForm, self).__init__(meta={'csrf': True}, *args, **kwargs)

    usr = StringField('Користувач:', [DataRequired()], render_kw={'readonly': False})
    pwd = StringField('Пароль:', [DataRequired()], render_kw={'readonly': False})
    new_pwd = StringField('Новий пароль:', [DataRequired()], render_kw={'readonly': False})
    pwd_repeat = StringField('Повторити новий пароль:', [DataRequired()], render_kw={'readonly': False})
    change = SubmitField('Змінити')

    def validate_new_pwd(self, field):
        passwd = field.data
        if len(passwd) < 6:
            raise ValidationError('Пароль має бути не менше 6 символів у довжину')
        if len(passwd) > 32:
            raise ValidationError('Довжина пароля не повинна бути довшою за 32 символи.')
        if not any(char.isdigit() for char in passwd):
            raise ValidationError('Пароль повинен містити хоча б одну цифру')
        if not any(char.isupper() for char in passwd):
            raise ValidationError('Пароль повинен містити хоча б одну велику букву')
        if not any(char.islower() for char in passwd):
            raise ValidationError('Пароль повинен містити хоча б одну маленьку букву')

    def validate_pwd_repeat(self, field):
        if not field.data == self.new_pwd.data:
            raise ValidationError('Паролі не співпадають')
