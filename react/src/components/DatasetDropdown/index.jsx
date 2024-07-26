import React, { useState } from 'react';
import { useDatasetsList } from '../../hooks';

const DatasetDropdown = ({ selectedDataset, setSelectedDataset }) => {
  const { data: datasets, isLoading, error } = useDatasetsList();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!Array.isArray(datasets)) return <div>Invalid datasets data</div>;

  const handleDatasetClick = (datasetId) => {
    setSelectedDataset(datasetId);
    setIsOpen(false);
  };

  const selectedDatasetDescription = datasets.find(dataset => dataset.id === selectedDataset)?.description || 'No Datasets';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        {selectedDatasetDescription}
        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                onClick={() => handleDatasetClick(dataset.id)}
                className="w-full px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                {dataset.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetDropdown;
