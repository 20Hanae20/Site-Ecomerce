import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Mail, Phone, Clock, Send, Sparkles, MessageSquare } from 'lucide-react';

const Contact = () => {
    const [settings, setSettings] = useState({
        contact_email: 'contact@siteparfum.fr',
        site_name: 'Site Parfum'
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await api.get('/settings/public');
                const publicSettings = response.data;
                setSettings(prev => ({
                    ...prev,
                    ...publicSettings
                }));
            } catch (err) {
                console.error("Failed to fetch contact settings", err);
            }
        };

        loadSettings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setStatus({ type: 'success', message: 'Votre message a été transmis à nos sommeliers. Nous vous recontacterons sous peu.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
            setTimeout(() => setStatus({ type: '', message: '' }), 5000);
        }, 1500);
    };

    return (
        <div className="container-premium contact-page-luxury animate-fade-in">
            <header className="contact-header-luxury">
                <h5 className="gradient-text-gold font-serif">CONCIERGERIE</h5>
                <h1 className="font-serif">À Votre <span className="gradient-text-gold">Écoute</span></h1>
                <p className="aesthetic-hint">Une question ? Un sillage particulier à rechercher ? Notre Maison déploie son expertise pour vous répondre.</p>
            </header>

            <div className="contact-layout-luxury">
                <aside className="contact-info-column">
                    <div className="info-cards-luxury">
                        <div className="info-card-luxury glass-premium">
                            <div className="card-icon-luxury"><MapPin size={24} /></div>
                            <div className="card-text-luxury">
                                <h4 className="font-serif">MAISON MÈRE</h4>
                                <p>123 Avenue AbouBaker AL SIDIK<br />75001 CASABLANCA, MAROC</p>
                            </div>
                        </div>

                        <div className="info-card-luxury glass-premium">
                            <div className="card-icon-luxury"><Mail size={24} /></div>
                            <div className="card-text-luxury">
                                <h4 className="font-serif">CORRESPONDANCE</h4>
                                <p>{settings.contact_email}</p>
                            </div>
                        </div>

                        <div className="info-card-luxury glass-premium">
                            <div className="card-icon-luxury"><Phone size={24} /></div>
                            <div className="card-text-luxury">
                                <h4 className="font-serif">LIGNE DIRECTE</h4>
                                <p>+212 6 23 45 67 89</p>
                            </div>
                        </div>

                        <div className="info-card-luxury glass-premium">
                            <div className="card-icon-luxury"><Clock size={24} /></div>
                            <div className="card-text-luxury">
                                <h4 className="font-serif">SALON D'ACCUEIL</h4>
                                <p>Lundi - Samedi : 10h00 - 19h00</p>
                            </div>
                        </div>
                    </div>

                    <div className="atmosphere-hint-luxury glass-premium">
                        <Sparkles size={20} className="gold-icon" />
                        <p className="font-serif italic">"Le parfum est la forme la plus intense du souvenir."</p>
                    </div>
                </aside>

                <main className="contact-form-column">
                    <div className="form-container-luxury glass-premium">
                        <div className="form-header-luxury">
                            <MessageSquare size={24} className="gold-icon" />
                            <h3 className="font-serif">Formulez votre Demande</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form-premium">
                            {status.message && (
                                <div className={`premium-alert ${status.type} m-b-2`}>
                                    {status.message}
                                </div>
                            )}

                            <div className="input-row-premium">
                                <div className="input-group-premium">
                                    <label>NOM COMPLET</label>
                                    <input name="name" value={formData.name} onChange={handleChange} required placeholder="Jean Dupont" />
                                </div>
                                <div className="input-group-premium">
                                    <label>COURRIEL</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jean@email.com" />
                                </div>
                            </div>

                            <div className="input-group-premium">
                                <label>OBJET DE LA DEMANDE</label>
                                <input name="subject" value={formData.subject} onChange={handleChange} required placeholder="Demande d'information olfactive" />
                            </div>

                            <div className="input-group-premium">
                                <label>VOTRE MESSAGE</label>
                                <textarea name="message" value={formData.message} onChange={handleChange} required rows="6" placeholder="Comment pouvons-nous vous accompagner ?" />
                            </div>

                            <button type="submit" className="btn-premium w-full m-t-1" disabled={isSubmitting}>
                                {isSubmitting ? 'TRANSMISSION EN COURS...' : 'ENVOYER MA DEMANDE'} <Send size={18} />
                            </button>
                        </form>
                    </div>
                </main>
            </div>

            <style>{`
                .contact-page-luxury { padding-top: 6rem; padding-bottom: 8rem; }
                .contact-header-luxury { text-align: center; margin-bottom: 6rem; }
                .contact-header-luxury h5 { letter-spacing: 5px; margin-bottom: 1.5rem; }
                .contact-header-luxury h1 { font-size: 4rem; margin-top: 1rem; }
                .aesthetic-hint { opacity: 0.5; font-size: 1.1rem; max-width: 700px; margin: 2rem auto 0; line-height: 1.6; }

                .contact-layout-luxury {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 6rem;
                    align-items: start;
                }

                .info-cards-luxury { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
                .info-card-luxury { display: flex; gap: 2rem; padding: 2rem; border-radius: 20px; align-items: center; }
                .card-icon-luxury { color: var(--primary); opacity: 0.8; }
                .card-text-luxury h4 { font-size: 0.8rem; letter-spacing: 3px; color: var(--primary); margin-bottom: 0.5rem; }
                .card-text-luxury p { font-size: 1rem; opacity: 0.8; line-height: 1.4; }

                .atmosphere-hint-luxury { padding: 3rem; border-radius: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
                .atmosphere-hint-luxury p { font-size: 1.25rem; opacity: 0.4; letter-spacing: 1px; }

                .form-container-luxury { padding: 4rem; border-radius: 32px; background: rgba(5, 7, 10, 0.6); border: 1px solid var(--glass-border); }
                .form-header-luxury { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 3rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 2rem; }
                .form-header-luxury h3 { font-size: 1.75rem; letter-spacing: 2px; }

                .input-row-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
                .input-group-premium { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
                
                .input-group-premium label { 
                    font-size: 0.75rem; 
                    letter-spacing: 2px; 
                    color: var(--primary); 
                    font-weight: 700; 
                    text-transform: uppercase;
                    margin-left: 0.5rem;
                }

                .input-group-premium input,
                .input-group-premium textarea {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid transparent;
                    border-bottom: 1px solid var(--glass-border);
                    padding: 1rem 1.5rem;
                    color: #fff;
                    font-size: 1rem;
                    font-family: 'Inter', sans-serif;
                    border-radius: 8px 8px 0 0;
                    transition: all 0.3s ease;
                }

                .input-group-premium input:focus,
                .input-group-premium textarea:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.05);
                    border-bottom-color: var(--primary);
                    padding-left: 2rem;
                }

                .input-group-premium input::placeholder,
                .input-group-premium textarea::placeholder {
                    opacity: 0.3;
                    font-style: italic;
                    letter-spacing: 1px;
                }

                .m-b-2 { margin-bottom: 2rem; }
                .m-t-1 { margin-top: 1rem; }
                .w-full { width: 100%; }

                @media (max-width: 1024px) {
                    .contact-layout-luxury { grid-template-columns: 1fr; gap: 4rem; }
                    .contact-info-column { order: 2; }
                    .form-container-luxury { padding: 2rem; }
                    .input-row-premium { grid-template-columns: 1fr; gap: 0; }
                }
            `}</style>
        </div>
    );
};

export default Contact;