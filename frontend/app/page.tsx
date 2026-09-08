"use client";

import { useEffect, useState } from "react";

type Character = {
  id: number;
  name: string;
};

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/characters")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch from backend");
        }

        return response.json();
      })
      .then((data) => {
        setCharacters(data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main>
      <h1>Where&apos;s Waldo?</h1>

      {loading && <p>Loading...</p>}

      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <>
          <h2>Characters:</h2>
          <ul>
            {characters.map((character) => (
              <li key={character.id}>{character.name}</li>
            ))}
          </ul>
          <h2>Character Count: {characters.length} </h2>
        </>
      )}
    </main>
  );
}
