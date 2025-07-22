import React from 'react';
import { Film, Tv } from 'lucide-react';

interface ContentTabsProps {
  activeTab: 'movies' | 'tv';
  onTabChange: (tab: 'movies' | 'tv') => void;
}

export function ContentTabs({ activeTab, onTabChange }: ContentTabsProps) {
  return (
    <div className="flex bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-700">
      <button
        onClick={() => onTabChange('movies')}
        className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
          activeTab === 'movies'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
      >
        <Film className="w-4 h-4" />
        Movies
      </button>
      <button
        onClick={() => onTabChange('tv')}
        className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
          activeTab === 'tv'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
      >
        <Tv className="w-4 h-4" />
        TV Shows
      </button>
    </div>
  );
}