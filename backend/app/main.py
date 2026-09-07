from fastapi import FastAPI

app = FastAPI()


@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI!"}


@app.get("/api/characters")
def get_characters():
    return [
        {"id": 1, "name": "Waldo"},
        {"id": 2, "name": "Wizard"},
        {"id": 3, "name": "Wilma"},
    ]