"""empty message

Revision ID: 74466cdd4ef0
Revises: 93eb0096f9e2
Create Date: 2022-01-31 10:39:32.681128

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '74466cdd4ef0'
down_revision = '93eb0096f9e2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('department_keys', sa.Column('tax_sti_code', sa.String(length=4), nullable=True, comment='Код інспекції, в яку подається оригінал документа'))
    op.add_column('department_keys', sa.Column('tax_sti_name', sa.String(length=512), nullable=True, comment='Назва органу ДПС де зареєстрований платник'))
    op.add_column('department_keys', sa.Column('tax_phone', sa.String(length=64), nullable=True, comment='Телефон платника'))
    op.drop_column('department_keys', 'email')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('department_keys', sa.Column('email', mysql.VARCHAR(length=50), nullable=True, comment='Електронна пошта для надсилання звітів'))
    op.drop_column('department_keys', 'tax_phone')
    op.drop_column('department_keys', 'tax_sti_name')
    op.drop_column('department_keys', 'tax_sti_code')
    # ### end Alembic commands ###