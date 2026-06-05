import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Tag,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown,
    BarChart3,
    Brain,
    CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TenantLayout = () => {
    const { user, tenant, subscription, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/tenant/dashboard', roles: ['*'] },
        { label: 'Produits', icon: <Package size={20} />, path: '/tenant/products', roles: ['admin', 'super_admin', 'gestionnaire', 'owner', 'moderateur'] },
        { label: 'Commandes', icon: <ShoppingCart size={20} />, path: '/tenant/orders', roles: ['admin', 'super_admin', 'gestionnaire', 'owner', 'moderateur'] },
        { label: 'Clients', icon: <Users size={20} />, path: '/tenant/customers', roles: ['admin', 'super_admin', 'gestionnaire', 'owner'] },
        { label: 'Promotions', icon: <Tag size={20} />, path: '/tenant/promotions', roles: ['admin', 'super_admin', 'gestionnaire', 'owner'] },
        { label: 'Équipe', icon: <Users size={20} />, path: '/tenant/team', roles: ['admin', 'super_admin', 'owner'] },
        { label: 'Analytics', icon: <BarChart3 size={20} />, path: '/tenant/analytics', roles: ['admin', 'super_admin', 'gestionnaire', 'owner'] },
        { label: 'IA', icon: <Brain size={20} />, path: '/tenant/ai', roles: ['admin', 'super_admin', 'gestionnaire', 'owner'] },
        { label: 'Facturation', icon: <CreditCard size={20} />, path: '/tenant/billing', roles: ['admin', 'super_admin', 'owner'] },
        { label: 'Paramètres', icon: <Settings size={20} />, path: '/tenant/settings', roles: ['admin', 'super_admin', 'owner'] },
    ];

    const filteredMenu = menuItems.filter(item =>
        item.roles.includes('*') || item.roles.includes(user?.role)
    );

    return (
        <div className="tenant-layout">
            {/* Sidebar */}
            <aside className={`tenant-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <Link to="/tenant/dashboard" className="brand-logo-tenant">
                        <span className="brand-icon">◆</span>
                        <span className="brand-text">AURA</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="sidebar-toggle"
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <div className="tenant-info-card">
                    <div className="tenant-name">{tenant?.name || 'Mon entreprise'}</div>
                    <div className="tenant-plan">{subscription?.plan || 'Free'} Plan</div>
                </div>

                <nav className="sidebar-nav">
                    {filteredMenu.map((item, index) => (
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
                                <div className="user-role">{user?.role}</div>
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
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="topbar-right">
                        <div className="notification-bell">
                            <button onClick={() => setNotificationsOpen(!notificationsOpen)}>
                                <Bell size={20} />
                                <span className="notification-badge">3</span>
                            </button>

                            {notificationsOpen && (
                                <div className="notification-panel">
                                    <div className="notification-item">
                                        <div className="notification-title">Nouvelle commande</div>
                                        <div className="notification-time">À l'instant</div>
                                    </div>
                                    <div className="notification-item">
                                        <div className="notification-title">Paiement confirmé</div>
                                        <div className="notification-time">Il y a 10 min</div>
                                    </div>
                                    <div className="notification-item">
                                        <div className="notification-title">Stock faible</div>
                                        <div className="notification-time">Il y a 1 h</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="user-menu">
                            <button className="user-btn">
                                <div className="user-avatar-sm">{user?.name?.charAt(0) || 'U'}</div>
                                <span>{user?.name?.split(' ')[0]}</span>
                                <ChevronDown size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="tenant-content">
                    <Outlet />
                </main>
            </div>

            <style>{`
                .tenant-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--bg-body);
                }

                /* Sidebar */
                .tenant-sidebar {
                    width: 280px;
                    background: var(--bg-surface);
                    border-right: 1px solid var(--border-light);
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                    position: fixed;
                    height: 100vh;
                    left: 0;
                    top: 0;
                    z-index: 100;
                    overflow-y: auto;
                }

                .tenant-sidebar.closed {
                    width: 80px;
                }

                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-light);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .brand-logo-tenant {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: var(--text-main);
                }

                .brand-icon {
                    color: var(--primary);
                    font-size: 1.5rem;
                }

                .brand-text {
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                .sidebar-toggle {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: none;
                }

                .tenant-info-card {
                    padding: 1rem;
                    margin: 1rem;
                    background: var(--bg-alt);
                    border-radius: var(--radius-md);
                    text-align: center;
                }

                .tenant-name {
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 0.9rem;
                    margin-bottom: 0.25rem;
                }

                .tenant-plan {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .sidebar-nav {
                    flex: 1;
                    padding: 1rem 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1rem;
                    color: var(--text-muted);
                    text-decoration: none;
                    transition: all 0.3s ease;
                    border-left: 3px solid transparent;
                }

                .nav-item:hover {
                    background: var(--bg-alt);
                    color: var(--primary);
                }

                .nav-item.active {
                    background: var(--primary-light);
                    color: var(--primary);
                    border-left-color: var(--primary);
                }

                .nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                }

                .nav-label {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .sidebar-footer {
                    padding: 1rem;
                    border-top: 1px solid var(--border-light);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .user-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: var(--bg-alt);
                    border-radius: var(--radius-md);
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--primary-light);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                }

                .user-info {
                    flex: 1;
                }

                .user-name {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-main);
                }

                .user-role {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .logout-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: none;
                    border: 1px solid var(--border-light);
                    color: var(--text-muted);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.875rem;
                }

                .logout-btn:hover {
                    background: var(--bg-alt);
                    color: var(--danger);
                    border-color: var(--danger);
                }

                /* Main Content */
                .tenant-main {
                    flex: 1;
                    margin-left: 280px;
                    display: flex;
                    flex-direction: column;
                    transition: margin-left 0.3s ease;
                }

                .tenant-sidebar.closed ~ .tenant-main {
                    margin-left: 80px;
                }

                .tenant-topbar {
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-light);
                    padding: 1rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }

                .topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .toggle-sidebar-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: none;
                }

                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .topbar-right {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .notification-bell {
                    position: relative;
                }

                .notification-bell button {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    position: relative;
                }

                .notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: var(--danger);
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .notification-panel {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 350px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    margin-top: 0.5rem;
                    z-index: 1000;
                }

                .notification-item {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-light);
                }

                .notification-item:last-child {
                    border-bottom: none;
                }

                .notification-title {
                    font-weight: 500;
                    color: var(--text-main);
                    font-size: 0.9rem;
                }

                .notification-time {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 0.25rem;
                }

                .user-menu {
                    display: flex;
                    align-items: center;
                }

                .user-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: none;
                    border: none;
                    color: var(--text-main);
                    cursor: pointer;
                    padding: 0.5rem;
                    font-size: 0.875rem;
                }

                .user-avatar-sm {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary-light);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .tenant-content {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                }

                @media (max-width: 768px) {
                    .tenant-sidebar {
                        width: 280px;
                        margin-left: -280px;
                    }

                    .tenant-sidebar.open {
                        margin-left: 0;
                    }

                    .tenant-main {
                        margin-left: 0;
                    }

                    .sidebar-toggle {
                        display: block;
                    }

                    .toggle-sidebar-btn {
                        display: block;
                    }

                    .tenant-topbar {
                        padding: 1rem;
                    }

                    .topbar-right {
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default TenantLayout;
