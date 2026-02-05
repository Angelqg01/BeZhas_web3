import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ====================
// ADVERTISER PROFILE
// ====================

export const advertiserProfileService = {
    // Crear o actualizar perfil
    createOrUpdateProfile: async (profileData) => {
        const response = await api.post('/advertiser-profile', profileData);
        return response.data;
    },

    // Obtener perfil
    getProfile: async () => {
        const response = await api.get('/advertiser-profile');
        return response.data;
    },

    // Verificar si tiene perfil
    checkProfile: async () => {
        const response = await api.get('/advertiser-profile/check');
        return response.data;
    }
};

// ====================
// CAMPAIGNS
// ====================

export const campaignsService = {
    // Subir imagen de creatividad
    uploadCreative: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/campaigns/upload-creative', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Crear campaña
    createCampaign: async (campaignData) => {
        const response = await api.post('/campaigns', campaignData);
        return response.data;
    },

    // Obtener campañas
    getCampaigns: async (params = {}) => {
        const response = await api.get('/campaigns', { params });
        return response.data;
    },

    // Obtener campaña específica
    getCampaign: async (id) => {
        const response = await api.get(`/campaigns/${id}`);
        return response.data;
    },

    // Actualizar campaña
    updateCampaign: async (id, data) => {
        const response = await api.put(`/campaigns/${id}`, data);
        return response.data;
    },

    // Pausar campaña
    pauseCampaign: async (id) => {
        const response = await api.put(`/campaigns/${id}`, { action: 'pause' });
        return response.data;
    },

    // Reanudar campaña
    resumeCampaign: async (id) => {
        const response = await api.put(`/campaigns/${id}`, { action: 'resume' });
        return response.data;
    },

    // Eliminar campaña
    deleteCampaign: async (id) => {
        const response = await api.delete(`/campaigns/${id}`);
        return response.data;
    },

    // Obtener analytics
    getCampaignAnalytics: async (id) => {
        const response = await api.get(`/campaigns/${id}/analytics`);
        return response.data;
    },

    // Obtener resumen
    getCampaignsSummary: async () => {
        const response = await api.get('/campaigns/stats/summary');
        return response.data;
    }
};

// ====================
// BILLING
// ====================

export const billingService = {
    // Añadir fondos FIAT
    addFiatFunds: async (amount) => {
        const response = await api.post('/billing/add-fiat-funds', { amount });
        return response.data;
    },

    // Añadir fondos BEZ
    addBezFunds: async (amount, txHash) => {
        const response = await api.post('/billing/add-bez-funds', { amount, txHash });
        return response.data;
    },

    // Obtener balance
    getBalance: async () => {
        const response = await api.get('/billing/balance');
        return response.data;
    },

    // Obtener historial
    getHistory: async (params = {}) => {
        const response = await api.get('/billing/history', { params });
        return response.data;
    }
};

// ====================
// ADMIN ADS
// ====================

export const adminAdsService = {
    // Obtener cola de aprobación
    getPendingQueue: async (params = {}) => {
        const response = await api.get('/admin/ads/pending-queue', { params });
        return response.data;
    },

    // Aprobar campaña
    approveCampaign: async (id) => {
        const response = await api.post(`/admin/ads/approve/${id}`);
        return response.data;
    },

    // Rechazar campaña
    rejectCampaign: async (id, reason) => {
        const response = await api.post(`/admin/ads/reject/${id}`, { reason });
        return response.data;
    },

    // Obtener todas las campañas
    getAllCampaigns: async (params = {}) => {
        const response = await api.get('/admin/ads/all-campaigns', { params });
        return response.data;
    },

    // Toggle campaña
    toggleCampaign: async (id, action, reason = '') => {
        const response = await api.post(`/admin/ads/toggle-campaign/${id}`, { action, reason });
        return response.data;
    },

    // Obtener anunciantes
    getAdvertisers: async (params = {}) => {
        const response = await api.get('/admin/ads/advertisers', { params });
        return response.data;
    },

    // Suspender/Reactivar anunciante
    suspendAdvertiser: async (id, suspend, reason = '') => {
        const response = await api.post(`/admin/ads/suspend-advertiser/${id}`, { suspend, reason });
        return response.data;
    }
};

export default {
    advertiserProfile: advertiserProfileService,
    campaigns: campaignsService,
    billing: billingService,
    adminAds: adminAdsService
};
