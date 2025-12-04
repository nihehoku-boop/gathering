# Free APIs for Collectibles Tracking

## 🎬 Movies & TV Shows

### The Movie Database (TMDB) API
- **URL**: https://www.themoviedb.org/documentation/api
- **Free Tier**: Yes, no rate limits
- **What it provides**:
  - Movies (details, cast, crew, images, trailers)
  - TV Shows (seasons, episodes, cast)
  - Search functionality
  - Popular/Top Rated lists
  - Genres, keywords, collections
- **Best for**: Movie/TV show collections, tracking watched items
- **Authentication**: API key required (free)

### OMDb API (Open Movie Database)
- **URL**: http://www.omdbapi.com/
- **Free Tier**: 1,000 requests/day
- **What it provides**: Movie/TV show details, ratings (IMDb, Rotten Tomatoes)
- **Best for**: Additional movie metadata

---

## 🎮 Video Games

### RAWG Video Games Database API
- **URL**: https://rawg.io/apidocs
- **Free Tier**: Yes, 20,000 requests/month
- **What it provides**:
  - Game details (title, release date, platforms, genres)
  - Game images and screenshots
  - Ratings and reviews
  - Game series and franchises
  - Search and filtering
- **Best for**: Video game collections, tracking owned games
- **Authentication**: API key required (free)

### IGDB (Internet Game Database) API
- **URL**: https://www.igdb.com/api
- **Free Tier**: Yes, with rate limits
- **What it provides**: Comprehensive game database with detailed metadata
- **Best for**: Detailed game information
- **Note**: Requires Twitch account for authentication

---

## 🎵 Music & Vinyl Records

### Discogs API
- **URL**: https://www.discogs.com/developers
- **Free Tier**: Yes, 60 requests/minute
- **What it provides**:
  - Album/Release information
  - Artist details
  - Label information
  - Marketplace data (prices, availability)
  - Images of releases
- **Best for**: Vinyl records, CDs, music collections
- **Authentication**: OAuth required

### MusicBrainz API
- **URL**: https://musicbrainz.org/doc/MusicBrainz_API
- **Free Tier**: Yes, 1 request/second
- **What it provides**: Comprehensive music metadata (artists, releases, recordings)
- **Best for**: Music cataloging, detailed metadata
- **Authentication**: User-Agent required

### Spotify Web API
- **URL**: https://developer.spotify.com/documentation/web-api
- **Free Tier**: Yes, 1,000 requests/month
- **What it provides**: Music metadata, playlists, artist information
- **Best for**: Modern music collections
- **Authentication**: OAuth required

---

## 📚 Books (Already Using)

### Open Library API
- **Status**: ✅ Already integrated
- **What it provides**: Book metadata, covers, ISBN lookup

### Google Books API
- **URL**: https://developers.google.com/books
- **Free Tier**: Yes, 1,000 requests/day
- **What it provides**: Book information, previews, search
- **Best for**: Additional book metadata

---

## 🃏 Trading Cards (Already Using)

### Pokemon TCG API (@tcgdx/sdk)
- **Status**: ✅ Already integrated
- **What it provides**: Pokemon card data, images, sets

### Scryfall API (Magic: The Gathering)
- **Status**: ✅ Already integrated
- **What it provides**: MTG card data, images, sets

### YGOPRODeck API (Yu-Gi-Oh!)
- **Status**: ✅ Already integrated
- **What it provides**: Yu-Gi-Oh! card data, images, sets

---

## 📖 Comics

### Comic Vine API
- **URL**: https://comicvine.gamespot.com/api/
- **Free Tier**: Yes, 200 requests/hour
- **What it provides**:
  - Comic book information
  - Character details
  - Series information
  - Publisher data
- **Best for**: Comic book collections
- **Authentication**: API key required (free)

### Marvel API
- **URL**: https://developer.marvel.com/
- **Free Tier**: Yes, 3,000 requests/day
- **What it provides**: Marvel comics, characters, creators, events
- **Best for**: Marvel comic collections
- **Authentication**: API key required (free)

### DC Comics API
- **Note**: No official public API available
- **Alternative**: Scrape or use Comic Vine for DC content

---

## 🏀 Sports Cards

### TCDB (Trading Card Database) API
- **URL**: https://www.tcdb.com/
- **Status**: Limited API access, mostly web scraping
- **What it provides**: Sports card information, checklists, prices
- **Best for**: Sports card collections
- **Note**: May require web scraping instead of API

### Sports Reference API
- **URL**: https://www.sports-reference.com/
- **Status**: No official API, but data is available
- **What it provides**: Sports statistics and player information
- **Note**: Would require web scraping

---

## 🪙 Coins & Currency

### Numista API
- **URL**: https://en.numista.com/
- **Status**: Limited API access
- **What it provides**: Coin catalog information
- **Note**: May require web scraping or manual data entry

### CoinGecko API
- **URL**: https://www.coingecko.com/en/api
- **Free Tier**: Yes, 50 calls/minute
- **What it provides**: Cryptocurrency data (not physical coins)
- **Best for**: Crypto collections (if applicable)

---

## 🎯 Recommended Next Steps

### High Priority (Easy to Implement):
1. **TMDB API** - Movies & TV Shows
   - Large database, no rate limits
   - Perfect for film collections
   - Easy to integrate

2. **RAWG API** - Video Games
   - Good free tier (20k requests/month)
   - Comprehensive game database
   - Great for gaming collections

3. **Discogs API** - Music/Vinyl
   - Excellent for music collectors
   - Marketplace data included
   - Good rate limits

### Medium Priority:
4. **Comic Vine API** - Comics
   - Good free tier
   - Covers Marvel, DC, and indie comics
   - Comprehensive database

5. **Spotify API** - Modern Music
   - Good for digital music collections
   - Limited free tier (1k/month)

### Lower Priority (More Complex):
6. **Sports Cards** - May require web scraping
7. **Coins** - Limited API availability

---

## Implementation Notes

- All APIs require API keys (free to obtain)
- Rate limiting should be implemented
- Consider caching responses to reduce API calls
- Some APIs require OAuth (Discogs, Spotify)
- Web scraping may be needed for some categories (sports cards, coins)

---

## Current Status

✅ **Already Integrated:**
- Open Library (Books)
- Pokemon TCG API
- Scryfall (Magic: The Gathering)
- YGOPRODeck (Yu-Gi-Oh!)

🎯 **Recommended Next:**
- TMDB (Movies/TV)
- RAWG (Video Games)
- Discogs (Music/Vinyl)

