import React, { useEffect, useState } from 'react';

export default function SuperPanel() {
    const [admin, setAdmin] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            setError('No tienes acceso. Inicia sesión como admin.');
            return;
        }
        fetch('/api/admin-register/superpanel', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setAdmin(data.admin);
            })
            .catch(() => setError('Acceso denegado o token inválido.'));
    }, []);

    if (error) {
        return <div className="flex flex-col items-center justify-center min-h-screen text-red-600">{error}</div>;
    }
    if (!admin) {
        return <div className="flex flex-col items-center justify-center min-h-screen">Verificando acceso...</div>;
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-4 text-red-700">Super Panel Admin</h1>
            <div className="bg-white rounded shadow p-6">
                <p className="mb-2">Bienvenido, <b>{admin.username}</b> ({admin.email})</p>
                <p>Rol: <b>{admin.role}</b></p>
                {/* Aquí puedes renderizar el dashboard admin completo */}
            </div>
        </div>
    );
}
