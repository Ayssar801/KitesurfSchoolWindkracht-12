// Importeer React, navigatie en hulpfuncties voor het ophalen van de ingelogde gebruiker
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser, getAuthToken } from '../utils/api';

// Bewaarcomponent: controleert of de gebruiker is ingelogd en de juiste rol heeft
// Zo niet, dan wordt de gebruiker doorgestuurd naar de juiste pagina
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getAuthToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Als de gebruiker niet de juiste rol heeft, stuur ze naar hun eigen dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'customer') return <Navigate to="/customer" replace />;
    if (user.role === 'instructor') return <Navigate to="/instructor" replace />;
    if (user.role === 'owner') return <Navigate to="/owner" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
