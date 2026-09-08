from pydantic import BaseModel


class CharacterCreate(BaseModel):
    name: str
    x: float
    y: float
    width: float
    height: float
    image_id: int


class CharacterResponse(BaseModel):
    id: int
    name: str
    x: float
    y: float
    width: float
    height: float
    image_id: int
