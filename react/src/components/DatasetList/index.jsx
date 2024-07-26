import { useDatasets } from '../../hooks';

export const DatasetList = ({ onMouseEnter, onMouseLeave, onClick }) => {
  const { data: datasets, isLoading, error } = useDatasets();

  if (isLoading) return <div>Loading datasets...</div>;
  if (error) return <div>Error loading datasets: {error.message}</div>;

  return (
      <div className="h-full w-full">
          {datasets.results && datasets.results.map((dataset, index) => (
              <div
                  className='datasetList-item p-2 mb-2 border-b border-gray-300 cursor-pointer'
                  key={index}
                  onMouseEnter={() => onMouseEnter(dataset)}
                  onMouseLeave={() => onMouseLeave()}
                  onClick={() => onClick(dataset)}
              >
                  <p className="text-lg font-semibold">[{dataset.id}]</p>
                  <p>{dataset.date_created}</p>
              </div>
          ))}
      </div>
  );
};
