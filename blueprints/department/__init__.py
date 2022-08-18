import time

from flask import Blueprint, render_template, request, jsonify, session, url_for, redirect, current_app
from flask_login import current_user, login_required
from flask_classy import route

from urllib.parse import urlparse, urlunparse
from werkzeug.urls import url_decode, url_encode
from functools import wraps
import json

# from manage import db
from models import db, Shifts, Users

from models import Departments
from transliterate import translit

import datetime

department = Blueprint('department', __name__, template_folder='templates', static_folder='static')


def make_next_param(login_url, current_url):
    '''
    Reduces the scheme and host from a given URL so it can be passed to
    the given `login` URL more efficiently.

    :param login_url: The login URL being redirected to.
    :type login_url: str
    :param current_url: The URL to reduce.
    :type current_url: str
    '''
    l = urlparse(login_url)
    c = urlparse(current_url)

    if (not l.scheme or l.scheme == c.scheme) and \
            (not l.netloc or l.netloc == c.netloc):
        return urlunparse(('', '', c.path, c.params, c.query, ''))
    return current_url


def department_url(login_view, next_url=None, next_field='next_dep'):
    '''
    Creates a URL for redirecting to a login page. If only `login_view` is
    provided, this will just return the URL for it. If `next_url` is provided,
    however, this will append a ``next=URL`` parameter to the query string
    so that the login view can redirect back to that URL.

    :param login_view: The name of the login view. (Alternately, the actual
                       URL to the login view.)
    :type login_view: str
    :param next_url: The URL to give the login view for redirection.
    :type next_url: str
    :param next_field: What field to store the next URL in. (It defaults to
                       ``next``.)
    :type next_field: str
    '''
    if login_view.startswith(('https://', 'http://', '/')):
        base = login_view
    else:
        base = url_for(login_view)

    if next_url is None:
        return base

    parts = list(urlparse(base))
    md = url_decode(parts[4])
    md[next_field] = make_next_param(base, next_url)
    parts[4] = url_encode(md, sort=True)
    return urlunparse(parts)


def department_chosen(func):
    """
    Перевірка на те, що користувач обрав робоче відділення
    """

    @wraps(func)
    def decorated_view(*args, **kwargs):
        # if current_user.role and (current_user.is_permissions(9) or current_user.is_permissions(8)):
        #     return redirect(url_for('webex.index_view'))
        if current_user.role and current_user.is_permissions(9):
            return redirect(url_for('admin.index'))
        if 'current_department' in session:
            return func(*args, **kwargs)
        # else:
        #     return redirect(department_url('department.choose', request.url))

    return decorated_view

