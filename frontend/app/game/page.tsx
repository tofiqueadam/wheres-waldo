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

export default function GamePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [lastClick, setLastClick] = useState<{ x: number; y: number } | null>(
    null
  );
  const [clickResult, setClickResult] = useState<string | null>(null);

  function findCharacter(x: number, y: number) {
    return characters.find((character) => {
      const insideX =
        x >= character.x &&
        x <= character.x + character.width;

      const insideY =
        y >= character.y &&
        y <= character.y + character.height;

      return insideX && insideY;
    });
  }

  function handleImageClick(event: MouseEvent<HTMLImageElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const displayX = event.clientX - rect.left;
    const displayY = event.clientY - rect.top;

    const scaleX = IMAGE_WIDTH / rect.width;
    const scaleY = IMAGE_HEIGHT / rect.height;

    const x = displayX * scaleX;
    const y = displayY * scaleY;

    setLastClick({
      x: Math.round(x),
      y: Math.round(y),
    });

    const character = findCharacter(x, y);

    if (character) {
      console.log("You clicked:", character.name);
      setClickResult(`You clicked: ${character.name}`);
    } else {
      console.log("Nothing found");
      setClickResult("Nothing found");
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
  <main>
    <h1>Where's Waldo?</h1>

    <p>
      Characters: {characters.length}
    </p>

    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1200px",
      }}
    >
      <img
        src="/images/waldo-city.jpg"
        alt="Where's Waldo game"
        style={{
          width: "100%",
          display: "block",
        }}
        onClick={handleImageClick}
      />

      {characters.map((character) => (
        <div
          key={character.id}
          style={{
            position: "absolute",
            left: `${(character.x / IMAGE_WIDTH) * 100}%`,
            top: `${(character.y / IMAGE_HEIGHT) * 100}%`,
            width: `${(character.width / IMAGE_WIDTH) * 100}%`,
            height: `${(character.height / IMAGE_HEIGHT) * 100}%`,
            border: "2px solid red",
            boxSizing: "border-box",
          }}
        />
      ))}
    </div>

    {lastClick && (
      <p>
        Last click: X={lastClick.x}, Y={lastClick.y}
      </p>
    )}

    {clickResult && <p>{clickResult}</p>}
  </main>
);
}