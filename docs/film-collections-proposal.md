# Film/Blu-ray Collections Proposal

## 🎬 Film Template

A new template has been created for physical film media (Blu-rays, DVDs, 4K UHD, etc.) with the following fields:

### Template Fields:
- **Director** - Film director name
- **Release Year** - Year the film was released
- **Format** - Physical format (Blu-ray, 4K UHD, DVD, etc.)
- **Edition** - Special editions (Steelbook, Collector's, Criterion, etc.)
- **Region** - Blu-ray/DVD region code
- **Runtime** - Film length in minutes
- **Rating** - Content rating (G, PG, R, etc.)
- **Genre** - Film genre(s)
- **Studio/Distributor** - Distributor or special edition label

## 📀 Proposed Example Collections

### 1. **Criterion Collection**
- **Description**: The Criterion Collection is a series of important classic and contemporary films on home video
- **Estimated Items**: 1,200+ films
- **Source**: Criterion.com official list
- **Image Source**: TMDB API (poster images)
- **Special Features**: Includes spine numbers, special features, restoration info

### 2. **Arrow Video Collection**
- **Description**: Premium cult and classic films on Blu-ray
- **Estimated Items**: 500+ releases
- **Source**: Arrow Films official catalog
- **Image Source**: TMDB API
- **Special Features**: Limited editions, booklets, special features

### 3. **4K UHD Collection - Top 100**
- **Description**: Top 100 films available in 4K Ultra HD
- **Estimated Items**: 100 films
- **Source**: Curated list of best 4K releases
- **Image Source**: TMDB API
- **Special Features**: HDR info, audio formats

### 4. **Steelbook Collection**
- **Description**: Popular films released in Steelbook editions
- **Estimated Items**: 200+ titles
- **Source**: Various retailers (Best Buy, Zavvi, etc.)
- **Image Source**: TMDB API + custom Steelbook images
- **Special Features**: Limited availability, retailer exclusives

### 5. **Best Picture Winners (Oscars)**
- **Description**: All Academy Award Best Picture winners
- **Estimated Items**: 95 films (1929-2024)
- **Source**: Academy Awards official list
- **Image Source**: TMDB API
- **Special Features**: Year won, director, studio

### 6. **IMDb Top 250 Films**
- **Description**: Top 250 films according to IMDb ratings
- **Estimated Items**: 250 films
- **Source**: IMDb Top 250 list
- **Image Source**: TMDB API
- **Special Features**: IMDb rating, user votes

### 7. **Criterion 4K Collection**
- **Description**: Criterion films available in 4K UHD
- **Estimated Items**: 50+ titles (growing)
- **Source**: Criterion 4K releases
- **Image Source**: TMDB API
- **Special Features**: 4K restoration info

### 8. **Shout Factory / Scream Factory**
- **Description**: Cult horror and classic films
- **Estimated Items**: 300+ releases
- **Source**: Shout Factory catalog
- **Image Source**: TMDB API
- **Special Features**: Collector's editions, special features

### 9. **Studio Ghibli Collection**
- **Description**: All Studio Ghibli films on physical media
- **Estimated Items**: 25+ films
- **Source**: Studio Ghibli official releases
- **Image Source**: TMDB API
- **Special Features**: Japanese and English versions

### 10. **Marvel Cinematic Universe (MCU)**
- **Description**: All MCU films on physical media
- **Estimated Items**: 30+ films
- **Source**: Marvel Studios releases
- **Image Source**: TMDB API
- **Special Features**: Phase information, release order

## 🖼️ Image Integration with TMDB API

### TMDB API Benefits:
- ✅ **Free** - No rate limits on free tier
- ✅ **Poster Images** - High-quality movie posters
- ✅ **Backdrop Images** - Wide format images for backgrounds
- ✅ **Comprehensive Data** - Cast, crew, ratings, genres, etc.
- ✅ **Search Functionality** - Easy to find films by title
- ✅ **Multiple Sizes** - Various image sizes available

### Image URLs Format:
```
https://image.tmdb.org/t/p/w500/{poster_path}
https://image.tmdb.org/t/p/original/{poster_path}
```

### Example API Response:
```json
{
  "id": 550,
  "title": "Fight Club",
  "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "backdrop_path": "/87hTDiay2N2qWyX4ugm7jj52NHo.jpg",
  "release_date": "1999-10-15",
  "director": "David Fincher",
  "runtime": 139,
  "genres": ["Drama", "Thriller"],
  "vote_average": 8.4
}
```

## 🚀 Implementation Plan

### Phase 1: Template Creation ✅
- [x] Create film template with all necessary fields
- [x] Add template to item-templates.ts

### Phase 2: TMDB Integration
- [ ] Set up TMDB API key (free, from themoviedb.org)
- [ ] Create utility functions for TMDB API calls
- [ ] Implement search functionality
- [ ] Add image fetching (posters and backdrops)

### Phase 3: Collection Seeding
- [ ] Start with smaller collections (Best Picture Winners, Studio Ghibli)
- [ ] Test image loading and data accuracy
- [ ] Expand to larger collections (Criterion, Arrow Video)

### Phase 4: Enhanced Features
- [ ] Add Steelbook variant detection
- [ ] Support for multiple editions of same film
- [ ] Region code validation
- [ ] Special edition tracking

## 📊 Collection Priority

**High Priority (Start Here):**
1. Best Picture Winners (Oscars) - 95 items, definitive list
2. Studio Ghibli Collection - 25 items, popular
3. IMDb Top 250 - 250 items, well-known list

**Medium Priority:**
4. Criterion Collection - Large but popular
5. 4K UHD Top 100 - Growing format
6. MCU Collection - Popular franchise

**Lower Priority:**
7. Arrow Video - Niche but dedicated fanbase
8. Shout Factory - Horror/cult focus
9. Steelbook Collection - Requires manual curation

## 🎯 Next Steps

1. **Review this proposal** - Confirm which collections to implement
2. **Set up TMDB API** - Get free API key
3. **Test with one collection** - Start with Best Picture Winners
4. **Expand based on results** - Add more collections if successful

