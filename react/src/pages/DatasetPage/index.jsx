import { DatasetList } from '../../components/DatasetList';
import { EvaluationList } from '../../components/EvaluationList';
import { useState, useContext } from 'react';
import { DatasetPageContext } from '../../context/DatasetPageContext';
import { EvaluationDetails } from '../../components/EvaluationDetails';




export const DatasetPage = () => {
    const { 
        hoveredDataset, clickedDataset, handleDatasetClick, handleDatasetHoverIn, handleDatasetHoverOut,
        hoveredEvaluation, clickedEvaluation, handleEvaluationHoverIn, handleEvaluationHoverOut, handleEvaluationClick
    } = useContext(DatasetPageContext);

    const activeDataset = hoveredDataset || clickedDataset || null;
    const activeEvaluation = hoveredEvaluation || clickedEvaluation || null;

    return (
        <div className='grid grid-cols-[25%_25%_50%] gap-4 p-4 min-h-screen w-full'>
            <div className='dataset-container p-4 bg-white shadow rounded'>
                <DatasetList 
                    onMouseEnter={handleDatasetHoverIn}
                    onMouseLeave={handleDatasetHoverOut}
                    onClick={handleDatasetClick}
                />
            </div>

            <div className='evaluation-container p-4 bg-white shadow rounded'>
                {activeDataset ? (
                    <EvaluationList 
                        datasetId={activeDataset.id} 
                        onMouseEnter={handleEvaluationHoverIn}
                        onMouseLeave={handleEvaluationHoverOut}
                        onClick={handleEvaluationClick}
                    />
                ) : (
                    <div className='text-gray-500'>Please select a dataset to see evaluations.</div>
                )}
            </div>

            <div className='details-container p-4 bg-white shadow rounded'>
                {activeDataset && !activeEvaluation ? (
                    <div>
                        <h1 className="text-xl font-bold">Details for dataset {activeDataset.id}</h1>
                        <p>{activeDataset.date_created}</p>
                    </div>
                ) : activeEvaluation ? (
                    <div>
                        <h1 className="text-xl font-bold">Details for evaluation {activeEvaluation.id}</h1>
                        <p>{activeEvaluation.date_created}</p>
                        <EvaluationDetails evaluationId={activeEvaluation.id} />
                    </div>
                ) : (
                    <div className='text-gray-500'>Select a dataset and evaluation to see details.</div>
                )}
            </div>
        </div>
    );
};
