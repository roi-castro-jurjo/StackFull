import React from 'react';
import { useLogout } from '../../hooks';

export const LogoutButton = () => {
  const mutation = useLogout();

  const handleLogout = () => {
    mutation.mutate();
  };

  return (
    <div onClick={handleLogout} className="flex items-center gap-x-4">
      <img src="/assets/exit.png" alt="Log Out" />
      <span className="text-gray-300 text-sm">Log Out</span>
    </div>
  );
};