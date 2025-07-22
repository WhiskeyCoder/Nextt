import React, { useState } from 'react';
import { Star, Calendar, Clock, Play, Check, Download } from 'lucide-react';
import { apiService } from '../services/api';

interface Content {
  id: string;
  title: string;
  poster: string;
  summary: string;
  genre: string[];
  country: string;
  language: string;
  rating: number;
  year: number;
  runtime?: number;
  seasons?: number;
  tmdbId: number;
  requestStatus: 'available' | 'requested' | 'not_requested';
}

interface ContentCardProps {
  content: Content;
  contentType: 'movies' | 'tv';
  onRequestSuccess?: (tmdbId: number) => void;
}

export function ContentCard({ content, contentType, onRequestSuccess }: ContentCardProps) {
  const [requestStatus, setRequestStatus] = useState(content.requestStatus);
  const [isHovered, setIsHovered] = useState(false);

  // Update local state when content prop changes
  React.useEffect(() => {
    console.log(`ContentCard: Updating requestStatus for ${content.title} from ${requestStatus} to ${content.requestStatus}`);
    setRequestStatus(content.requestStatus);
  }, [content.requestStatus, content.title]);

  const handleRequest = async () => {
    if (requestStatus === 'not_requested') {
      console.log(`ContentCard: Setting requestStatus to 'requested' for ${content.title}`);
      setRequestStatus('requested');
      
      try {
        // Convert 'movies' to 'movie' for the API call
        const apiContentType = contentType === 'movies' ? 'movie' : 'tv';
        console.log(`Requesting content: ${content.title} (TMDB ID: ${content.tmdbId}, Type: ${apiContentType})`);
        await apiService.requestContent(content.tmdbId, apiContentType);
        console.log(`Successfully requested ${contentType}: ${content.title}`);
        
        // Notify parent component of successful request
        if (onRequestSuccess) {
          onRequestSuccess(content.tmdbId);
        }
        
        // Keep the status as 'requested' since the request was successful
      } catch (error) {
        console.error('Request failed:', error);
        console.log(`ContentCard: Reverting requestStatus to 'not_requested' for ${content.title}`);
        setRequestStatus('not_requested'); // Revert on error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to request content: ${errorMessage}`);
      }
    }
  };

  const getRequestButton = () => {
    // Use the local state, but also check the content prop as fallback
    const currentStatus = requestStatus || content.requestStatus || 'not_requested';
    
    switch (currentStatus) {
      case 'available':
        return (
          <button className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed">
            <Check className="w-4 h-4" />
            Available
          </button>
        );
      case 'requested':
        return (
          <button className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed">
            <Download className="w-4 h-4" />
            Requested
          </button>
        );
      case 'not_requested':
        return (
          <button 
            onClick={handleRequest}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <Play className="w-4 h-4" />
            I want to watch this
          </button>
        );
      default:
        console.log(`Unknown request status: ${currentStatus}, defaulting to not_requested`);
        return (
          <button 
            onClick={handleRequest}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <Play className="w-4 h-4" />
            I want to watch this
          </button>
        );
    }
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={content.poster} 
          alt={content.title}
          className="w-full h-64 object-cover"
        />
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Play className="w-12 h-12 text-white" />
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          <Star className="w-3 h-3 fill-current text-yellow-400" />
          {content.rating.toFixed(1)}
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-white mb-2 line-clamp-2">{content.title}</h4>
        
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {content.year}
          </div>
          {content.runtime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {content.runtime}m
            </div>
          )}
          {content.seasons && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {content.seasons} seasons
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {content.genre.slice(0, 2).map((g) => (
            <span key={g} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
              {g}
            </span>
          ))}
        </div>

        <p className="text-sm text-gray-300 mb-4 line-clamp-3">{content.summary}</p>

        {getRequestButton()}
      </div>
    </div>
  );
}