"""empty message

Revision ID: ae71f20ccde2
Revises: 74466cdd4ef0
Create Date: 2022-02-07 21:24:06.194132

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'ae71f20ccde2'
down_revision = '74466cdd4ef0'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('department_keys', sa.Column('cert1_content', sa.String(length=4096), nullable=True, comment='Розпакований вміст ключа'))
    op.add_column('department_keys', sa.Column('cert2_content', sa.String(length=4096), nullable=True, comment='Розпакований вміст сертифіката шифрування'))
    op.alter_column('department_keys', 'key_content',
               existing_type=mysql.VARCHAR(length=4096),
               comment='Розпакований вміст сертифіката підпису',
               existing_comment='Розпакований вміст ключа',
               existing_nullable=True)
    op.drop_column('department_keys', 'tax_sti_name')
    op.drop_column('department_keys', 'tax_sti_code')
    op.drop_column('department_keys', 'tax_phone')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('department_keys', sa.Column('tax_phone', mysql.VARCHAR(length=64), nullable=True, comment='Телефон платника'))
    op.add_column('department_keys', sa.Column('tax_sti_code', mysql.VARCHAR(length=4), nullable=True, comment='Код інспекції, в яку подається оригінал документа'))
    op.add_column('department_keys', sa.Column('tax_sti_name', mysql.VARCHAR(length=512), nullable=True, comment='Назва органу ДПС де зареєстрований платник'))
    op.alter_column('department_keys', 'key_content',
               existing_type=mysql.VARCHAR(length=4096),
               comment='Розпакований вміст ключа',
               existing_comment='Розпакований вміст сертифіката підпису',
               existing_nullable=True)
    op.drop_column('department_keys', 'cert2_content')
    op.drop_column('department_keys', 'cert1_content')
    # ### end Alembic commands ###
