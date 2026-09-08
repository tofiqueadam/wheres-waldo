"use client";

import { useEffect, useState } from "react";

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
      />

      {characters.map((character) => (
        <div
          key={character.id}
          style={{
            position: "absolute",
            left: character.x,
            top: character.y,
            width: character.width,
            height: character.height,
            border: "2px solid red",
          }}
        />
      ))}
    </div>
  </main>
);
}