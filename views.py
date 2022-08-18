import os

from flask import render_template, send_from_directory, current_app
from flask_classy import FlaskView, route
from flask_login import login_required

from flask import Blueprint, render_template, request, jsonify, session, url_for, redirect, current_app

class IndexView(FlaskView):
    route_base = ''

    @route('/favicon.ico')
    def favicon(self):
        return send_from_directory(
            os.path.join(current_app.root_path, 'static'),
            'favicon.ico',
            mimetype='image/vnd.microsoft.icon')

    @route('/', methods=['GET'], endpoint='index')
    @login_required
    def index(self):

        return redirect(url_for('admin.index'))
    #     forms = {
    #     }
    #
    #     return render_template(
    #         "change/change-main.html",
    #         forms=forms)
