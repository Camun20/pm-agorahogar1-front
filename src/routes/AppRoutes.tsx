import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/MainLayout';

// Vistas / Páginas
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';

// 13 secciones residenciales
import {
  Encuestas,
  Visitantes,
  Domicilios,
  Saldos,
  EstadosCuenta,
  PQRS,
  Cartelera,
  Documentos,
  Sanciones,
  RecibosPublicos,
  Parqueadero,
  Reservas,
  Mudanzas,
  Usuarios,
  Residentes,
  MiHogar,
  Anuncios
} from '../pages/sections';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rutas protegidas bajo el Layout Principal */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard de inicio */}
        <Route index element={<Dashboard />} />

        {/* 1. Encuestas */}
        <Route
          path="encuestas"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Resident']}>
              <Encuestas />
            </ProtectedRoute>
          }
        />

        {/* 2. Visitantes */}
        <Route
          path="visitantes"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'Security', 'Resident']}>
              <Visitantes />
            </ProtectedRoute>
          }
        />

        {/* 3. Domicilios */}
        <Route
          path="domicilios"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'Security', 'Resident']}>
              <Domicilios />
            </ProtectedRoute>
          }
        />

        {/* 4. Saldos */}
        <Route
          path="saldos"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Accounting', 'Resident']}>
              <Saldos />
            </ProtectedRoute>
          }
        />

        {/* 5. Estados de Cuenta */}
        <Route
          path="estados-cuenta"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Accounting', 'Resident']}>
              <EstadosCuenta />
            </ProtectedRoute>
          }
        />

        {/* 6. PQRS */}
        <Route
          path="pqrs"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Resident']}>
              <PQRS />
            </ProtectedRoute>
          }
        />

        {/* 7. Cartelera */}
        <Route
          path="cartelera"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Resident']}>
              <Cartelera />
            </ProtectedRoute>
          }
        />

        {/* 8. Documentos */}
        <Route
          path="documentos"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Resident']}>
              <Documentos />
            </ProtectedRoute>
          }
        />

        {/* 9. Sanciones */}
        <Route
          path="sanciones"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Security', 'Resident']}>
              <Sanciones />
            </ProtectedRoute>
          }
        />

        {/* 10. Recibos Públicos */}
        <Route
          path="recibos-publicos"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'Security', 'Resident']}>
              <RecibosPublicos />
            </ProtectedRoute>
          }
        />

        {/* 11. Parqueadero */}
        <Route
          path="parqueadero"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Security', 'Resident']}>
              <Parqueadero />
            </ProtectedRoute>
          }
        />

        {/* 12. Reservas */}
        <Route
          path="reservas"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Security', 'Resident']}>
              <Reservas />
            </ProtectedRoute>
          }
        />

        {/* 13. Mudanzas */}
        <Route
          path="mudanzas"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Security', 'Resident']}>
              <Mudanzas />
            </ProtectedRoute>
          }
        />

        {/* 14. Usuarios */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Anuncios Administrativos */}
        <Route
          path="anuncios"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin']}>
              <Anuncios />
            </ProtectedRoute>
          }
        />

        {/* 15. Residentes */}
        <Route
          path="residentes"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin', 'ResidentialAdmin', 'Security', 'Accounting']}>
              <Residentes />
            </ProtectedRoute>
          }
        />

        {/* 16. Mi Hogar (Residentes co-habitantes) */}
        <Route
          path="mi-hogar"
          element={
            <ProtectedRoute allowedRoles={['Resident']}>
              <MiHogar />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
