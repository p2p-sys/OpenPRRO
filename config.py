import os

CONFIG_PATH = os.path.abspath(os.path.dirname(__file__))
TESTING = False
DEBUG = False
PORT = 80

BACKUP_FOLDER = os.path.join(CONFIG_PATH, "upload/")
SQLALCHEMY_RECORD_QUERIES = True
DATABASE_QUERY_TIMEOUT = 0.5
SQLALCHEMY_TRACK_MODIFICATIONS = True

DATABASE_NAME = 'openprro_kir'
DATABASE_USER = 'openprro'
DATABASE_PWD = '6!g2KGlPeXF90wcd'
DATABASE_HOST = 'pma.liftmedia.kz'

# SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://{}:{}@{}/{}".format(DATABASE_USER, DATABASE_PWD, DATABASE_HOST,DATABASE_NAME)
SQLALCHEMY_DATABASE_URI = "mysql+pymysql://{}:{}@{}/{}?charset=utf8".format(DATABASE_USER, DATABASE_PWD, DATABASE_HOST,
                                                                            DATABASE_NAME)

# Ext
SECRET_KEY = 's0318f3b-a802-410d-bb0f-8ff73b3b4768'
WTF_CSRF_ENABLED = True
CSRF_ENABLED = True

UPLOAD_FOLDER = os.path.join(CONFIG_PATH, "upload/")
MAX_CONTENT_PATH = 1 * 1024 * 1024  # not implemented?
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}  # not implemented
ENABLE_ADMIN_PANEL = True
ADMIN_PANEL_FREE_ACCESS = False
ENABLE_CURATOR_PANEL = True

ENABLE_LOGGING = True
ENABLE_WEB_LOGGING = True
WEB_LOGGING_REQUEST_FILTERED = ['GET']  # 'GET'

NO_PWD_CHECK = True
ACCESS_LOG_PATH = os.path.join(CONFIG_PATH, 'logs/')
ACCESS_LOG_FILE = 'auth.log'  # '/var/log/httpd/auth_log'

# Custom
HANDLE_ERRORS = True
SESSION_EXPIRATION_SECONDS = 5400
WTF_CSRF_TIME_LIMIT = 5400

PRRO_KEY_STORAGE = "certs"

REMOTE_SIGNER_SERVER = '127.0.0.1:3100'
REMOTE_SIGNER_SERVER_KEY = '4d505eacff74a1637ed6ce85ea38284b739083b87855d0dcd77d24c42774cb90'

TAX_COMPANY_PHONE = '380988408291'
TAX_NAME = "ГОЛОВНЕ УПРАВЛІННЯ ДПС У М.КИЄВІ, ДПІ У ПЕЧЕРСЬКОМУ РАЙОНІ (ПЕЧЕРСЬКИЙ РАЙОН М.КИЄВА)"
TAX_OBL = 26
TAX_RAYON = 55
TAX_EMAIL = "roman.gatchenko@gmail.com"
