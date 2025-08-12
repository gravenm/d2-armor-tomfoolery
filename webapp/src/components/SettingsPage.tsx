import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider: React.FC<SliderProps> = ({ label, value, onChange, min = 0, max = 2, step = 0.1 }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    />
    <span className="text-sm text-gray-500">{value}</span>
  </div>
);

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => (
    <div className="mb-4">
        <label className="flex items-center">
            <input type="checkbox" checked={checked} onChange={onChange} className="form-checkbox h-5 w-5 text-blue-600" />
            <span className="ml-2 text-gray-700">{label}</span>
        </label>
    </div>
);

interface SettingsPageProps {
  weights: any;
  setWeights: any;
  onContinue: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ weights, setWeights, onContinue }) => {
  const handleWeightChange = (category: string, key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeights({
      ...weights,
      [category]: {
        ...weights[category],
        [key]: parseFloat(e.target.value),
      },
    });
  };

  const handleTierChange = (key: string, field: 'low' | 'high') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeights({
      ...weights,
      tier: {
        ...weights.tier,
        [key]: {
          ...weights.tier[key],
          [field]: parseFloat(e.target.value),
        },
      },
    });
  };

  const handleTierEnable = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeights({
      ...weights,
      tier: {
        ...weights.tier,
        [key]: {
          ...weights.tier[key],
          enabled: e.target.checked,
        },
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow">
      <h1 className="font-serif text-3xl font-bold text-gray-800 mb-4">Customize Your Weights</h1>
      <p className="font-sans text-gray-600 mb-8">
        Adjust the sliders to change how the armor is weighted.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-800 mb-4">General Weights</h2>
          {Object.entries(weights.general).map(([key, value]) => (
            <Slider key={key} label={key} value={value as number} onChange={handleWeightChange('general', key)} />
          ))}
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-800 mb-4">Archetype Weights</h2>
          {Object.entries(weights.archetype).map(([key, value]) => (
            <Slider key={key} label={key} value={value as number} onChange={handleWeightChange('archetype', key)} />
          ))}
        </div>
        <div className="lg:col-span-3">
          <h2 className="font-serif text-xl font-bold text-gray-800 mb-4">Tier Weights</h2>
          <p className="font-sans text-gray-600 mb-8">
            Uncheck unwanted Tiers.
          </p>          
          {Object.entries(weights.tier).map(([key, value]: [string, any]) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Checkbox label={key} checked={value.enabled} onChange={handleTierEnable(key)} />
                <>
                  <Slider label="Low" value={value.low} onChange={handleTierChange(key, 'low')} />
                  <Slider label="High" value={value.high} onChange={handleTierChange(key, 'high')} />
                </>
              
            </div>
          ))}
        </div>       
        <div className="lg:col-span-3">
          <h2 className="font-serif text-xl font-bold text-gray-800 mb-4">Illegal Combo Weights</h2>
          <p className="font-sans text-gray-600 mb-8">
            Only applies to armor 2.0 (Legacy Armor)
          </p>          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(weights.illegal_combo).map(([key, value]) => (
              <Slider key={key} label={key.replace(/,/g, ' + ')} value={value as number} onChange={handleWeightChange('illegal_combo', key)} />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300"
      >
        Continue to Upload
      </button>
    </div>
  );
};

export default SettingsPage;
