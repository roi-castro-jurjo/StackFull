import React, { useEffect, useState } from 'react';
import SearchBar from '../../components/searchBar';
import DatasetDropdown from '../../components/DatasetDropdown';
import { useImages } from '../../hooks'; 
import { useNavigate } from 'react-router-dom';

const defaultImageUrl = 'https://static.vecteezy.com/system/resources/previews/004/639/366/original/error-404-not-found-text-design-vector.jpg'; // URL de la imagen por defecto

const getImageUrl = (image) => {
  if (image.coco_url) {
    return image.coco_url;
  } else if (image.flickr_url) {
    return image.flickr_url;
  } else {
    return defaultImageUrl;
  }
};

const getIconUrl = (categoryId) => {
  return `/assets/cocoicons/${categoryId}.jpg`; 
};

const ImageCard = ({ image, onCategoryClick }) => {

  const navigate = useNavigate();

  const handleImageClick = () => {
    navigate(`/image/${image.coco_id}`);
  };

  return (
    <div className="border p-4 rounded shadow cursor-pointer hover:bg-gray-100" onClick={handleImageClick}>
      <p className="font-bold">{image.file_name}</p>
      <div className="w-full h-64 bg-white flex items-center justify-center overflow-hidden rounded">
        <img
          src={getImageUrl(image)}
          alt={image.file_name}
          className="object-contain h-full w-full rounded"
          onError={(e) => {
            if (e.target.src === image.coco_url) {
              e.target.src = image.flickr_url || defaultImageUrl;
            } else {
              e.target.src = defaultImageUrl;
            }
          }}
        />
      </div>
      <p className="text-gray-500">ID: {image.coco_id}</p>
      <div className="flex flex-wrap gap-2 mt-2" 
        onClick={(e) => {
          e.stopPropagation(); 
        }}
      >
        {image.categories.map((category, index) => (
          <img
            key={index}
            src={getIconUrl(category)}
            alt={`Category ${category}`}
            className="w-8 h-8 cursor-pointer"
            onClick={(e) => {
              onCategoryClick(category);
            }}
            onError={(e) => { e.target.src = defaultImageUrl; }}
          />
        ))}
      </div>
    </div>
  );
};

const CategoryDropdown = ({ categories, selectedCategories, setSelectedCategories }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded="true"
        >
          Categories
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1 flex flex-wrap" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {categories.map((category, index) => (
              <img
                key={index}
                onClick={() => handleCategoryClick(category)}
                src={getIconUrl(category)}
                alt={`Category ${category}`}
                className={`w-8 h-8 m-1 cursor-pointer ${selectedCategories.includes(category) ? 'border border-gray-400' : ''}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SelectedCategories = ({ selectedCategories, setSelectedCategories }) => {
  const handleCategoryClick = (categoryId) => {
    const updatedCategories = selectedCategories.filter((id) => id !== categoryId);
    setSelectedCategories(updatedCategories);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {selectedCategories.map((category, index) => (
        <img
          key={index}
          src={getIconUrl(category)}
          alt={`Category ${category}`}
          className="w-8 h-8 cursor-pointer border border-gray-400"
          onClick={() => handleCategoryClick(category)}
        />
      ))}
    </div>
  );
};

const findCommonCategories = (images) => {
  if (images.length === 0) return [];
  const categoryCounts = {};
  images.forEach(image => {
    image.categories.forEach(category => {
      if (categoryCounts[category]) {
        categoryCounts[category]++;
      } else {
        categoryCounts[category] = 1;
      }
    });
  });
  const commonCategories = Object.keys(categoryCounts).filter(
    category => categoryCounts[category] === images.length
  ).map(Number);
  return commonCategories;
};

const Dropdown = ({ options, selectedOptions, setSelectedOptions }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((id) => id !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          Options
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1 flex flex-wrap" role="menu" aria-orientation="vertical">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`w-full p-2 cursor-pointer ${selectedOptions.includes(option) ? 'bg-gray-200' : ''}`}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const { data, error, isLoading } = useImages(query, currentPage);
  const [isSearchFromBar, setIsSearchFromBar] = useState(false);

  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedDropdown2, setSelectedDropdown2] = useState([]);
  const [selectedDropdown3, setSelectedDropdown3] = useState([]);



  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setCurrentPage(page);
      }, 350);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setCurrentPage(1);
    setSelectedCategories([categoryId]);
  };

  useEffect(() => {
    setCurrentPage(1);
    if (selectedCategories.length === 0) {
      if (!isSearchFromBar){
        setQuery('');
      } else {
        setIsSearchFromBar(false);
      }
      
    } else {
      const combinedQuery = selectedCategories.join(',');
      setQuery(combinedQuery);
    }
  }, [selectedCategories]);

  useEffect(() => {
    if (data) {
      const totalResults = data.count;
      const pageSize = data.results.length;
      setTotalPages(Math.ceil(totalResults / pageSize));
      setNextPage(data.next);
      setPreviousPage(data.previous);

      if (isSearchFromBar) {
        const commonCategories = findCommonCategories(data.results);
        setSelectedCategories(commonCategories);
        
      }
    }  else {
      setTotalPages(1);
      setNextPage(null);
      setPreviousPage(null);
    }
  }, [data, isSearchFromBar]);

  const handleSearch = (searchQuery) => {
    setCurrentPage(1);
    setIsSearchFromBar(true);
    setQuery(searchQuery);
  };

  const categories = Array.from({ length: 91 }, (_, i) => i + 1);

  let results = [];
  if (data && Array.isArray(data.results)) {
    results = data.results;
  }

  return (
    <div className="p-4">
      <div className="flex items-center space-x-4">
        <SearchBar setResults={handleSearch} />
        <div className="flex items-center space-x-4">
  {/* <SearchBar setResults={handleSearch} /> */}
  <CategoryDropdown
    categories={categories}
    selectedCategories={selectedCategories}
    setSelectedCategories={setSelectedCategories}
  />
<DatasetDropdown
          selectedDataset={selectedDataset}
          setSelectedDataset={setSelectedDataset}
        />
  {/* <Dropdown
    options={[]} 
    selectedOptions={selectedDropdown2}
    setSelectedOptions={setSelectedDropdown2}
  />
  <Dropdown
    options={[]} 
    selectedOptions={selectedDropdown3}
    setSelectedOptions={setSelectedDropdown3}
  />
  <SelectedCategories
    selectedCategories={selectedCategories}
    setSelectedCategories={setSelectedCategories}
  /> */}
</div>

        <SelectedCategories
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      <div className="min-h-screen">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.length > 0 ? (
            results.map((image, index) => (
              <ImageCard key={index} image={image} onCategoryClick={handleCategoryClick} />
            ))
          ) : (
            !isLoading && <div className="col-span-full text-center p-4">No results found</div>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!previousPage}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {isNaN(totalPages) ? 1 : totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!nextPage}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default SearchPage;