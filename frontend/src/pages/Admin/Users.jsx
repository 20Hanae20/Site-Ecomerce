import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Filter, Shield, User as UserIcon, ShieldAlert, Trash2, Ban, Unlock, Users, ShieldCheck, UserPlus, Fingerprint } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [currentUser] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        fetchUsers();
    }, [filterRole]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterRole) params.append('role', filterRole);
            if (searchTerm) params.append('q', searchTerm);

            const response = await api.get(`/admin/users?${params.toString()}`);
            setUsers(response.data.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setMessage({ text: 'Erreur lors du chargement des utilisateurs', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (userId, status) => {
        try {
            await api.patch(`/admin/users/${userId}/status`, { status });
            setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
            setMessage({ text: `Compte ${status === 'active' ? 'débloqué' : 'bloqué'} avec succès`, type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Erreur lors du changement de statut', type: 'error' });
        }
    };

    const handleUpdateRole = async (userId, role) => {
        if (!window.confirm(`Voulez-vous vraiment changer le rôle vers ${role} ?`)) return;
        try {
            await api.patch(`/admin/users/${userId}/role`, { role });
            setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
            setMessage({ text: 'Rôle mis à jour avec succès', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Erreur lors du changement de rôle', type: 'error' });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Action critique : Supprimer définitivement cet utilisateur ?")) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
            setMessage({ text: 'Utilisateur effacé de la Maison', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Erreur suppression', type: 'error' });
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin': return <span className="status-badge" style={{ background: 'rgba(255,0,85,0.1)', color: '#ff0055', border: '1px solid rgba(255,0,85,0.2)' }}>Super Admin</span>;
            case 'admin': return <span className="status-badge active" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary)', border: '1px solid rgba(212,175,55,0.2)' }}>Administrateur</span>;
            case 'moderateur': return <span className="status-badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>Modérateur</span>;
            case 'gestionnaire': return <span className="status-badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>Gestionnaire</span>;
            default: return <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>Client</span>;
        }
    };

    if (isLoading && users.length === 0) return <div className="loader">Recensement des Membres...</div>;

    return (
        <div className="admin-page-container">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Cénacle des <span className="gradient-text-gold">Utilisateurs</span></h1>
                    <p>Gérez les accès et les privilèges de votre communauté avec élégance.</p>
                </div>
                <div className="header-actions">
                    <button className="gold-button" onClick={() => fetchUsers()}>
                        <Fingerprint size={16} /> Chroniques
                    </button>
                </div>
            </header>

            <div className="stats-mosaic" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-card-glass">
                    <div className="card-icon gold"><Users size={22} /></div>
                    <div className="card-data">
                        <span className="label">Total Membres</span>
                        <span className="value">{users.length}</span>
                    </div>
                </div>
                <div className="admin-card-glass">
                    <div className="card-icon blue"><ShieldCheck size={22} /></div>
                    <div className="card-data">
                        <span className="label">Administrateurs</span>
                        <span className="value">{users.filter(u => ['admin', 'super_admin'].includes(u.role)).length}</span>
                    </div>
                </div>
                <div className="admin-card-glass">
                    <div className="card-icon purple"><UserPlus size={22} /></div>
                    <div className="card-data">
                        <span className="label">Gestionnaires</span>
                        <span className="value">{users.filter(u => u.role === 'gestionnaire' || u.role === 'moderateur').length}</span>
                    </div>
                </div>
                <div className="admin-card-glass">
                    <div className={`card-icon ${users.filter(u => u.status === 'blocked').length > 0 ? 'red' : 'green'}`}>
                        <ShieldAlert size={22} />
                    </div>
                    <div className="card-data">
                        <span className="label">Comptes Bloqués</span>
                        <span className="value">{users.filter(u => u.status === 'blocked').length}</span>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ borderRadius: '14px', marginBottom: '2rem' }}>
                    {message.text}
                </div>
            )}

            <div className="admin-toolbar-refined">
                <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1.4rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: 'var(--primary)' }} size={18} />
                    <input
                        type="text"
                        className="premium-input-refined"
                        placeholder="Rechercher une âme par nom, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                    />
                </div>
                <div className="filter-box" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <Filter size={18} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                    <select
                        value={filterRole}
                        className="premium-select-refined"
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{ minWidth: '200px' }}
                    >
                        <option value="">Tous les rangs</option>
                        <option value="user">Clients</option>
                        <option value="admin">Administrateurs</option>
                        <option value="moderateur">Modérateurs</option>
                        <option value="gestionnaire">Gestionnaires</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="premium-table-refined">
                    <thead>
                        <tr>
                            <th>Identité</th>
                            <th>Rang</th>
                            <th>État</th>
                            <th>Affiliation</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ opacity: user.status === 'blocked' ? 0.5 : 1 }}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div className="avatar-wrapper" style={{ position: 'relative', flexShrink: 0 }}>
                                            <div className="avatar-refined" style={{
                                                background: 'rgba(212, 175, 55, 0.08)',
                                                color: 'var(--primary)',
                                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                                fontWeight: '600'
                                            }}>
                                                {user.name[0].toUpperCase()}
                                            </div>
                                            {user.status === 'active' && (
                                                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', border: '2px solid var(--bg-deep)', boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)' }}></div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: 600, color: 'white', letterSpacing: '0.3px', fontSize: '0.95rem' }}>{user.name}</span>
                                            <span style={{ opacity: 0.4, fontSize: '0.75rem', fontWeight: '400' }}>{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{getRoleBadge(user.role)}</td>
                                <td>
                                    <span className={`status-badge ${user.status === 'active' ? 'active' : 'inactive'}`} style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem' }}>
                                        {user.status === 'active' ? 'Intègre' : 'Révoqué'}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                                    {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="actions-cell">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                        <button
                                            className="icon-btn"
                                            title={user.status === 'active' ? 'Révoquer l\'accès' : 'Rétablir l\'accès'}
                                            onClick={() => handleUpdateStatus(user.id, user.status === 'active' ? 'blocked' : 'active')}
                                            disabled={user.id === currentUser?.id}
                                            style={{
                                                background: user.status === 'active' ? 'rgba(239, 68, 68, 0.03)' : 'rgba(34, 197, 94, 0.03)',
                                                color: user.status === 'active' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)',
                                                border: `1px solid ${user.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'}`,
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '10px'
                                            }}
                                        >
                                            {user.status === 'active' ? <Ban size={16} /> : <Unlock size={16} />}
                                        </button>

                                        {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                                            <>
                                                <select
                                                    className="premium-select-refined"
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                    disabled={user.id === currentUser?.id}
                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', minWidth: '130px', height: '38px' }}
                                                >
                                                    <option value="user">Client</option>
                                                    <option value="moderateur">Modérateur</option>
                                                    <option value="gestionnaire">Gestionnaire</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="super_admin">Super Admin</option>
                                                </select>
                                                <button
                                                    className="icon-btn"
                                                    title="Bannir définitivement"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={user.id === currentUser?.id}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.03)',
                                                        color: 'rgba(239, 68, 68, 0.7)',
                                                        border: '1px solid rgba(239, 68, 68, 0.1)',
                                                        width: '38px',
                                                        height: '38px',
                                                        borderRadius: '10px'
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
