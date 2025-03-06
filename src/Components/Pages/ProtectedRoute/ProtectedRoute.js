// src/Components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../AuthContext/AuthContext'; // Adjust the import path as necessary

const ProtectedRoute = () => {
  const { authToken } = useContext(AuthContext);

  return authToken ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;