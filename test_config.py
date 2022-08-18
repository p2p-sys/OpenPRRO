MYSQL_PREFIX = "mysql+pymysql://{}:{}@{}/{}?charset=utf8"
POSTGRES_PREFIX = "postgresql+psycopg2://{}:{}@{}/{}"


# 'postgresql+psycopg2://{}:{}@{}/{}'
# SQLALCHEMY_DATABASE_URI = 'sqlite:///{}?check_same_thread=False'.format(os.path.abspath('/home/usb/Downloads/app.db'))
# SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:?check_same_thread=False'

def changeDB(dic, access):
    dic.update(dict(
        UAH_ID=access[4],
        DATABASE_USER=access[0],
        DATABASE_PWD=access[1],
        DATABASE_HOST=access[2],
        DATABASE_NAME=access[3],
        SQLALCHEMY_DATABASE_URI=MYSQL_PREFIX.format(*access),
    ))
    return dic


DBS = dict(
)

BASIC_TEST = dict(
    MODE_DESC='Production DB in test env',
    IP='localhost',
    PORT=5000,
    SECRET_KEY='s0318f3b-a802-410d-bb0f-8ff73b3b4768s',
    DEBUG=True,
    TESTING=True,
    NBU_DEVIATION_BOTTOM=30,  # rate >= (1-NBU_DEVIATION_BOTTOM)*NBU_RATE
    NBU_DEVIATION_TOP=30,  # rate =< (1+NBU_DEVIATION_BOTTOM)*NBU_RATE
    SESSION_EXPIRATION_SECONDS=999999,
    ADMIN_PANEL_FREE_ACCESS=True,
    NO_PWD_CHECK=True,
    ENABLE_ADMIN_PANEL=True,
    FRONTEND_ARCHIVE=True,
    OPERATIONS_DELAY=-9999999,
    LOCAL_RPC_URL='http://localhost:5725/RPCinuque',
    ARCHIVE_MAX_DAYS=30,
)

config_updates = {}
config_updates['prod'] = {}
config_updates['prod']['MODE_DESC'] = 'Test DB from 21.29'
