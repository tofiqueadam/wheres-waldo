from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Character(Base):
    __tablename__ = "characters"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    x: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    y: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    width: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    height: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    image_id: Mapped[int] = mapped_column(
        ForeignKey("images.id"),
        nullable=False
    )