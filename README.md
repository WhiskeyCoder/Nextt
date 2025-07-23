# Nextt - Multi-Platform Media Recommendation Dashboard

A self-hosted, multi-platform recommendation dashboard with TMDB enrichment and Overseerr integration — finally, a smart, personalized way to find what to watch next.

![Nextt Dashboard](https://github.com/WhiskeyCoder/Nextt/blob/main/images/2025-07-19%202001_35_18-Settings.png)

## 🎯 What is Nextt?

Nextt is a beautiful, self-hosted web application that generates intelligent, personalized content recommendations for **Plex** and **Jellyfin** users based on their viewing history and personal star ratings. Instead of surfacing generic trending content, Nextt reverse-engineers your media consumption patterns and finds content that aligns with your tastes.

### Core Use Case
*"I gave that show 5 stars in Plex/Jellyfin. What else would I love based on that exact vibe?"*
*"Show me recommendations based on what I've been watching lately."*

## ✨ Features

### 🆕 v2 Features
- **🎬 Multi-Platform Support**: Now supports both **Plex** and **Jellyfin** media servers
- **📊 Dual Recommendation Modes**: 
  - **Ratings-Based**: Recommendations from your 4-5 star rated content
  - **Watch History**: Recommendations based on your recently watched content
- **⚙️ Flexible Configuration**: Choose your preferred media server and recommendation strategy

### Core Features
- **🎬 Smart Recommendations**: Get personalized movie and TV show recommendations 
- **🌙 Beautiful Dark UI**: Modern, responsive dark mode interface with smooth animations
- **🎯 Advanced Filtering**: Filter by genre, country, language, rating, Korean content, and anime
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🔗 Overseerr Integration**: One-click content requests directly to your Overseerr instance
- **🎨 Rich Metadata**: TMDB-powered content cards with posters, summaries, and detailed information
- **⚙️ Easy Configuration**: Simple settings panel with connection testing for both platforms
- **🔄 Auto-Sync**: Manual and automatic library synchronization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- **Either** Plex Media Server **or** Jellyfin with content
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

#### 2. Plex Configuration
**Plex Token:**
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

#### 3. Jellyfin Configuration
**Jellyfin API Key:**
1. Open Jellyfin Admin Dashboard
2. Go to Dashboard → API Keys
3. Click "+" to create a new API key
4. Name it "Nextt" and save
5. Copy the generated API key

**Jellyfin User ID:**
1. In Jellyfin Admin Dashboard
2. Go to Dashboard → Users
3. Click on your user account
4. Copy the User ID from the URL or user details

#### 4. Overseerr API Key (Optional)
1. Open your Overseerr web interface
2. Go to Settings → General
3. Copy the API Key from the "API Key" section

### Setup Steps

1. **Navigate to Settings tab** in the Nextt interface
2. **Choose your media server:**
   - Select either "Plex" or "Jellyfin" as your provider
3. **Enter your API credentials:**
   - **For Plex**: Server URL (e.g., `http://localhost:32400`) + Plex Token
   - **For Jellyfin**: Server URL (e.g., `http://localhost:8096`) + API Key + User ID
   - TMDB API Key (required for both)
   - Overseerr URL + API Key (optional)
4. **Configure recommendation preferences:**
   - **Recommendation Mode**: Choose between "Ratings" (4+ stars) or "Watch History"
   - **Watch History Limit**: Number of recent items to base recommendations on (default: 25)
   - Rating threshold and recommendations per seed
5. **Test connections** using the built-in connection tester
6. **Save configuration**
7. **Sync your library** using the "Sync Library" button

## 🎮 How to Use

### Recommendation Modes

#### 🌟 Ratings-Based Mode
- Uses your 4-5 star rated content as seeds
- Perfect for users who actively rate their content
- More curated, high-quality recommendations
- **Pro tip**: Rate your content! It dramatically improves recommendations

#### 📺 Watch History Mode  
- Uses your recently watched content as seeds
- Great for users who don't rate content regularly
- Captures your current viewing mood and preferences
- Configurable history limit (default: 25 recent items)

### Dashboard Navigation
- **Movies Tab**: View movie recommendations based on your selected mode
- **TV Shows Tab**: Browse TV series recommendations 
- **Filters Sidebar**: Narrow down recommendations by genre, country, language, rating, or content type

### Content Discovery
1. **Browse Recommendations**: Content is organized by your preference seeds
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

### Backend Stack
- **Node.js** with Express
- **SQLite** database for caching
- **Axios** for API clients

### Production Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Frontend │    │  Node.js Backend │    │  External APIs  │
│                 │    │                  │    │                 │
│ • Dashboard     │◄──►│ • Plex Client    │◄──►│ • Plex Server   │
│ • Settings      │    │ • Jellyfin Client│    │ • Jellyfin      │
│ • Filters       │    │ • TMDB Client    │    │ • TMDB API      │
│ • Content Cards │    │ • Overseerr API  │    │ • Overseerr     │
│                 │    │ • SQLite Cache   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Development

### Project Structure
```
nextt/
├── src/                     # Frontend React app
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── ContentCard.tsx  # Individual content cards
│   │   ├── Settings.tsx     # Configuration panel
│   │   └── ...
│   └── App.tsx              # Main application
├── server/                  # Backend Node.js server
│   ├── index.js            # Main server file
│   └── nextt.db            # SQLite database
└── README.md
```

### Available Scripts
- `npm run dev:full` - Start both frontend and backend
- `npm run dev` - Start frontend only
- `npm run server` - Start backend only
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Known Issues & Notes

### Jellyfin Integration
- **Testing Needed**: Jellyfin integration is implemented but requires community testing
- **Volunteer Testers Wanted**: If you use Jellyfin, please test and report issues

### Watch History Implementation
- **Complex API Handling**: Plex's session history API doesn't return recent items first
- **Multiple API Calls**: Requires pagination through potentially thousands of entries
- **Performance Impact**: May take longer to sync with large watch histories
- **Recommendation**: Use ratings mode for faster, more curated results

### General Recommendations
- **Rate Your Content**: Ratings-based mode provides significantly better recommendations
- **Watch History Limits**: Keep watch history limits reasonable (25-50) to avoid API rate limits
- **API Rate Limits**: TMDB has rate limits - large syncs may take time

## 🔮 Roadmap

### Phase 1: Stability & Testing
- [ ] Community testing of Jellyfin integration
- [ ] Performance optimization for watch history mode
- [ ] Enhanced error handling and logging
- [ ] Docker deployment options

### Phase 2: Advanced Features
- [ ] Machine learning recommendations
- [ ] Emby support
- [ ] Trakt.tv integration
- [ ] Multi-user support
- [ ] Advanced analytics dashboard

### Phase 3: Community Features
- [ ] Shared recommendation lists
- [ ] Social features
- [ ] Plugin system
- [ ] Email digest notifications

## 🤝 Contributing

We especially need help with:
- **Jellyfin Testing**: Users with Jellyfin setups
- **Performance Optimization**: Especially for watch history mode
- **Documentation**: Setup guides and troubleshooting
- **Feature Requests**: What would make Nextt better for you?

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Test thoroughly (especially if you have Jellyfin)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Community

- **GitHub**: [Report issues and contribute](https://github.com/WhiskeyCoder/nextt)
- **Reddit**: r/selfhosted, r/Plex, r/jellyfin discussions
- **Feedback Welcome**: Especially from Jellyfin users!

## 🙏 Acknowledgments

- **Plex & Jellyfin**: For amazing media server platforms
- **TMDB**: For comprehensive movie and TV metadata
- **Overseerr**: For seamless content request management
- **The Self-Hosted Community**: For inspiration, feedback, and testing
- **Beer**: For fueling the v2 development process 🍺🍺🍺+

---

**Made with ❤️ (and way more than 2 beers) for the self-hosted community**

> **Note**: If you're a Jellyfin user, we'd love your help testing the integration! The developer primarily uses Plex, so community feedback is essential for improving Jellyfin support.
