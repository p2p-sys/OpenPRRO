"""empty message

Revision ID: 7b1cf4ec31d6
Revises: 823ec310205f
Create Date: 2022-09-07 21:44:38.828297

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '7b1cf4ec31d6'
down_revision = '823ec310205f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('advances', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('advances', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека офлайн',
               existing_comment='Фискальный номер чека оффлайн',
               existing_nullable=True)
    op.alter_column('advances', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.add_column('departments', sa.Column('offline_supported', sa.SmallInteger(), nullable=True, comment='Дозвіл переходу в режим офлайн по податковій'))
    op.add_column('departments', sa.Column('next_local_number', sa.Integer(), nullable=True, comment='Наступний локальний номер документа'))
    op.add_column('departments', sa.Column('org_name', sa.String(length=256), nullable=True, comment='Найменування продавця (256 символів)'))
    op.add_column('departments', sa.Column('name', sa.String(length=256), nullable=True, comment='Найменування точки продаж (256 символів)'))
    op.add_column('departments', sa.Column('prro_name', sa.String(length=256), nullable=True, comment='Найменування РРО (256 символів)'))
    op.add_column('departments', sa.Column('tin', sa.String(length=10), nullable=True, comment='ЄДРПОУ/ДРФО/№ паспорта продавця (10 символів)'))
    op.add_column('departments', sa.Column('ipn', sa.String(length=12), nullable=True, comment='Податковий номер або Індивідуальний номер платника ПДВ (12 символів)'))
    op.add_column('departments', sa.Column('entity', sa.Integer(), nullable=True, comment='Ідентифікатор запису ГО'))
    op.add_column('departments', sa.Column('zn', sa.Integer(), nullable=True, comment='Локальний номер реєстратора розрахункових операцій (64 символи)'))
    op.add_column('departments', sa.Column('single_tax', sa.Boolean(), nullable=True, comment='Єдиний податок'))
    op.add_column('departments', sa.Column('tax_obj_guid', sa.String(length=32), nullable=True, comment='Ідентифікатор запису ОО'))
    op.add_column('departments', sa.Column('tax_obj_id', sa.Integer(), nullable=True, comment='Код запису ОО'))
    op.add_column('departments', sa.Column('shift_state', sa.SmallInteger(), nullable=True, comment='Стан зміни'))
    op.add_column('departments', sa.Column('closed', sa.Boolean(), nullable=True, comment='Стан ПРРО'))
    op.add_column('departments', sa.Column('chief_cashier', sa.Boolean(), nullable=True, comment='Старший касир'))
    op.alter_column('inkasses', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('inkasses', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека офлайн',
               existing_comment='Фискальный номер чека оффлайн',
               existing_nullable=True)
    op.alter_column('inkasses', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('offline_checks', 'operation_type',
               existing_type=mysql.SMALLINT(display_width=6),
               comment='Тип операции: 1- открытие офлайн, 0 - закрытие офлайн',
               existing_comment='Тип операции: 1- открытие оффлайн, 0 - закрытие оффлайн',
               existing_nullable=False)
    op.alter_column('offline_checks', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('offline_checks', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека офлайн',
               existing_comment='Фискальный номер чека оффлайн',
               existing_nullable=True)
    op.create_table_comment(
        'offline_checks',
        'Таблица данных о чеках открытия / закрытия офлайн режима',
        existing_comment='Таблица данных о чеках открытия / закрытия оффлайн режима',
        schema=None
    )
    op.alter_column('podkreps', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('podkreps', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека офлайн',
               existing_comment='Фискальный номер чека оффлайн',
               existing_nullable=True)
    op.alter_column('podkreps', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('sales', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('sales', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека офлайн',
               existing_comment='Фискальный номер чека оффлайн',
               existing_nullable=True)
    op.alter_column('sales', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('shifts', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Отделение находится в режиме офлайн',
               existing_comment='Отделение находится в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('shifts', 'p_offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Отделение находится в режиме эмуляции офлайн',
               existing_comment='Отделение находится в режиме эмуляции оффлайн',
               existing_nullable=True)
    op.alter_column('shifts', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('shifts', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека офлайн',
               existing_comment='Фискальный номер чека оффлайн',
               existing_nullable=True)
    op.alter_column('shifts', 'prro_offline_local_number',
               existing_type=mysql.INTEGER(display_width=11),
               comment='Локальний номер офлайн документа',
               existing_comment='Локальний номер оффлайн документа',
               existing_nullable=True)
    op.alter_column('shifts', 'prev_hash',
               existing_type=mysql.VARCHAR(length=64),
               comment='Хэш предыдущего офлайн документа',
               existing_comment='Хэш предыдущего оффлайн документа',
               existing_nullable=True)
    op.alter_column('stornos', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('stornos', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека офлайн',
               existing_comment='Фискальный номер чека оффлайн',
               existing_nullable=True)
    op.alter_column('stornos', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('z_reports', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    op.alter_column('z_reports', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека офлайн',
               existing_comment='Фискальный номер чека оффлайн',
               existing_nullable=True)
    op.alter_column('z_reports', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме офлайн',
               existing_comment='Чек сохранен в режиме оффлайн',
               existing_nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('z_reports', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('z_reports', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека оффлайн',
               existing_comment='Фискальный номер чека офлайн',
               existing_nullable=True)
    op.alter_column('z_reports', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('stornos', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('stornos', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека оффлайн',
               existing_comment='Фискальный номер чека офлайн',
               existing_nullable=True)
    op.alter_column('stornos', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('shifts', 'prev_hash',
               existing_type=mysql.VARCHAR(length=64),
               comment='Хэш предыдущего оффлайн документа',
               existing_comment='Хэш предыдущего офлайн документа',
               existing_nullable=True)
    op.alter_column('shifts', 'prro_offline_local_number',
               existing_type=mysql.INTEGER(display_width=11),
               comment='Локальний номер оффлайн документа',
               existing_comment='Локальний номер офлайн документа',
               existing_nullable=True)
    op.alter_column('shifts', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека оффлайн',
               existing_comment='Фискальный номер чека офлайн',
               existing_nullable=True)
    op.alter_column('shifts', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('shifts', 'p_offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Отделение находится в режиме эмуляции оффлайн',
               existing_comment='Отделение находится в режиме эмуляции офлайн',
               existing_nullable=True)
    op.alter_column('shifts', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Отделение находится в режиме оффлайн',
               existing_comment='Отделение находится в режиме офлайн',
               existing_nullable=True)
    op.alter_column('sales', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('sales', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека оффлайн',
               existing_comment='Фискальный номер чека офлайн',
               existing_nullable=True)
    op.alter_column('sales', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('podkreps', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('podkreps', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека оффлайн',
               existing_comment='Фискальный номер чека офлайн',
               existing_nullable=True)
    op.alter_column('podkreps', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.create_table_comment(
        'offline_checks',
        'Таблица данных о чеках открытия / закрытия оффлайн режима',
        existing_comment='Таблица данных о чеках открытия / закрытия офлайн режима',
        schema=None
    )
    op.alter_column('offline_checks', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека оффлайн',
               existing_comment='Фискальный номер чека офлайн',
               existing_nullable=True)
    op.alter_column('offline_checks', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('offline_checks', 'operation_type',
               existing_type=mysql.SMALLINT(display_width=6),
               comment='Тип операции: 1- открытие оффлайн, 0 - закрытие оффлайн',
               existing_comment='Тип операции: 1- открытие офлайн, 0 - закрытие офлайн',
               existing_nullable=False)
    op.alter_column('inkasses', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('inkasses', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека оффлайн',
               existing_comment='Фискальный номер чека офлайн',
               existing_nullable=True)
    op.alter_column('inkasses', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.drop_column('departments', 'chief_cashier')
    op.drop_column('departments', 'closed')
    op.drop_column('departments', 'shift_state')
    op.drop_column('departments', 'tax_obj_id')
    op.drop_column('departments', 'tax_obj_guid')
    op.drop_column('departments', 'single_tax')
    op.drop_column('departments', 'zn')
    op.drop_column('departments', 'entity')
    op.drop_column('departments', 'ipn')
    op.drop_column('departments', 'tin')
    op.drop_column('departments', 'prro_name')
    op.drop_column('departments', 'name')
    op.drop_column('departments', 'org_name')
    op.drop_column('departments', 'next_local_number')
    op.drop_column('departments', 'offline_supported')
    op.alter_column('advances', 'offline',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    op.alter_column('advances', 'offline_tax_id',
               existing_type=mysql.VARCHAR(length=32),
               comment='Фискальный номер чека оффлайн',
               existing_comment='Фискальный номер чека офлайн',
               existing_nullable=True)
    op.alter_column('advances', 'offline_check',
               existing_type=mysql.TINYINT(display_width=1),
               comment='Чек сохранен в режиме оффлайн',
               existing_comment='Чек сохранен в режиме офлайн',
               existing_nullable=True)
    # ### end Alembic commands ###
