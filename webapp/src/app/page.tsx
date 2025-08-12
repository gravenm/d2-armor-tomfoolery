'use client';

import React, { useState } from 'react';
import LandingPage from '../components/LandingPage';
import UploadArea from '../components/UploadArea';
import ResultsTable from '../components/ResultsTable';

type AppState = 'landing' | 'upload' | 'results';

interface ArmorPiece {
  Id: string;
  Name: string;
  Tier: number;
  Equippable: string;
  Total: number;
  Armor_Weight: number;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [results, setResults] = useState<Record<string, ArmorPiece[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetStarted = () => {
    setAppState('upload');
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

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
