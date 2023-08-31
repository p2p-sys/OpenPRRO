from flask_wtf import FlaskForm
from wtforms import BooleanField, StringField, HiddenField, SubmitField


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
