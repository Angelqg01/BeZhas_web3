import React, { useState, useEffect } from 'react';
import {
    Terminal as TerminalIcon, Lock as LockIcon, Globe as GlobeIcon, Bell as BellIcon,
    ShoppingCart as ShoppingCartIcon, Truck as TruckIcon, Briefcase as BriefcaseIcon, Building as BuildingIcon, Activity as ActivityIcon,
    Key as KeyIcon, Plus as PlusIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, Copy as CopyIcon, RefreshCw as RefreshCwIcon, Trash2 as Trash2Icon,
    Shield as ShieldIcon, Check as CheckIcon, XAlt as XAltIcon, Settings as SettingsIcon,
    FileCode as FileCodeIcon, Code as CodeIcon,
    Zap as ZapIcon, Cpu as CpuIcon, BarChart2 as BarChart2Icon,
    Search as SearchIcon, User as UserIcon, DollarSign as DollarSignIcon, Wallet as WalletIcon
} from 'lucide-react';
import http from '../../services/http';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout';

// Sub-components
import McpSdkDownloadTab from '../../components/developer-console/McpSdkDownloadTab';
import SDKSnippetsTab from '../../components/developer-console/SDKSnippetsTab';
import WebhooksTab from '../../components/developer-console/WebhooksTab';
import EmbedWidgetsTab from '../../components/developer-console/EmbedWidgetsTab';
import DocumentationTab from '../../components/developer-console/DocumentationTab';
import LoyaltyMetricsTab from '../../components/developer-console/LoyaltyMetricsTab';
import { EmptyState, ApiKeyCard, CreateKeyModal, KeyRevealModal, KeyDetailsModal } from '../../components/developer-console/ApiKeyManagement';

// Constantes y Mapeos
const PERMISSION_MODULES = {
    marketplace: { label: 'Marketplace', icon: ShoppingCartIcon, permissions: [{ id: 'marketplace:read', label: 'Leer Productos' }, { id: 'marketplace:write', label: 'Gestionar Productos' }] },
    logistics: { label: 'Logística', icon: TruckIcon, permissions: [{ id: 'logistics:read', label: 'Ver Envíos' }, { id: 'logistics:write', label: 'Crear Envíos' }, { id: 'logistics:fleet', label: 'Gestión de Flota' }] },
    payments: { label: 'Pagos & Escrow', icon: DollarSignIcon, permissions: [{ id: 'payments:read', label: 'Ver Transacciones' }, { id: 'payments:escrow:create', label: 'Crear Escrow' }, { id: 'payments:swap', label: 'Swap Tokens' }] },
    identity: { label: 'Identidad (KYC)', icon: UserIcon, permissions: [{ id: 'identity:read', label: 'Leer Perfil' }, { id: 'identity:verify', label: 'Verificar KYC' }] },
    realestate: { label: 'Real Estate', icon: BuildingIcon, permissions: [{ id: 'realestate:tokenize', label: 'Tokenizar Propiedad' }, { id: 'realestate:manage', label: 'Gestionar Activos' }] },
    ai: { label: 'Inteligencia Artificial', icon: CpuIcon, permissions: [{ id: 'ai:analyze', label: 'Análisis Predictivo' }, { id: 'ai:moderate', label: 'Moderación de Contenido' }] },
    legal: { label: 'Legal & Contratos', icon: BriefcaseIcon, permissions: [{ id: 'legal:contract:deploy', label: 'Desplegar Contratos' }, { id: 'legal:notarize', label: 'Notarizar Documentos' }] }
};

const DeveloperConsole = () => {
    const { user } = useAuth();
    // ... (state remains same)

    // ... (effects and handlers remain same)

    return (
        <MainLayout>
            <div className="container mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                            Developer Console
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Gestiona tus integraciones, monitorea el uso y accede a herramientas avanzadas.
                        </p>
                    </div>
                    {/* Botón de crear solo visible si no estamos en la tab de onboarding vacía */}
                    {activeTab === 'keys' && apiKeys.length > 0 && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
                        >
                            <PlusIcon size={20} />
                            Nueva API Key
                        </button>
                    )}
                </div>

                {/* Tabs Navigation */}
                <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
                    {[
                        { id: 'keys', label: 'API Keys', icon: KeyIcon },
                        { id: 'downloads', label: 'Downloads (MCP)', icon: TerminalIcon }, // NEW
                        { id: 'sdk', label: 'Integración SDK', icon: FileCodeIcon },
                        { id: 'webhooks', label: 'Webhooks', icon: GlobeIcon },
                        { id: 'widgets', label: 'Widgets', icon: ActivityIcon },
                        { id: 'docs', label: 'Documentación', icon: CodeIcon },
                        { id: 'metrics', label: 'Métricas & Loyalty', icon: BarChart2Icon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* TAB: API KEYS */}
                            {activeTab === 'keys' && (
                                <div className="space-y-6">
                                    {apiKeys.length === 0 ? (
                                        <EmptyState onCreateClick={() => setShowCreateModal(true)} />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                            {apiKeys.map(key => (
                                                <ApiKeyCard
                                                    key={key._id}
                                                    apiKey={key}
                                                    onDelete={handleDeleteKey}
                                                    onRotate={handleRotateKey}
                                                    onViewDetails={setSelectedKey}
                                                />
                                            ))}
                                            {/* Card para agregar nueva */}
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-all min-h-[200px]"
                                            >
                                                <PlusIcon size={40} className="mb-2 opacity-50" />
                                                <span className="font-semibold">Crear Nueva Key</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: DOWNLOADS (MCP & SDK) */}
                            {activeTab === 'downloads' && (
                                <McpSdkDownloadTab />
                            )}

                            {/* TAB: SDK INTEGRATION */}
                            {activeTab === 'sdk' && (
                                <SDKSnippetsTab
                                    apiKeys={apiKeys}
                                    onCreateKey={() => setShowCreateModal(true)}
                                />
                            )}

                            {/* TAB: WEBHOOKS */}
                            {activeTab === 'webhooks' && (
                                <WebhooksTab
                                    apiKeys={apiKeys}
                                />
                            )}

                            {/* TAB: WIDGETS */}
                            {activeTab === 'widgets' && (
                                <EmbedWidgetsTab />
                            )}

                            {/* TAB: DOCS */}
                            {activeTab === 'docs' && (
                                <DocumentationTab
                                    apiKeys={apiKeys}
                                    address={user?.walletAddress}
                                />
                            )}

                            {/* TAB: METRICS */}
                            {activeTab === 'metrics' && (
                                <LoyaltyMetricsTab
                                    usageStats={usageStats}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Modals */}
                {showCreateModal && (
                    <CreateKeyModal
                        onClose={() => setShowCreateModal(false)}
                        onCreate={handleCreateKey}
                        permissionModules={PERMISSION_MODULES}
                    />
                )}

                {newKeyData && (
                    <KeyRevealModal
                        keyData={newKeyData}
                        onClose={() => setNewKeyData(null)}
                    />
                )}

                {selectedKey && (
                    <KeyDetailsModal
                        apiKey={selectedKey}
                        onClose={() => setSelectedKey(null)}
                        permissionModules={PERMISSION_MODULES}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default DeveloperConsole;
