import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMultipleEvaluationDetails, useCategories, useEvaluationsOfDataset  } from '../../hooks';
import PrecisionRecallChart from '../../components/PrecisionRecallChart'; 

import ClipLoader from 'react-spinners/ClipLoader';


function useQueryParams() {
    return new URLSearchParams(useLocation().search);
  }
  
  function EvaluationComparisonPage() {
    const query = useQueryParams();
    const ids = query.getAll('id');
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [addingEvaluation, setAddingEvaluation] = useState(false);
    const { data, error, isLoading } = useMultipleEvaluationDetails(ids);
    const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError } = useCategories();
    const [datasetId, setDatasetId] = useState(null);
    
    useEffect(() => {
      if (data && data.length > 0 && !datasetId) {
        setDatasetId(data[0].dataset);  // Asume que todas las evaluaciones tienen el mismo datasetId
      }
    }, [data]);
  
    const { data: availableEvaluations, isLoading: isLoadingEvaluations } = useEvaluationsOfDataset(datasetId);
  
    useEffect(() => {
      console.log('Evaluations:', data);
    }, [data]);
  
    const handleCategoryChange = (e) => {
      const value = e.target.value;
      setSelectedCategory(value === "none" ? null : value);
    };
  
    const handleAddEvaluation = (evaluationId) => {
      const newIds = [...ids, evaluationId];
      navigate(`/comparison?id=${newIds.join('&id=')}`);
    };
  
    const handleRemoveEvaluation = (evaluationId) => {
      const newIds = ids.filter(id => id !== evaluationId);
      navigate(`/comparison?id=${newIds.join('&id=')}`);
    };
  
    if (isLoading) {
      return <div className="text-center py-4">Loading...</div>;
    }
  
    if (error) {
      return <div className="text-center text-red-500 py-4">Error: {error.message}</div>;
    }
  
    if (data.length === 0) {
      return <div className="text-center py-4">No evaluations found</div>;
    }
  
    const getBackgroundColor = (value, values) => {
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      if (value === maxValue) {
        return 'bg-green-200';
      }
      if (value === minValue) {
        return 'bg-red-200';
      }
      return '';
    };
  
    const renderRow = (metric) => {
      const values = data.map((evaluation) => evaluation[metric]);
      return (
        <tr key={metric}>
          <td className="px-4 py-2 border border-gray-300">{metric}</td>
          {data.map((evaluation) => (
            <td
              key={evaluation.id}
              className={`px-4 py-2 border border-gray-300 text-center ${getBackgroundColor(evaluation[metric], values)}`}
            >
              {evaluation[metric]}
            </td>
          ))}
        </tr>
      );
    };
  
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Compare Evaluations</h1>
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setAddingEvaluation(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Add Evaluation
          </button>
        </div>
        {addingEvaluation && (
          <div className="mb-4">
            {isLoadingEvaluations ? (
              <div className="flex justify-center"><ClipLoader size={35} /></div>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-2">Select an Evaluation to Add</h2>
                <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
                  {availableEvaluations && availableEvaluations.filter(e => !ids.includes(String(e.id))).map((evaluation) => (
                    <div key={evaluation.id} className="flex justify-between items-center mb-2">
                      <span>Evaluation ID: {evaluation.id}</span>
                      <button
                        onClick={() => {
                          handleAddEvaluation(String(evaluation.id));
                          setAddingEvaluation(false);
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border border-gray-300">Metric</th>
                {data.map((evaluation) => (
                  <th key={evaluation.id} className="px-4 py-2 border border-gray-300 text-center relative">
                    Evaluation ID: {evaluation.id}
                    {data.length > 1 && (
                      <button
                        onClick={() => handleRemoveEvaluation(String(evaluation.id))}
                        className="absolute top-0 right-0 mt-1 mr-1 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {renderRow('AP')}
              {renderRow('AP50')}
              {renderRow('AP75')}
              {renderRow('APs')}
              {renderRow('APm')}
              {renderRow('APl')}
              {renderRow('avg_conf')}
              {renderRow('dataset')}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <div className="mb-4 text-center">
            <label htmlFor="category-select" className="mr-2">Select Category:</label>
            <select
              id="category-select"
              value={selectedCategory || 'none'}
              onChange={handleCategoryChange}
              className="border px-2 py-1"
              disabled={isCategoriesLoading || isCategoriesError}
            >
              <option value="none">None</option>
              {categories && categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {isCategoriesError && <p className="text-red-500 mt-2">Error loading categories</p>}
          </div>
          <div className="flex flex-wrap justify-center">
            {data.map((evaluation) => (
              <div key={evaluation.id} className="w-full md:w-1/2 px-2 mb-8 flex flex-col items-center justify-center">
                <h2 className="text-xl font-semibold mb-4 text-center">Precision-Recall Curve for Evaluation ID: {evaluation.id}</h2>
                <div className="w-full">
                  <PrecisionRecallChart evaluationId={evaluation.id} selectedCategory={selectedCategory} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  export default EvaluationComparisonPage;