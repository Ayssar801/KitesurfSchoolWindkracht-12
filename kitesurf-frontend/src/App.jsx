// Importeer React, routeringsfuncties, de routewachter en alle paginacomponenten
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Packages from './pages/Packages';
import Login from './pages/Login';
import Register from './pages/Register';
import Activate from './pages/Activate';
import CustomerDashboard from './pages/CustomerDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

// Hoofdcomponent: definieert de volledige routestructuur van de applicatie
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publieke routes: voor iedereen toegankelijk zonder inloggen */}
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:token" element={<Activate />} />

        {/* Beveiligde klantroutes: alleen toegankelijk met de rol 'customer' */}
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Beveiligde instructeurroutes: alleen toegankelijk met de rol 'instructor' */}
        <Route 
          path="/instructor" 
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Beveiligde eigenaarroutes: alleen toegankelijk met de rol 'owner' */}
        <Route 
          path="/owner" 
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Fallback route: stuurt elke onbekende URL terug naar de homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
