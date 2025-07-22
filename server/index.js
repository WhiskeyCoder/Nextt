import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import axios from 'axios';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const forceFallbackRatingAt = true; // Set to false if you want to strictly ignore items missing ratingAt


// Database setup
let db;
async function initializeDatabase() {
  try {
    const dbPath = path.join(__dirname, 'nextt.db');
    console.log(`🗄️  Initializing database at: ${dbPath}`);
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Check current schema
    const libraryTableInfo = await db.all("PRAGMA table_info(cached_library)").catch(() => []);
    const recommendationsTableInfo = await db.all("PRAGMA table_info(cached_recommendations)").catch(() => []);
    
    const hasLibraryTable = libraryTableInfo.length > 0;
    const hasRecommendationsTable = recommendationsTableInfo.length > 0;
    
    // Check for required columns
    const hasRatingAt = libraryTableInfo.some(col => col.name === 'rating_at');
    const hasAvailabilityStatus = recommendationsTableInfo.some(col => col.name === 'availability_status');
    const hasAvailabilityCheckedAt = recommendationsTableInfo.some(col => col.name === 'availability_checked_at');
    
    console.log(`📊 Database schema status:`);
    console.log(`   - Library table exists: ${hasLibraryTable}`);
    console.log(`   - Recommendations table exists: ${hasRecommendationsTable}`);
    console.log(`   - Has rating_at column: ${hasRatingAt}`);
    console.log(`   - Has availability_status column: ${hasAvailabilityStatus}`);
    console.log(`   - Has availability_checked_at column: ${hasAvailabilityCheckedAt}`);
    
    // If schema is incompatible, recreate tables
    if (hasLibraryTable && !hasRatingAt) {
      console.log(`🔄 Schema outdated, recreating tables for TRUE TOP 10 functionality...`);
      
      // Drop old tables
      await db.exec(`
        DROP TABLE IF EXISTS cached_recommendations;
        DROP TABLE IF EXISTS cached_library;
      `);
      
      console.log(`🗑️  Dropped old tables`);
    }
    
    // Create tables with proper schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS cached_library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plex_id TEXT UNIQUE,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        rating REAL,
        year INTEGER,
        genre TEXT,
        tmdb_id INTEGER,
        poster_url TEXT,
        summary TEXT,
        section_title TEXT,
        rating_at INTEGER,
        last_synced DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cached_recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seed_item_id INTEGER,
        tmdb_id INTEGER,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        poster_url TEXT,
        summary TEXT,
        genre TEXT,
        rating REAL,
        year INTEGER,
        country TEXT,
        language TEXT,
        availability_status TEXT DEFAULT 'not_requested',
        availability_checked_at DATETIME,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seed_item_id) REFERENCES cached_library (id)
      );

      CREATE INDEX IF NOT EXISTS idx_cached_library_type ON cached_library(type);
      CREATE INDEX IF NOT EXISTS idx_cached_library_rating_at ON cached_library(rating_at DESC);
      CREATE INDEX IF NOT EXISTS idx_cached_recommendations_seed ON cached_recommendations(seed_item_id);
      CREATE INDEX IF NOT EXISTS idx_cached_recommendations_type ON cached_recommendations(type);
    `);
    
    // Verify final schema
    const finalLibrarySchema = await db.all("PRAGMA table_info(cached_library)");
    const finalRecommendationsSchema = await db.all("PRAGMA table_info(cached_recommendations)");
    
    console.log(`✅ Database initialized successfully with TRUE TOP 10 schema`);
    console.log(`   Library columns: ${finalLibrarySchema.map(col => col.name).join(', ')}`);
    console.log(`   Recommendations columns: ${finalRecommendationsSchema.map(col => col.name).join(', ')}`);
    
    const libraryCount = await db.get("SELECT COUNT(*) as count FROM cached_library");
    const recommendationsCount = await db.get("SELECT COUNT(*) as count FROM cached_recommendations");
    
    console.log(`📊 Current data: ${libraryCount.count} library items, ${recommendationsCount.count} recommendations`);
    
    if (libraryCount.count === 0) {
      console.log(`📝 Database is empty - run sync to populate with your top 10 recent ratings`);
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

initializeDatabase().catch(console.error);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configuration management
const possibleConfigPaths = [
  path.join(__dirname, 'config.json'),
  path.join(__dirname, '..', 'config.json'),
  path.join(process.cwd(), 'config.json'),
  path.join(process.cwd(), 'server', 'config.json')
];

function findConfigPath() {
  for (const configPath of possibleConfigPaths) {
    if (fs.existsSync(configPath)) {
      console.log(`✅ Found config at: ${configPath}`);
      return configPath;
    }
  }
  const defaultPath = path.join(__dirname, 'config.json');
  console.log(`📝 Creating new config at: ${defaultPath}`);
  return defaultPath;
}

const configPath = findConfigPath();

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      console.log(`✅ Loaded config from: ${configPath}`);
      console.log(`   📊 Config keys: ${Object.keys(config).join(', ')}`);
      return config;
    }
    console.log(`⚠️  No config file found, returning empty config`);
    return {};
  } catch (error) {
    console.error(`❌ Error loading config:`, error.message);
    return {};
  }
}

function saveConfig(config) {
  try {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Saved config to: ${configPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving config:`, error.message);
    return false;
  }
}

function validateConfig(config) {
  const required = ['plexUrl', 'plexToken', 'tmdbApiKey'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.log(`⚠️  Missing required config: ${missing.join(', ')}`);
    return false;
  }
  
  if (config.plexUrl && !config.plexUrl.startsWith('http')) {
    console.log(`⚠️  Invalid Plex URL format: ${config.plexUrl}`);
    return false;
  }
  
  if (config.overseerrUrl && !config.overseerrUrl.startsWith('http')) {
    console.log(`⚠️  Invalid Overseerr URL format: ${config.overseerrUrl}`);
    return false;
  }
  
  console.log(`✅ Config validation passed`);
  return true;
}

// Axios instance
const createAxiosInstance = () => {
  return axios.create({
    timeout: 30000,
    headers: {
      'User-Agent': 'Nextt/1.0',
      'Accept': 'application/json'
    }
  });
};

// Debug function to check what's actually in your library
async function debugPlexRatings(plexUrl, plexToken) {
  console.log('\n🔍 DEBUG: Checking Plex ratings in detail...');
  
  const client = createAxiosInstance();
  const sectionsResponse = await client.get(`${plexUrl}/library/sections`, {
    headers: { 'X-Plex-Token': plexToken, 'Accept': 'application/json' }
  });
  
  const allSections = sectionsResponse.data.MediaContainer.Directory;
  
  for (const section of allSections) {
    if (section.type !== 'movie' && section.type !== 'show') continue;
    
    console.log(`\n📁 Analyzing section: ${section.title} (${section.type})`);
    
    try {
      const response = await client.get(`${plexUrl}/library/sections/${section.key}/all`, {
        headers: { 'X-Plex-Token': plexToken, 'Accept': 'application/json' },
        params: { 'includeGuids': 1 }
      });
      
      const items = response.data.MediaContainer.Metadata || [];
      console.log(`   Total items: ${items.length}`);
      
      const ratedItems = items.filter(item => item.userRating);
      console.log(`   Items with ANY rating: ${ratedItems.length}`);
      
      const fourPlusStars = items.filter(item => item.userRating && item.userRating >= 8);
      console.log(`   Items with 4+ stars: ${fourPlusStars.length}`);
      
      const withRatingAt = items.filter(item => item.userRating && item.ratingAt);
      console.log(`   Items with ratingAt timestamp: ${withRatingAt.length}`);
      
      // Show a few examples
      if (fourPlusStars.length > 0) {
        console.log(`   Examples of 4+ star items:`);
        fourPlusStars.slice(0, 5).forEach(item => {
          const ratingAt = item.ratingAt ? new Date(parseInt(item.ratingAt) * 1000).toLocaleDateString() : 'No timestamp';
          console.log(`      - ${item.title}: ${item.userRating/2}/5 stars (rated: ${ratingAt})`);
        });
      }
      
      // Show rating distribution
      const ratingCounts = {};
      ratedItems.forEach(item => {
        const stars = Math.round(item.userRating / 2);
        ratingCounts[stars] = (ratingCounts[stars] || 0) + 1;
      });
      
      if (Object.keys(ratingCounts).length > 0) {
        console.log(`   Rating distribution:`);
        Object.entries(ratingCounts).sort().forEach(([stars, count]) => {
          console.log(`      ${stars}⭐: ${count} items`);
        });
      }
      
    } catch (error) {
      console.error(`   Error analyzing ${section.title}:`, error.message);
    }
  }
}

// STEP 1: Get ALL rated movies from Plex with more flexible filtering
async function getTop10RecentMovies(plexUrl, plexToken) {
  console.log('\n🎬 STEP 1: Getting top 10 most recent rated movies...');

  const client = createAxiosInstance();

  const sectionsResponse = await client.get(`${plexUrl}/library/sections`, {
    headers: { 'X-Plex-Token': plexToken }
  });

  const movieSections = sectionsResponse.data.MediaContainer.Directory.filter(s => s.type === 'movie');
  console.log(`📁 Found ${movieSections.length} movie sections`);

  let allRatedMovies = [];

  for (const section of movieSections) {
    console.log(`   Scanning: ${section.title}`);

    try {
      const moviesResponse = await client.get(`${plexUrl}/library/sections/${section.key}/all`, {
        headers: { 'X-Plex-Token': plexToken },
        params: { includeGuids: 1 }
      });

      const movies = moviesResponse.data.MediaContainer.Metadata || [];

      const ratedMovies = movies
        .filter(movie => movie.userRating >= 8)
        .map(movie => {
          const ratingAt = movie.ratingAt || movie.addedAt || Math.floor(Date.now() / 1000);
          if (!movie.ratingAt) {
            console.log(`      ⚠️  ${movie.title} has no ratingAt — fallback to ${movie.addedAt ? 'addedAt' : 'now()'}`);
          }

          return {
            plexId: movie.ratingKey,
            title: movie.title,
            year: movie.year,
            rating: movie.userRating / 2,
            ratingAt: parseInt(ratingAt),
            summary: movie.summary || '',
            genres: movie.Genre ? movie.Genre.map(g => g.tag) : [],
            sectionTitle: section.title,
            tmdbId: movie.Guid?.find(g => g.id.includes('tmdb://'))?.id?.replace('tmdb://', '') || null
          };
        });

      ratedMovies.forEach(movie => {
        console.log(`      ⭐ ${movie.title} - ${movie.rating}/5 (ratedAt: ${new Date(movie.ratingAt * 1000).toISOString()})`);
      });

      allRatedMovies.push(...ratedMovies);
    } catch (error) {
      console.error(`   ❌ Error scanning ${section.title}:`, error.message);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  allRatedMovies.sort((a, b) => b.ratingAt - a.ratingAt);
  const top10Movies = allRatedMovies.slice(0, 10);

  console.log(`🏆 Top 10 most recent rated movies:`);
  top10Movies.forEach((movie, i) => {
    console.log(`   ${i + 1}. ${movie.title} (${movie.rating}⭐)`);
  });

  return top10Movies;
}



// STEP 2: Get ALL rated TV shows from Plex with more flexible filtering
async function getTop10RecentTVShows(plexUrl, plexToken) {
  console.log('\n📺 STEP 2: Getting top 10 most recent rated TV shows...');

  const client = createAxiosInstance();

  const sectionsResponse = await client.get(`${plexUrl}/library/sections`, {
    headers: { 'X-Plex-Token': plexToken }
  });

  const tvSections = sectionsResponse.data.MediaContainer.Directory.filter(s => s.type === 'show');
  console.log(`📁 Found ${tvSections.length} TV sections`);

  let allRatedShows = [];

  for (const section of tvSections) {
    console.log(`   Scanning: ${section.title}`);

    try {
      const showsResponse = await client.get(`${plexUrl}/library/sections/${section.key}/all`, {
        headers: { 'X-Plex-Token': plexToken },
        params: { includeGuids: 1 }
      });

      const shows = showsResponse.data.MediaContainer.Metadata || [];

      const ratedShows = shows
        .filter(show => show.userRating >= 8)
        .map(show => {
          const ratingAt = show.ratingAt || show.addedAt || Math.floor(Date.now() / 1000);
          if (!show.ratingAt) {
            console.log(`      ⚠️  ${show.title} has no ratingAt — fallback to ${show.addedAt ? 'addedAt' : 'now()'}`);
          }

          return {
            plexId: show.ratingKey,
            title: show.title,
            year: show.year,
            rating: show.userRating / 2,
            ratingAt: parseInt(ratingAt),
            summary: show.summary || '',
            genres: show.Genre ? show.Genre.map(g => g.tag) : [],
            sectionTitle: section.title,
            tmdbId: show.Guid?.find(g => g.id.includes('tmdb://'))?.id?.replace('tmdb://', '') || null
          };
        });

      ratedShows.forEach(show => {
        console.log(`      ⭐ ${show.title} - ${show.rating}/5 (ratedAt: ${new Date(show.ratingAt * 1000).toISOString()})`);
      });

      allRatedShows.push(...ratedShows);
    } catch (error) {
      console.error(`   ❌ Error scanning ${section.title}:`, error.message);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  allRatedShows.sort((a, b) => b.ratingAt - a.ratingAt);
  const top10Shows = allRatedShows.slice(0, 10);

  console.log(`🏆 Top 10 most recent rated TV shows:`);
  top10Shows.forEach((show, i) => {
    console.log(`   ${i + 1}. ${show.title} (${show.rating}⭐)`);
  });

  return top10Shows;
}


// STEP 3: Search TMDB for matches
async function searchTMDB(title, year, type, tmdbApiKey) {
  try {
    console.log(`🔍 Searching TMDB for: "${title}" (${year}) [${type}]`);
    
    const client = createAxiosInstance();
    let response = await client.get(`https://api.themoviedb.org/3/search/${type}`, {
      params: {
        api_key: tmdbApiKey,
        query: title,
        year: year,
        language: 'en-US'
      }
    });
    
    let results = response.data.results || [];
    
    if (results.length === 0 && year) {
      console.log(`   ↻ No results with year, trying without year...`);
      response = await client.get(`https://api.themoviedb.org/3/search/${type}`, {
        params: {
          api_key: tmdbApiKey,
          query: title,
          language: 'en-US'
        }
      });
      results = response.data.results || [];
    }

    if (results.length === 0) {
      console.log(`   ❌ No TMDB results found for: "${title}"`);
      return null;
    }

    const bestMatch = results[0];
    console.log(`   ✅ Found TMDB match: "${bestMatch.title || bestMatch.name}" (ID: ${bestMatch.id})`);
    
    return bestMatch;
  } catch (error) {
    console.error(`TMDB search error for "${title}":`, error.message);
    return null;
  }
}

async function getTMDBDetails(tmdbId, type, tmdbApiKey) {
  try {
    const client = createAxiosInstance();
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    
    const response = await client.get(`https://api.themoviedb.org/3/${endpoint}/${tmdbId}`, {
      params: {
        api_key: tmdbApiKey,
        language: 'en-US',
        append_to_response: 'credits,external_ids'
      }
    });
    return response.data;
  } catch (error) {
    console.error('TMDB details error:', error.message);
    return null;
  }
}

// STEP 4: Get recommendations from TMDB
async function getTMDBRecommendations(tmdbId, type, tmdbApiKey) {
  try {
    const client = createAxiosInstance();
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    
    const response = await client.get(`https://api.themoviedb.org/3/${endpoint}/${tmdbId}/recommendations`, {
      params: {
        api_key: tmdbApiKey,
        language: 'en-US',
        page: 1
      }
    });
    
    // Filter to ensure same type
    const filteredResults = response.data.results.filter(rec => {
      if (type === 'movie') {
        return rec.title && rec.release_date;
      } else {
        return rec.name && rec.first_air_date;
      }
    });
    
    return filteredResults.slice(0, 8); // Get 8 recommendations per item
  } catch (error) {
    console.error(`TMDB recommendations error:`, error.message);
    return [];
  }
}

// STEP 5: Check availability in Overseerr (only called during sync, not on page load)
async function checkAvailabilityInOverseerr(tmdbId, type, overseerrUrl, overseerrApiKey) {
  try {
    if (!overseerrUrl || !overseerrApiKey) {
      return 'not_requested';
    }
    
    const client = createAxiosInstance();
    const response = await client.get(`${overseerrUrl}/api/v1/${type}/${tmdbId}`, {
      headers: { 'X-Api-Key': overseerrApiKey }
    });
    
    if (response.data?.mediaInfo) {
      const status = response.data.mediaInfo.status;
      if (status === 5) return 'available';
      if (status === 3 || status === 4) return 'requested'; // processing = requested
      if (status === 2) return 'requested';
      if (status === 1) return 'requested'; // pending = requested
    }
    
    return 'not_requested';
  } catch (error) {
    if (error.response?.status === 404) {
      return 'not_requested';
    }
    console.error(`Availability check error for TMDB ${tmdbId}:`, error.message);
    return 'not_requested'; // unknown = not_requested
  }
}

// STEP 6: Request content in Overseerr
async function requestInOverseerr(tmdbId, type, overseerrUrl, overseerrApiKey) {
  try {
    const client = createAxiosInstance();
    const response = await client.post(`${overseerrUrl}/api/v1/request`, {
      mediaType: type,
      mediaId: tmdbId
    }, {
      headers: {
        'X-Api-Key': overseerrApiKey,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Overseerr request error:', error.message);
    throw error;
  }
}

// API Routes
app.get('/api/config', (req, res) => {
  try {
    const config = loadConfig();
    res.json(config);
  } catch (error) {
    console.error('Error loading config:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/config', (req, res) => {
  try {
    const success = saveConfig(req.body);
    if (success) {
      res.json({ message: 'Configuration saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save configuration' });
    }
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/test/:service', async (req, res) => {
  const config = loadConfig();
  const service = req.params.service;

  try {
    switch (service) {
      case 'plex':
        if (!config.plexUrl || !config.plexToken) {
          return res.json({
            success: false,
            message: 'Please configure your Plex URL and token first'
          });
        }
        const client = createAxiosInstance();
        await client.get(`${config.plexUrl}/library/sections`, {
          headers: { 'X-Plex-Token': config.plexToken }
        });
        res.json({
          success: true,
          message: 'Plex connection successful'
        });
        break;

      case 'tmdb':
        if (!config.tmdbApiKey) {
          return res.json({
            success: false,
            message: 'Please configure your TMDB API key first'
          });
        }
        const tmdbClient = createAxiosInstance();
        await tmdbClient.get('https://api.themoviedb.org/3/configuration', {
          params: { api_key: config.tmdbApiKey }
        });
        res.json({
          success: true,
          message: 'TMDB connection successful'
        });
        break;

      case 'overseerr':
        if (!config.overseerrUrl || !config.overseerrApiKey) {
          return res.json({
            success: false,
            message: 'Please configure your Overseerr URL and API key first'
          });
        }
        const overseerrClient = createAxiosInstance();
        await overseerrClient.get(`${config.overseerrUrl}/api/v1/status`, {
          headers: { 'X-Api-Key': config.overseerrApiKey }
        });
        res.json({
          success: true,
          message: 'Overseerr connection successful'
        });
        break;

      default:
        res.status(400).json({ error: 'Invalid service' });
    }
  } catch (error) {
    res.json({
      success: false,
      message: `${service.toUpperCase()} connection failed: ${error.message}`
    });
  }
});

// Debug endpoint to analyze Plex ratings
app.get('/api/debug-ratings', async (req, res) => {
  const config = loadConfig();
  
  if (!validateConfig(config)) {
    return res.status(400).json({ error: 'Missing Plex configuration' });
  }

  try {
    await debugPlexRatings(config.plexUrl, config.plexToken);
    res.json({ message: 'Debug info logged to console - check server logs' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Main sync endpoint implementing all 6 steps
app.post('/api/sync', async (req, res) => {
  const config = loadConfig();
  
  if (!validateConfig(config)) {
    return res.status(400).json({
      error: 'Configuration validation failed. Please check your settings.',
      missing: ['plexUrl', 'plexToken', 'tmdbApiKey'].filter(key => !config[key])
    });
  }

  try {
    console.log('\n🚀 Starting TRUE TOP 10 sync process...');
    
    // Clear existing data
    await db.run('DELETE FROM cached_library');
    await db.run('DELETE FROM cached_recommendations');
    console.log('🗑️  Cleared existing cache');
    
    // STEP 1 & 2: Get top 10 recent movies and TV shows
    const [top10Movies, top10Shows] = await Promise.all([
      getTop10RecentMovies(config.plexUrl, config.plexToken),
      getTop10RecentTVShows(config.plexUrl, config.plexToken)
    ]);
    
    const allTop20Items = [
      ...top10Movies.map(m => ({...m, type: 'movie'})), 
      ...top10Shows.map(s => ({...s, type: 'tv'}))
    ];
    
    if (allTop20Items.length === 0) {
      return res.json({
        success: false,
        message: 'No recent 4-5 star ratings found. Visit http://localhost:3001/api/debug-ratings to analyze your Plex ratings.',
        stats: { totalRated: 0, processedMovies: 0, processedShows: 0 }
      });
    }
    
    console.log(`\n📊 Processing ${allTop20Items.length} items (${top10Movies.length} movies, ${top10Shows.length} TV shows)`);
    
    let processedMovies = 0;
    let processedShows = 0;
    let tmdbMatches = 0;
    
    // STEP 3: Search TMDB and cache library items
    for (const [index, item] of allTop20Items.entries()) {
      console.log(`\n[${index + 1}/${allTop20Items.length}] Processing: ${item.title} (${item.type})`);
      
      let tmdbData = null;
      if (item.tmdbId) {
        tmdbData = await getTMDBDetails(item.tmdbId, item.type, config.tmdbApiKey);
      }
      
      if (!tmdbData) {
        tmdbData = await searchTMDB(item.title, item.year, item.type, config.tmdbApiKey);
      }
      
      if (tmdbData) {
        await db.run(`
          INSERT INTO cached_library (
            plex_id, title, type, rating, year, genre, tmdb_id, poster_url, summary, 
            section_title, rating_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          item.plexId,
          item.title,
          item.type,
          item.rating,
          item.year,
          item.genres[0] || null,
          tmdbData.id,
          tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null,
          tmdbData.overview || item.summary,
          item.sectionTitle,
          item.ratingAt
        ]);
        
        tmdbMatches++;
        if (item.type === 'movie') processedMovies++;
        else processedShows++;
        
        console.log(`   ✅ Cached: ${item.title} (TMDB ID: ${tmdbData.id})`);
      } else {
        console.log(`   ❌ No TMDB match for: ${item.title}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // STEP 4: Generate recommendations and check availability during sync
    console.log('\n🎯 STEP 4: Generating recommendations and checking availability...');
    const libraryItems = await db.all('SELECT * FROM cached_library ORDER BY rating_at DESC');
    
    let recommendationsGenerated = 0;
    
    for (const item of libraryItems) {
      console.log(`Getting ${item.type} recommendations for: ${item.title}`);
      
      const recommendations = await getTMDBRecommendations(item.tmdb_id, item.type, config.tmdbApiKey);
      
      for (const rec of recommendations) {
        const recTitle = rec.title || rec.name;
        const recYear = rec.release_date ? new Date(rec.release_date).getFullYear() : 
                       rec.first_air_date ? new Date(rec.first_air_date).getFullYear() : null;
        
        // STEP 5: Check availability during sync (not on page load)
        console.log(`   📡 Checking availability for: ${recTitle}`);
        const availability = await checkAvailabilityInOverseerr(
          rec.id, 
          item.type, 
          config.overseerrUrl, 
          config.overseerrApiKey
        );
        console.log(`   ✅ ${recTitle}: ${availability}`);
        
        // Get detailed info for genre and country
        let genre = null;
        let country = null;
        try {
          const details = await getTMDBDetails(rec.id, item.type, config.tmdbApiKey);
          if (details) {
            // Extract genre names
            if (details.genres && Array.isArray(details.genres)) {
              genre = details.genres.map(g => g.name).join(', ');
            }
            
            // Extract production country
            if (details.production_countries && Array.isArray(details.production_countries) && details.production_countries.length > 0) {
              country = details.production_countries[0].name;
            }
          }
        } catch (error) {
          console.log(`   ⚠️ Could not fetch details for ${recTitle}:`, error.message);
        }
        
        await db.run(`
          INSERT INTO cached_recommendations (
            seed_item_id, tmdb_id, title, type, poster_url, summary, genre, rating, year, 
            country, language, availability_status, availability_checked_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
          item.id,
          rec.id,
          recTitle,
          item.type,
          rec.poster_path ? `https://image.tmdb.org/t/p/w500${rec.poster_path}` : null,
          rec.overview,
          genre, // Now properly set
          rec.vote_average,
          recYear,
          country, // Now properly set
          rec.original_language,
          availability
        ]);
        
        recommendationsGenerated++;
        
        // Small delay to avoid overwhelming Overseerr and TMDB
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const successMessage = [
      `✅ TRUE TOP 10 Sync Completed!`,
      `🎯 Processed exactly ${allTop20Items.length} most recent ratings`,
      `🎬 Movies: ${processedMovies} | 📺 TV Shows: ${processedShows}`,
      `🔗 TMDB matches: ${tmdbMatches}/${allTop20Items.length}`,
      `🎯 Recommendations generated: ${recommendationsGenerated}`,
      `📡 Availability cached for all recommendations`
    ].join('\n');

    console.log(`\n${successMessage}`);

    res.json({
      success: true,
      message: successMessage,
      stats: {
        totalRated: allTop20Items.length,
        processedMovies,
        processedShows,
        tmdbMatches,
        recommendationsGenerated
      }
    });
    
  } catch (error) {
    console.error('\n💥 Sync failed:', error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get recommendations from cache (NO API calls on page load)
app.get('/api/recommendations/:type', async (req, res) => {
  const type = req.params.type;

  try {
    console.log(`📋 Getting cached recommendations for: ${type}`);
    
    const libraryItems = await db.all(`
      SELECT * FROM cached_library 
      WHERE type = ? 
      ORDER BY rating_at DESC
    `, [type === 'movies' ? 'movie' : 'tv']);

    console.log(`📚 Found ${libraryItems.length} library items for ${type}`);

    const result = [];

    for (const item of libraryItems) {
      const recommendations = await db.all(`
        SELECT r.*, li.title as seed_title, li.poster_url as seed_poster
        FROM cached_recommendations r
        JOIN cached_library li ON r.seed_item_id = li.id
        WHERE r.seed_item_id = ? AND r.type = ?
        ORDER BY r.rating DESC
        LIMIT 10
      `, [item.id, item.type]);

      console.log(`🎯 Found ${recommendations.length} recommendations for "${item.title}"`);

      if (recommendations.length > 0) {
        const mappedRecommendations = recommendations.map(rec => {
          const status = rec.availability_status || 'not_requested';
          console.log(`   - ${rec.title}: ${status}`);
          
          // Parse genre properly - it might be stored as a single string or comma-separated
          let genreArray = [];
          if (rec.genre) {
            if (typeof rec.genre === 'string') {
              genreArray = rec.genre.split(',').map(g => g.trim()).filter(g => g);
            } else if (Array.isArray(rec.genre)) {
              genreArray = rec.genre;
            }
          }
          
          // Ensure country and language are strings, not null
          const country = rec.country || 'Unknown';
          const language = rec.language || 'Unknown';
          
          return {
            id: rec.tmdb_id.toString(),
            title: rec.title,
            poster: rec.poster_url,
            summary: rec.summary,
            genre: genreArray,
            country: country,
            language: language,
            rating: rec.rating,
            year: rec.year,
            runtime: null,
            tmdbId: rec.tmdb_id,
            requestStatus: status // Use cached status
          };
        });

        result.push({
          title: item.title,
          rating: item.rating,
          poster: item.poster_url,
          recommendations: mappedRecommendations
        });
      }
    }

    console.log(`📊 Returning ${result.length} cached recommendation groups`);
    res.json(result);

  } catch (error) {
    console.error('Error getting cached recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// STEP 6: Request content and update cache
app.post('/api/request', async (req, res) => {
  const { tmdbId, contentType } = req.body;
  const config = loadConfig();

  console.log(`📝 Request received: TMDB ID ${tmdbId}, Type: ${contentType}`);

  if (!config.overseerrUrl || !config.overseerrApiKey) {
    console.log('❌ Overseerr not configured');
    return res.status(400).json({
      error: 'Overseerr not configured. Please set up Overseerr URL and API key in settings.'
    });
  }

  try {
    // Get content details for the response message
    const details = await getTMDBDetails(tmdbId, contentType, config.tmdbApiKey);
    if (!details) {
      console.log(`❌ Content not found: TMDB ID ${tmdbId}`);
      return res.status(404).json({ error: 'Content not found' });
    }

    console.log(`🎯 Making request to Overseerr for: ${details.title || details.name}`);

    // Make the request to Overseerr
    await requestInOverseerr(tmdbId, contentType, config.overseerrUrl, config.overseerrApiKey);
    
    console.log(`📊 Updating database for TMDB ID: ${tmdbId}`);

    // Update the cached availability status
    const updateResult = await db.run(`
      UPDATE cached_recommendations 
      SET availability_status = 'requested', availability_checked_at = CURRENT_TIMESTAMP
      WHERE tmdb_id = ?
    `, [tmdbId]);

    console.log(`✅ Database update result: ${updateResult.changes} rows affected`);

    console.log(`✅ Successfully requested: ${details.title || details.name} (TMDB ID: ${tmdbId})`);

    res.json({
      success: true,
      message: `Successfully requested ${details.title || details.name}`
    });

  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({
      error: `Failed to request content: ${error.message}`
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Nextt backend is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.get('/api/debug', async (req, res) => {
  const config = loadConfig();
  
  try {
    const libraryCount = await db.get("SELECT COUNT(*) as count FROM cached_library").catch(() => ({count: 0}));
    const recommendationsCount = await db.get("SELECT COUNT(*) as count FROM cached_recommendations").catch(() => ({count: 0}));
    const lastSync = await db.get("SELECT MAX(last_synced) as last_sync FROM cached_library").catch(() => ({last_sync: null}));
    
    res.json({
      configPath: configPath,
      configExists: fs.existsSync(configPath),
      configKeys: Object.keys(config),
      possiblePaths: possibleConfigPaths.map(p => ({
        path: p,
        exists: fs.existsSync(p)
      })),
      workingDirectory: process.cwd(),
      serverDirectory: __dirname,
      configSample: {
        plexUrl: config.plexUrl ? `${config.plexUrl.substring(0, 20)}...` : 'NOT SET',
        hasPlexToken: !!config.plexToken,
        hasTmdbKey: !!config.tmdbApiKey,
        hasOverseerr: !!config.overseerrUrl
      },
      database: {
        libraryCount: libraryCount.count,
        recommendationsCount: recommendationsCount.count,
        lastSync: lastSync.last_sync
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      configPath: configPath,
      configExists: fs.existsSync(configPath)
    });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT 
        type,
        section_title,
        COUNT(*) as count,
        AVG(rating) as avg_rating
      FROM cached_library 
      GROUP BY type, section_title
      ORDER BY type, count DESC
    `);
    
    const totalItems = await db.get('SELECT COUNT(*) as count FROM cached_library');
    const totalRecommendations = await db.get('SELECT COUNT(*) as count FROM cached_recommendations');
    const availabilityStats = await db.all(`
      SELECT 
        availability_status,
        COUNT(*) as count
      FROM cached_recommendations 
      GROUP BY availability_status
      ORDER BY count DESC
    `);
    
    res.json({
      totalItems: totalItems.count,
      totalRecommendations: totalRecommendations.count,
      bySection: stats,
      availabilityBreakdown: availabilityStats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Database reset endpoint for troubleshooting
app.post('/api/reset-database', async (req, res) => {
  try {
    console.log('🗑️  Resetting database...');
    
    await db.exec(`
      DROP TABLE IF EXISTS cached_recommendations;
      DROP TABLE IF EXISTS cached_library;
    `);
    
    await db.exec(`
      CREATE TABLE cached_library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plex_id TEXT UNIQUE,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        rating REAL,
        year INTEGER,
        genre TEXT,
        tmdb_id INTEGER,
        poster_url TEXT,
        summary TEXT,
        section_title TEXT,
        rating_at INTEGER,
        last_synced DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE cached_recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seed_item_id INTEGER,
        tmdb_id INTEGER,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        poster_url TEXT,
        summary TEXT,
        genre TEXT,
        rating REAL,
        year INTEGER,
        country TEXT,
        language TEXT,
        availability_status TEXT DEFAULT 'not_requested',
        availability_checked_at DATETIME,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seed_item_id) REFERENCES cached_library (id)
      );

      CREATE INDEX idx_cached_library_type ON cached_library(type);
      CREATE INDEX idx_cached_library_rating_at ON cached_library(rating_at DESC);
      CREATE INDEX idx_cached_recommendations_seed ON cached_recommendations(seed_item_id);
      CREATE INDEX idx_cached_recommendations_type ON cached_recommendations(type);
    `);
    
    console.log('✅ Database reset completed');
    
    res.json({
      success: true,
      message: 'Database reset successfully. You can now sync your library again.'
    });
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    res.status(500).json({
      error: `Database reset failed: ${error.message}`
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nextt backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`💾 Database initialized at: ${path.join(__dirname, 'nextt.db')}`);
  console.log(`⚙️  Config file location: ${configPath}`);
  console.log(`🐛 Debug endpoint: http://localhost:${PORT}/api/debug`);
  console.log(`🔍 Debug ratings: http://localhost:${PORT}/api/debug-ratings`);
});

export default app;