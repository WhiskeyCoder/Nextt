import React from 'react';
import { Save } from 'lucide-react';
import { apiService, Config } from '../services/api';

interface Config {
  plexUrl: string;
  plexToken: string;
  tmdbApiKey: string;
  overseerrUrl: string;
  overseerrApiKey: string;
  ratingThreshold: number;
  recommendationsPerSeed: number;
}

interface ConfigFormProps {
  config: Config;
  onConfigChange: (config: Config) => void;
}

export function ConfigForm({ config, onConfigChange }: ConfigFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState('');

  const updateConfig = (field: keyof Config, value: string | number) => {
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
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);

      let errorMessage = error.message;
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

      {saveMessage && (
        <div className={`p-3 rounded-md text-sm ${
          saveMessage.includes('Error') 
            ? 'bg-red-900/20 border border-red-700 text-red-200' 
            : 'bg-green-900/20 border border-green-700 text-green-200'
        }`}>
          {saveMessage}
        </div>
      )}

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