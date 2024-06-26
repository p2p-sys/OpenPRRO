"""empty message

Revision ID: 93eb0096f9e2
Revises: f8120fc0cdd3
Create Date: 2021-12-28 15:11:54.792062

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '93eb0096f9e2'
down_revision = 'f8120fc0cdd3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('advances', sa.Column('offline_session_id', sa.Integer(), nullable=True, comment='Ідентифікатор офлайн сесії поточного чеку'))
    op.add_column('inkasses', sa.Column('offline_session_id', sa.Integer(), nullable=True, comment='Ідентифікатор офлайн сесії поточного чеку'))
    op.add_column('offline_checks', sa.Column('offline_session_id', sa.Integer(), nullable=True, comment='Ідентифікатор офлайн сесії поточного чеку'))
    op.add_column('podkreps', sa.Column('offline_session_id', sa.Integer(), nullable=True, comment='Ідентифікатор офлайн сесії поточного чеку'))
    op.add_column('sales', sa.Column('offline_session_id', sa.Integer(), nullable=True, comment='Ідентифікатор офлайн сесії поточного чеку'))
    op.add_column('shifts', sa.Column('offline_session_id', sa.Integer(), nullable=True, comment='Ідентифікатор офлайн сесії поточного чеку'))
    op.add_column('stornos', sa.Column('offline_session_id', sa.Integer(), nullable=True, comment='Ідентифікатор офлайн сесії поточного чеку'))
    op.add_column('z_reports', sa.Column('offline_session_id', sa.Integer(), nullable=True, comment='Ідентифікатор офлайн сесії поточного чеку'))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('z_reports', 'offline_session_id')
    op.drop_column('stornos', 'offline_session_id')
    op.drop_column('shifts', 'offline_session_id')
    op.drop_column('sales', 'offline_session_id')
    op.drop_column('podkreps', 'offline_session_id')
    op.drop_column('offline_checks', 'offline_session_id')
    op.drop_column('inkasses', 'offline_session_id')
    op.drop_column('advances', 'offline_session_id')
    # ### end Alembic commands ###
