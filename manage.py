# -*- coding: utf-8 -*-
import os, sys
import plotly
import simplejson

dpath = os.path.dirname(os.path.realpath(__file__))
dpath = os.path.join(dpath, 'test')
sys.path.append(dpath)

import click, datetime

from flask import Flask, g, session, jsonify
from functools import wraps

from models import db
from flask_wtf import CSRFProtect

csrf = CSRFProtect()
from flask_babelex import Babel

from views import IndexView
from api import ApiView
from blueprints.login import login

from test_config import config_updates as cfg_upd

from decimal import Decimal


class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def init_packages(app):
    db.init_app(app)
    csrf.init_app(app)

    babel = Babel(app)

    @babel.localeselector
    def get_locale():
        return 'uk'


def register_views(app):
    IndexView.register(app)
    ApiView.register(app)


def create_app(run_mode=None):
    app = Flask(__name__)
    app.g = g

    app.config.from_object('config')

    if not run_mode:
        run_mode = 'prod'
    app.config.update(**cfg_upd[run_mode])
    print('Starting in {} mode...'.format(run_mode))

    app.config['SESSION_TYPE'] = 'filesystem'
    init_packages(app)
    register_views(app)

    app.register_blueprint(login, url_prefix='/login')
    from blueprints.admin import connect_admin_panel
    connect_admin_panel(app, db)

    # Make json to work with decimals and datetime
    class DecimalEncoder(simplejson.JSONEncoder, plotly.utils.PlotlyJSONEncoder):
        def default(self, obj):
            if isinstance(obj, datetime.datetime):
                return obj.isoformat()
            elif isinstance(obj, datetime.date):
                return obj.isoformat()
            elif isinstance(obj, datetime.timedelta):
                return (datetime.datetime.min + obj).time().isoformat()
            elif isinstance(obj, Decimal):
                return float(obj)
            return super(DecimalEncoder, self).default(obj)

    app.json_encoder = DecimalEncoder

    @app.before_request
    def make_session_permanent():
        session.permanent = True
        app.permanent_session_lifetime = datetime.timedelta(seconds=app.config['SESSION_EXPIRATION_SECONDS'])

    if 'HANDLE_ERRORS' in app.config and app.config['HANDLE_ERRORS']:
        @app.errorhandler(InvalidUsage)
        def handle_invalid_usage(error):
            response = jsonify(error.to_dict())
            response.status_code = error.status_code
            return response

    return app


@click.group()
def main():
    """Entry point into Web-exchange: displays availabile CLI cmds """
    pass


@main.command()
def rules():
    ''' display routing rules '''
    app = create_app()
    print(app.url_map.iter_rules)


@main.command()
def auto():
    ''' Takes mode from ENVVAR WEBEX_RUN_MODE [test, dev, prod] '''
    app = create_app()
    app.run(host=app.config['IP'], port=app.config['PORT'], threaded=True)


def runFns(run_mode):
    def wrapper(func):
        @wraps(func)
        def inner(*args, **kwargs):
            app = create_app(run_mode=run_mode)
            app.run(host=app.config['IP'], port=app.config['PORT'], threaded=True)

        inner.__doc__ = cfg_upd[run_mode]['MODE_DESC']
        return inner

    return wrapper


for t in cfg_upd:
    fns = lambda x: x
    main.command(t)(runFns(t)(fns))

if __name__ == '__main__':
    main()
