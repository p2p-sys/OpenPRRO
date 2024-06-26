"""empty message

Revision ID: 60242536c88c
Revises: ebc73e720c05
Create Date: 2023-05-31 12:42:07.029288

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '60242536c88c'
down_revision = 'ebc73e720c05'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('departments', sa.Column('next_offline_local_number', sa.Integer(), nullable=True, comment='Наступний локальний оффлайн номер документа'))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('departments', 'next_offline_local_number')
    # ### end Alembic commands ###
