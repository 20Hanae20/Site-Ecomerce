import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Layers,
    ShoppingBag,
    Tag,
    MessageSquare,
    Users,
    Settings,
    ShieldAlert,
    LogOut,
    Home,
    TrendingUp,
    Activity,
    Bell,
    PieChart,
    Award,
    Brain
} from 'lucide-react';
import api from '../../services/api';

const AdminLayout = () => {
    const [user] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });
    const [tenantBrand, setTenantBrand] = useState({
        name: 'SITE PARFUM',
        logo: null,
    });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

        if (!user || !token) {
            navigate('/admin/login');
            return;
        }

        const isStaff = ['admin', 'super_admin', 'moderateur', 'gestionnaire'].includes(user.role);

        if (!isStaff) {
            navigate('/');
            return;
        }

        api.get('/tenant/current')
            .then(({ data }) => {
                setTenantBrand({
                    name: data?.name || 'SITE PARFUM',
                    logo: data?.theme?.logo || null,
                });
            })
            .catch(() => {
                setTenantBrand({
                    name: 'SITE PARFUM',
                    logo: null,
                });
            });
    }, [navigate, user]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <div className="loader-premium">Initialisation du Sillage...</div>;

    const menuItems = [
        { label: 'Centre de Contrôle', icon: <ShieldAlert size={20} />, path: '/admin/dashboard', roles: ['super_admin', 'admin'] },
        { label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard', roles: ['*'] },
        { label: 'Analytics IA', icon: <TrendingUp size={20} />, path: '/admin/analytics-full', roles: ['super_admin', 'admin', 'gestionnaire'] },
        { label: 'Segmentation Clients', icon: <PieChart size={20} />, path: '/admin/segmentation', roles: ['super_admin', 'admin', 'gestionnaire'] },
        { label: 'Super Admin SaaS', icon: <Award size={20} />, path: '/admin/saas', roles: ['super_admin'] },
        { label: 'Console IA Plateforme', icon: <Brain size={20} />, path: '/admin/ia', roles: ['super_admin'] },
        { label: 'Monitoring SaaS', icon: <Activity size={20} />, path: '/admin/monitoring', roles: ['super_admin', 'admin'] },
        { label: 'Centre Notifications', icon: <Bell size={20} />, path: '/admin/notifications', roles: ['super_admin', 'admin', 'gestionnaire'] },
        { label: 'Produits', icon: <Package size={20} />, path: '/admin/products', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Catégories', icon: <Layers size={20} />, path: '/admin/categories', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Commandes', icon: <ShoppingBag size={20} />, path: '/admin/orders', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Promotions', icon: <Tag size={20} />, path: '/admin/promotions', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Modération Avis', icon: <MessageSquare size={20} />, path: '/admin/reviews', roles: ['super_admin', 'admin', 'moderateur'] },
        { label: 'Utilisateurs', icon: <Users size={20} />, path: '/admin/users', roles: ['super_admin', 'admin'] },
        { label: 'Paramètres Scellés', icon: <Settings size={20} />, path: '/admin/settings', roles: ['super_admin', 'admin'] },
        { label: 'Registres (Logs)', icon: <ShieldAlert size={20} />, path: '/admin/logs', roles: ['super_admin', 'admin'] },
    ];

    const filteredMenu = menuItems.filter(item =>
        item.roles.includes('*') || item.roles.includes(user.role)
    );

    return (
        <div className="admin-shell-premium">
            <aside className="admin-sidebar-premium glass-premium">
                <div className="admin-brand-premium">
                    <Link to="/" className="brand-link-luxury">
                        {tenantBrand.logo && (
                            <img
                                src={tenantBrand.logo}
                                alt={`${tenantBrand.name} logo`}
                                className="tenant-logo-premium"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                        <h2 className="font-serif gradient-text-gold">S.P ADMIN</h2>
                        <p className="tenant-brand-name">{tenantBrand.name}</p>
                    </Link>
                    <div className="role-badge-premium">
                        {user.role}
                    </div>
                </div>

                <nav className="admin-nav-luxury">
                    {filteredMenu.map((item) => (
                        <Link
                            key={`${item.path}-${item.label}`}
                            to={item.path}
                            className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="icon-wrapper">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </Link>
                    ))}

                    {(user.role === 'super_admin' || user.role === 'admin') && (
                        <div className="admin-special-access">
                            <div className="nav-divider"></div>
                            <Link to="/admin/settings" className="admin-nav-item gold-border-nav">
                                <span className="icon-wrapper gold-glow-icon"><Settings size={20} /></span>
                                <span className="label font-serif gold-text">MAÎTRISE TOTALE</span>
                            </Link>
                        </div>
                    )}
                    <div className="nav-divider"></div>
                    <Link to="/" className="admin-nav-item return-site">
                        <span className="icon-wrapper"><Home size={20} /></span>
                        <span className="label">Retour au Site</span>
                    </Link>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-mini-user">
                        <div className="admin-avatar">{user.name[0]}</div>
                        <div className="admin-user-details">
                            <span className="name">{user.name}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <LogOut size={18} />
                        DÉCONNEXION
                    </button>
                </div>
            </aside>

            <main className="admin-main-premium">
                <header className="admin-top-bar glass-premium">
                    <div className="top-bar-left">
                        <h2>{menuItems.find(i => i.path === location.pathname)?.label || 'Administration'}</h2>
                    </div>
                    <div className="top-bar-actions">
                        {(user.role === 'super_admin' || user.role === 'admin') && (
                            <Link to="/admin/settings" className="btn-master-hub">
                                <ShieldAlert size={16} /> Hub de Contrôle
                            </Link>
                        )}
                        <span className="system-status"><span className="dot pulse"></span> Système Actif</span>
                    </div>
                </header>

                <div className="admin-page-content animate-fade-in">
                    {(user.role === 'admin' || user.role === 'super_admin') && location.pathname === '/admin/dashboard' && (
                        <div className="full-control-diagnostic-overlay">
                            <div className="diagnostic-line"><span className="diag-label">OVERSIGHT MODE:</span> <span className="diag-value">ENABLED</span></div>
                            <div className="diagnostic-line"><span className="diag-label">SECURITY PROTOCOL:</span> <span className="diag-value">FULL PARITY</span></div>
                        </div>
                    )}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
