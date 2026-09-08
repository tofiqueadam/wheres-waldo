"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import styles from "./page.module.css";

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 800;
const SHOW_DEBUG_BOXES = process.env.NODE_ENV !== "production";

type Character = {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image_id: number;
};

type Score = {
  id: number;
  player_name: string;
  time_seconds: number;
};

type ClickPosition = {
  x: number;
  y: number;
};

type PanPosition = {
  x: number;
  y: number;
};

type PointerPosition = {
  x: number;
  y: number;
};

export default function GamePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [foundCharacters, setFoundCharacters] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [scores, setScores] = useState<Score[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState<PanPosition>({ x: 0, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<ClickPosition | null>(
    null
  );
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, PointerPosition>());
  const dragStartRef = useRef<
    { x: number; y: number; pan: PanPosition } | null
  >(null);
  const pinchStartRef = useRef<
    { distance: number; zoom: number } | null
  >(null);
  const suppressClickRef = useRef(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    correct: boolean;
  } | null>(null);
  const gameFinished =
    characters.length > 0 && foundCharacters.length === characters.length;

  function changeZoom(delta: number) {
    setZoomLevel((current) =>
      Math.min(2.5, Math.max(1, Number((current + delta).toFixed(1))))
    );
  }

  function constrainPan(next: PanPosition, zoom = zoomLevel) {
    const viewport = viewportRef.current;

    if (!viewport) {
      return next;
    }

    const rect = viewport.getBoundingClientRect();
    const maxX = (rect.width * (zoom - 1)) / 2;
    const maxY = (rect.height * (zoom - 1)) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  function getPointerDistance() {
    const [first, second] = [...pointersRef.current.values()];

    if (!first || !second) {
      return 0;
    }

    return Math.hypot(second.x - first.x, second.y - first.y);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (zoomLevel === 1) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 1) {
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        pan: panPosition,
      };
    } else if (pointersRef.current.size === 2) {
      pinchStartRef.current = {
        distance: getPointerDistance(),
        zoom: zoomLevel,
      };
      dragStartRef.current = null;
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2 && pinchStartRef.current) {
      const distance = getPointerDistance();
      const nextZoom = Math.min(
        2.5,
        Math.max(1, pinchStartRef.current.zoom * (distance / pinchStartRef.current.distance))
      );

      setZoomLevel(Number(nextZoom.toFixed(2)));
      setPanPosition((current) => constrainPan(current, nextZoom));
      suppressClickRef.current = true;
      return;
    }

    if (pointersRef.current.size === 1 && dragStartRef.current) {
      const deltaX = event.clientX - dragStartRef.current.x;
      const deltaY = event.clientY - dragStartRef.current.y;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        suppressClickRef.current = true;
      }

      setPanPosition(
        constrainPan({
          x: dragStartRef.current.pan.x + deltaX,
          y: dragStartRef.current.pan.y + deltaY,
        })
      );
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }

    if (pointersRef.current.size === 0) {
      dragStartRef.current = null;
    }
  }

  function resetGame() {
    setGameStarted(false);
    setSeconds(0);
    setFoundCharacters([]);
    setSelectedPosition(null);
    setMenuPosition({ x: 0, y: 0 });
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setFeedback(null);
  }

  function handleImageClick(event: MouseEvent<HTMLImageElement>) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();

    const visibleX = event.clientX - rect.left;
    const visibleY = event.clientY - rect.top;
    const imageOffsetX = (rect.width * (1 - zoomLevel)) / 2 + panPosition.x;
    const imageOffsetY = (rect.height * (1 - zoomLevel)) / 2 + panPosition.y;

    const displayX = (visibleX - imageOffsetX) / zoomLevel;
    const displayY = (visibleY - imageOffsetY) / zoomLevel;

    const scaleX = IMAGE_WIDTH / rect.width;
    const scaleY = IMAGE_HEIGHT / rect.height;

    const x = displayX * scaleX;
    const y = displayY * scaleY;

    setSelectedPosition({ x, y });
    setMenuPosition({ x: visibleX, y: visibleY });
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

  async function saveScore() {
    if (!playerName.trim()) {
      return;
    }

    await fetch("http://127.0.0.1:8000/api/scores/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_name: playerName.trim(),
        time_seconds: seconds,
      }),
    });

    const response = await fetch("http://127.0.0.1:8000/api/scores/");
    const data = await response.json();

    setScores(data);
  }

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/characters/")
      .then((response) => response.json())
      .then((data) => {
        setCharacters(data);
      });
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/scores/")
      .then((response) => response.json())
      .then((data) => {
        setScores(data);
      });
  }, []);

  useEffect(() => {
    if (!gameStarted || gameFinished) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [gameStarted, gameFinished]);

  useEffect(() => {
    setPanPosition((current) => constrainPan(current, zoomLevel));
  }, [zoomLevel]);

  useEffect(() => {
    if (!gameFinished || !playerName) {
      return;
    }

    saveScore();
  }, [gameFinished, playerName]);

  if (!gameStarted) {
    return (
      <main className={styles.startPage}>
        <div className={styles.startBackdrop} aria-hidden="true" />
        <section className={styles.startCard}>
          <p className={styles.startEyebrow}>A field search challenge</p>
          <h1 className={styles.startTitle}>Where&apos;s Waldo?</h1>
          <p className={styles.startCopy}>
            Find every hidden character before the clock catches you. Zoom in,
            inspect the scene, and trust your eyes.
          </p>
          <label className={styles.nameLabel} htmlFor="player-name">
            Your name
          </label>
          <input
            id="player-name"
            className={styles.nameInput}
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && playerName.trim()) {
                setGameStarted(true);
              }
            }}
            autoComplete="name"
            autoFocus
          />
          <button
            type="button"
            className={styles.startButton}
            onClick={() => setGameStarted(true)}
            disabled={!playerName.trim()}
          >
            Start game <span aria-hidden="true">-&gt;</span>
          </button>
          <p className={styles.startNote}>The clock starts when you enter.</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.gamePage}>
      <section className={styles.shell}>
        <div className={styles.stageColumn}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Field search / 01</p>
              <h1 className={styles.title}>Where&apos;s Waldo?</h1>
              <div className={styles.statStrip}>
                <span className={styles.stat}>
                  <span className={styles.statLabel}>Found</span>
                  <span className={styles.statValue}>
                    {foundCharacters.length}/{characters.length}
                  </span>
                </span>
                <span className={styles.stat}>
                  <span className={styles.statLabel}>Time</span>
                  <span className={styles.statValue}>{seconds}s</span>
                </span>
              </div>
            </div>
            <p className={styles.targetCount}>{characters.length} targets</p>
          </header>

          <div className={styles.imageFrame}>
            <div
              ref={viewportRef}
              className={`${styles.imageViewport} ${
                zoomLevel > 1 ? styles.imageViewportZoomed : ""
              }`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div
                className={styles.toolbar}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className={styles.toolButton}
                  onClick={() => changeZoom(-0.5)}
                  disabled={zoomLevel === 1}
                  aria-label="Zoom out"
                >
                  -
                </button>
                <span className={styles.zoomReadout}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  className={styles.toolButton}
                  onClick={() => changeZoom(0.5)}
                  disabled={zoomLevel === 2.5}
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  type="button"
                  className={styles.toolButton}
                  onClick={() => setZoomLevel(1)}
                  disabled={zoomLevel === 1}
                >
                  Reset
                </button>
              </div>
              <div
                className={styles.imageLayer}
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                }}
              >
                <img
                  src="/images/waldo-city.jpg"
                  alt="Where's Waldo game"
                  className={styles.image}
                  onClick={handleImageClick}
                />

                {characters
                  .filter(
                    (character) =>
                      SHOW_DEBUG_BOXES || foundCharacters.includes(character.id)
                  )
                  .map((character) => (
                    <div
                      key={character.id}
                      className={styles.debugBox}
                      style={{
                        left: `${(character.x / IMAGE_WIDTH) * 100}%`,
                        top: `${(character.y / IMAGE_HEIGHT) * 100}%`,
                        width: `${(character.width / IMAGE_WIDTH) * 100}%`,
                        height: `${(character.height / IMAGE_HEIGHT) * 100}%`,
                      }}
                    />
                  ))}
              </div>

              {selectedPosition && (
                <div
                  className={styles.clickMarker}
                  style={{
                    left: `${menuPosition.x}px`,
                    top: `${menuPosition.y}px`,
                  }}
                  aria-hidden="true"
                />
              )}

              {selectedPosition && (
                <div
                  className={styles.selectionMenu}
                  onPointerDown={(event) => event.stopPropagation()}
                  style={{
                    left: `${menuPosition.x}px`,
                    top: `${menuPosition.y}px`,
                  }}
                >
                  <p className={styles.selectionLabel}>Identify the target</p>
                  {characters
                    .filter(
                      (character) =>
                        !foundCharacters.includes(character.id)
                    )
                    .map((character) => (
                      <button
                        key={character.id}
                        type="button"
                        className={styles.characterButton}
                        onClick={() => handleCharacterSelection(character)}
                      >
                        {character.name}
                        <span aria-hidden="true">-&gt;</span>
                      </button>
                    ))}
                  {characters.every((character) =>
                    foundCharacters.includes(character.id)
                  ) && <p className={styles.emptyMenu}>Everyone found.</p>}
                </div>
              )}

            </div>
          </div>
        </div>

        <aside className={styles.panel}>
          <p className={styles.panelEyebrow}>Mission status</p>
          <h2 className={styles.panelTitle}>Find the hidden crew.</h2>
          <p className={styles.panelCopy}>
            Click the picture, then choose the name that matches your find.
          </p>

          <div className={styles.result}>
            <p className={styles.resultLabel}>Latest result</p>
            <p
              className={`${styles.resultText} ${
                feedback
                  ? feedback.correct
                    ? styles.resultSuccess
                    : styles.resultFailure
                  : ""
              }`}
            >
              {feedback?.message ?? "Waiting for your first find."}
            </p>
            {gameFinished && (
              <div className={styles.completion}>
                <p>You found everyone!</p>
                <p>Your time: {seconds} seconds</p>
                <button
                  type="button"
                  className={styles.playAgainButton}
                  onClick={resetGame}
                >
                  Play again <span aria-hidden="true">-&gt;</span>
                </button>
              </div>
            )}
          </div>

          <section className={styles.leaderboard}>
            <p className={styles.leaderboardLabel}>Leaderboard</p>
            {scores.length === 0 ? (
              <p className={styles.panelCopy}>No completed runs yet.</p>
            ) : (
              <div className={styles.leaderboardList}>
                {scores.map((score, index) => (
                  <div key={score.id} className={styles.scoreItem}>
                    <span>
                      <strong className={styles.scoreRank}>{index + 1}.</strong>{" "}
                      {score.player_name}
                    </span>
                    <span className={styles.scoreTime}>
                      {score.time_seconds}s
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}