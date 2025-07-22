import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

interface Config {
  plexUrl: string;
  plexToken: string;
  tmdbApiKey: string;
  overseerrUrl: string;
  overseerrApiKey: string;
  ratingThreshold: number;
  recommendationsPerSeed: number;
}

interface ConnectionTestProps {
  config: Config;
}

interface TestResult {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export function ConnectionTest({ config }: ConnectionTestProps) {
  const [plexTest, setPlexTest] = useState<TestResult>({ status: 'idle' });
  const [tmdbTest, setTmdbTest] = useState<TestResult>({ status: 'idle' });
  const [overseerrTest, setOverseerrTest] = useState<TestResult>({ status: 'idle' });

  const testConnection = async (service: 'plex' | 'tmdb' | 'overseerr') => {
    const setTest = service === 'plex' ? setPlexTest : 
                   service === 'tmdb' ? setTmdbTest : setOverseerrTest;

    setTest({ status: 'loading' });

    try {
      const response = await apiService.testConnection(service);
      setTest({
        status: response.success ? 'success' : 'error',
        message: response.message
      });
    } catch (error) {
      setTest({ status: 'error', message: error.message });
    }
  };

  const renderTestButton = (service: 'plex' | 'tmdb' | 'overseerr', testResult: TestResult, label: string) => (
    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-700">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {testResult.status === 'loading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          {testResult.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {testResult.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          {testResult.status === 'idle' && <div className="w-5 h-5 rounded-full border-2 border-gray-500" />}
        </div>
        <div>
          <span className="font-medium text-white">{label}</span>
          {testResult.message && (
            <p className={`text-sm ${testResult.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.message}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => testConnection(service)}
        disabled={testResult.status === 'loading'}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition-colors duration-200"
      >
        {testResult.status === 'loading' ? 'Testing...' : 'Test'}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderTestButton('plex', plexTest, 'Plex Connection')}
      {renderTestButton('tmdb', tmdbTest, 'TMDB API')}
      {renderTestButton('overseerr', overseerrTest, 'Overseerr API')}
    </div>
  );
}