from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.character import Character
from app.schemas.game import CharacterGuess


router = APIRouter(
    prefix="/api/game",
    tags=["game"],
)

@router.post("/guess")
def check_guess(
    guess: CharacterGuess,
    db: Session = Depends(get_db),
):
    statement = select(Character).where(
        Character.id == guess.character_id
    )

    character = db.scalars(statement).first()

    if character is None:
        return {"correct": False}

    inside_x = (
        guess.x >= character.x
        and guess.x <= character.x + character.width
    )

    inside_y = (
        guess.y >= character.y
        and guess.y <= character.y + character.height
    )

    correct = inside_x and inside_y

    return {
        "correct": correct,
        "character": character.name,
    }