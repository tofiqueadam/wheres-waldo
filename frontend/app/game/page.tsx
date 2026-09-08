"use client";

import { useEffect, useState, type MouseEvent } from "react";

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 800;

type Character = {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image_id: number;
};

type ClickPosition = {
  x: number;
  y: number;
};

export default function GamePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<ClickPosition | null>(
    null
  );
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState<{
    message: string;
    correct: boolean;
  } | null>(null);

  function handleImageClick(event: MouseEvent<HTMLImageElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const displayX = event.clientX - rect.left;
    const displayY = event.clientY - rect.top;

    const scaleX = IMAGE_WIDTH / rect.width;
    const scaleY = IMAGE_HEIGHT / rect.height;

    const x = displayX * scaleX;
    const y = displayY * scaleY;

    setSelectedPosition({ x, y });
    setMenuPosition({ x: displayX, y: displayY });
    setFeedback(null);
  }

  function handleCharacterSelection(character: Character) {
    if (!selectedPosition) {
      return;
    }

    const insideX =
      selectedPosition.x >= character.x &&
      selectedPosition.x <= character.x + character.width;

    const insideY =
      selectedPosition.y >= character.y &&
      selectedPosition.y <= character.y + character.height;

    if (insideX && insideY) {
      setFeedback({
        message: `Correct! You found ${character.name}`,
        correct: true,
      });
    } else {
      setFeedback({
        message: "Not this one. Keep looking.",
        correct: false,
      });
    }

    setSelectedPosition(null);
  }

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/characters/")
      .then((response) => response.json())
      .then((data) => {
        setCharacters(data);
      });
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4efe5",
        color: "#202522",
        padding: "clamp(24px, 5vw, 64px) 16px",
      }}
    >
      <section style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            gap: "24px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                color: "#bf3f35",
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.16em",
                margin: "0 0 8px",
                textTransform: "uppercase",
              }}
            >
              Field search / 01
            </p>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 4.25rem)",
                letterSpacing: "0",
                lineHeight: 0.95,
                margin: 0,
              }}
            >
              Where&apos;s Waldo?
            </h1>
          </div>
          <p
            style={{
              background: "#202522",
              color: "#f4efe5",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              margin: 0,
              padding: "10px 14px",
              textTransform: "uppercase",
            }}
          >
            {characters.length} targets in frame
          </p>
        </header>

        <div
          style={{
            background: "#202522",
            border: "1px solid #202522",
            boxShadow: "12px 12px 0 #d7cdbd",
            padding: "clamp(8px, 1.5vw, 16px)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              overflow: "hidden",
            }}
          >
            <img
              src="/images/waldo-city.jpg"
              alt="Where's Waldo game"
              style={{
                width: "100%",
                display: "block",
                cursor: "crosshair",
              }}
              onClick={handleImageClick}
            />

            {selectedPosition && (
              <div
                style={{
                  position: "absolute",
                  left: `${menuPosition.x}px`,
                  top: `${menuPosition.y}px`,
                  transform: "translate(-50%, 18px)",
                  width: "min(220px, calc(100% - 24px))",
                  background: "#fffaf0",
                  border: "2px solid #202522",
                  boxShadow: "6px 6px 0 rgba(32, 37, 34, 0.7)",
                  padding: "14px",
                  zIndex: 3,
                }}
              >
                <p
                  style={{
                    color: "#bf3f35",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    margin: "0 0 10px",
                    textTransform: "uppercase",
                  }}
                >
                  Identify the target
                </p>
                {characters.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => handleCharacterSelection(character)}
                    style={{
                      alignItems: "center",
                      background: "#202522",
                      border: "0",
                      color: "#fffaf0",
                      cursor: "pointer",
                      display: "flex",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      justifyContent: "space-between",
                      marginTop: "6px",
                      padding: "11px 12px",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {character.name}
                    <span aria-hidden="true">-&gt;</span>
                  </button>
                ))}
              </div>
            )}

            {characters.map((character) => (
              <div
                key={character.id}
                style={{
                  position: "absolute",
                  left: `${(character.x / IMAGE_WIDTH) * 100}%`,
                  top: `${(character.y / IMAGE_HEIGHT) * 100}%`,
                  width: `${(character.width / IMAGE_WIDTH) * 100}%`,
                  height: `${(character.height / IMAGE_HEIGHT) * 100}%`,
                  background: "rgba(191, 63, 53, 0.12)",
                  border: "2px solid #e85145",
                  boxSizing: "border-box",
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>
        </div>

        {feedback && (
          <p
            style={{
              background: feedback.correct ? "#d8eadb" : "#f5d7d1",
              borderLeft: `5px solid ${feedback.correct ? "#2c7a4b" : "#bf3f35"}`,
              color: "#202522",
              fontWeight: 700,
              margin: "24px 0 0",
              padding: "14px 16px",
            }}
          >
            {feedback.message}
          </p>
        )}
      </section>
    </main>
  );
}