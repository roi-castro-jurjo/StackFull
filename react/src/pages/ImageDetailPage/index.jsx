import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useImage } from '../../hooks';

const colors = ['blue', 'lightgreen', 'yellow', 'purple', 'pink'];

const ImageDetailPage = () => {
    const { coco_id } = useParams();
    const { data, error, isLoading } = useImage(coco_id);
    const canvasRef = useRef(null);
    const imageRef = useRef(new Image());
    const [showDetections, setShowDetections] = useState({});
    const [evaluationColors, setEvaluationColors] = useState({});
    const [hiddenEvaluations, setHiddenEvaluations] = useState({});
    const [highlightedBox, setHighlightedBox] = useState(null);
    const [expandedEvaluations, setExpandedEvaluations] = useState({});
    const [debugBorders, setDebugBorders] = useState([]);
    const [showAnnotations, setShowAnnotations] = useState(true);
    const [tooltip, setTooltip] = useState(null);
    const [showEvaluationMenu, setShowEvaluationMenu] = useState(false); 
    const buttonRef = useRef(null);

    const [areaMin, setAreaMin] = useState(0);
    const [areaMax, setAreaMax] = useState(100000);
    const [scoreMin, setScoreMin] = useState(0);
    const [scoreMax, setScoreMax] = useState(1);
    const [iscrowdFilter, setIscrowdFilter] = useState(false);

  
    const handleToggleEvaluation = (evaluationId) => {
      setExpandedEvaluations(prevState => ({
        ...prevState,
        [evaluationId]: !prevState[evaluationId]
      }));
    };
  
    const handleToggleDetections = (evaluationId) => {
      setShowDetections(prevState => ({
        ...prevState,
        [evaluationId]: !prevState[evaluationId]
      }));
    };
  
    const handleLegendClick = (evaluationId) => {
      setHiddenEvaluations(prevState => ({
        ...prevState,
        [evaluationId]: !prevState[evaluationId]
      }));
    };
  
    const handleToggleAnnotations = () => {
      setShowAnnotations(!showAnnotations);
    };
  
    const isNearBorder = (x, y, bx, by, width, height, margin = 5) => {
      const nearLeft = x >= bx - margin && x <= bx + margin && y >= by && y <= by + height;
      const nearRight = x >= bx + width - margin && x <= bx + width + margin && y >= by && y <= by + height;
      const nearTop = y >= by - margin && y <= by + margin && x >= bx && x <= bx + width;
      const nearBottom = y >= by + height - margin && y <= by + height + margin && x >= bx && x <= bx + width;
      if (nearLeft || nearRight || nearTop || nearBottom) {
        //setDebugBorders([{ bx, by, width, height, margin }]);
        return true;
      }
      return false;
    };
  
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
      let hoveredBox = null;
      //setDebugBorders([]);
  
      if (data) {
        const annotations = showAnnotations ? data.annotations || [] : [];
        const evaluations = data.datasets.flatMap(dataset => dataset.evaluations) || [];
  
        annotations.forEach(annotation => {
          const [bx, by, width, height] = annotation.bbox;
          if (isNearBorder(x, y, bx, by, width, height)) {
            hoveredBox = { id: annotation.id, type: 'annotation', details: annotation };
          }
        });
  
        evaluations.forEach(evaluation => {
          if (showDetections[evaluation.evaluation.id] && !hiddenEvaluations[evaluation.evaluation.id]) {
            evaluation.detections.forEach(detection => {
              const [bx, by, width, height] = detection.bbox;
              if (isNearBorder(x, y, bx, by, width, height)) {
                hoveredBox = { id: detection.id, type: 'detection', evaluationId: evaluation.evaluation.id, details: detection };
              }
            });
          }
        });
      }
  
      setHighlightedBox(hoveredBox);
  
      if (hoveredBox) {
        const tooltipWidth = 200;
        const tooltipHeight = 120;
        const xOffset = (e.clientX + tooltipWidth > window.innerWidth) ? -tooltipWidth - 10 : 10;
        const yOffset = (e.clientY + tooltipHeight > window.innerHeight) ? -tooltipHeight - 10 : 10;
        setTooltip({
          x: e.clientX + xOffset,
          y: e.clientY + yOffset,
          details: hoveredBox.details
        });
      } else {
        setTooltip(null);
      }
    };
  
    const handleMouseOut = () => {
      setHighlightedBox(null);
      //setDebugBorders([]);
      setTooltip(null);
    };
  
    const drawBoxes = (ctx, annotations, evaluations) => {
      if (showAnnotations) {
        annotations.forEach(annotation => {
          const [x, y, width, height] = annotation.bbox;
          const isHighlighted = highlightedBox && highlightedBox.id === annotation.id && highlightedBox.type === 'annotation';
          if (annotation.area >= areaMin && annotation.area <= areaMax && (!iscrowdFilter || annotation.iscrowd)) {
            ctx.strokeStyle = isHighlighted ? 'yellow' : 'red';
            ctx.lineWidth = isHighlighted ? 4 : 2;
            ctx.strokeRect(x, y, width, height);
          }
        });
      }
    
      evaluations.forEach((evaluation, index) => {
        const color = evaluationColors[evaluation.evaluation.id] || colors[index % colors.length];
        if (!evaluationColors[evaluation.evaluation.id]) {
          setEvaluationColors(prevColors => ({
            ...prevColors,
            [evaluation.evaluation.id]: color
          }));
        }
        if (showDetections[evaluation.evaluation.id] && !hiddenEvaluations[evaluation.evaluation.id]) {
          evaluation.detections.forEach(detection => {
            const [x, y, width, height] = detection.bbox;
            const isHighlighted = highlightedBox && highlightedBox.id === detection.id && highlightedBox.type === 'detection';
            if (detection.score >= scoreMin && detection.score <= scoreMax) {
              ctx.strokeStyle = isHighlighted ? 'yellow' : color;
              ctx.lineWidth = isHighlighted ? 4 : 2;
              ctx.strokeRect(x, y, width, height);
            }
          });
        }
      });
    
      debugBorders.forEach(border => {
        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 2;
        const { bx, by, width, height, margin } = border;
        ctx.strokeRect(bx - margin, by, margin, height);
        ctx.strokeRect(bx + width, by, margin, height);
        ctx.strokeRect(bx, by - margin, width, margin);
        ctx.strokeRect(bx, by + height, width, margin);
      });
    };
    
  
    useEffect(() => {
      if (data) {
        const imageData = data.image;
        const annotations = data.annotations || [];
        const evaluations = data.datasets.flatMap(dataset => dataset.evaluations) || [];
  
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
  
        const image = imageRef.current;
        image.src = imageData.coco_url || imageData.flickr_url || 'https://static.vecteezy.com/system/resources/previews/004/639/366/original/error-404-not-found-text-design-vector.jpg';
  
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          drawBoxes(ctx, annotations, evaluations);
        };
  
        image.onerror = () => {
          image.src = 'https://static.vecteezy.com/system/resources/previews/004/639/366/original/error-404-not-found-text-design-vector.jpg';
        };
      }
    }, [data, showAnnotations, showDetections, hiddenEvaluations, evaluationColors, highlightedBox]);


    useEffect(() => {
      if (!data) return;

      const annotations = data.annotations || [];
      const evaluations = data.datasets.flatMap(dataset => dataset.evaluations) || [];

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const image = imageRef.current;
      ctx.drawImage(image, 0, 0);


      drawBoxes(ctx, annotations, evaluations)

    }, [areaMin, areaMax, scoreMin, scoreMax, iscrowdFilter]);
  
    if (isLoading) {
      return <div>Loading...</div>;
    }
  
    if (error) {
      return <div>Error: {error.message}</div>;
    }
  
    if (!data) {
      return <div>No data found</div>;
    }
  
    const imageData = data.image;
    const categories = imageData.categories || [];
    const datasets = data.datasets || [];
    
    // Filtrar evaluaciones no mostradas
    const availableEvaluations = datasets.flatMap(dataset => dataset.evaluations)
      .filter(evaluation => !showDetections[evaluation.evaluation.id]);
  
    return (
      <div className="p-4 flex">
        <div className="flex-1 relative">
          <h1 className="text-2xl font-bold mb-4">{imageData.file_name}</h1>
          <div className="relative w-full max-w-full bg-white flex md:flex-row flex-col items-center justify-center overflow-hidden rounded mb-4">
            

          <div className="bg-white p-2 rounded shadow-lg mr-10 mb-5 overflow-visible">
  <div className="mb-0 flex flex-row md:flex-col gap-4 md:gap-3 items-center md:items-baseline" >
    <h2 className="text-lg font-bold mb-2">Filters</h2>
    <div className="mb-2">
      <label className="block text-gray-700 text-sm font-bold mb-2">Area Min</label>
      <input
        type="range"
        min="0"
        max="100000"
        step="1000"
        value={areaMin}
        onChange={(e) => setAreaMin(Number(e.target.value))}
        className="w-full max-w-full"
      />
      <div className='w-full'>
      <span className='w-full'>{areaMin}</span>
      </div>
    </div>
    <div className="mb-2">
      <label className="block text-gray-700 text-sm font-bold mb-2">Area Max</label>
      <input
        type="range"
        min="0"
        max="100000"
        step="1000"
        value={areaMax}
        onChange={(e) => setAreaMax(Number(e.target.value))}
        className="w-full max-w-full"
      />
      <div className='w-full'>
      <span className='w-full'>{areaMax}</span>
      </div>
    </div>
    <div className="mb-2">
      <label className="block text-gray-700 text-sm font-bold mb-2">Is Crowd</label>
      <input
        type="checkbox"
        checked={iscrowdFilter}
        onChange={() => setIscrowdFilter(!iscrowdFilter)}
        className="form-checkbox"
      />
    </div>
    <div className="mb-2">
      <label className="block text-gray-700 text-sm font-bold mb-2">Score Min</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={scoreMin}
        onChange={(e) => setScoreMin(Number(e.target.value))}
        className="w-full max-w-full"
      />
      <span>{scoreMin.toFixed(2)}</span>
    </div>
    <div className="mb-2">
      <label className="block text-gray-700 text-sm font-bold mb-2">Score Max</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={scoreMax}
        onChange={(e) => setScoreMax(Number(e.target.value))}
        className="w-full max-w-full"
      />
      <span className='w-full'>{scoreMax.toFixed(2)}</span>
    </div>
  </div>
</div>

            
            
            <canvas
              ref={canvasRef}
              className="w-auto h-auto max-w-full max-h-full shadow-lg"
              onMouseMove={handleMouseMove}
              onMouseOut={handleMouseOut}
            />
            <div className="h-auto m-4 p-2 bg-white rounded shadow-lg overflow-hidden select-none">
              <div
                className={`mb-2 cursor-pointer flex items-center ${showAnnotations ? '' : 'line-through text-gray-400'}`}
                onClick={handleToggleAnnotations}
              >
                <div className="w-4 h-4 bg-red-500 inline-block mr-2"></div>
                <span>Annotations</span>
              </div>
              {Object.entries(showDetections).map(([evaluationId, isVisible]) => {
                if (evaluationColors[evaluationId]) {
                  return (
                    <div
                      key={evaluationId}
                      className={`mb-2 cursor-pointer flex items-center ${hiddenEvaluations[evaluationId] ? 'line-through text-gray-400' : ''}`}
                      onClick={() => handleLegendClick(evaluationId)}
                    >
                      <div className="w-4 h-4 inline-block mr-2" style={{ backgroundColor: evaluationColors[evaluationId] }}></div>
                      <span>Evaluation ID: {evaluationId}</span>
                    </div>
                  );
                }
                return null;
              })}
              {availableEvaluations.length > 0 && ( // Mostrar botón solo si hay evaluaciones disponibles
                <button
                  ref={buttonRef}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => setShowEvaluationMenu(!showEvaluationMenu)}
                >
                  Add Evaluation
                </button>
              )}
              {showEvaluationMenu && (
                <div
                  className="absolute bg-white border border-gray-300 shadow-lg p-4 rounded mt-2"
                  style={{
                    top: buttonRef.current ? buttonRef.current.offsetTop - buttonRef.current.clientHeight : 0,
                    left: buttonRef.current ? buttonRef.current.offsetLeft : 0,
                  }}
                >
                  {availableEvaluations.map((evaluation, index) => (
                    <div
                      key={evaluation.evaluation.id}
                      className="mb-2 cursor-pointer"
                      onClick={() => {
                        handleToggleDetections(evaluation.evaluation.id); // Toggle detections instead of evaluations
                        setShowEvaluationMenu(false);
                      }}
                    >
                      <span>Evaluation ID: {evaluation.evaluation.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </div>
          <p className="text-gray-600 mb-4">ID: {imageData.coco_id}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category, index) => (
              <img
                key={index}
                src={`/assets/cocoicons/${category}.jpg`}
                alt={`Category ${category}`}
                className="w-8 h-8"
              />
            ))}
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Datasets</h2>
            {datasets.length > 0 ? (
              datasets.map((dataset, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-lg font-semibold">{dataset.dataset.description}</h3>
                  <div className="pl-4 mb-2">
                    <p><strong>Year:</strong> {dataset.dataset.year}</p>
                    <p><strong>Version:</strong> {dataset.dataset.version}</p>
                    <p><strong>Contributor:</strong> {dataset.dataset.contributor}</p>
                    <p><strong>URL:</strong> <a href={dataset.dataset.url} className="text-blue-500" target="_blank" rel="noopener noreferrer">{dataset.dataset.url}</a></p>
                    <p><strong>Date Created:</strong> {dataset.dataset.date_created}</p>
                  </div>
                  {dataset.evaluations.map((evaluation, idx) => (
                    <div key={idx} className="pl-4 mb-2">
                      <h4
                        className="text-md font-semibold cursor-pointer text-blue-500"
                        onClick={() => handleToggleEvaluation(evaluation.evaluation.id)}
                      >
                        {expandedEvaluations[evaluation.evaluation.id] ? '▼' : '▶'} Evaluation ID: {evaluation.evaluation.id}
                      </h4>
                      {expandedEvaluations[evaluation.evaluation.id] && (
                        <div className="pl-4">
                          <p><strong>AP:</strong> {evaluation.evaluation.AP}</p>
                          <p><strong>AP50:</strong> {evaluation.evaluation.AP50}</p>
                          <p><strong>AP75:</strong> {evaluation.evaluation.AP75}</p>
                          <p><strong>APs:</strong> {evaluation.evaluation.APs}</p>
                          <p><strong>APm:</strong> {evaluation.evaluation.APm}</p>
                          <p><strong>APl:</strong> {evaluation.evaluation.APl}</p>
                          <p><strong>Average Confidence:</strong> {evaluation.evaluation.avg_conf}</p>
                          <button
                            onClick={() => handleToggleDetections(evaluation.evaluation.id)}
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
                          >
                            {showDetections[evaluation.evaluation.id] ? 'Hide Detections' : 'Show Detections'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>No datasets found.</p>
            )}
          </div>
        </div>
        {tooltip && (
          <div
            className="absolute bg-white border border-gray-400 shadow-lg p-2 rounded"
            style={{ top: tooltip.y, left: tooltip.x, maxWidth: '200px', wordWrap: 'break-word' }}
          >
            <p><strong>ID:</strong> {tooltip.details.id}</p>
            {tooltip.details.bbox && (
              <>
                <p><strong>Bounding Box:</strong> {tooltip.details.bbox.join(', ')}</p>
                <p><strong>Category ID:</strong> {tooltip.details.category_id}</p>
                {tooltip.details.area !== undefined && (
                  <p><strong>Area:</strong> {tooltip.details.area}</p>
                )}
                {tooltip.details.iscrowd !== undefined && (
                  <p><strong>Is Crowd:</strong> {tooltip.details.iscrowd ? 'Yes' : 'No'}</p>
                )}
                {tooltip.details.score !== undefined && (
                  <p><strong>Score:</strong> {tooltip.details.score}</p>
                )}
              </>
            )}
          </div>
        )}


      </div>
    );
  };
  
  export default ImageDetailPage;