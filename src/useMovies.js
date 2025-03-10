import { useState, useEffect } from "react";

const KEY = '6744af7c';

// export function useMovies(query, callback) {
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(function () {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError('');
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          {
            signal: controller.signal,
          });

        if (!res.ok) throw new Error("💥Something went wrongwith fetching movies!");

        const data = await res.json();
        if (data.Response === 'False') throw new Error('Movie not found');
        setMovies(data.Search);
        setError('');

      } catch (err) {
        console.log(err.message);
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError('');
      return;
    }
    // handleCloseMovie()
    // callback?.(); // for closing a movie
    fetchMovies();

    return function () {
      controller.abort();
    };
  }, [query]);

  return {movies, isLoading, error}
}