from pydantic import BaseModel


class ScoreCreate(BaseModel):
    player_name: str
    time_seconds: int


class ScoreResponse(BaseModel):
    id: int
    player_name: str
    time_seconds: int
