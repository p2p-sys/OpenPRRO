from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, current_app

from flask_login import login_user, logout_user, login_required

from models import Users, db
from flask_login import LoginManager
from blueprints.login.forms import LoginForm, ChangePasswordForm, CheckUserForm
import datetime
import time

login = Blueprint('login', __name__, template_folder='templates', static_folder='static')
login_manager = LoginManager()
login_manager.login_view = 'login.auth'
login_manager.login_message = None


@login_manager.user_loader
def load_user(id):
    return Users.query.get(int(id))


@login.record_once
def on_register(state):
    login_manager.init_app(state.app)


@login.route('/auth', methods=['GET'], endpoint='auth')
def auth():
    loginForm = LoginForm()
    changeForm = ChangePasswordForm()
    return render_template('login.html', loginForm=loginForm, changeForm=changeForm)


@login_required
@login.route('/logout', methods=['GET'], endpoint='logout')
def logout():
    session.clear()
    logout_user()
    return redirect(url_for('index'))


@login.route('/check_login', methods=['GET'], endpoint='check_login')
def check_login():
    usr = CheckUserForm(request.args).usr.data
    status = Users.query.filter(Users.login == usr).count() > 0

    return jsonify({'status': str(status)})


@login.route('/check_password', methods=['POST'], endpoint='check_password')
def check_password():
    form = LoginForm(request.form)
    user = Users.query.filter(Users.login == form.usr.data).first()

    if current_app.config['NO_PWD_CHECK']:
        if user:
            # if not user.is_active:
            #     return jsonify({'status': 'Користувач був деактивований', 'msg': 'Користувач був деактивований'})

            user.last_login = datetime.datetime.now()
            db.session.commit()

            login_user(user)
            session.update({'current_user': user.id})
            return jsonify({'status': 'success'})
        else:
            return jsonify({'status': 'Такого користувача не існує'})

    if user and user.check_password(form.pwd.data):

        # if not user.is_active:
        #     return jsonify({'status': 'Вы были деактивированы', 'msg': 'Вы были деактивированы'})
        if not user.last_login:
            return jsonify({'status': 'first_login',
                            'msg': 'Это Ваш первый вход, необходимо изменить пароль, придумайте свой пароль и введите его два раза в окне ниже, после нажмите "Изменить"'})

        user.last_login = datetime.datetime.now()
        db.session.commit()
        login_user(user)

        session.update({'current_user': user.id})
        # current_app.logger.info('Successfull login')
        return jsonify({'status': 'success'})
    else:
        time.sleep(5)
        current_app.logger.error('Failed login: %s password %s IP %s', form.usr.data, form.pwd.data,
                                 request.environ.get('HTTP_X_REAL_IP', request.remote_addr))
        return jsonify({'status': 'Неверное имя пользователя или пароль'})


@login.route('/change_password', methods=['POST'], endpoint='change_password')
def change_password():
    form = ChangePasswordForm(request.form)
    if not form.validate_on_submit():
        return jsonify({'errors': form.errors})

    user = Users.query.filter(Users.login == form.usr.data).first()
    if user and user.check_password(form.pwd.data):
        if not user.is_active:
            msg = 'Вы были отключены от системы'
            # current_app.logger.error(msg)
            return jsonify({'status': msg})

        user.set_password(form.new_pwd.data)
        user.last_login = datetime.datetime.now()
        db.session.commit()
        login_user(user)

        current_app.logger.info('Successfull password change and login')
        session.update({'current_user': user.id})
        return jsonify({'status': 'success'})
    else:
        time.sleep(3)
        current_app.logger.error('Failed login: %s password %s IP %s', form.usr.data, form.pwd.data,
                                 request.environ.get('HTTP_X_REAL_IP', request.remote_addr))
        return jsonify({'status': 'Неверное имя пользователя или пароль'})
