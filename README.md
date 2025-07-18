# Nextt - Plex-Powered Recommendation Dashboard


# 🚧🚧🚧🚧🚧 COMING SOON 🚧🚧🚧🚧🚧


A self-hosted, Plex-powered recommendation dashboard with TMDB enrichment and Overseerr integration — finally, a smart, personalized way to find what to watch next.

![Nextt Dashboard](https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600)

## 🎯 What is Nextt?

Nextt is a beautiful, self-hosted web application that generates intelligent, personalized content recommendations for Plex users based on their viewing history and personal star ratings. Instead of surfacing generic trending content, Nextt reverse-engineers your Plex ratings and finds media that aligns with your 4★–5★ tastes.

### Core Use Case
*"I gave that show 5 stars in Plex. What else would I love based on that exact vibe?"*

## ✨ Features

- **🎬 Smart Recommendations**: Get personalized movie and TV show recommendations based on your 4-5 star Plex ratings
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
- Plex Media Server with content and ratings
- TMDB API account (free)
- Overseerr instance (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nextt.git
   cd nextt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
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

#### 2. Plex Token
1. Open Plex Web App
2. Play any media item
3. Open browser developer tools (F12)
4. Go to Network tab
5. Look for requests containing `X-Plex-Token` parameter
6. Copy the token value

**Alternative method:**
1. Visit: `https://plex.tv/claim`
2. Copy the claim token
3. Use it to authenticate your server

#### 3. Overseerr API Key (Optional)
1. Open your Overseerr web interface
2. Go to Settings → General
3. Copy the API Key from the "API Key" section

### Setup Steps

1. **Navigate to Settings tab** in the Nextt interface
2. **Enter your API credentials:**
   - Plex Server URL (e.g., `http://localhost:32400`)
   - Plex Token
   - TMDB API Key
   - Overseerr URL (e.g., `http://localhost:5055`)
   - Overseerr API Key
3. **Configure preferences:**
   - Rating threshold (3+, 4+, or 5 stars only)
   - Number of recommendations per seed content
4. **Test connections** using the built-in connection tester
5. **Save configuration**
6. **Sync your library** using the "Sync Library" button

## 🎮 How to Use

### Dashboard Navigation
- **Movies Tab**: View movie recommendations based on your highly-rated films
- **TV Shows Tab**: Browse TV series recommendations from your favorite shows
- **Filters Sidebar**: Narrow down recommendations by genre, country, language, rating, or content type

### Content Discovery
1. **Browse Recommendations**: Content is organized by your 5-star and 4-star ratings
2. **View Details**: Each card shows poster, summary, genre, rating, and metadata
3. **Filter Content**: Use sidebar filters to find specific types of content
4. **Request Content**: Click "I want to watch this" to send requests to Overseerr

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
│   React Frontend │    │  FastAPI Backend │    │  External APIs  │
│                 │    │                  │    │                 │
│ • Dashboard     │◄──►│ • Plex Client    │◄──►│ • Plex Server   │
│ • Settings      │    │ • TMDB Client    │    │ • TMDB API      │
│ • Filters       │    │ • Overseerr API  │    │ • Overseerr     │
│ • Content Cards │    │ • SQLite DB      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🐳 Docker Deployment (Coming Soon)

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
- [ ] FastAPI backend implementation
- [ ] Plex API integration
- [ ] TMDB API client
- [ ] SQLite database setup
- [ ] Overseerr integration

### Phase 2: Advanced Features
- [ ] Machine learning recommendations
- [ ] Email digest notifications
- [ ] Jellyfin support
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

- **GitHub**: [Report issues and contribute](https://github.com/yourusername/nextt)
- **Discord**: Join our community server
- **Reddit**: r/selfhosted, r/Plex discussions

## 🙏 Acknowledgments

- **Plex**: For the amazing media server platform
- **TMDB**: For comprehensive movie and TV metadata
- **Overseerr**: For seamless content request management
- **The Self-Hosted Community**: For inspiration and feedback

---

**Made with ❤️ for the self-hosted community**
