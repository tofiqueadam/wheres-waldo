from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.score import Score
from app.schemas.score import ScoreCreate, ScoreResponse


router = APIRouter(
    prefix="/api/scores",
    tags=["scores"],
)


@router.post(
    "/",
    response_model=ScoreResponse,
)
def create_score(
    score: ScoreCreate,
    db: Session = Depends(get_db),
):
    new_score = Score(
        player_name=score.player_name,
        time_seconds=score.time_seconds,
    )

    db.add(new_score)
    db.commit()
    db.refresh(new_score)

    return new_score


@router.get(
    "/",
    response_model=list[ScoreResponse],
)
def get_scores(db: Session = Depends(get_db)):
    statement = select(Score).order_by(Score.time_seconds)

    scores = db.scalars(statement).all()

    return scores
