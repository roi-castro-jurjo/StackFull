import { useQuery, useMutation, useQueryClient } from "react-query"
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export const useDatasets = () => {
  return useQuery('datasets', async () => {
    const response = await fetch('http://localhost:8000/datasets');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }, {
    staleTime: 1000 * 60 * 1,
  });
}

export const useEvaluationsOfDataset = (dataset_id) => {
  return useQuery(`evaluations_of_${dataset_id}`, async () => {
    console.log('Fetching evaluations for dataset', dataset_id);
    const response = await fetch(`http://localhost:8000/datasets/${dataset_id}/evaluations`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.evaluation;
  }, {
    staleTime: 1000 * 60 * 2,
  });
}

export const useMultipleEvaluationDetails = (ids) => {
  return useQuery(['evaluations', ids], async () => {
    const fetchEvaluations = async (id) => {
      try {
        const response = await fetch(`http://localhost:8000/datasets/evaluations/${id}/`);
        if (!response.ok) {
          throw new Error(`Error fetching evaluation with ID ${id}: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        return null;  
      }
    };

    const evaluations = await Promise.all(ids.map(id => fetchEvaluations(id)));
    return evaluations.filter(evaluation => evaluation !== null);  
  }, {
    staleTime: 1000 * 60 * 2,
  });
}

export const useImage = (coco_id) => {
  return useQuery(['image', coco_id], async () => {
    const response = await fetch(`http://localhost:8000/datasets/images/${coco_id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }, {
    staleTime: 1000 * 60 * 1, 
  });
};

export const useDatasetsList = () => {
  return useQuery('datasets', async () => {
    const response = await fetch('http://localhost:8000/datasets/list/');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Expected an array of datasets');
    }
    return data.length > 0 ? data : [{ id: null, description: 'No Datasets', year: '', version: '', contributor: '', url: '', date_created: '' }];
  });
};
export const useImages = (query, page = 1, dataset = null) => {
  return useQuery(['images', query, page, dataset], async () => {
    let url = `http://localhost:8000/datasets/images?query=${query}&page=${page}`;
    if (dataset) {
      url += `&dataset=${dataset}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }, {
    staleTime: 1000 * 60 * 1, 
  });
};

export const usePRPoints = (evaluation_id, iou = null, cat = null, area = null) => {
  const constructUrl = () => {
    const baseUrl = `http://localhost:8000/datasets/evaluations/${evaluation_id}/pr_points`;
    const params = new URLSearchParams();

    if (iou !== null) params.append('iou', iou);
    if (cat !== null) params.append('cat', cat);
    if (area !== null) params.append('area', area);

    return params.toString() ? `${baseUrl}?${params}` : baseUrl;
  };

  return useQuery([`pr_points_of_${evaluation_id}`, { cat }], async () => {
    console.log('Fetching pr points for evaluation', evaluation_id);
    const url = constructUrl();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }, {
    staleTime: 1000 * 60 * 2, 
  });
};

export const useCategories = () => {
  return useQuery('categories', async () => {
      const response = await fetch('http://localhost:8000/datasets/categories');
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  }, {
      staleTime: 1000 * 60 * 2, // 2 minutos
  });
};


export const useJobs = () => {
  return useQuery('jobs', async () => {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    const response = await fetch('http://localhost:8000/jobs/', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }, {
    staleTime: 1000 * 60 * 2,
  });
};

export const useClusterInfo = () => {
  return useQuery('cluster_info', async () => {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    const response = await fetch('http://localhost:8000/jobs/cluster_info/', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }, {
    staleTime: 1000 * 60 * 2,
  });
};

export const useJobDetails = (jobId) => {
  return useQuery(['job_details', jobId], async () => {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    const response = await fetch(`http://localhost:8000/jobs/${jobId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }, {
    staleTime: 1000 * 60 * 2,
  });
};

export const useJobHistory = (jobId) => {
  return useQuery(['job_history', jobId], async () => {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    const response = await fetch(`http://localhost:8000/jobs/${jobId}/job_history/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }, {
    staleTime: 1000 * 60 * 2,
  });
};



const axiosUsersInstance = axios.create({
  baseURL: 'http://localhost:8000/users',
});

const login = async (userData) => {
  const response = await axiosUsersInstance.post('/login/', userData);
  return response.data;
};

export const useLogin = () => {
  return useMutation(login, {
    onSuccess: (data) => {
      localStorage.setItem('token', data.access); // Guarda el token de acceso
      localStorage.setItem('refresh_token', data.refresh); // Guarda el refresh token
    },
    onError: (error) => {
      console.error('Error during login:', error);
      //alert('Login failed');
    },
  });
};



const register = async (userData) => {
  const response = await axiosUsersInstance.post('/register/', userData);
  return response.data;
};

export const useRegister = () => {
  return useMutation(register, {
    onSuccess: (data) => {
      // Manejar el éxito del registro, como redirigir al usuario a la página de login
      console.log('Registration successful', data);
    },
    onError: (error) => {
      console.error('Error during registration:', error);
      //alert('Registration failed');
    },
  });
};


export const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axiosUsersInstance.get('/validate-token/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // Token is valid
          navigate('/');
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('token');
        }
      }
    };

    validateToken();
  }, [navigate]);
};


const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const accessToken = localStorage.getItem('token'); // Obtén el token de acceso

  const response = await axiosUsersInstance.post('/logout/', {
    refresh_token: refreshToken,
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`, // Incluye el token de acceso en los encabezados
    },
  });

  return response.data;
};

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation(logout, {
    onSuccess: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      navigate('/login'); // Redirige al usuario a la página de inicio de sesión
    },
    onError: (error) => {
      console.error('Error during logout:', error);
      alert('Logout failed');
    },
  });
};




export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axiosUsersInstance.get('/validate-token/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setIsAuthenticated(true); // Token is valid
        } catch (error) {
          localStorage.removeItem('token');
          setIsAuthenticated(false); // Token is invalid or expired
        }
      } else {
        setIsAuthenticated(false); // No token found
      }
    };

    validateToken();
  }, [navigate]);

  return isAuthenticated;
};


const recalculateMetrics = async (evaluationId) => {
  const response = await fetch(`http://localhost:8000/datasets/recalculate_metrics/${evaluationId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const useRecalculateMetrics = () => {
  const queryClient = useQueryClient();

  return useMutation(recalculateMetrics, {
    onSuccess: () => {
      queryClient.invalidateQueries('evaluations');  
    },
  });
};