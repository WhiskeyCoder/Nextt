import React from 'react';
import { RecommendationSection } from './RecommendationSection';

interface Recommendation {
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

interface SeedContent {
  title: string;
  rating: number;
  poster: string;
  recommendations: Recommendation[];
}

interface RecommendationGridProps {
  recommendations: SeedContent[];
  contentType: 'movies' | 'tv';
  filters: {
    genre: string;
    country: string;
    language: string;
    rating: string;
    koreanOnly: boolean;
    animeOnly: boolean;
  };
  onRequestSuccess?: (tmdbId: number) => void;
}

export function RecommendationGrid({ recommendations, contentType, filters, onRequestSuccess }: RecommendationGridProps) {
  console.log('RecommendationGrid: Received filters:', filters);
  console.log('RecommendationGrid: Received recommendations:', recommendations.length, 'groups');
  console.log('RecommendationGrid: Sample recommendation group:', recommendations[0]);
  
  const filteredRecommendations = recommendations.map(seed => {
    const filteredRecs = seed.recommendations.filter(rec => {
      if (filters.genre && !rec.genre.includes(filters.genre)) {
        return false;
      }
      if (filters.country && rec.country !== filters.country) {
        return false;
      }
      if (filters.language && rec.language !== filters.language) {
        return false;
      }
      if (filters.rating && rec.rating < parseFloat(filters.rating)) {
        return false;
      }
      if (filters.koreanOnly && rec.country !== 'South Korea') {
        return false;
      }
      if (filters.animeOnly && rec.country !== 'Japan') {
        return false;
      }
      
      return true;
    });
    
    return {
      ...seed,
      recommendations: filteredRecs
    };
  }).filter(seed => seed.recommendations.length > 0);

  console.log('RecommendationGrid: After filtering,', filteredRecommendations.length, 'groups remain');
  console.log('RecommendationGrid: Seed ratings found:', filteredRecommendations.map(s => s.rating));

  const fiveStarSeeds = filteredRecommendations.filter(seed => seed.rating === 5);
  const fourStarSeeds = filteredRecommendations.filter(seed => seed.rating === 4);
  const threeStarSeeds = filteredRecommendations.filter(seed => seed.rating === 3);

  return (
    <div className="space-y-8">
      {fiveStarSeeds.length > 0 && (
        <RecommendationSection 
          title="Because you loved these 5★ favorites"
          seeds={fiveStarSeeds}
          contentType={contentType}
          onRequestSuccess={onRequestSuccess}
        />
      )}
      
      {fourStarSeeds.length > 0 && (
        <RecommendationSection 
          title="Based on your 4★ picks"
          seeds={fourStarSeeds}
          contentType={contentType}
          onRequestSuccess={onRequestSuccess}
        />
      )}

      {threeStarSeeds.length > 0 && (
        <RecommendationSection 
          title="Based on your recent watch history"
          seeds={threeStarSeeds}
          contentType={contentType}
          onRequestSuccess={onRequestSuccess}
        />
      )}

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No recommendations match your current filters.</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filter criteria or sync your Plex library.</p>
        </div>
      )}
    </div>
  );
}
