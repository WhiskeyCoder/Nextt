import React from 'react';
import { Save } from 'lucide-react';
import { apiService, Config } from '../services/api';

interface ConfigFormProps {
  config: Config;
  onConfigChange: (config: Config) => void;
}

export function ConfigForm({ config, onConfigChange }: ConfigFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState('');

  const updateConfig = (field: keyof Config, value: string | number | boolean) => {
    onConfigChange({ ...config, [field]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    console.log('Attempting to save config:', config);

    try {
      const response = await apiService.saveConfig(config);
      setSaveMessage('Configuration saved successfully!');
      console.log('Config saved:', response);
    } catch (error) {
      console.error('Full save error:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');

      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to backend server. Please check if the server is running on port 3001.';
      }

      setSaveMessage(`Error saving configuration: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Media Server Provider *
        </label>
        <select
          value={config.provider}
          onChange={(e) => updateConfig('provider', e.target.value as 'plex' | 'jellyfin')}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="plex">Plex</option>
          <option value="jellyfin">Jellyfin</option>
        </select>
      </div>

      {/* Plex Configuration */}
      {config.provider === 'plex' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plex Server URL *
            </label>
            <input
              type="url"
              value={config.plexUrl}
              onChange={(e) => updateConfig('plexUrl', e.target.value)}
              placeholder="http://localhost:32400"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plex Token *
            </label>
            <input
              type="password"
              value={config.plexToken}
              onChange={(e) => updateConfig('plexToken', e.target.value)}
              placeholder="Your Plex authentication token"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Jellyfin Configuration */}
      {config.provider === 'jellyfin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Jellyfin Server URL *
            </label>
            <input
              type="url"
              value={config.jellyfinUrl}
              onChange={(e) => updateConfig('jellyfinUrl', e.target.value)}
              placeholder="http://localhost:8096"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Jellyfin API Key *
            </label>
            <input
              type="password"
              value={config.jellyfinApiKey}
              onChange={(e) => updateConfig('jellyfinApiKey', e.target.value)}
              placeholder="Your Jellyfin API key"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Jellyfin User ID *
            </label>
            <input
              type="text"
              value={config.jellyfinUserId}
              onChange={(e) => updateConfig('jellyfinUserId', e.target.value)}
              placeholder="Your Jellyfin user ID"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Common Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            TMDB API Key *
          </label>
          <input
            type="password"
            value={config.tmdbApiKey}
            onChange={(e) => updateConfig('tmdbApiKey', e.target.value)}
            placeholder="Your TMDB API key"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Overseerr URL
          </label>
          <input
            type="url"
            value={config.overseerrUrl}
            onChange={(e) => updateConfig('overseerrUrl', e.target.value)}
            placeholder="http://localhost:5055"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Overseerr API Key
          </label>
          <input
            type="password"
            value={config.overseerrApiKey}
            onChange={(e) => updateConfig('overseerrApiKey', e.target.value)}
            placeholder="Your Overseerr API key"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rating Threshold
          </label>
          <select
            value={config.ratingThreshold}
            onChange={(e) => updateConfig('ratingThreshold', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={3}>3+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={5}>5 Stars Only</option>
          </select>
        </div>
      </div>

      {/* Recommendation Engine Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Recommendation Engine</h3>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="useWatchHistory"
            checked={config.useWatchHistory}
            onChange={(e) => updateConfig('useWatchHistory', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="useWatchHistory" className="text-sm font-medium text-gray-300">
            Use Watch History for Recommendations
          </label>
        </div>
        
        <p className="text-sm text-gray-400">
          When enabled, the system will use your recent watch history to generate recommendations, 
          even for content you haven't rated. This is useful for users who don't rate content frequently.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recommendations per Seed Content
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={config.recommendationsPerSeed}
            onChange={(e) => updateConfig('recommendationsPerSeed', parseInt(e.target.value))}
            className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {config.useWatchHistory && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Watch History Limit
            </label>
            <input
              type="number"
              min="10"
              max="50"
              value={config.watchHistoryLimit}
              onChange={(e) => updateConfig('watchHistoryLimit', parseInt(e.target.value))}
              className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-400 mt-1">
              Number of recently watched items to use for recommendations (10-50)
            </p>
          </div>
        )}
      </div>

      {saveMessage && (
        <div className={`p-3 rounded-md text-sm ${
          saveMessage.includes('Error') 
            ? 'bg-red-900/20 border border-red-700 text-red-200' 
            : 'bg-green-900/20 border border-green-700 text-green-200'
        }`}>
          {saveMessage}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors duration-200"
      >
        <Save className="w-4 h-4" />
        {isSaving ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
}
