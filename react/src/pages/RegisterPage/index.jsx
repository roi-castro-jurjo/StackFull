import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks';
import { useAuthRedirect } from '../../hooks';


const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hostname, setHostname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const registerMutation = useRegister();

  useAuthRedirect();

  const handleRegister = (e) => {
    e.preventDefault();
    setError(''); // Reset error message

    // Validar campos vacíos
    if (!username || !password || !hostname) {
      setError('All fields are required. Please fill in all fields.');
      return;
    }

    registerMutation.mutate({ username, password, hostname }, {
      onSuccess: () => {
        navigate('/login');
      },
      onError: (error) => {
        // Mostrar mensaje de error si el nombre de usuario ya está ocupado
        if (error.response && error.response.status === 400) {
          setError('Username already taken. Please choose another username.');
        } else {
          setError('An error occurred. Please try again.');
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Register</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hostname">
              Hostname
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="hostname"
              type="text"
              placeholder="Hostname"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={registerMutation.isLoading}
            >
              {registerMutation.isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-700 font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;