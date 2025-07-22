import React from 'react';
import { ContentCard } from './ContentCard';
import { Star } from 'lucide-react';

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

interface RecommendationSectionProps {
  title: string;
  seeds: SeedContent[];
  contentType: 'movies' | 'tv';
  onRequestSuccess?: (tmdbId: number) => void;
}

export function RecommendationSection({ title, seeds, contentType, onRequestSuccess }: RecommendationSectionProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500 fill-current" />
        {title}
      </h2>

      <div className="space-y-8">
        {seeds.map((seed, index) => (
          <div key={index} className="border-b border-gray-700 last:border-b-0 pb-8 last:pb-0">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={seed.poster} 
                alt={seed.title}
                className="w-12 h-18 object-cover rounded-md shadow-sm"
              />
              <div>
                <h3 className="font-semibold text-white">Because you loved "{seed.title}"</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(seed.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {seed.recommendations.map((recommendation) => (
                <ContentCard 
                  key={recommendation.id} 
                  content={recommendation}
                  contentType={contentType}
                  onRequestSuccess={onRequestSuccess}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}