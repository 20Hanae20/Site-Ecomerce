import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Profile Edit State
    const [profileData, setProfileData] = useState({
        name: '',
        first_name: '',
        last_name: '',
        phone: '',
    });

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressData, setAddressData] = useState({
        city: '',
        neighborhood: '',
        full_address: '',
        zip_code: '',
        is_default: false,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setUser(response.data);
            setProfileData({
                name: response.data.name || '',
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
                phone: response.data.phone || '',
            });
            setAddresses(response.data.addresses || []);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await api.put('/profile', profileData);
            setMessage(response.data.message);
            setUser(response.data.user);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await api.post('/profile/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
                new_password_confirmation: passwordData.new_password_confirmation
            });
            setMessage(response.data.message);
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            if (err.response?.data?.message) setMessage(err.response.data.message);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/addresses', addressData);
            setAddresses([...addresses, response.data.address]);
            setShowAddressForm(false);
            setAddressData({ city: '', neighborhood: '', full_address: '', zip_code: '', is_default: false });
        } catch (err) {
            console.error("Failed to add address", err);
        }
    };

    const deleteAddress = async (id) => {
        if (!globalThis.confirm("Supprimer cette adresse ?")) return;
        try {
            await api.delete(`/addresses/${id}`);
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (err) {
            console.error("Failed to delete address", err);
        }
    };

    if (isLoading) return <div className="page-container"><p>Chargement du profil...</p></div>;

    return (
        <div className="page-container profile-page">
            <h1>Mon Profil</h1>
            <p>Gérez vos informations et adresses de livraison.</p>

            <div className="profile-grid">
                {/* Personal Info Section */}
                <section className="profile-section">
                    <h2>Informations Personnelles</h2>
                    <form onSubmit={handleProfileUpdate} className="auth-form profile-form">
                        <div className="form-group">
                            <label htmlFor="member-since">Membre depuis le</label>
                            <input id="member-since" type="text" value={new Date(user.created_at).toLocaleDateString('fr-FR')} disabled className="disabled-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email-static">Email (Non modifiable)</label>
                            <input id="email-static" type="text" value={user.email} disabled className="disabled-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pseudo">Pseudo</label>
                            <input
                                id="pseudo"
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            />
                        </div>
                        <div className="row">
                            <div className="form-group">
                                <label htmlFor="first_name">Prénom</label>
                                <input
                                    id="first_name"
                                    type="text"
                                    value={profileData.first_name}
                                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name">Nom</label>
                                <input
                                    id="last_name"
                                    type="text"
                                    value={profileData.last_name}
                                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Téléphone</label>
                            <input
                                id="phone"
                                type="text"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                placeholder="06..."
                            />
                        </div>
                        <button type="submit" className="submit-btn">Mettre à jour</button>
                    </form>
                </section>

                {/* Password Section */}
                <section className="profile-section">
                    <h2>Sécurité</h2>
                    <form onSubmit={handlePasswordChange} className="auth-form password-form">
                        <div className="form-group">
                            <label htmlFor="current_password">Mot de passe actuel</label>
                            <input
                                id="current_password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="new_password">Nouveau mot de passe</label>
                            <input
                                id="new_password"
                                type="password"
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="new_password_confirmation">Confirmer le nouveau mot de passe</label>
                            <input
                                id="new_password_confirmation"
                                type="password"
                                value={passwordData.new_password_confirmation}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn secondary">Changer le mot de passe</button>
                    </form>
                </section>

                {/* Addresses Section */}
                <section className="profile-section addresses-section">
                    <div className="section-header">
                        <h2>Mes Adresses</h2>
                        <button className="add-btn" onClick={() => setShowAddressForm(!showAddressForm)}>
                            {showAddressForm ? "Annuler" : "Ajouter"}
                        </button>
                    </div>

                    {showAddressForm && (
                        <form onSubmit={handleAddressSubmit} className="auth-form address-form">
                            <div className="row">
                                <div className="form-group">
                                    <label htmlFor="city">Ville</label>
                                    <input id="city" type="text" required onChange={(e) => setAddressData({ ...addressData, city: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="neighborhood">Quartier</label>
                                    <input id="neighborhood" type="text" required onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_address">Adresse complète</label>
                                <textarea id="full_address" required onChange={(e) => setAddressData({ ...addressData, full_address: e.target.value })} />
                            </div>
                            <div className="row">
                                <div className="form-group">
                                    <label htmlFor="zip_code">Code Postal</label>
                                    <input id="zip_code" type="text" required onChange={(e) => setAddressData({ ...addressData, zip_code: e.target.value })} />
                                </div>
                                <div className="form-group checkbox">
                                    <label>
                                        <input type="checkbox" onChange={(e) => setAddressData({ ...addressData, is_default: e.target.checked })} />
                                        &nbsp;Par défaut
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="submit-btn">Enregistrer l'adresse</button>
                        </form>
                    )}

                    <div className="address-list">
                        {addresses.map(addr => (
                            <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
                                <div className="address-info">
                                    <strong>{addr.city}, {addr.neighborhood}</strong>
                                    <p>{addr.full_address}</p>
                                    <span>{addr.zip_code}</span>
                                    {addr.is_default && <span className="badge">Défaut</span>}
                                </div>
                                <button className="delete-icon" onClick={() => deleteAddress(addr.id)}>×</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {message && <div className="floating-alert alert-success">{message}</div>}

            <style>{`
                .profile-page {
                    max-width: 1200px !important;
                }
                .profile-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 2rem;
                    margin-top: 3rem;
                }
                .profile-section h2 {
                    color: var(--primary);
                    margin-bottom: 1.5rem;
                    font-size: 1.5rem;
                    text-align: left;
                }
                .profile-form, .password-form, .address-form {
                    margin: 0;
                    max-width: 100%;
                }
                .row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .disabled-input {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .add-btn {
                    padding: 0.5rem 1rem;
                    background: var(--glass);
                    border: 1px solid var(--primary);
                    color: var(--primary);
                    border-radius: 0.5rem;
                    cursor: pointer;
                }
                .address-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
                .address-card {
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    padding: 1rem;
                    border-radius: 0.75rem;
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                }
                .address-card.default {
                    border-color: var(--primary);
                }
                .badge {
                    background: var(--primary);
                    color: #000;
                    font-size: 0.7rem;
                    padding: 0.1rem 0.4rem;
                    border-radius: 4px;
                    margin-left: 0.5rem;
                    font-weight: 700;
                }
                .delete-icon {
                    background: none;
                    border: none;
                    color: #ef4444;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .checkbox label {
                    display: flex !important;
                    align-items: center;
                    gap: 0.5rem;
                    flex-direction: row !important;
                    cursor: pointer;
                }
                .floating-alert {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Profile;
