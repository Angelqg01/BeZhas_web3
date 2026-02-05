import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Spinner } from '../ui/Spinner';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Lista de wallets admin autorizadas (hardcoded para desarrollo)
const ADMIN_WALLETS = [
  '0x3EfC42095E8503d41Ad8001328FC23388E00e8a3', // Safe Wallet Principal
  '0x52Df82920CBAE522880dD7657e43d1A754eD044E', // Admin wallet
  '0x1234567890123456789012345678901234567890',
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat default
].map(addr => addr.toLowerCase());

/**
 * @dev AdminRoute - Protects admin routes
 * Opciones de acceso:
 * 1. Token demo: localStorage.setItem('adminToken', 'demo-admin-token-123')
 * 2. Wallet autorizada en ADMIN_WALLETS
 * 3. Backend API (si está disponible)
 */
const AdminRoute = () => {
  const { address, isConnecting, isReconnecting } = useAccount();
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, true = admin, false = not admin
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // OPCIÓN 1: Check for demo token
      const demoToken = localStorage.getItem('adminToken');
      if (demoToken === 'demo-admin-token-123') {
        console.log('✅ AdminRoute: Demo token found, granting access');
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }

      if (!address) {
        console.log('❌ AdminRoute: No wallet connected');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const addressLower = address.toLowerCase();

      // OPCIÓN 2: Check if wallet is in hardcoded admin list
      if (ADMIN_WALLETS.includes(addressLower)) {
        console.log('✅ AdminRoute: Wallet is in admin list', address);
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }

      // OPCIÓN 3: Try backend API
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': address,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userRole = data.user?.role;

          // Verificar si el rol es ADMIN, MODERATOR o DEVELOPER
          const hasAdminAccess = ['ADMIN', 'MODERATOR', 'DEVELOPER'].includes(userRole);

          console.log('✅ AdminRoute: Backend verification', { role: userRole, hasAccess: hasAdminAccess });
          setIsAdmin(hasAdminAccess);

          if (hasAdminAccess) {
            localStorage.setItem('isAdmin', 'true');
          } else {
            toast.error('Acceso denegado. Se requieren permisos de administrador.');
          }
        } else {
          console.log('⚠️ AdminRoute: Backend not available, denying access');
          setIsAdmin(false);
          toast.error('Backend no disponible. Usa el token demo para acceder.');
        }
      } catch (error) {
        console.error('⚠️ AdminRoute: Backend error, denying access', error);
        setIsAdmin(false);
        toast.error('Backend no disponible. Usa: localStorage.setItem("adminToken", "demo-admin-token-123")');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [address]);

  // Loading states
  if (isConnecting || isReconnecting || isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-gray-900">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // No wallet connected
  if (!address) {
    toast.error('Conecta tu wallet para acceder al panel de administración');
    return <Navigate to="/" replace />;
  }

  // Not an admin
  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  // Admin verified - render protected content
  return <Outlet />;
};

export default AdminRoute;