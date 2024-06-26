"""empty message

Revision ID: 38772c4f82c1
Revises: eba2ba33745e
Create Date: 2021-12-01 17:53:32.547044

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '38772c4f82c1'
down_revision = 'eba2ba33745e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # op.drop_constraint('department_keys_ibfk_1', 'department_keys', type_='foreignkey')
    # op.drop_column('department_keys', 'department_id')
    op.add_column('departments', sa.Column('taxform_key_id', sa.Integer(), nullable=True, comment='Ключи для подписи налоговых форм'))
    op.add_column('departments', sa.Column('prro_key_id', sa.Integer(), nullable=True, comment='Основной ключ для подписи чеков ПРРО'))
    # op.create_foreign_key(None, 'departments', 'department_keys', ['taxform_key_id'], ['id'])
    # op.create_foreign_key(None, 'departments', 'department_keys', ['prro_key_id'], ['id'])
    op.create_table_comment(
        'sales_taxes',
        'Таблица данных о налогах в розничных продажах',
        existing_comment=None,
        schema=None
    )
    op.create_table_comment(
        'shifts',
        'Таблица данных о сменах',
        existing_comment=None,
        schema=None
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table_comment(
        'shifts',
        existing_comment='Таблица данных о сменах',
        schema=None
    )
    op.drop_table_comment(
        'sales_taxes',
        existing_comment='Таблица данных о налогах в розничных продажах',
        schema=None
    )
    # op.drop_constraint(None, 'departments', type_='foreignkey')
    # op.drop_constraint(None, 'departments', type_='foreignkey')
    op.drop_column('departments', 'prro_key_id')
    op.drop_column('departments', 'taxform_key_id')
    # op.add_column('department_keys', sa.Column('department_id', mysql.INTEGER(display_width=11), autoincrement=False, nullable=False, comment='Отделение'))
    # op.create_foreign_key('department_keys_ibfk_1', 'department_keys', 'departments', ['department_id'], ['id'])
    # ### end Alembic commands ###
