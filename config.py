import os

CONFIG_PATH = os.path.abspath(os.path.dirname(__file__))
TESTING = False
DEBUG = False

SQLALCHEMY_RECORD_QUERIES = True
SQLALCHEMY_TRACK_MODIFICATIONS = True

DATABASE_NAME = 'openprro'
DATABASE_USER = 'openprro'
DATABASE_PWD = 'openprro'
DATABASE_HOST = '127.0.0.1'

# SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://{}:{}@{}/{}".format(DATABASE_USER, DATABASE_PWD, DATABASE_HOST,DATABASE_NAME)
SQLALCHEMY_DATABASE_URI = "mysql+pymysql://{}:{}@{}/{}?charset=utf8mb4".format(DATABASE_USER, DATABASE_PWD, DATABASE_HOST,
                                                                            DATABASE_NAME)

# Ext
SECRET_KEY = 's0318f3b-a802-410d-bb0f-8ff73b3b4768'
WTF_CSRF_ENABLED = True
CSRF_ENABLED = True

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}  # not implemented
ENABLE_ADMIN_PANEL = True

NO_PWD_CHECK = False

# Custom
HANDLE_ERRORS = True
SESSION_EXPIRATION_SECONDS = 5400
WTF_CSRF_TIME_LIMIT = 5400

REMOTE_SIGNER_SERVER = '127.0.0.1:3100'
REMOTE_SIGNER_SERVER_KEY = '4d505eacff74a1637ed6ce85ea38284b739083b87855d0dcd77d24c42774cb90'
