"""empty message

Revision ID: b3eab94585de
Revises: 1a4cc0a120bf
Create Date: 2023-10-05 18:30:26.427630

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b3eab94585de'
down_revision = '1a4cc0a120bf'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index('departments_rro_id_idx', 'departments', ['rro_id'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('departments_rro_id_idx', table_name='departments')
    # ### end Alembic commands ###