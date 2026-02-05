import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
    Vote, Users, TrendingUp, Clock, CheckCircle,
    XCircle, AlertCircle, Filter, Search, Plus,
    ArrowRight, Info, ThumbsUp, ThumbsDown, Minus
} from 'lucide-react';
import axios from 'axios';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

const API_URL = '';

// State labels con colores
const stateColors = {
    0: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Pendiente' },
    1: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Activa' },
    2: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Aprobada' },
    3: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rechazada' },
    4: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En Cola' },
    5: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Ejecutada' },
    6: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Cancelada' }
};

export default function GovernancePage() {
    const { address, isConnected } = useAccount();
    const [proposals, setProposals] = useState([]);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [filterState, setFilterState] = useState('all'); // 'all', 'active', 'executed'
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadData();
    }, [address, page]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Cargar propuestas
            const proposalsRes = await axios.get(`${API_URL}/api/governance/proposals?page=${page}&limit=10`);
            setProposals(proposalsRes.data.data.proposals || []);
            setTotalPages(proposalsRes.data.data.pagination.totalPages || 1);

            // Cargar estadísticas
            const statsRes = await axios.get(`${API_URL}/api/governance/stats`);
            setStats(statsRes.data.data);

            // Si está conectado, cargar datos del usuario
            if (isConnected && address) {
                const token = localStorage.getItem('token');
                if (token) {
                    const userRes = await axios.get(`${API_URL}/api/governance/user/${address}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserData(userRes.data.data);
                }
            }
        } catch (error) {
            // Silently handle error - backend may not be available
            if (error.code !== 'ERR_NETWORK') {
                console.error('Error loading governance data:', error);
                toast.error('Error al cargar datos de gobernanza');
            }
        } finally {
            setLoading(false);
        }
    };

    const openProposalModal = async (proposalId) => {
        try {
            const res = await axios.get(`${API_URL}/api/governance/proposal/${proposalId}`);
            setSelectedProposal(res.data.data);
        } catch (error) {
            console.error('Error loading proposal:', error);
            toast.error('Error al cargar propuesta');
        }
    };

    const closeProposalModal = () => {
        setSelectedProposal(null);
    };

    const handleVote = async (voteType) => {
        if (!selectedProposal) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Debes iniciar sesión');
                return;
            }

            // Validar voto
            const validation = await axios.post(
                `${API_URL}/api/governance/validate-vote`,
                {
                    proposalId: selectedProposal.id,
                    userAddress: address
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!validation.data.data.canVote) {
                toast.error(validation.data.data.reason);
                return;
            }

            toast.success('Ahora aprueba la transacción en tu wallet');
            // TODO: Implementar llamada al contrato con wagmi
            closeProposalModal();

        } catch (error) {
            console.error('Error voting:', error);
            toast.error('Error al votar');
        }
    };

    const filteredProposals = proposals.filter(proposal => {
        // Filtro por estado
        if (filterState === 'active' && !proposal.isActive) return false;
        if (filterState === 'executed' && proposal.state !== 5) return false;

        // Filtro por búsqueda
        if (searchQuery && !proposal.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    Cargando propuestas...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900">
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Vote className="text-indigo-400" size={32} />
                                Gobernanza DAO
                            </h1>
                            <p className="text-gray-400 mt-1">Participa en las decisiones de BeZhas</p>
                        </div>

                        {userData && (
                            <div className="hidden md:block bg-white/10 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20">
                                <p className="text-gray-400 text-sm">Tu Poder de Voto</p>
                                <p className="text-white text-xl font-bold">
                                    {parseFloat(userData.votingPowerFormatted).toFixed(2)} BEZ
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total Propuestas</p>
                                    <p className="text-white text-2xl font-bold mt-1">{stats.totalProposals}</p>
                                </div>
                                <Vote className="text-white/30" size={40} />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Activas</p>
                                    <p className="text-white text-2xl font-bold mt-1">{stats.activeProposals}</p>
                                </div>
                                <TrendingUp className="text-white/30" size={40} />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Ejecutadas</p>
                                    <p className="text-white text-2xl font-bold mt-1">{stats.executedProposals}</p>
                                </div>
                                <CheckCircle className="text-white/30" size={40} />
                            </div>
                        </motion.div>

                        {userData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm">Mis Votos</p>
                                        <p className="text-white text-2xl font-bold mt-1">{userData.proposalsVoted}</p>
                                    </div>
                                    <Users className="text-white/30" size={40} />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {/* Filters & Search */}
            <div className="max-w-7xl mx-auto px-4 pb-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar propuestas..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterState('all')}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${filterState === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setFilterState('active')}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${filterState === 'active'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                            >
                                Activas
                            </button>
                            <button
                                onClick={() => setFilterState('executed')}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${filterState === 'executed'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                            >
                                Ejecutadas
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposals List */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
                {!isConnected ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center border border-white/20">
                        <Vote className="mx-auto text-gray-400 mb-4" size={64} />
                        <h3 className="text-white text-xl font-semibold mb-2">Conecta tu Wallet</h3>
                        <p className="text-gray-400 mb-6">
                            Conecta tu wallet para ver las propuestas y participar en la gobernanza
                        </p>
                    </div>
                ) : filteredProposals.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center border border-white/20">
                        <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
                        <h3 className="text-white text-xl font-semibold mb-2">No se encontraron propuestas</h3>
                        <p className="text-gray-400">Intenta cambiar los filtros de búsqueda</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProposals.map((proposal, index) => {
                            const stateStyle = stateColors[proposal.state];
                            return (
                                <motion.div
                                    key={proposal.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:border-indigo-500 transition cursor-pointer"
                                    onClick={() => openProposalModal(proposal.id)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 ${stateStyle.bg} ${stateStyle.text} rounded-full text-xs font-semibold`}>
                                                    {stateStyle.label}
                                                </span>
                                                {proposal.isActive && (
                                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {proposal.timeRemaining?.label || 'En curso'}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-white font-bold text-lg mb-2">{proposal.title}</h3>
                                            <p className="text-gray-400 text-sm line-clamp-2">{proposal.description}</p>
                                        </div>
                                        <ArrowRight className="text-gray-400 flex-shrink-0 ml-4" size={24} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-gray-400 text-xs mb-1">A Favor</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500"
                                                        style={{ width: `${proposal.forPercent || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-green-400 text-sm font-semibold">
                                                    {proposal.forPercent || 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs mb-1">En Contra</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-red-500"
                                                        style={{ width: `${proposal.againstPercent || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-red-400 text-sm font-semibold">
                                                    {proposal.againstPercent || 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs mb-1">Abstención</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gray-500"
                                                        style={{ width: `${proposal.abstainPercent || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-gray-400 text-sm font-semibold">
                                                    {proposal.abstainPercent || 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Anterior
                        </button>
                        <div className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg">
                            Página {page} de {totalPages}
                        </div>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            {/* Proposal Detail Modal */}
            <AnimatePresence>
                {selectedProposal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
                        >
                            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 z-10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-white text-2xl font-bold">{selectedProposal.title}</h2>
                                    <button
                                        onClick={closeProposalModal}
                                        className="text-gray-400 hover:text-white transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-white font-semibold mb-2">Descripción</h3>
                                    <p className="text-gray-300">{selectedProposal.description}</p>
                                </div>

                                {/* Voting Results */}
                                <div>
                                    <h3 className="text-white font-semibold mb-4">Resultados de Votación</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-green-400">A Favor</span>
                                                <span className="text-white font-semibold">{selectedProposal.forPercent}%</span>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{ width: `${selectedProposal.forPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-red-400">En Contra</span>
                                                <span className="text-white font-semibold">{selectedProposal.againstPercent}%</span>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500"
                                                    style={{ width: `${selectedProposal.againstPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-400">Abstención</span>
                                                <span className="text-white font-semibold">{selectedProposal.abstainPercent}%</span>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gray-500"
                                                    style={{ width: `${selectedProposal.abstainPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vote Buttons */}
                                {selectedProposal.isVotingOpen && (
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleVote(1)}
                                            className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold"
                                        >
                                            <ThumbsUp size={20} />
                                            A Favor
                                        </button>
                                        <button
                                            onClick={() => handleVote(0)}
                                            className="py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-semibold"
                                        >
                                            <ThumbsDown size={20} />
                                            En Contra
                                        </button>
                                        <button
                                            onClick={() => handleVote(2)}
                                            className="py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 font-semibold"
                                        >
                                            <Minus size={20} />
                                            Abstención
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
