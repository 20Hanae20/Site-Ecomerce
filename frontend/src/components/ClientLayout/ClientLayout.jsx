import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Sparkles,
    Package,
    Heart,
    User,
    HelpCircle,
    LogOut,
    Menu,
    X,
    ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/useCart';

const ClientLayout = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const menuItems = [
        { label: 'Espace Client', icon: <LayoutDashboard size={20} />, path: '/client/dashboard' },
        { label: 'Catalogue Parfums', icon: <ShoppingBag size={20} />, path: '/client/catalog' },
        { label: 'Moteur IA & Quiz', icon: <Sparkles size={20} />, path: '/client/quiz' },
        { label: 'Suggestions IA', icon: <Sparkles size={20} />, path: '/client/recommendations' },
        { label: 'Mes Commandes', icon: <Package size={20} />, path: '/client/orders' },
        { label: 'Mes Favoris', icon: <Heart size={20} />, path: '/client/favorites' },
        { label: 'Mon Profil', icon: <User size={20} />, path: '/client/profile' },
        { label: 'Support & FAQ', icon: <HelpCircle size={20} />, path: '/client/support' }
    ];

    return (
        <div className="tenant-layout">
            {/* Sidebar */}
            <aside className={`tenant-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <Link to="/client/dashboard" className="brand-logo-tenant">
                        <span className="brand-icon">❖</span>
                        <span className="brand-text">Maison Aura</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="sidebar-toggle"
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <div className="tenant-info-card">
                    <div className="tenant-name">Espace Privé</div>
                    <div className="tenant-plan">Client Privilège</div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
                        {sidebarOpen && (
                            <div className="user-info">
                                <div className="user-name">{user?.name}</div>
                                <div className="user-role">Membre</div>
                            </div>
                        )}
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Se déconnecter">
                        <LogOut size={18} />
                        {sidebarOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="tenant-main">
                {/* Top Bar */}
                <header className="tenant-topbar">
                    <div className="topbar-left">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="toggle-sidebar-btn"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="page-title">
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Aura'}
                        </h2>
                    </div>

                    <div className="topbar-right">
                        <Link to="/cart" className="action-btn" style={{ position: 'relative', display: 'flex', textDecoration: 'none', color: 'inherit' }}>
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="notification-badge" style={{ top: '-10px', right: '-10px' }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="user-menu">
                            <div className="user-avatar-sm">{user?.name?.charAt(0) || 'U'}</div>
                            <span style={{ marginLeft: '0.5rem', fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="tenant-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ClientLayout;
