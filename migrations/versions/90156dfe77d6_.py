"""empty message

Revision ID: 90156dfe77d6
Revises: dca3b043b12d
Create Date: 2023-07-05 18:00:11.707905

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '90156dfe77d6'
down_revision = 'dca3b043b12d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('departments', sa.Column('telegram_offline_error_sended', sa.Boolean(), nullable=True, comment='Ознака відправки помилки по телеграм боту'))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('departments', 'telegram_offline_error_sended')
    # ### end Alembic commands ###
