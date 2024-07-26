import React from 'react';
import { useDatasetsList } from '../../hooks';
import { DatasetItem } from '../../components/DatasetItem';

export const DatasetListPage = () => {
  const { data: datasets, error, isLoading } = useDatasetsList();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">Error loading datasets</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Datasets</h1>
        {datasets.length > 0 ? (
          datasets.map((dataset) => (
            <DatasetItem key={dataset.id} dataset={dataset} />
          ))
        ) : (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold mb-2">No Datasets</h2>
          </div>
        )}
      </div>
    </div>
  );
};
