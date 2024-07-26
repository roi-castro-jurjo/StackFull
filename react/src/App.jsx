import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/HomePage';
import { DatasetPage } from './pages/DatasetPage';
import { NavBar } from './components/navbar';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { DatasetPageProvider } from './context/DatasetPageContext';
import SearchPage from './pages/SearchPage';
import ImageDetailPage from './pages/ImageDetailPage';
import EvaluationComparisonPage from './pages/EvaluationComparisonPage';
import JobsPage from './pages/JobsPage';
import ClusterInfoPage from './pages/ClusterInfoPage';
import JobDetailsPage from './pages/JobDetailsPage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { DatasetList } from './components/DatasetList';

import { DatasetListPage } from './pages/DatasetListPage';
import { EvaluationsPage } from './pages/EvaluationsPage';


const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        
        <Router>
          <div className='flex w-full overflow-x-hidden'>
            <NavBar />
            <div className="main-container w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/datasets" element={<DatasetListPage />} />
                <Route path="/datasets/:datasetId/evaluations" element={<EvaluationsPage />} />
                <Route path='/search' element={<SearchPage />}></Route>
                <Route path="/image/:coco_id" element={<ImageDetailPage />} > </Route>
                <Route path="/comparison" element={<EvaluationComparisonPage />} > </Route>

                <Route path="/jobs" element={<JobsPage />}> </Route>
                <Route path="/jobs/:jobId" element={<JobDetailsPage />}></Route>
                <Route exact path="/cluster_info" element={<ClusterInfoPage />} > </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />


                <Route path="*" element={<h1>Not Found</h1>} />
              </Routes>
            </div>
          </div>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
