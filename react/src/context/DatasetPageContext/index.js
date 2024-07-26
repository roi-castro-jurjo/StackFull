import React, { createContext, useState } from 'react';

export const DatasetPageContext = createContext();

export const DatasetPageProvider = ({ children }) => {
    const [hoveredDataset, setHoveredDataset] = useState(null);
    const [clickedDataset, setClickedDataset] = useState(null);
    const [hoveredEvaluation, setHoveredEvaluation] = useState(null);
    const [clickedEvaluation, setClickedEvaluation] = useState(null);

    const handleDatasetHoverIn = (dataset) => {
        setHoveredDataset(dataset);
        setHoveredEvaluation(null);

    };

    const handleDatasetHoverOut = () => {
        setHoveredDataset(null);

    }

    const handleDatasetClick = (dataset) => {
        setClickedDataset(dataset);
        setHoveredDataset(dataset);
        setHoveredEvaluation(null);
        setClickedEvaluation(null);
    };

    const handleEvaluationHoverIn = (evaluation) => {
        setHoveredEvaluation(evaluation);
    };

    const handleEvaluationHoverOut = () => {   
        setHoveredEvaluation(null);
    }
    
    const handleEvaluationClick = (evaluation) => {
        setClickedEvaluation(evaluation);
        setHoveredEvaluation(evaluation);
    }

    const contextValue = {
        hoveredDataset,
        clickedDataset,
        handleDatasetHoverIn,
        handleDatasetHoverOut,
        handleDatasetClick,
        hoveredEvaluation,
        clickedEvaluation,
        handleEvaluationHoverIn,
        handleEvaluationHoverOut,
        handleEvaluationClick,
    };

    return (
        <DatasetPageContext.Provider value={contextValue}>
            {children}
        </DatasetPageContext.Provider>
    );
};
