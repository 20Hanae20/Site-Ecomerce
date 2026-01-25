import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Filter, Shield, User as UserIcon, ShieldAlert, Trash2, Ban, Unlock } from 'lucide-react';

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
        <div className="admin-content-inner">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Cénacle des <span className="gradient-text-gold">Utilisateurs</span></h1>
                    <p>Gérez les accès et les privilèges de votre communauté.</p>
                </div>
            </header>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="admin-toolbar glass-premium" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                        style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                    />
                </div>
                <div className="filter-box" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Filter size={18} style={{ opacity: 0.5 }} />
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--primary)' }}
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

            <div className="admin-table-container glass-premium">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Identité</th>
                            <th>Rang</th>
                            <th>État du Compte</th>
                            <th>Membre depuis</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ opacity: user.status === 'blocked' ? 0.6 : 1 }}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="avatar" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary)' }}>
                                            {user.name[0]}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                            <small style={{ opacity: 0.4 }}>{user.email}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>{getRoleBadge(user.role)}</td>
                                <td>
                                    <span className={`status-badge ${user.status === 'active' ? 'active' : 'inactive'}`}>
                                        {user.status === 'active' ? 'Actif' : 'Révoqué'}
                                    </span>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                                <td className="actions-cell">
                                    <button
                                        className={`icon-btn ${user.status === 'active' ? 'delete' : ''}`}
                                        title={user.status === 'active' ? 'Suspendre' : 'Réactiver'}
                                        onClick={() => handleUpdateStatus(user.id, user.status === 'active' ? 'blocked' : 'active')}
                                        disabled={user.id === currentUser?.id}
                                    >
                                        {user.status === 'active' ? <Ban size={16} /> : <Unlock size={16} />}
                                    </button>

                                    {currentUser?.role === 'super_admin' && (
                                        <>
                                            <select
                                                className="status-select"
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                disabled={user.id === currentUser?.id}
                                                style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                            >
                                                <option value="user">Client</option>
                                                <option value="moderateur">Modérateur</option>
                                                <option value="gestionnaire">Gestionnaire</option>
                                                <option value="admin">Admin</option>
                                                <option value="super_admin">Super Admin</option>
                                            </select>
                                            <button
                                                className="icon-btn delete"
                                                title="Supprimer"
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={user.id === currentUser?.id}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
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
