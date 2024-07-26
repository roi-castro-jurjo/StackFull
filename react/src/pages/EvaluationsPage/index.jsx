import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvaluationsOfDataset, useRecalculateMetrics } from '../../hooks';
import ClipLoader from 'react-spinners/ClipLoader';
import { useState } from 'react';


export const EvaluationsPage = () => {
    const { datasetId } = useParams();
    const navigate = useNavigate();
    const { data: evaluations, error, isLoading } = useEvaluationsOfDataset(datasetId);
    const recalculateMetricsMutation = useRecalculateMetrics();
    const [loadingState, setLoadingState] = useState({});
  
    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center">Error loading evaluations</div>;
  
    const handleRecalculateMetrics = async (evaluationId) => {
      setLoadingState(prev => ({ ...prev, [evaluationId]: true }));
      await recalculateMetricsMutation.mutateAsync(evaluationId);
      setLoadingState(prev => ({ ...prev, [evaluationId]: false }));
    };
  
    const handleCompare = (evaluationId) => {
      navigate(`/comparison?id=${evaluationId}`);
    };
  
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <button onClick={() => window.history.back()} className="flex items-center text-blue-500 hover:underline">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Datasets
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-6">Evaluaciones del Dataset {datasetId}</h1>
          {evaluations && evaluations.length > 0 ? (
            <div className="space-y-4">
              {evaluations.map((evaluation) => {
                const isMetricsIncomplete = Object.values(evaluation).some(value => value === null || value === '');
                const isLoading = loadingState[evaluation.id];
  
                return (
                  <div key={evaluation.id} className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-2">Evaluation ID: {evaluation.id}</h2>
                    <div className="text-gray-700 mb-1"><strong>AP:</strong> {evaluation.AP ? evaluation.AP.toFixed(2) : 'N/A'}</div>
                    <div className="text-gray-700 mb-1"><strong>AP50:</strong> {evaluation.AP50 ? evaluation.AP50.toFixed(2) : 'N/A'}</div>
                    <div className="text-gray-700 mb-1"><strong>AP75:</strong> {evaluation.AP75 ? evaluation.AP75.toFixed(2) : 'N/A'}</div>
                    <div className="text-gray-700 mb-1"><strong>APs:</strong> {evaluation.APs ? evaluation.APs.toFixed(2) : 'N/A'}</div>
                    <div className="text-gray-700 mb-1"><strong>APm:</strong> {evaluation.APm ? evaluation.APm.toFixed(2) : 'N/A'}</div>
                    <div className="text-gray-700 mb-1"><strong>APl:</strong> {evaluation.APl ? evaluation.APl.toFixed(2) : 'N/A'}</div>
                    <div className="text-gray-700 mb-1"><strong>Average Confidence:</strong> {evaluation.avg_conf ? evaluation.avg_conf.toFixed(2) : 'N/A'}</div>
                    <div className="text-gray-700 mb-1">
                        <strong>False Negatives:</strong> {evaluation.false_negatives ? evaluation.false_negatives : 'N/A'} 
                        <span> ({evaluation.false_negatives ? (evaluation.false_negatives / (evaluation.false_negatives + evaluation.false_positives + evaluation.true_positives)).toFixed(2) : 'N/A'}%)</span>
                    </div>
                    <div className="text-gray-700 mb-1">
                        <strong>False Positives:</strong> {evaluation.false_positives ? evaluation.false_positives : 'N/A'} 
                        <span> ({evaluation.false_positives ? (evaluation.false_positives / (evaluation.false_negatives + evaluation.false_positives + evaluation.true_positives)).toFixed(2) : 'N/A'}%)</span>
                    </div>
                    <div className="text-gray-700 mb-1">
                        <strong>True Positives:</strong> {evaluation.true_positives ? evaluation.true_positives : 'N/A'} 
                        <span> ({evaluation.true_positives ? (evaluation.true_positives / (evaluation.false_negatives + evaluation.false_positives + evaluation.true_positives)).toFixed(2) : 'N/A'}%)</span>
                    </div>

                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={() => handleRecalculateMetrics(evaluation.id)}
                        className={`px-4 py-2 rounded ${isMetricsIncomplete ? 'bg-yellow-500 text-black hover:bg-yellow-700' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <ClipLoader color={"#ffffff"} loading={isLoading} size={20} />
                            <span className="ml-2">Calculating...</span>
                          </div>
                        ) : (
                          isMetricsIncomplete ? 'Calculate Metrics' : 'Recalculate Metrics'
                        )}
                      </button>
                      <button
                        onClick={() => handleCompare(evaluation.id)}
                        className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-700"
                      >
                        Compare
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6 flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2V6m6 14H6a2 2 0 01-2-2V6a2 2 0 012-2h7.6a2 2 0 011.4.6l4.6 4.6a2 2 0 01.6 1.4V18a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-bold mb-2">No Evaluations</h2>
            </div>
          )}
        </div>
      </div>
    );
  };