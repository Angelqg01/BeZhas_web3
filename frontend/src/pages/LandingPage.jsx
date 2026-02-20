import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import SafeGoogleLogin from '../components/common/SafeGoogleLogin';
import {
    ShieldCheck, Coins, Globe2, BrainCircuit, ArrowRight,
    CheckCircle2, Code2, Terminal, LayoutGrid, ChevronRight,
    Layers, Vote, Percent, Twitter, Github, Disc,
    Zap, Lock, TrendingUp, Activity, X, Briefcase, User, Building2, Wallet
} from 'lucide-react';
import ConnectWalletModal from '../components/auth/ConnectWalletModal';

// Components
import CosmosCanvas from '../components/landing/CosmosCanvas';
import LogoScroll from '../components/landing/LogoScroll';
import TokenWidget from '../components/landing/TokenWidget';

import '../components/landing/Landing.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const { open } = useWeb3Modal();
    const { isConnected } = useAccount();
    const [scrolled, setScrolled] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showConnectWalletModal, setShowConnectWalletModal] = useState(false);
    const [regMethod, setRegMethod] = useState('email'); // 'email' | 'wallet'
    const [formData, setFormData] = useState({
        email: '', password: '', username: '', accountType: 'individual',
        companyName: '', industry: 'Technology', phone: '', taxId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleWalletRegister = () => {
        open();
        setShowRegisterModal(false);
    };

    const handleEmailRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                // Save auth & Close Modal
                localStorage.setItem('auth', JSON.stringify(data));
                setShowRegisterModal(false);
                // Open Connect Wallet Suggestion
                setShowConnectWalletModal(true);
            } else {
                setError(data.error || 'Error al registrarse');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: credentialResponse.credential })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }));
                navigate('/feed');
            } else {
                console.error('Google auth failed:', data.error);
            }
        } catch (error) {
            console.error('Error en Google Auth:', error);
        }
    };

    const handleGithubRegister = () => {
        setShowRegisterModal(false);
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        const scope = 'read:user user:email';

        // Pequeño delay para que se cierre el modal antes de redirigir
        setTimeout(() => {
            window.location.href = `https://github.com/login/oauth/authorize?` +
                `client_id=${clientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `scope=${encodeURIComponent(scope)}`;
        }, 100);
    };

    // Scroll handler effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.reveal').forEach((el) => {
            observer.observe(el);
        });

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    // Redirigir a home si ya está conectado
    useEffect(() => {
        if (isConnected) {
            navigate('/home');
        }
    }, [isConnected, navigate]);

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden relative selection:bg-purple-500 selection:text-white">
            {/* Universe Background */}
            <CosmosCanvas />

            {/* Fisheye Vignette */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle at center, transparent 40%, rgba(5, 5, 10, 0.5) 65%, rgba(0, 0, 0, 1) 100%)',
                    backdropFilter: 'blur(2px)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 110%)'
                }}
            />

            {/* Navbar */}
            <nav className={`fixed w-full z-40 transition-all duration-300 border-b border-white/5 ${scrolled ? 'bg-[#010105]/90 shadow-lg' : 'bg-[#010105]/60'
                } backdrop-blur-md`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <a href="#" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
                            <div className="relative w-full h-full bg-black/80 rounded-xl border border-white/10 flex items-center justify-center font-display font-bold text-xl backdrop-blur-sm">
                                B
                            </div>
                        </div>
                        <span className="font-display text-xl font-bold tracking-tight">BeZhas</span>
                    </a>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#solutions" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Soluciones</a>
                        <a href="#benefits" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Beneficios</a>
                        <a href="#technology" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Tecnología</a>
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="relative group px-6 py-2.5 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] transition-all"
                        >
                            <span className="relative flex items-center gap-2 text-sm font-semibold text-white">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                Registrarse Ahora
                            </span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="md:hidden px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-semibold text-white"
                    >
                        Registrarse
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-44 pb-20 z-10 px-6">
                {/* Token Price Widget - Floating in Hero */}
                <TokenWidget position="hero" />

                <div className="max-w-7xl mx-auto text-center reveal active">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                        <span className="text-sm font-medium text-purple-300 tracking-wide uppercase">Web3 Enterprise Grade</span>
                    </div>

                    <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight drop-shadow-2xl">
                        La Eficiencia de la Web3, <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Diseñada para la Empresa Real.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed shadow-black drop-shadow-md">
                        Transformamos la complejidad de la tecnología blockchain en soluciones de negocio tangibles.
                        <strong> BeZhas</strong> es la plataforma integral para optimizar procesos, asegurar transacciones
                        y escalar tu empresa hacia el futuro descentralizado.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center gap-2 group backdrop-blur-sm"
                        >
                            <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Comenzar Gratis
                        </button>
                        <a
                            href="https://calendar.app.google/Bff4eQn6SukB9jMx9"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                        >
                            <LayoutGrid className="w-5 h-5 text-gray-400" />
                            Solicitar Demo Empresarial
                        </a>
                    </div>
                </div>
            </section>

            {/* EL DIAGNÓSTICO: Problema vs Solución */}
            <section id="solutions" className="py-20 px-6 relative z-10">
                <div className="max-w-7xl mx-auto reveal">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">El Salto Evolutivo</h2>
                        <p className="text-gray-400 text-lg">Deje atrás las ineficiencias del sistema Legacy.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-0 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm bg-black/40">
                        {/* Columna Legacy */}
                        <div className="p-8 md:p-12 bg-red-900/5">
                            <h3 className="text-2xl font-bold text-gray-300 mb-8 flex items-center gap-3">
                                <Activity className="w-6 h-6 text-red-400" />
                                El Problema Actual (Legacy)
                            </h3>
                            <ul className="space-y-8">
                                <li className="flex gap-4 text-gray-400">
                                    <X className="w-6 h-6 text-red-500 flex-shrink-0" />
                                    <div>
                                        <strong className="block text-gray-200 text-lg mb-1">Procesos Manuales y Lentos</strong>
                                        <p>Dependencia humana propensa a errores costosos y retrasos administrativos.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 text-gray-400">
                                    <X className="w-6 h-6 text-red-500 flex-shrink-0" />
                                    <div>
                                        <strong className="block text-gray-200 text-lg mb-1">Intermediarios Costosos</strong>
                                        <p>Múltiples capas bancarias que encarecen y retrasan los pagos días enteros.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 text-gray-400">
                                    <X className="w-6 h-6 text-red-500 flex-shrink-0" />
                                    <div>
                                        <strong className="block text-gray-200 text-lg mb-1">Opacidad y Riesgo</strong>
                                        <p>Datos fragmentados difíciles de auditar, aumentando el riesgo de fraude interno y externo.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Columna BeZhas */}
                        <div className="p-8 md:p-12 bg-blue-900/10 border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
                            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-blue-400" />
                                La Solución BeZhas (Web3)
                            </h3>
                            <ul className="space-y-8 relative z-10">
                                <li className="flex gap-4 text-blue-100">
                                    <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <strong className="block text-white text-lg mb-1">Smart Contracts SDK</strong>
                                        <p className="text-blue-200/70">Ejecución automática de acuerdos sin intervención humana, garantizando cumplimiento al 100%.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 text-blue-100">
                                    <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <strong className="block text-white text-lg mb-1">Transacciones P2P Instantáneas</strong>
                                        <p className="text-blue-200/70">Pagos globales en segundos usando Blockchain y BEZ-Coin, eliminando fricción bancaria.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 text-blue-100">
                                    <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <strong className="block text-white text-lg mb-1">Oracle AI & Ledger Inmutable</strong>
                                        <p className="text-blue-200/70">Trazabilidad total auditada por nuestra IA y registrada permanentemente en la Blockchain.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Logo Scroll */}
            <LogoScroll />

            {/* 3. PROPUESTA DE VALOR: ROI Comercial */}
            <section id="benefits" className="py-20 px-6 max-w-7xl mx-auto relative z-10 text-center">
                <h2 className="font-display text-3xl font-bold mb-16 reveal">Resultados de Negocio Inmediatos</h2>
                <div className="grid md:grid-cols-4 gap-6 reveal">
                    {[
                        {
                            icon: <Zap className="w-10 h-10 text-yellow-400" />,
                            title: "Velocidad Operativa",
                            desc: "Reduzca el tiempo de liquidación de días a segundos. El flujo de caja de su empresa nunca se detiene."
                        },
                        {
                            icon: <ShieldCheck className="w-10 h-10 text-green-400" />,
                            title: "Seguridad Institucional",
                            desc: "Protección criptográfica avanzada. Elimine puntos únicos de fallo y hacks tradicionales."
                        },
                        {
                            icon: <TrendingUp className="w-10 h-10 text-blue-400" />,
                            title: "Reducción de Costes",
                            desc: "Ahorre hasta un 40% en operativos eliminando intermediarios y automatizando con nuestra SDK."
                        },
                        {
                            icon: <Globe2 className="w-10 h-10 text-purple-400" />,
                            title: "Escalabilidad Global",
                            desc: "Acceda a mercados internacionales sin barreras. Su empresa, operando sin fronteras."
                        }
                    ].map((item, i) => (
                        <div key={i} className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-all group text-left border border-white/5">
                            <div className="mb-4 group-hover:scale-110 transition-transform duration-300 bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center border border-white/10">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Video Introduction Section */}
            <section className="py-24 relative z-10 bg-black/40 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto reveal text-center">
                        <span className="text-purple-400 font-semibold tracking-wider text-sm uppercase mb-4 block">Visualice el Futuro</span>
                        <h2 className="font-display text-3xl md:text-5xl font-bold mb-8">
                            Nuestra Tecnología Escuchando a su Negocio
                        </h2>
                        <p className="text-gray-400 mb-12 max-w-2xl mx-auto text-lg pt-4">
                            Vea cómo nuestro Sistema Oracle, potenciado por IA, interactúa con la Blockchain para auditar y validar eventos del mundo real automáticamente.
                        </p>

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-md">
                            <div className="aspect-video w-full bg-slate-900">
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/L8H2AapjtVc" // Modifica con el ID del video si es diferente
                                    title="BeZhas Platform Overview"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. TECNOLOGÍA & TOKEN: El Motor */}
            <section id="technology" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
                <div className="bg-gradient-to-br from-[#0f0f16] to-[#1a1a24] rounded-3xl p-8 md:p-16 border border-purple-500/20 shadow-2xl reveal">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                                Potenciado por <span className="text-purple-400">BEZ-Coin</span> & SDK
                            </h2>
                            <p className="text-gray-300 mb-8 text-lg">
                                No es solo un token, es el combustible de su nueva infraestructura eficiente.
                            </p>
                            <ul className="space-y-6 mb-8">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">1</div>
                                    <div>
                                        <strong className="block text-white mb-1">Automatización SDK</strong>
                                        <p className="text-gray-400 text-sm">Integre sus sistemas actuales (ERP, CRM) con nuestra Blockchain en días, no meses.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">2</div>
                                    <div>
                                        <strong className="block text-white mb-1">Liquidez Instantánea</strong>
                                        <p className="text-gray-400 text-sm">Utilice BEZ-Coin para micropagos de alta velocidad y recompensas corporativas.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">3</div>
                                    <div>
                                        <strong className="block text-white mb-1">IA Oracle Resolver</strong>
                                        <p className="text-gray-400 text-sm">Nuestra Inteligencia Artificial arbitra disputas automáticamente, reduciendo costes legales.</p>
                                    </div>
                                </li>
                            </ul>
                            <a
                                href="https://docs.google.com/document/d/1hoy541vyrkgYHAzjcUsXX67ssgbt2SqP1L88yuzPXnM/edit?usp=sharing"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2 transition-colors"
                            >
                                Leer Whitepaper Económico <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-600/20 blur-[60px] rounded-full"></div>
                            {/* Representación visual abstracta del token/sistema */}
                            <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-xl">
                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-gray-400 text-sm font-mono">System Status</span>
                                    <span className="text-green-400 text-xs px-2 py-1 bg-green-900/30 rounded border border-green-500/30 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Operational
                                    </span>
                                </div>
                                <div className="space-y-4 font-mono text-sm">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-purple-300">Oracle AI Logic</span>
                                        <span className="text-white">Processing...</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-purple-300">Smart Contract</span>
                                        <span className="text-white">Executed (0.02s)</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-purple-300">Settlement</span>
                                        <span className="text-yellow-400">1,500 BEZ</span>
                                    </div>
                                    <div className="mt-4 p-4 bg-purple-900/10 rounded-lg border border-purple-500/20 text-purple-200 text-xs leading-relaxed">
                                        &gt; Transaction verified on-chain. <br />
                                        &gt; Assets transferred instantly. <br />
                                        &gt; SDK Callback received.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 text-center px-6 relative z-10 mb-20">
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 reveal">¿Listo para optimizar su futuro?</h2>
                <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg reveal">
                    Únase a las empresas pioneras que ya están escalando con la infraestructura descentralizada de BeZhas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center reveal">
                    <button onClick={() => navigate('/register')} className="px-10 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                        Comenzar Ahora
                    </button>
                    <a
                        href="https://calendar.app.google/Bff4eQn6SukB9jMx9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                    >
                        📅 Agendar Cita
                    </a>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 reveal">
                    <a
                        href="https://t.me/+34661175645"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                        Telegram
                    </a>
                    <a
                        href="mailto:info.bezcoin@bezhas.com"
                        className="px-8 py-3 bg-transparent border border-white/20 text-white hover:bg-white/5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        ✉️ info.bezcoin@bezhas.com
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#020203]/90 pt-16 pb-8 relative z-10 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    B
                                </div>
                                <span className="text-xl font-display font-bold">BeZhas</span>
                            </div>
                            <p className="text-gray-500 text-sm max-w-sm mb-6">
                                Construyendo la capa de confianza para el comercio global descentralizado.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://twitter.com/bezhas" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="https://github.com/bezhas" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="https://discord.gg/bezhas" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                    <Disc className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Ecosistema</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li>
                                    <Link to="/marketplace" className="hover:text-purple-400 transition-colors">Marketplace</Link>
                                </li>
                                <li>
                                    <Link to="/logistics" className="hover:text-purple-400 transition-colors">Bridge</Link>
                                </li>
                                <li>
                                    <Link to="/explorer" className="hover:text-purple-400 transition-colors">Explorer</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li>
                                    <Link to="/privacy" className="hover:text-purple-400 transition-colors">Privacy</Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="hover:text-purple-400 transition-colors">Terms</Link>
                                </li>
                                <li>
                                    <Link to="/audits" className="hover:text-purple-400 transition-colors">Audits</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                        <p>© 2026 BeZhas Enterprise. Decentralized & Open Source.</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>Systems Operational</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="relative bg-[#0f0f16] border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-slideUp overflow-hidden">

                        {/* Tabs */}
                        <div className="flex border-b border-white/10 mb-6">
                            <button
                                onClick={() => setRegMethod('email')}
                                className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${regMethod === 'email' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Email / Empresa
                                {regMethod === 'email' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />}
                            </button>
                            <button
                                onClick={() => setRegMethod('wallet')}
                                className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${regMethod === 'wallet' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Web3 Wallet
                                {regMethod === 'wallet' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />}
                            </button>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowRegisterModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Content */}
                        {regMethod === 'wallet' ? (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-3 text-purple-400">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Conectar Billetera</h3>
                                    <p className="text-sm text-gray-400 mt-2">Acceso instantáneo sin contraseñas.</p>
                                </div>
                                <button
                                    onClick={handleWalletRegister}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-white transition-all hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] group"
                                >
                                    <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Conectar Metamask / Rabbit
                                </button>
                                <div className="relative py-3">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                    <div className="relative flex justify-center text-xs"><span className="bg-[#0f0f16] px-2 text-gray-500">SEGURO & PRIVADO</span></div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleEmailRegister} className="space-y-4 animate-fadeIn">
                                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">{error}</div>}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-400 mb-1 block">Tipo de Cuenta</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['individual', 'freelancer', 'company'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, accountType: type })}
                                                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${formData.accountType === type
                                                        ? 'bg-purple-600 border-purple-500 text-white'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {type === 'individual' ? 'Personal' : type === 'freelancer' ? 'Autónomo' : 'Empresa'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.accountType !== 'individual' && (
                                        <>
                                            <div className="col-span-2">
                                                <input
                                                    type="text"
                                                    placeholder={formData.accountType === 'company' ? "Nombre de la Empresa" : "Nombre Comercial"}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
                                                    value={formData.companyName}
                                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <select
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                                                    value={formData.industry}
                                                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                                >
                                                    {['Logistics', 'Retail', 'Real Estate', 'Finance', 'Technology', 'Other'].map(i => (
                                                        <option key={i} value={i} className="bg-black">{i}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Tax ID / CIF"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                                                    value={formData.taxId}
                                                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="col-span-2">
                                        <input
                                            type="email"
                                            placeholder="Correo Electrónico"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                                </button>

                                <div className="text-center">
                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                        <div className="relative flex justify-center text-xs"><span className="bg-[#0f0f16] px-2 text-gray-500">o registrarse con</span></div>
                                    </div>
                                    <div className="flex gap-2 justify-center mt-2">
                                        <SafeGoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => console.warn('Google Login not available')}
                                            useOneTap={false}
                                            type="icon"
                                            theme="filled_black"
                                            size="medium"
                                            shape="circle"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGithubRegister}
                                            className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                                        >
                                            <Github className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Terms */}
                        <p className="text-xs text-gray-500 text-center mt-6">
                            Al registrarte, aceptas nuestros{' '}
                            <Link to="/terms" className="text-purple-400 hover:text-purple-300">Términos</Link>
                            {' '}y{' '}
                            <Link to="/privacy" className="text-purple-400 hover:text-purple-300">Privacidad</Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Wallet Suggestion Modal */}
            <ConnectWalletModal
                isOpen={showConnectWalletModal}
                onClose={() => setShowConnectWalletModal(false)}
                onSkip={() => {
                    setShowConnectWalletModal(false);
                    navigate('/feed');
                }}
            />
        </div>
    );
};


export default LandingPage;
