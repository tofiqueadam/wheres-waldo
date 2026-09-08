from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.character import Character
from app.schemas.character import CharacterCreate, CharacterResponse


router = APIRouter(
    prefix="/api/characters",
    tags=["characters"],
)

@router.get(
    "",
    response_model=list[CharacterResponse],
)
def get_characters(db: Session = Depends(get_db)):
    statement = select(Character)

    characters = db.scalars(statement).all()

    return characters

@router.get("/count")
def get_character_count(db: Session = Depends(get_db)):
    statement = select(Character)

    characters = db.scalars(statement).all()

    return {"count": len(characters)}

@router.post(
    "",
    response_model=CharacterResponse,
)
def create_character(
    character: CharacterCreate,
    db: Session = Depends(get_db),
):
    new_character = Character(
        name=character.name
    )

    db.add(new_character)
    db.commit()
    db.refresh(new_character)

    return new_character

@router.get(
    "/{character_id}",
    response_model=CharacterResponse,
)
def get_character(
    character_id: int,
    db: Session = Depends(get_db),
):
    statement = select(Character).where(
        Character.id == character_id
    )

    character = db.scalars(statement).first()

    if character is None:
        raise HTTPException(
            status_code=404,
            detail="Character not found",
        )

    return character

