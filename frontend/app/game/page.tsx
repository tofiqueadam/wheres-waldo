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
  const [foundCharacters, setFoundCharacters] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<ClickPosition | null>(
    null
  );
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState<{
    message: string;
    correct: boolean;
  } | null>(null);
  const gameFinished =
    characters.length > 0 && foundCharacters.length === characters.length;

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

  async function handleCharacterSelection(character: Character) {
    if (!selectedPosition) {
      return;
    }

    if (foundCharacters.includes(character.id)) {
      setSelectedPosition(null);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/game/guess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          character_id: character.id,
          x: selectedPosition.x,
          y: selectedPosition.y,
        }),
      });

      if (!response.ok) {
        throw new Error("Guess request failed");
      }

      const result: { correct: boolean; character?: string } =
        await response.json();

      if (result.correct) {
        setFoundCharacters((current) =>
          current.includes(character.id) ? current : [...current, character.id]
        );
        setFeedback({
          message: `Correct! You found ${result.character ?? character.name}`,
          correct: true,
        });
      } else {
        setFeedback({
          message: "Not this one. Keep looking.",
          correct: false,
        });
      }
    } catch {
      setFeedback({
        message: "Could not check your guess. Try again.",
        correct: false,
      });
    } finally {
      setSelectedPosition(null);
    }
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
        height: "100vh",
        background: "#f4efe5",
        color: "#202522",
        overflow: "hidden",
        padding: "clamp(14px, 2.5vw, 32px)",
      }}
    >
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)",
          gap: "clamp(16px, 2.5vw, 36px)",
          height: "100%",
          margin: "0 auto",
          maxWidth: "1600px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <header
            style={{
              alignItems: "end",
              display: "flex",
              gap: "20px",
              justifyContent: "space-between",
              marginBottom: "clamp(12px, 2vh, 22px)",
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
            <p
              style={{
                color: "#5d645f",
                fontSize: "0.86rem",
                fontWeight: 700,
                margin: "10px 0 0",
              }}
            >
              Found {foundCharacters.length} / {characters.length}
            </p>
            </div>
            <p
              style={{
                background: "#202522",
                color: "#f4efe5",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                padding: "9px 12px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {characters.length} targets
            </p>
          </header>

          <div
            style={{
              alignItems: "center",
              background: "#202522",
              border: "1px solid #202522",
              boxShadow: "12px 12px 0 #d7cdbd",
              display: "flex",
              flex: 1,
              minHeight: 0,
              padding: "clamp(8px, 1.5vw, 16px)",
            }}
          >
            <div
              style={{
              position: "relative",
              aspectRatio: "3 / 2",
              width: "100%",
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
                {characters
                  .filter((character) => !foundCharacters.includes(character.id))
                  .map((character) => (
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
                {characters.every((character) =>
                  foundCharacters.includes(character.id)
                ) && (
                  <p
                    style={{
                      color: "#5d645f",
                      fontSize: "0.8rem",
                      margin: "10px 0 0",
                    }}
                  >
                    Everyone found.
                  </p>
                )}
              </div>
            )}

            {characters
              .filter((character) => foundCharacters.includes(character.id))
              .map((character) => (
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
        </div>

        <aside
          style={{
            background: "#202522",
            boxShadow: "12px 12px 0 #d7cdbd",
            color: "#fffaf0",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            padding: "clamp(20px, 3vw, 42px)",
          }}
        >
          <p
            style={{
              color: "#e85145",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.16em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Mission status
          </p>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 3rem)",
              letterSpacing: "0",
              lineHeight: 1,
              margin: "12px 0 14px",
            }}
          >
            Find the hidden crew.
          </h2>
          <p
            style={{
              color: "#c8c5b9",
              fontSize: "0.95rem",
              lineHeight: 1.55,
              margin: 0,
              maxWidth: "32ch",
            }}
          >
            Click the picture, then choose the name that matches your find.
          </p>

          <div
            style={{
              borderBottom: "1px solid #4b514c",
              borderTop: "1px solid #4b514c",
              margin: "clamp(24px, 5vh, 56px) 0 0",
              padding: "18px 0",
            }}
          >
            <p
              style={{
                color: "#c8c5b9",
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                margin: "0 0 10px",
                textTransform: "uppercase",
              }}
            >
              Latest result
            </p>
            <p
              style={{
                color: feedback
                  ? feedback.correct
                    ? "#91d5a6"
                    : "#ff9b8f"
                  : "#fffaf0",
                fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {feedback?.message ?? "Waiting for your first find."}
            </p>
            {gameFinished && (
              <p
                style={{
                  color: "#91d5a6",
                  fontSize: "1rem",
                  fontWeight: 800,
                  margin: "14px 0 0",
                }}
              >
                You found everyone!
              </p>
            )}
          </div>

          <div style={{ marginTop: "auto" }}>
            <p
              style={{
                color: "#c8c5b9",
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                margin: "0 0 12px",
                textTransform: "uppercase",
              }}
            >
              Targets in this frame
            </p>
            <div style={{ display: "grid", gap: "8px" }}>
              {characters.map((character, index) => (
                <div
                  key={character.id}
                  style={{
                    alignItems: "center",
                    borderBottom: "1px solid #4b514c",
                    display: "flex",
                    gap: "10px",
                    padding: "8px 0",
                  }}
                >
                  <span style={{ color: "#e85145", fontWeight: 800 }}>
                    0{index + 1}
                  </span>
                  <span style={{ fontWeight: 700 }}>{character.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}