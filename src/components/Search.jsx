import React from 'react'

const Search = ({ query, setQuery }) => {
  
  return (
    <div className='search'>
        <div>
            <img src='search.svg' alt="search" />
            <input
                className='ml-2'
                type='text' placeholder='From Classics to New Releases Find Them All'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    </div>
  )
}

export default Search