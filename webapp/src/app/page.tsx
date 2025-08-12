'use client';

import React, { useState } from 'react';
import LandingPage from '../components/LandingPage';
import SettingsPage from '../components/SettingsPage';
import UploadArea from '../components/UploadArea';
import ResultsTable from '../components/ResultsTable';

type AppState = 'landing' | 'settings' | 'upload' | 'results';

interface ArmorPiece {
  Id: string;
  Name: string;
  Tier: number;
  Equippable: string;
  Total: number;
  Armor_Weight: number;
}

interface ResultsData {
  [key: string]: {
    stats: {
      total_count: number;
      average_weight: number;
    };
    armor: ArmorPiece[];
  };
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [results, setResults] = useState<ResultsData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weights, setWeights] = useState({
    general: {
      "BST": 1.0,
      "Artiface": 1.0,
    },
    archetype: {
      "Bulwark": 1.1,
      "Brawler": 1.6,
      "Gunner": 1.6,
      "Specialist": 1.6,
      "Grenadier": 1.6,
      "Paragon": 1.6,
    },
    tier: {
      "Tier 1": { low: 1.0, high: 1.05, enabled: true },
      "Tier 2": { low: 1.1, high: 1.15, enabled: true },
      "Tier 3": { low: 1.2, high: 1.25, enabled: true },
      "Tier 4": { low: 1.3, high: 1.35, enabled: true },
      "Tier 5": { low: 1.5, high: 1.55, enabled: true },
    },
    illegal_combo: {
      "Grenade (Base),Health (Base)": 1.5,
      "Health (Base),Super (Base)": 1.5,
      "Health (Base),Weapons (Base)": 1.8,
      "Grenade (Base),Melee (Base)": 2.0,
      "Melee (Base),Super (Base)": 2.0,
      "Class (Base),Melee (Base)": 2.0,
      "Class (Base),Grenade (Base)": 1.5,
      "Class (Base),Super (Base)": 1.5,
      "Super (Base),Weapons (Base)": 1.8,
    },
  });

  const handleGetStarted = () => {
    setAppState('settings');
  };

  const handleSettingsContinue = () => {
    setAppState('upload');
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('weights', JSON.stringify(weights));

    try {
      const response = await fetch('/api/process-armor', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process armor data.');
      }

      const data = await response.json();
      console.log('API Response:', data);
      setResults(data);
      setAppState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      {appState === 'landing' && <LandingPage onClick={handleGetStarted} />}
      {appState === 'settings' && (
        <SettingsPage
          weights={weights as any}
          setWeights={setWeights as any}
          onContinue={handleSettingsContinue}
        />
      )}
      {appState === 'upload' && (
        <div className="w-full max-w-2xl">
          <UploadArea onFileUpload={handleFileUpload} isLoading={isLoading} />
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}
      {appState === 'results' && <ResultsTable data={results} />}
    </main>
  );
}
