"""empty message

Revision ID: bef138602367
Revises: 24da89222823
Create Date: 2021-12-07 17:27:54.221664

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'bef138602367'
down_revision = '24da89222823'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('department_keys', 'key_data',
               existing_type=sa.BLOB(),
               comment='Вміст файлу ключа',
               existing_comment='Содержимое файла ключа',
               existing_nullable=True)
    op.alter_column('department_keys', 'key_data_txt',
               existing_type=mysql.LONGTEXT(charset='utf8mb4', collation='utf8mb4_bin'),
               comment='Текстовий вміст файлу ключа',
               existing_comment='Текстовое содержимое файла ключа',
               existing_nullable=True)
    op.alter_column('department_keys', 'cert1_data',
               existing_type=sa.BLOB(),
               comment='Вміст файлу сертифіката підпису',
               existing_comment='Содержимое файла 1 сертификата',
               existing_nullable=True)
    op.alter_column('department_keys', 'cert2_data',
               existing_type=sa.BLOB(),
               comment='Вміст файлу сертифіката шифрування',
               existing_comment='Содержимое файла 2 сертификата',
               existing_nullable=True)
    op.alter_column('department_keys', 'key_content',
               existing_type=mysql.VARCHAR(length=4096),
               comment='Розпакований вміст ключа',
               existing_comment='Распакованное содержимое криптоключа',
               existing_nullable=True)
    op.alter_column('department_keys', 'box_id',
               existing_type=mysql.VARCHAR(length=100),
               comment='Ідентифікатор крипто-сесії',
               existing_comment='Идентификатор крипто-сессии',
               existing_nullable=True)
    op.alter_column('department_keys', 'edrpou',
               existing_type=mysql.VARCHAR(length=16),
               comment='Код ЄДРПОУ',
               existing_comment='EDRPOU',
               existing_nullable=True)
    op.alter_column('department_keys', 'ceo_fio',
               existing_type=mysql.VARCHAR(length=128),
               comment='ПІБ',
               existing_comment='ПІБ директора',
               existing_nullable=True)
    op.alter_column('department_keys', 'sign',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Ключ може підписувати',
               existing_comment='Ключ для підпису',
               existing_nullable=True)
    op.alter_column('department_keys', 'key_tax_registered',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Ознака що ключ зареєстровано у податковій формою 5-ПРРО',
               existing_comment='Ключ зареєстрований у податковій',
               existing_nullable=True)
    op.drop_column('department_keys', 'signer_type')
    op.add_column('departments', sa.Column('signer_type', sa.String(length=20), nullable=True, comment='Тип підпису: Касир / Старший касир / Припинення роботи'))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('departments', 'signer_type')
    op.add_column('department_keys', sa.Column('signer_type', mysql.VARCHAR(length=20), nullable=True, comment='Тип підпису: Касир / Старший касир / Припинення роботи'))
    op.alter_column('department_keys', 'key_tax_registered',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Ключ зареєстрований у податковій',
               existing_comment='Ознака що ключ зареєстровано у податковій формою 5-ПРРО',
               existing_nullable=True)
    op.alter_column('department_keys', 'sign',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Ключ для підпису',
               existing_comment='Ключ може підписувати',
               existing_nullable=True)
    op.alter_column('department_keys', 'ceo_fio',
               existing_type=mysql.VARCHAR(length=128),
               comment='ПІБ директора',
               existing_comment='ПІБ',
               existing_nullable=True)
    op.alter_column('department_keys', 'edrpou',
               existing_type=mysql.VARCHAR(length=16),
               comment='EDRPOU',
               existing_comment='Код ЄДРПОУ',
               existing_nullable=True)
    op.alter_column('department_keys', 'box_id',
               existing_type=mysql.VARCHAR(length=100),
               comment='Идентификатор крипто-сессии',
               existing_comment='Ідентифікатор крипто-сесії',
               existing_nullable=True)
    op.alter_column('department_keys', 'key_content',
               existing_type=mysql.VARCHAR(length=4096),
               comment='Распакованное содержимое криптоключа',
               existing_comment='Розпакований вміст ключа',
               existing_nullable=True)
    op.alter_column('department_keys', 'cert2_data',
               existing_type=sa.BLOB(),
               comment='Содержимое файла 2 сертификата',
               existing_comment='Вміст файлу сертифіката шифрування',
               existing_nullable=True)
    op.alter_column('department_keys', 'cert1_data',
               existing_type=sa.BLOB(),
               comment='Содержимое файла 1 сертификата',
               existing_comment='Вміст файлу сертифіката підпису',
               existing_nullable=True)
    op.alter_column('department_keys', 'key_data_txt',
               existing_type=mysql.LONGTEXT(charset='utf8mb4', collation='utf8mb4_bin'),
               comment='Текстовое содержимое файла ключа',
               existing_comment='Текстовий вміст файлу ключа',
               existing_nullable=True)
    op.alter_column('department_keys', 'key_data',
               existing_type=sa.BLOB(),
               comment='Содержимое файла ключа',
               existing_comment='Вміст файлу ключа',
               existing_nullable=True)
    # ### end Alembic commands ###
