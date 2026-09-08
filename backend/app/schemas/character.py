from pydantic import BaseModel


class CharacterCreate(BaseModel):
    name: str


class CharacterResponse(BaseModel):
    id: int
    name: str