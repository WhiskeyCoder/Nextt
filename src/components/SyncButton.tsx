import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface SyncButtonProps {
  onSync: (result: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function SyncButton({ onSync, isLoading, setIsLoading }: SyncButtonProps) {
  const handleSync = async () => {
    setIsLoading(true);
    
    try {
      // Clear any cached data in localStorage or sessionStorage
      sessionStorage.removeItem('nextt-cached-recommendations');
      localStorage.removeItem('nextt-cached-recommendations');
      
      const result = await apiService.syncLibrary();
      onSync(result);
    } catch (error) {
      console.error('Sync error:', error);
      onSync({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors duration-200"
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Sync Library'}
    </button>
  );
}