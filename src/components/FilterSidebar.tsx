import React from 'react';
import { Filter } from 'lucide-react';

interface Filters {
  genre: string;
  country: string;
  language: string;
  rating: string;
  koreanOnly: boolean;
  animeOnly: boolean;
}

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const updateFilter = (key: keyof Filters, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];
  const countries = ['United States', 'South Korea', 'Japan', 'United Kingdom', 'France', 'Germany'];
  const languages = ['English', 'Korean', 'Japanese', 'French', 'Spanish', 'German'];

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700 h-fit">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-300" />
        <h3 className="text-lg font-semibold text-white">Filters</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
          <select
            value={filters.genre}
            onChange={(e) => updateFilter('genre', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
          <select
            value={filters.country}
            onChange={(e) => updateFilter('country', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
          <select
            value={filters.language}
            onChange={(e) => updateFilter('language', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Languages</option>
            {languages.map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Rating</label>
          <select
            value={filters.rating}
            onChange={(e) => updateFilter('rating', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Rating</option>
            <option value="7">7.0+</option>
            <option value="8">8.0+</option>
            <option value="9">9.0+</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="koreanOnly"
            checked={filters.koreanOnly}
            onChange={(e) => updateFilter('koreanOnly', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="koreanOnly" className="ml-2 text-sm font-medium text-gray-300">
            Only show Korean content 🇰🇷
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="animeOnly"
            checked={filters.animeOnly}
            onChange={(e) => updateFilter('animeOnly', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="animeOnly" className="ml-2 text-sm font-medium text-gray-300">
            Only show anime content 🎌
          </label>
        </div>
      </div>
    </div>
  );
}