import React, { useState } from 'react';
import { useEffect } from 'react';
import { ConnectionTest } from './ConnectionTest';
import { ConfigForm } from './ConfigForm';
import { apiService, Config } from '../services/api';

export function Settings() {
  const [config, setConfig] = useState<Config>({
    plex_url: '',
    plex_token: '',
    tmdb_api_key: '',
    overseerr_url: '',
    overseerr_api_key: '',
    rating_threshold: 4,
    recommendations_per_seed: 5,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load configuration when component mounts
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await apiService.getConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-300">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Configuration</h2>
        <ConfigForm config={config} onConfigChange={setConfig} />
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Connection Tests</h2>
        <ConnectionTest config={config} />
      </div>
    </div>
  );
}