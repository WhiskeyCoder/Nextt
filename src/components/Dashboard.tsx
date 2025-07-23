import React, { useState } from 'react';
import { useEffect } from 'react';
import { ContentTabs } from './ContentTabs';
import { FilterSidebar } from './FilterSidebar';
import { RecommendationGrid } from './RecommendationGrid';
import { SyncButton } from './SyncButton';
import { apiService } from '../services/api';

export function Dashboard() {
  const [contentType, setContentType] = useState<'movies' | 'tv'>('movies');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [cachedRecommendations, setCachedRecommendations] = useState<{[key: string]: any[]}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [filters, setFilters] = useState({
    genre: '',
    country: '',
    language: '',
    rating: '',
    koreanOnly: false,
    animeOnly: false,
  });

  // Load recommendations when component mounts or content type changes
  useEffect(() => {
    if (cachedRecommendations[contentType]) {
      setRecommendations(cachedRecommendations[contentType]);
      setIsInitialLoad(false);
    } else {
      loadRecommendations();
    }
  }, [contentType, cachedRecommendations]);

  const loadRecommendations = async () => {
    try {
      console.log(`🔍 Loading recommendations for: ${contentType}`);
      const data = await apiService.getRecommendations(contentType);
      console.log(`📊 Received recommendations data:`, data);
      console.log(`📊 Data length: ${data.length}`);
      setRecommendations(data);
      // Cache the data for this content type
      setCachedRecommendations(prev => ({
        ...prev,
        [contentType]: data
      }));
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
      setIsInitialLoad(false);
    }
  };

  const handleSync = (result: any) => {
    if (result.error) {
      setSyncMessage(`Sync failed: ${result.error}`);
    } else {
      setSyncMessage(result.message || `Sync completed! Processed ${result.processedMovies || 0} movies and ${result.processedShows || 0} TV shows.`);
      // Clear cache and reload recommendations after successful sync
      setCachedRecommendations({});
      loadRecommendations();
    }
    
    // Clear message after 5 seconds
    setTimeout(() => setSyncMessage(''), 5000);
  };

  const handleRequestSuccess = async (tmdbId: number) => {
    console.log(`Dashboard: Request successful for TMDB ID ${tmdbId}, refreshing recommendations`);
    // Refresh the current recommendations to get updated status
    await loadRecommendations();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <FilterSidebar filters={filters} onFiltersChange={setFilters} />
      </div>
      
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <ContentTabs activeTab={contentType} onTabChange={setContentType} />
          <SyncButton onSync={handleSync} isLoading={isLoading} setIsLoading={setIsLoading} />
        </div>
        
        {syncMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            syncMessage.includes('failed') 
              ? 'bg-red-900/20 border border-red-700 text-red-200' 
              : 'bg-green-900/20 border border-green-700 text-green-200'
          }`}>
            {syncMessage}
          </div>
        )}

        {isInitialLoad ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Loading Recommendations...</h3>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          </div>
        ) : (
        recommendations.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">No Recommendations Available</h3>
              <p className="text-gray-300 mb-6">
                No recommendations found. This could be because:
              </p>
              <div className="space-y-3 text-sm text-gray-400 text-left">
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>You haven't configured your media server and TMDB credentials yet</li>
                  <li>You don't have any rated content or recent watch history</li>
                  <li>You haven't synced your library yet</li>
                  <li>Your content doesn't have TMDB metadata</li>
                  <li>Try enabling "Use Watch History" in settings if you don't rate content</li>
                </ol>
              </div>
              <button
                onClick={() => handleSync({})}
                disabled={isLoading}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200"
              >
                {isLoading ? 'Syncing...' : 'Sync Library'}
              </button>
            </div>
          </div>
        ) : (
          <RecommendationGrid 
            recommendations={recommendations} 
            contentType={contentType}
            filters={filters}
            onRequestSuccess={handleRequestSuccess}
          />
        ))}
      </div>
    </div>
  );
}
