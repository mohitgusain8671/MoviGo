import React, { useEffect, useState } from 'react'
import Search from './components/search'
import './App.css'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
const App = () => {
  
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('');

  const [movies, setMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  // Debounce the search term to prevent making too many Api Request by waiting for user to stop typing for 500 ms
  useDebounce(()=> setDebouncedSearchTerm(searchQuery), 500, [searchQuery])

  const fetchMovies = async (query='') => {
    setIsLoading(true);
    setErrorMessage(null)
    try{
      const endpoint = query?
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if(!response.ok){
        throw new Error(response.statusText);
      }
      const data = await response.json();
      if(data.response==='False'){
        setErrorMessage(data.Error || 'No movies found');
        setMovies([]);
        return ;
      }
      console.log(data);
      setMovies(data.results || [])

      if(query && data.results.length>0){
        await updateSearchCount(query,data.results[0]);
      }
    }catch(error){
      console.log(`Error Fetching Movies: ${error}`)
      setErrorMessage('Something went wrong with the movie search. Refresh or try again later.');
    }finally{
      setIsLoading(false);
    }
  }
  const fetchTrendingMovies = async () => {
    try{
      const res = await getTrendingMovies();
      setTrendingMovies(res);
    }catch(err){
      console.error(`Error Fetching Trending Movies: ${err}`)
    }
  }
  useEffect(()=>{
    fetchMovies(debouncedSearchTerm)
  },[debouncedSearchTerm])

  useEffect(()=>{
    fetchTrendingMovies()
  },[])

  return (
    <main>
      <div className='pattern'></div>

      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt='Hero Banner'/>
          <h1>
            Say Goodbye to Boring Picks – Find <span className='text-gradient'>Movies</span> That Excite!
          </h1>
          <Search query={searchQuery} setQuery={setSearchQuery} />
        </header>
        {trendingMovies.length>0 && (
          <section className='trending'>
            <h2 className='trending-title'>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.Poster_Url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className='all-movies'>
          <h2>All Movies</h2>
          {
            isLoading ? (
              <span class="loader"></span>
            ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p> ): (
                <ul>
                  {movies.map((movie, index) => (
                    <MovieCard key={index} movie={movie} />
                  ))}
                </ul>
              )
          }
        </section>
        
      </div>
    </main>
  )
}

export default App