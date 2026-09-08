from pydantic import BaseModel


class CharacterGuess(BaseModel):
    character_id: int
    x: float
    y: float