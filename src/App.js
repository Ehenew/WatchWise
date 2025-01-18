import { useEffect, useState } from "react";
import StarRating from './StarRating.js';

// eslint-disable-next-line no-unused-vars
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];
// eslint-disable-next-line no-unused-vars
const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = '6744af7c';

export default function App() {
  const [ query, setQuery ] = useState('');
  const [ movies, setMovies ] = useState([]);
  const [ watched, setWatched ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState('');
  const [ selectedId, setSelectedId ] = useState(null);


  // eslint-disable-next-line no-lone-blocks
  {/* useEffect(function () {
    console.log('After intial render');
  }, [query]);

  useEffect(function () {
    console.log('After every re-render');
  });
  
  useEffect(function () {
    console.log('D');
  }, [query]);
  
  console.log('During render');
*/}

  function handleSelectId(id) {
    setSelectedId((selectedId) => id === selectedId ? null : id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [ ...watched, movie ]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(function () {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError('');
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${ KEY }&s=${ query }`,
          {
            signal: controller.signal,
          });

        if (!res.ok) throw new Error("💥Something went wrongwith fetching movies!");

        const data = await res.json();
        if (data.Response === 'False') throw new Error('Movie not found');
        setMovies(data.Search);
        setError('');


        // older way of handling async calls -> .then
        // .then(res => res.json())
        // .then(data => setMovies(data.Search));
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
    fetchMovies();

    return function () {
      controller.abort();
    };
  }, [ query ]);

  return (
    <div className="App">
      <NavBar>
        <Search query={ query } setQuery={ setQuery } />
        <NumMovies movies={ movies } />
      </NavBar>
      {/* explicit way of doing the above
      <NavBar element={
        <><Search />
          <NumMovies movies={ movies } />
        </>
      }
      />
      */}
      <Main>
        <Box>
          { isLoading && <Loader /> }
          { !isLoading && !error &&
            <MoviesList
              movies={ movies }
              selectedId={ selectedId }
              onSelectId={ handleSelectId }
            />
          }
          { error && <ErrorMessage message={ error } /> }
        </Box>
        <Box>
          { selectedId ?
            <MovieDetails
              selectedId={ selectedId }
              onCloseMovie={ handleCloseMovie }
              onAddWatched={ handleAddWatched }
              watched={ watched }
            />
            :
            <>
              <WatchedSummary watched={ watched } />
              <WatchedMoviesList watched={ watched } onDeleteWatched={ handleDeleteWatched } />
            </>
          }
        </Box>
      </Main>
    </div>
  );
}

function Loader() {
  return (
    <p className="loader">Loading...</p>
  );
}

function ErrorMessage({ message }) {
  return <p className="error">{ message }</p>;
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      { children }
    </nav>
  );
}



function Logo() {
  return (
    <div className="logo">
      <img src="logo.png" alt="Popcorn logo" width={ 84 } />
      <h1>WatchWise</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={ query }
      onChange={ (e) => setQuery(e.target.value) }
    />
  );
}

function NumMovies({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{ movies.length }</strong> results
    </p>
  );
}


function Main({ children }) {
  return (
    <main className="main">
      { children }
    </main>
  );
}

function Box({ children }) {
  const [ isOpen, setIsOpen ] = useState(true);
  //  here children is the <MoviesList/>

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={ () => setIsOpen((open) => !open) }
      >
        { isOpen ? "–" : "+" }
      </button>
      { isOpen && children }
    </div>
  );
}

/* 
function WatchedBox() {
  const [ watched, setWatched ] = useState(tempWatchedData);
  const [ isOpen2, setIsOpen2 ] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={ () => setIsOpen2((open) => !open) }
      >
        { isOpen2 ? "–" : "+" }
      </button>
      { isOpen2 && (
        <>
          <WatchedSummary watched={ watched } />
          <WatchedMoviesList watched={ watched } />
        </>
      ) }
    </div>
  );
}
*/

function MoviesList({ movies, selectedId, onSelectId }) {
  return (
    <ul className="list list-movies">
      { movies?.map((movie) => (
        <Movie
          movie={ movie }
          selectedId={ selectedId }
          onSelectId={ onSelectId }
          key={ movie.imdbID }
        />
      )) }
    </ul>
  );
}

function Movie({ movie, onSelectId }) {


  return (
    <li onClick={ () => onSelectId(movie.imdbID) }>
      <img src={ movie.Poster } alt={ `${ movie.Title } poster` } />
      <h3>{ movie.Title }</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{ movie.Year }</span>
        </p>
      </div>
    </li>
  );
}


function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [ movie, setMovie ] = useState({});
  const [ isLoading, setIsLoading ] = useState(false);
  const [ userRating, setUserRating ] = useState('');

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;

  const {
    // destructuring
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Released: released,
    Plot: plot,
    Actors: actors,
    Director: director,
    Gener: gener,
  } = movie;
  // console.log(title, year);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  // Closing the movie details page with Escape key
  useEffect(function () {
    function callback(e) {
      if (e.code === 'Escape') {
        onCloseMovie();
        // console.log('CLOSING');
      }
    }

    document.addEventListener('keydown', callback);

    // cleanup function
    return function () {
      document.removeEventListener('keydown', callback);
    };
  }, [ onCloseMovie ]);


  useEffect(function () {
    if (!title) return;
    document.title = `Movie | ${ title }`;

    // cleanup function - will run before the next effect runs and after the component unmounts
    return function () {
      document.title = 'WatchWise';
      console.log(`Cleanup effect for movie ${ title }`);
      // Why is even we have access to title here? Well it is because of closure which is a concept in JS that allows us to access the variables from the outer scope that are no longer in scope. Those variables are still accessible in the inner function. With closure, a function can remember all the variables present at the time and the place where it was created, even if the function is executed in a different scope.
    };
  }, [ title ]);

  useEffect(function () {
    setIsLoading(true);
    async function getMovieDetails() {
      try {
        const res = await fetch(`http://www.omdbapi.com/?apikey=${ KEY }&i=${ selectedId }`);
        if (!res.ok) throw new Error("💥 Could not get movie data!");

        const data = await res.json();
        // console.log(data);
        setMovie(data);
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    getMovieDetails();
  }, [ selectedId ]);

  return (
    <div className="details">
      { isLoading ? <Loader /> :
        <>
          <header>
            <button className="btn-back" onClick={ onCloseMovie }>&larr;</button>
            <img src={ poster } alt={ `Poster of ${ title }` } />
            <div className="details-overview">
              <h2>{ title }</h2>
              <p>{ released }&bull; { runtime }</p>
              <p>{ gener }</p>
              <p>⭐ { imdbRating } IMDb rating</p>
            </div>
          </header>

          <section>
            <div className="rating">
              {
                !isWatched ?
                  <>
                    <StarRating
                      maxRating={ 10 } size={ 24 }
                      onSetRating={ setUserRating }
                    />

                    { userRating > 0 && (
                      <button className="btn-add" onClick={ handleAdd }>+ Add to list</button>)
                    }</> :
                  <p> You rated this movie with { watchedUserRating }⭐</p>
              }
            </div>
            <p><em>{ plot }</em></p>
            <p>Staring: { actors }</p>
            <p>Directed by { director }</p>
          </section>
        </>
      }
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{ watched.length } movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{ avgImdbRating.toFixed(2) }</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{ avgUserRating.toFixed(2) }</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{ avgRuntime } min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      { watched.map((movie) => (
        <WatchedMovie movie={ movie } key={ movie.imdbID } onDeleteWatched={ onDeleteWatched } />
      )) }
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={ movie.poster } alt={ `${ movie.Title } poster` } />
      <h3>{ movie.title }</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{ movie.imdbRating }</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{ movie.userRating }</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{ movie.runtime } min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={ () => onDeleteWatched(movie.imdbID) }>X</button>
    </li>
  );
}