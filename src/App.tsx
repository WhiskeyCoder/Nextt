import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { NavigationTabs } from './components/NavigationTabs';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Nextt</h1>
              <p className="text-gray-300">Your personalized Plex recommendation dashboard</p>
            </div>
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </header>

        <main>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default App;