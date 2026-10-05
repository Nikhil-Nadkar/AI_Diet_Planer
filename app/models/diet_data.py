from app.config.db_connect import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from sqlalchemy import DateTime

class DietPlannerData(Base):
    __tablename__="diet_plans"
    
    id:Mapped[int] = mapped_column(primary_key=True)
    input_data:Mapped[dict] = mapped_column(JSONB, nullable=False)
    output_data:Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at:Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)
    
    