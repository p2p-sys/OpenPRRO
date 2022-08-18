"""empty message

Revision ID: e4b3e4a2799c
Revises: 3b0671867f4f
Create Date: 2021-12-21 22:09:25.102271

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e4b3e4a2799c'
down_revision = '3b0671867f4f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('shifts', sa.Column('cashier', sa.String(length=128), nullable=True, comment='ПИБ Касира'))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('shifts', 'cashier')
    # ### end Alembic commands ###
