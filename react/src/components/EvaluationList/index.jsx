import { useEvaluationsOfDataset } from "../../hooks";

export const EvaluationList = ({ datasetId, onMouseEnter, onMouseLeave, onClick }) => {
  const { data: evaluations, isLoading, error } = useEvaluationsOfDataset(datasetId);

  if (isLoading) return <div>Loading evaluations...</div>;
  if (error) return <div>Error loading evaluations: {error.message}</div>;

  return (
      <div className='h-full w-full'>
          {evaluations.evaluation.map((evaluation, index) => (
              <div 
                  className='w-full evaluationList-item p-2 mb-2 border-b border-gray-300 cursor-pointer' 
                  key={index}
                  onClick={() => onClick(evaluation)}
                  onMouseEnter={() => onMouseEnter(evaluation)}
                  onMouseLeave={() => onMouseLeave()}
              >
                  <p>{evaluation.id}</p>
              </div>
          ))}
      </div>
  );
};
