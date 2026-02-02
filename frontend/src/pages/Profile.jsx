import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    User,
    Shield,
    MapPin,
    Plus,
    Trash2,
    Check,
    ExternalLink,
    Calendar,
    Phone,
    Mail,
    Info,
    Settings,
    ChevronRight,
    Camera
} from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [profileData, setProfileData] = useState({
        name: '',
        first_name: '',
        last_name: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

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
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        setMessage({ text: '', type: '' });
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put('http://127.0.0.1:8000/api/profile', profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: 'VOTRE PROFIL A ÉTÉ MIS À JOUR.', type: 'success' });
            setUser(response.data.user);
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (err) {
            setMessage({ text: 'ÉCHEC DE LA MISE À JOUR.', type: 'error' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://127.0.0.1:8000/api/profile/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
                new_password_confirmation: passwordData.new_password_confirmation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: 'MOT DE PASSE MODIFIÉ AVEC SUCCÈS.', type: 'success' });
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'ÉCHEC DU CHANGEMENT.', type: 'error' });
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/addresses', addressData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses([...addresses, response.data.address]);
            setShowAddressForm(false);
            setAddressData({ city: '', neighborhood: '', full_address: '', zip_code: '', is_default: false });
            setMessage({ text: 'NOUVELLE ADRESSE ENREGISTRÉE.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (err) {
            console.error("Failed to add address", err);
        }
    };

    const deleteAddress = async (id) => {
        if (!window.confirm("Supprimer cette adresse de votre carnet ?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/addresses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(addresses.filter(a => a.id !== id));
            setMessage({ text: 'ADRESSE SUPPRIMÉE.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (err) {
            console.error("Failed to delete address", err);
        }
    };

    if (isLoading) return (
        <div className="loader-container-premium">
            <div className="premium-loader"></div>
            <p className="loader-text-luxury">ACCÈS À VOTRE SILLAGE PERSONNEL...</p>
        </div>
    );

    if (!user) return (
        <div className="container-premium profile-page-luxury animate-fade-in">
            <div className="error-message-luxury glass-premium">
                <Info size={48} className="gold-icon m-b-2" />
                <h2>SÉANCE EXPIREE</h2>
                <p>Votre jeton de présence a expiré. Veuillez vous identifier de nouveau.</p>
                <button className="btn-premium m-t-2" onClick={() => window.location.href = '/login'}>
                    RETOUR À LA CONNEXION
                </button>
            </div>
        </div>
    );

    return (
        <div className="container-premium profile-page-luxury animate-fade-in">
            <header className="profile-header-luxury">
                <div className="avatar-preview-luxury">
                    <div className="avatar-ring">
                        <div className="avatar-content">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                    <button className="btn-edit-avatar glass-premium">
                        <Camera size={16} />
                    </button>
                </div>
                <h5 className="gradient-text-gold font-serif">MON ESPACE</h5>
                <h1 className="font-serif">{user.first_name || 'Votre'} <span className="gradient-text-gold">{user.last_name || 'Profil'}</span></h1>
                <p className="aesthetic-hint">Gérez votre univers olfactif et vos informations confidentielles.</p>
            </header>

            <div className="profile-layout-luxury">
                {/* Left Column: Forms */}
                <div className="profile-column-main">
                    <section className="profile-card-luxury glass-premium">
                        <div className="card-header-luxury">
                            <User size={18} className="gold-icon" />
                            <h3 className="font-serif uppercase-tracking">Identité & Sillage</h3>
                        </div>

                        <div className="member-status-bar glass-premium">
                            <div className="status-item">
                                <Calendar size={14} />
                                <span>MEMBRE DEPUIS {new Date(user.created_at).getFullYear()}</span>
                            </div>
                            <div className="status-item">
                                <Mail size={14} />
                                <span>{user.email}</span>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="luxury-form">
                            <div className="input-group-luxury">
                                <label className="gold-label-luxury">NOM D'UTILISATEUR</label>
                                <input
                                    type="text"
                                    className="input-luxury"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                            </div>

                            <div className="input-row-luxury">
                                <div className="input-group-luxury">
                                    <label className="gold-label-luxury">PRÉNOM</label>
                                    <input
                                        type="text"
                                        className="input-luxury"
                                        value={profileData.first_name}
                                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                    />
                                </div>
                                <div className="input-group-luxury">
                                    <label className="gold-label-luxury">NOM</label>
                                    <input
                                        type="text"
                                        className="input-luxury"
                                        value={profileData.last_name}
                                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="input-group-luxury">
                                <label className="gold-label-luxury">TÉLÉPHONE PERSONNALISÉ</label>
                                <div className="input-with-icon-luxury">
                                    <Phone size={16} className="input-icon" />
                                    <input
                                        type="text"
                                        className="input-luxury"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        placeholder="+212 600..."
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-premium w-full">SAUVEGARDER LES CHANGEMENTS</button>
                        </form>
                    </section>

                    <section className="profile-card-luxury glass-premium">
                        <div className="card-header-luxury">
                            <Shield size={18} className="gold-icon" />
                            <h3 className="font-serif uppercase-tracking">Coffre-fort (Sécurité)</h3>
                        </div>
                        <form onSubmit={handlePasswordChange} className="luxury-form">
                            <div className="input-group-luxury">
                                <label className="gold-label-luxury">MOT DE PASSE ACTUEL</label>
                                <input
                                    type="password"
                                    className="input-luxury"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-row-luxury">
                                <div className="input-group-luxury">
                                    <label className="gold-label-luxury">NOUVELLE FRÉQUENCE</label>
                                    <input
                                        type="password"
                                        className="input-luxury"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group-luxury">
                                    <label className="gold-label-luxury">CONFIRMATION</label>
                                    <input
                                        type="password"
                                        className="input-luxury"
                                        value={passwordData.new_password_confirmation}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-premium btn-secondary-luxury w-full">REVÉRIFIER LE CODE SECRET</button>
                        </form>
                    </section>
                </div>

                {/* Right Column: Sidebar */}
                <div className="profile-column-side">
                    <section className="profile-card-luxury glass-premium">
                        <div className="card-header-luxury space-between">
                            <div className="flex-center gap-1">
                                <MapPin size={18} className="gold-icon" />
                                <h3 className="font-serif uppercase-tracking">Adresses</h3>
                            </div>
                            <button
                                className="btn-circle-luxury"
                                onClick={() => setShowAddressForm(!showAddressForm)}
                                title="Ajouter une adresse"
                            >
                                {showAddressForm ? <XCircle size={18} /> : <Plus size={18} />}
                            </button>
                        </div>

                        {showAddressForm && (
                            <form onSubmit={handleAddressSubmit} className="address-form-luxury animate-fade-in-down">
                                <div className="input-row-luxury">
                                    <div className="input-group-luxury">
                                        <label className="gold-label-luxury">VILLE</label>
                                        <input type="text" className="input-luxury small" required onChange={(e) => setAddressData({ ...addressData, city: e.target.value })} />
                                    </div>
                                    <div className="input-group-luxury">
                                        <label className="gold-label-luxury">ZIP</label>
                                        <input type="text" className="input-luxury small" required onChange={(e) => setAddressData({ ...addressData, zip_code: e.target.value })} />
                                    </div>
                                </div>
                                <div className="input-group-luxury">
                                    <label className="gold-label-luxury">QUARTIER</label>
                                    <input type="text" className="input-luxury small" required onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })} />
                                </div>
                                <div className="input-group-luxury">
                                    <label className="gold-label-luxury">RÉSIDENCE / APPARTEMENT</label>
                                    <textarea className="input-luxury small" rows="2" required onChange={(e) => setAddressData({ ...addressData, full_address: e.target.value })} />
                                </div>
                                <label className="luxury-checkbox">
                                    <input type="checkbox" onChange={(e) => setAddressData({ ...addressData, is_default: e.target.checked })} />
                                    <span className="checkmark"></span>
                                    <span>Définir comme résidence principale</span>
                                </label>
                                <button type="submit" className="btn-premium w-full m-t-1">AJOUTER</button>
                            </form>
                        )}

                        <div className="side-list-luxury">
                            {addresses.length === 0 ? (
                                <div className="empty-state-small">
                                    <p>Aucune adresse enregistrée.</p>
                                </div>
                            ) : (
                                addresses.map(addr => (
                                    <div key={addr.id} className={`address-item-luxury glass-premium ${addr.is_default ? 'active' : ''}`}>
                                        <div className="address-info">
                                            <div className="address-header">
                                                <strong>{addr.city.toUpperCase()}</strong>
                                                {addr.is_default && <span className="luxury-badge-pill">DÉFAUT</span>}
                                            </div>
                                            <p className="address-text">{addr.full_address}</p>
                                            <span className="address-sub">{addr.neighborhood}, {addr.zip_code}</span>
                                        </div>
                                        <button className="btn-delete-luxury" onClick={() => deleteAddress(addr.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <div className="explore-card-luxury glass-premium">
                        <div className="card-header-luxury">
                            <Settings size={18} className="gold-icon" />
                            <h3 className="font-serif uppercase-tracking">Mes Acquisitions</h3>
                        </div>
                        <p className="aesthetic-hint small">Retrouvez l'historique complet de vos commandes et leur sillage.</p>
                        <Link to="/orders" className="btn-link-luxury">
                            VOIR MES COMMANDES <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`notification-premium feedback-pill animate-slide-up ${message.type}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{message.text}</span>
                </div>
            )}

            <style>{`
                .profile-page-luxury { padding-top: 4rem; padding-bottom: 8rem; }
                .profile-header-luxury { text-align: center; margin-bottom: 6rem; position: relative; }
                
                .avatar-preview-luxury {
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 3rem auto;
                    position: relative;
                }

                .avatar-ring {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    padding: 4px;
                    background: var(--grad-gold);
                    box-shadow: 0 0 30px var(--primary-glow);
                }

                .avatar-content {
                    width: 100%;
                    height: 100%;
                    background: var(--bg-deep);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-family: 'Cormorant Garamond', serif;
                    color: var(--primary);
                }

                .btn-edit-avatar {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    cursor: pointer;
                    border: 1px solid var(--glass-border);
                }

                .profile-header-luxury h5 { letter-spacing: 5px; margin-bottom: 1.5rem; font-size: 0.9rem; }
                .profile-header-luxury h1 { font-size: 3.5rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px; }

                .profile-layout-luxury {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 3rem;
                    align-items: start;
                }

                .profile-column-main, .profile-column-side { display: flex; flex-direction: column; gap: 3rem; }

                .profile-card-luxury { padding: 3rem; border-radius: 24px; transition: 0.4s ease; }
                .profile-card-luxury:hover { transform: translateY(-5px); border-color: var(--gold-border); }
                
                .card-header-luxury { display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem; }
                .card-header-luxury.space-between { justify-content: space-between; }
                .uppercase-tracking { text-transform: uppercase; letter-spacing: 2px; font-size: 1.1rem; }

                .member-status-bar {
                    display: flex;
                    gap: 1.5rem;
                    padding: 1rem 2rem;
                    border-radius: 50px;
                    margin-bottom: 3rem;
                }

                .status-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; opacity: 0.6; }

                .luxury-form { display: flex; flex-direction: column; gap: 2rem; }
                .input-group-luxury { display: flex; flex-direction: column; gap: 0.8rem; }
                .gold-label-luxury { font-size: 0.65rem; color: var(--primary); letter-spacing: 2px; font-weight: 800; display: block; }

                .input-luxury {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 1.2rem;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.95rem;
                    transition: 0.3s;
                }
                .input-luxury:focus { outline: none; border-color: var(--primary); background: rgba(255,255,255,0.05); box-shadow: 0 0 20px var(--glass-glow); }
                .input-luxury.small { padding: 0.9rem; font-size: 0.85rem; border-radius: 10px; }

                .input-row-luxury { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

                .input-with-icon-luxury { position: relative; }
                .input-icon { position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%); opacity: 0.4; color: var(--primary); }
                .input-with-icon-luxury input { padding-left: 3.5rem; }

                .btn-secondary-luxury {
                    background: transparent;
                    border: 1px solid var(--primary);
                    color: var(--primary);
                }
                .btn-secondary-luxury:hover { background: rgba(212, 175, 55, 0.05); color: #fff; border-color: #fff; }

                .btn-circle-luxury {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--glass-hover);
                    border: 1px solid var(--glass-border);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .btn-circle-luxury:hover { border-color: var(--primary); transform: rotate(90deg); }

                .address-form-luxury { 
                    margin-bottom: 3rem; 
                    padding-bottom: 3rem; 
                    border-bottom: 1px solid var(--glass-border); 
                    display: flex; flex-direction: column; gap: 1.5rem;
                }

                .luxury-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    position: relative;
                    margin: 0.5rem 0;
                    opacity: 0.8;
                }

                .luxury-checkbox input { display: none; }
                .checkmark {
                    width: 18px;
                    height: 18px;
                    border: 2px solid var(--primary);
                    border-radius: 4px;
                    position: relative;
                    transition: 0.3s;
                }
                .luxury-checkbox input:checked + .checkmark { background: var(--primary); }
                .luxury-checkbox input:checked + .checkmark:after {
                    content: '';
                    position: absolute;
                    left: 5px; top: 2px;
                    width: 4px; height: 8px;
                    border: solid #000;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                .side-list-luxury { display: flex; flex-direction: column; gap: 1rem; }
                .address-item-luxury {
                    padding: 1.5rem;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: 0.3s;
                    border: 1px solid transparent;
                }
                .address-item-luxury.active { border-color: var(--primary); background: rgba(212, 175, 55, 0.03); }
                .address-info { flex: 1; }
                .address-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.4rem; }
                .address-header strong { font-size: 0.75rem; letter-spacing: 1px; }
                .luxury-badge-pill { font-size: 0.55rem; background: var(--primary); color: #000; padding: 0.1rem 0.6rem; border-radius: 5px; font-weight: 900; }
                .address-text { font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.2rem; }
                .address-sub { font-size: 0.7rem; opacity: 0.4; }

                .btn-delete-luxury { 
                    background: none; border: none; color: #ef4444; 
                    opacity: 0.3; cursor: pointer; transition: 0.3s; 
                    padding: 0.5rem;
                }
                .btn-delete-luxury:hover { opacity: 1; transform: scale(1.1); }

                .explore-card-luxury { padding: 2.5rem; border-radius: 20px; }
                .btn-link-luxury {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--primary);
                    text-decoration: none;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    margin-top: 1.5rem;
                    transition: 0.3s;
                }
                .btn-link-luxury:hover { opacity: 0.8; transform: translateX(5px); }

                .notification-premium {
                    position: fixed;
                    bottom: 3rem;
                    right: 3rem;
                    padding: 1.25rem 2.5rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 1.2rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    background: #000;
                    border: 1px solid var(--glass-border);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                    z-index: 9999;
                }
                .notification-premium.success { color: #22c55e; border-color: #22c55e; }
                .notification-premium.error { color: #ef4444; border-color: #ef4444; }

                .flex-center { display: flex; align-items: center; }
                .gap-1 { gap: 1rem; }
                .m-t-1 { margin-top: 1rem; }
                .m-b-2 { margin-bottom: 2rem; }

                @media (max-width: 1024px) {
                    .profile-layout-luxury { grid-template-columns: 1fr; }
                    .profile-column-side { order: -1; }
                }

                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-down { animation: fadeInDown 0.4s ease forwards; }
            `}</style>
        </div>
    );
};

export default Profile;
