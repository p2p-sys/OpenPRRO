TESTING = False
DEBUG = False

SQLALCHEMY_RECORD_QUERIES = True
SQLALCHEMY_TRACK_MODIFICATIONS = True

SECRET_KEY = 's0318f3b-a802-410d-bb0f-8ff73b3b4768'
WTF_CSRF_ENABLED = True
CSRF_ENABLED = True

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}
ENABLE_ADMIN_PANEL = True

HANDLE_ERRORS = True
SESSION_EXPIRATION_SECONDS = 5400
WTF_CSRF_TIME_LIMIT = 5400

# Налаштування доступу до бази даних
DATABASE_NAME = 'openprro'
DATABASE_USER = 'openprro'
DATABASE_PWD = 'openprro'
DATABASE_HOST = '127.0.0.1'

SQLALCHEMY_DATABASE_URI = "mysql+pymysql://{}:{}@{}/{}?charset=utf8mb4".format(DATABASE_USER, DATABASE_PWD, DATABASE_HOST,
                                                                            DATABASE_NAME)

# Вимкнути перевірку паролів при вході в панель адміністрування (для цілей налагодження)
NO_PWD_CHECK = False

# Сервер криптографії
REMOTE_SIGNER_SERVER = '127.0.0.1:3100'
REMOTE_SIGNER_SERVER_KEY = '4d505eacff74a1637ed6ce85ea38284b739083b87855d0dcd77d24c42774cb90'

# Часовий пояс
TIMEZONE = 'Europe/Kiev'

# Шлях до файлу логування
LOGFILE = 'logs/openprro.log'

# Режим тестування офлайн режиму, якщо увімкнено, запити до податкової відправлятися не будуть
TESTING_OFFLINE = False

# Адреса фіскального сервера
FS_URL = 'http://fs.tax.gov.ua:8609/fs/'

TELEGRAM_BOT = False

TELEGRAM_BOT_TOKEN = '000000000:AbcdefghAbcdefghAbcdefgh'

TELEGRAM_BOT_CHAT = '1234567890'
