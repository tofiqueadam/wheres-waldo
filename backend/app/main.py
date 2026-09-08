from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import characters_router
from app.models.image import Image
from app.models.score import Score
from app.routers.game import router as game_router
from app.routers.scores import router as score_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(game_router)
app.include_router(score_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(characters_router)


@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI!"}
