# Nextt - Multi-Provider Recommendation Dashboard

A self-hosted, multi-provider recommendation dashboard with TMDB enrichment and Overseerr integration — finally, a smart, personalized way to find what to watch next. Supports both Plex and Jellyfin! Now With Docker Image

![Nextt Dashboard](https://github.com/WhiskeyCoder/Nextt/blob/main/images/2025-07-19%202001_35_18-Settings.png)

## 🎯 What is Nextt?

Nextt is a beautiful, self-hosted web application that generates intelligent, personalized content recommendations for Plex users based on their viewing history and personal star ratings. Instead of surfacing generic trending content, Nextt reverse-engineers your Plex ratings and finds media that aligns with your 4★–5★ tastes.

### Core Use Case
*"I gave that show 5 stars in Plex. What else would I love based on that exact vibe?"*

## ✨ Features

- **🎬 Smart Recommendations**: Get personalized movie and TV show recommendations based on your ratings or watch history
- **📺 Multi-Provider Support**: Works with both Plex and Jellyfin media servers
- **🎯 Watch History Mode**: Generate recommendations from recent watch history (perfect for users who don't rate content)
- **🌙 Beautiful Dark UI**: Modern, responsive dark mode interface with smooth animations
- **🎯 Advanced Filtering**: Filter by genre, country, language, rating, Korean content, and anime
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🔗 Overseerr Integration**: One-click content requests directly to your Overseerr instance
- **🎨 Rich Metadata**: TMDB-powered content cards with posters, summaries, and detailed information
- **⚙️ Easy Configuration**: Simple settings panel with connection testing
- **🔄 Auto-Sync**: Manual and automatic library synchronization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Plex Media Server OR Jellyfin Media Server with content
- TMDB API account (free)
- Overseerr instance (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WhiskeyCoder/nextt.git
   cd nextt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev:full
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## ⚙️ Configuration

### Required API Keys

#### 1. TMDB API Key
1. Go to [TMDB](https://www.themoviedb.org/)
2. Create a free account
3. Navigate to Settings → API
4. Request an API key (choose "Developer" option)
5. Copy your API key

#### 2. Media Server Configuration

**For Plex:**
1. Open Plex Web App
2. Play any media item
3. Open browser developer tools (F12)
4. Go to Network tab
5. Look for requests containing `X-Plex-Token` parameter
6. Copy the token value

**Alternative Plex method:**
1. Visit: `https://plex.tv/claim`
2. Copy the claim token
3. Use it to authenticate your server

**For Jellyfin:**
1. Open your Jellyfin web interface
2. Go to Dashboard → Users → Select your user
3. Copy your User ID
4. Go to Dashboard → API Keys
5. Create a new API key and copy it

#### 3. Overseerr/Jellyseerr API Key (Optional)
**For Overseerr:**
1. Open your Overseerr web interface
2. Go to Settings → General
3. Copy the API Key from the "API Key" section

**For Jellyseerr (Alternative to Overseerr):**
1. Open your Jellyseerr web interface
2. Go to Settings → General
3. Copy the API Key from the "API Key" section
4. Enable "Use Jellyseerr instead of Overseerr" in Nextt settings

### Setup Steps

1. **Navigate to Settings tab** in the Nextt interface
2. **Select your media server provider** (Plex or Jellyfin)
3. **Enter your API credentials:**
   - **For Plex**: Server URL (e.g., `http://localhost:32400`) and Token
   - **For Jellyfin**: Server URL (e.g., `http://localhost:8096`), API Key, and User ID
   - TMDB API Key
   - **Overseerr**: URL (e.g., `http://localhost:5055`) and API Key (optional)
   - **Jellyseerr**: URL (e.g., `http://localhost:5055`) and API Key (optional, alternative to Overseerr)
4. **Configure recommendation preferences:**
   - **Use Watch History**: Enable to generate recommendations from recent watch history instead of ratings
   - **Watch History Limit**: Number of recently watched items to use (10-50, default: 25)
   - Rating threshold (3+, 4+, or 5 stars only)
   - Number of recommendations per seed content
5. **Test connections** using the built-in connection tester
6. **Save configuration**
7. **Sync your library** using the "Sync Library" button

## 🎮 How to Use

### Dashboard Navigation
- **Movies Tab**: View movie recommendations based on your highly-rated films
- **TV Shows Tab**: Browse TV series recommendations from your favorite shows
- **Filters Sidebar**: Narrow down recommendations by genre, country, language, rating, or content type

### Content Discovery
1. **Browse Recommendations**: Content is organized by your ratings or recent watch history
2. **View Details**: Each card shows poster, summary, genre, rating, and metadata
3. **Filter Content**: Use sidebar filters to find specific types of content
4. **Request Content**: Click "I want to watch this" to send requests to Overseerr or Jellyseerr

### Recommendation Modes
- **Rating-Based**: Uses your 4-5 star ratings to find similar content (top 10 most recent)
- **Watch History**: Uses your recently watched content (last 30 days) to generate recommendations (configurable, default: 25 items)

### Special Filters
- **🇰🇷 Korean Content**: Toggle to show only Korean movies and TV shows
- **🎌 Anime Content**: Filter to display only Japanese anime content
- **Rating Filter**: Set minimum rating thresholds (7.0+, 8.0+, 9.0+)

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Current Implementation
This is a frontend-only demo showcasing the complete UI/UX. The current version uses:
- Mock data to demonstrate functionality
- Simulated API responses for testing
- Local state management

### Production Architecture (Planned)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Frontend │    │  FastAPI Backend │    │  External APIs  │
│                 │    │                  │    │                 │
│ • Dashboard     │◄──►│ • Plex Client    │◄──►│ • Plex Server   │
│ • Settings      │    │ • TMDB Client    │    │ • TMDB API      │
│ • Filters       │    │ • Overseerr/Jellyseerr API  │    │ • Overseerr/Jellyseerr     │
│ • Content Cards │    │ • SQLite DB      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🐳 Docker Deployment ([ITS NOW LIVE - https://hub.docker.com/r/whiskeycoder/nextt](https://hub.docker.com/r/whiskeycoder/nextt))

```yaml
version: '3.8'
services:
  nextt-backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./config:/app/config
      - ./db:/app/db
    environment:
      - PLEX_URL=${PLEX_URL}
      - PLEX_TOKEN=${PLEX_TOKEN}
      - TMDB_API_KEY=${TMDB_API_KEY}
      - OVERSEERR_URL=${OVERSEERR_URL}
      - OVERSEERR_API_KEY=${OVERSEERR_API_KEY}
      - JELLYSEERR_URL=${JELLYSEERR_URL}
      - JELLYSEERR_API_KEY=${JELLYSEERR_API_KEY}
    restart: unless-stopped

  nextt-frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - nextt-backend
    restart: unless-stopped
```

## 🔧 Development

### Project Structure
```
nextt/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── ContentCard.tsx  # Individual content cards
│   │   ├── Settings.tsx     # Configuration panel
│   │   └── ...
│   ├── data/
│   │   └── mockData.ts      # Demo data
│   └── App.tsx              # Main application
├── public/                  # Static assets
└── README.md
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎨 Design Philosophy

Nextt follows Apple-inspired design principles:
- **Simplicity**: Clean, uncluttered interface
- **Consistency**: Uniform spacing, typography, and interactions
- **Responsiveness**: Fluid layouts that work on any device
- **Accessibility**: High contrast ratios and keyboard navigation
- **Performance**: Smooth animations and fast loading times

## 🔮 Roadmap

### Phase 1: Core Backend (In Progress)
- [X] FastAPI backend implementation
- [X] Plex API integration
- [X] TMDB API client
- [X] SQLite database setup
- [X] Overseerr integration

### Phase 2: Advanced Features
- [ ] Email digest notifications
- [x] Jellyfin support ✅
- [x] Watch history recommendations ✅
- [ ] Trakt.tv integration
- [ ] Multi-user support

### Phase 3: Community Features
- [ ] Shared recommendation lists
- [ ] Social features
- [ ] Plugin system
- [ ] Advanced analytics

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Community

- **GitHub**: [Report issues and contribute](https://github.com/WhiskeyCoder/nextt)
- **Discord**: Join our community server
- **Reddit**: r/selfhosted, r/Plex discussions

## 🙏 Acknowledgments

- **Plex**: For the amazing media server platform
- **TMDB**: For comprehensive movie and TV metadata
- **Overseerr**: For seamless content request management
- **The Self-Hosted Community**: For inspiration and feedback

---

**Made with ❤️ for the self-hosted community**
