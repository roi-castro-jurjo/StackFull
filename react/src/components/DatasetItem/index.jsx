import React from 'react';
import { useNavigate } from 'react-router-dom';


export const DatasetItem = ({ dataset }) => {
    const navigate = useNavigate();
  
    const handleViewEvaluations = () => {
      navigate(`/datasets/${dataset.id}/evaluations`);
    };
  
    return (
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <h2 className="text-xl font-bold mb-2">{dataset.description}</h2>
        <p className="text-gray-700">Year: {dataset.year}</p>
        <p className="text-gray-700">Version: {dataset.version}</p>
        <p className="text-gray-700">Contributor: {dataset.contributor}</p>
        <a href={dataset.url} className="text-blue-500 hover:underline">Dataset URL</a>
        <p className="text-gray-500 text-sm mt-2">Date Created: {dataset.date_created}</p>
        <button
          onClick={handleViewEvaluations}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          See Evaluations
        </button>
      </div>
    );
  };
