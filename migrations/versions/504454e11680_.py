"""empty message

Revision ID: 504454e11680
Revises: 890514fd1771
Create Date: 2023-10-06 11:24:13.103867

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '504454e11680'
down_revision = '890514fd1771'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index('advances_offline_session_id', 'advances', ['offline_session_id'], unique=False)
    op.alter_column('departments', 'taxform_key_id',
               existing_type=mysql.INTEGER(display_width=11),
               comment='Ключ для підпису податкових форм',
               existing_comment='Ключи для подписи налоговых форм',
               existing_nullable=True)
    op.alter_column('departments', 'prro_key_id',
               existing_type=mysql.INTEGER(display_width=11),
               comment='Основний ключ для підпису чеків ПРРО',
               existing_comment='Основной ключ для подписи чеков ПРРО',
               existing_nullable=True)
    op.create_index('incasses_offline_session_id', 'inkasses', ['offline_session_id'], unique=False)
    op.create_index('offline_checks_offline_session_id', 'offline_checks', ['offline_session_id'], unique=False)
    op.create_index('offline_checks_operation_type', 'offline_checks', ['operation_type'], unique=False)
    op.create_index('podkreps_offline_session_id', 'podkreps', ['offline_session_id'], unique=False)
    op.create_index('sales_offline_session_id', 'sales', ['offline_session_id'], unique=False)
    op.create_index('shifts_offline_session_id', 'shifts', ['offline_session_id'], unique=False)
    op.create_index('shifts_operation_type', 'shifts', ['operation_type'], unique=False)
    op.create_index('stornos_offline_session_id', 'stornos', ['offline_session_id'], unique=False)
    op.create_index('zreports_offline_session_id', 'z_reports', ['offline_session_id'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('zreports_offline_session_id', table_name='z_reports')
    op.drop_index('stornos_offline_session_id', table_name='stornos')
    op.drop_index('shifts_operation_type', table_name='shifts')
    op.drop_index('shifts_offline_session_id', table_name='shifts')
    op.drop_index('sales_offline_session_id', table_name='sales')
    op.drop_index('podkreps_offline_session_id', table_name='podkreps')
    op.drop_index('offline_checks_operation_type', table_name='offline_checks')
    op.drop_index('offline_checks_offline_session_id', table_name='offline_checks')
    op.drop_index('incasses_offline_session_id', table_name='inkasses')
    op.alter_column('departments', 'prro_key_id',
               existing_type=mysql.INTEGER(display_width=11),
               comment='Основной ключ для подписи чеков ПРРО',
               existing_comment='Основний ключ для підпису чеків ПРРО',
               existing_nullable=True)
    op.alter_column('departments', 'taxform_key_id',
               existing_type=mysql.INTEGER(display_width=11),
               comment='Ключи для подписи налоговых форм',
               existing_comment='Ключ для підпису податкових форм',
               existing_nullable=True)
    op.drop_index('advances_offline_session_id', table_name='advances')
    # ### end Alembic commands ###