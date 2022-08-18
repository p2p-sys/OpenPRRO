# -*- coding: utf-8 -*-
import sys

activate_this = 'venv/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

from os import path

dpath = path.dirname(path.realpath(__file__))
if dpath not in sys.path:
    sys.path.insert(0, dpath)

from manage import create_app

application = create_app()
