const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// Rate limiting: TMDB has no official rate limits, but we'll be respectful
const DELAY_BETWEEN_REQUESTS = 250 // 250ms between requests (4 requests/second)

// Get API key at runtime (not at module load time)
function getApiKey(): string {
  return process.env.TMDB_API_KEY || ''
}

export interface TMDBMovie {
  id: number
  title: string
  original_title: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  runtime: number | null
  vote_average: number
  genres: Array<{ id: number; name: string }>
  director?: string
  certification?: string
}

export interface MovieData {
  title: string
  year: number
  director: string
  runtime: number | null
  rating: string
  genre: string
  posterUrl: string | null
  backdropUrl: string | null
  tmdbId: number
}

/**
 * Search for a movie by title and year
 */
export async function searchMovie(title: string, year?: number): Promise<TMDBMovie | null> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn('⚠️  TMDB_API_KEY not set. Skipping TMDB search.')
    return null
  }

  try {
    // Clean title for better matching (remove special characters that might interfere)
    let searchTitle = title
    // Remove parentheticals like "(The Unexpected Virtue of Ignorance)" for better matching
    searchTitle = searchTitle.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
    
    const searchParams = new URLSearchParams({
      api_key: apiKey,
      query: searchTitle,
      language: 'en-US',
    })
    
    if (year) {
      searchParams.append('year', year.toString())
    }

    const response = await fetch(`${TMDB_BASE_URL}/search/movie?${searchParams}`)
    
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      // Try without year if first search failed
      if (year) {
        const retryParams = new URLSearchParams({
          api_key: apiKey,
          query: searchTitle,
          language: 'en-US',
        })
        const retryResponse = await fetch(`${TMDB_BASE_URL}/search/movie?${retryParams}`)
        if (retryResponse.ok) {
          const retryData = await retryResponse.json()
          if (retryData.results && retryData.results.length > 0) {
            // Find the best match by year proximity
            const bestMatch = retryData.results.find((m: any) => {
              const releaseYear = m.release_date ? new Date(m.release_date).getFullYear() : null
              return releaseYear && Math.abs(releaseYear - (year || 0)) <= 2
            }) || retryData.results[0]
            
            return await getMovieDetails(bestMatch.id)
          }
        }
      }
      return null
    }

    // If we have year, try to find exact match first
    let movie = data.results[0]
    if (year) {
      const exactMatch = data.results.find((m: any) => {
        const releaseYear = m.release_date ? new Date(m.release_date).getFullYear() : null
        return releaseYear === year
      })
      if (exactMatch) {
        movie = exactMatch
      } else {
        // Find closest year match
        const closestMatch = data.results.reduce((best: any, current: any) => {
          const bestYear = best.release_date ? new Date(best.release_date).getFullYear() : null
          const currentYear = current.release_date ? new Date(current.release_date).getFullYear() : null
          if (!bestYear) return current
          if (!currentYear) return best
          const bestDiff = Math.abs(bestYear - year)
          const currentDiff = Math.abs(currentYear - year)
          return currentDiff < bestDiff ? current : best
        })
        movie = closestMatch
      }
    }
    
    // Fetch full details including director
    return await getMovieDetails(movie.id)
  } catch (error) {
    console.error(`Error searching TMDB for "${title}":`, error)
    return null
  }
}

/**
 * Get detailed movie information including director
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=credits,release_dates`
    )
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    // Find director from credits
    const director = data.credits?.crew?.find((person: any) => person.job === 'Director')?.name || null
    
    // Get content rating (MPAA rating)
    const certification = data.release_dates?.results
      ?.find((r: any) => r.iso_3166_1 === 'US')
      ?.release_dates?.[0]?.certification || null

    return {
      id: data.id,
      title: data.title,
      original_title: data.original_title,
      release_date: data.release_date,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      overview: data.overview,
      runtime: data.runtime,
      vote_average: data.vote_average,
      genres: data.genres || [],
      director: director || undefined,
      certification: certification || undefined,
    }
  } catch (error) {
    console.error(`Error fetching TMDB movie details for ID ${movieId}:`, error)
    return null
  }
}

/**
 * Get poster image URL
 */
export function getPosterUrl(posterPath: string | null, size: 'w500' | 'original' = 'w500'): string | null {
  if (!posterPath) return null
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`
}

/**
 * Get backdrop image URL
 */
export function getBackdropUrl(backdropPath: string | null, size: 'w1280' | 'original' = 'w1280'): string | null {
  if (!backdropPath) return null
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`
}

/**
 * Process movie data for database storage
 */
export async function processMovie(
  title: string,
  year: number,
  delay: number = 0
): Promise<MovieData | null> {
  // Add delay for rate limiting
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  console.log(`   Searching TMDB for "${title}" (${year})...`)
  
  const movie = await searchMovie(title, year)
  
  if (!movie) {
    console.log(`   ⚠️  Not found in TMDB`)
    return null
  }

  // Map genres to string
  const genre = movie.genres.map(g => g.name).join(', ') || 'Unknown'
  
  // Get rating (certification or default)
  const rating = movie.certification || 'NR'

  return {
    title: movie.title,
    year: new Date(movie.release_date).getFullYear(),
    director: movie.director || 'Unknown',
    runtime: movie.runtime,
    rating,
    genre,
    posterUrl: getPosterUrl(movie.poster_path),
    backdropUrl: getBackdropUrl(movie.backdrop_path),
    tmdbId: movie.id,
  }
}

/**
 * Sleep function for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

