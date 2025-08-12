import React from 'react';

interface LandingPageProps {
  onClick?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <h1 className="font-serif text-5xl font-bold text-gray-800 mb-4">
        Welcome to D2 Armor Tomfoolery
      </h1>
      <p className="font-sans text-lg text-gray-600 mb-8 max-w-2xl">
        This tool helps you analyze your Destiny 2 armor by processing a CSV file. 
        Upload your armor data to see which pieces are considered underweight for their class.
      </p>
      <button 
        onClick={onClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300"
      >
        Get Started
      </button>
    </div>
  );
};

export default LandingPage;
