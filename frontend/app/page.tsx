"use client";

import { useEffect, useState } from "react";

type Character = {
  id: number;
  name: string;
};

export default function Home() {
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
      <h1>Where&apos;s Waldo?</h1>

      <h2>Found {characters.length} characters</h2>

      <ul>
        {characters.map((character) => (
          <li key={character.id}>
            {character.name}
          </li>
        ))}
      </ul>
    </main>
  );
}