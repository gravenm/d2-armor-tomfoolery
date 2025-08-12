import React, { useState, useMemo } from 'react';

interface ArmorPiece {
  Id: string;
  Name: string;
  Tier: number;
  Equippable: string;
  Total: number;
  Armor_Weight: number;
}

interface ResultsTableProps {
  data: Record<string, ArmorPiece[]>;
}

type SortKey = keyof ArmorPiece;
type SortDirection = 'asc' | 'desc';

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [filter, setFilter] = useState('');

  const sortedAndFilteredData = useMemo(() => {
    const classData = Object.entries(data);

    return classData.map(([className, armorPieces]) => {
      let filteredPieces = armorPieces;
      if (filter) {
        filteredPieces = armorPieces.filter(piece =>
          piece.Name.toLowerCase().includes(filter.toLowerCase())
        );
      }

      if (sortConfig !== null) {
        filteredPieces.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      return [className, filteredPieces];
    });
  }, [data, sortConfig, filter]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (!data || typeof data !== 'object') {
    return <p>No data to display.</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <input
        type="text"
        placeholder="Filter by name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      {sortedAndFilteredData.map(([className, armorPieces]) => {
        if (!Array.isArray(armorPieces)) {
          return null;
        }
        return (
          <div key={className as string} className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-gray-800 mb-4">{className as string}</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('Name')}>Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('Tier')}>Tier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('Total')}>Total Stats</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('Armor_Weight')}>Armor Weight</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(armorPieces as ArmorPiece[]).map((piece) => (
                  <tr key={piece.Id} className="hover:bg-gray-100 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{piece?.Name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{piece?.Tier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{piece?.Total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{piece?.Armor_Weight?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )
      })}
    </div>
  );
};

export default ResultsTable;
