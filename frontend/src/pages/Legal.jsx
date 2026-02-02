import React from 'react';
import { Shield, Gavel, Scale, Lock } from 'lucide-react';

const Legal = () => {
    return (
        <div className="container-premium legal-page-luxury animate-fade-in">
            <header className="legal-header-luxury">
                <h5 className="gradient-text-gold font-serif">TRANSPARENCE</h5>
                <h1 className="font-serif">Mentions <span className="gradient-text-gold">Légales</span></h1>
                <p className="aesthetic-hint">La confiance est le fondement de toute relation d'exception.</p>
            </header>

            <div className="legal-content-luxury glass-premium">
                <section className="legal-section-luxury">
                    <div className="section-title-luxury">
                        <Gavel size={20} className="gold-icon" />
                        <h2 className="font-serif">1. Éditeur du Site</h2>
                    </div>
                    <p>Ce site est un projet académique de prestige (PFE) réalisé par Hanae, dans le cadre d'un cursus de développement web avancé pour la Maison SITE PARFUM.</p>
                </section>

                <section className="legal-section-luxury">
                    <div className="section-title-luxury">
                        <Shield size={20} className="gold-icon" />
                        <h2 className="font-serif">2. Hébergement & Sécurité</h2>
                    </div>
                    <p>Le site est actuellement déployé en environnement local sécurisé à des fins de démonstration technique et de présentation de portfolio.</p>
                </section>

                <section className="legal-section-luxury">
                    <div className="section-title-luxury">
                        <Scale size={20} className="gold-icon" />
                        <h2 className="font-serif">3. Propriété Olfactive & Intellectuelle</h2>
                    </div>
                    <p>L'ensemble des visuels, descriptions et concepts présentés sur ce site sont utilisés à titre illustratif pour démontrer les capacités Full-Stack de l'application.</p>
                </section>

                <section className="legal-section-luxury">
                    <div className="section-title-luxury">
                        <Lock size={20} className="gold-icon" />
                        <h2 className="font-serif">4. Protection des Secrets</h2>
                    </div>
                    <p>Nous protégeons vos données comme nous protégeons les formules de nos plus grands parfums. Vos informations ne sont jamais partagées à des tiers.</p>
                </section>
            </div>

            <div className="legal-footer-luxury">
                <p className="font-serif">MAISON SITE PARFUM &copy; 2026 — L'EXCELLENCE COMME SEULE RÈGLE.</p>
            </div>

            <style>{`
                .legal-page-luxury { padding-top: 6rem; padding-bottom: 8rem; max-width: 800px !important; }
                .legal-header-luxury { text-align: center; margin-bottom: 6rem; }
                .legal-header-luxury h5 { letter-spacing: 5px; margin-bottom: 1.5rem; }
                .legal-header-luxury h1 { font-size: 3.5rem; margin-top: 1rem; }
                .aesthetic-hint { opacity: 0.5; font-size: 1.1rem; max-width: 600px; margin: 1.5rem auto 0; }

                .legal-content-luxury { padding: 5rem; border-radius: 40px; }
                .legal-section-luxury { margin-bottom: 4rem; text-align: left; }
                .legal-section-luxury:last-child { margin-bottom: 0; }
                
                .section-title-luxury { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; }
                .section-title-luxury h2 { font-size: 1.5rem; letter-spacing: 1px; color: var(--primary); }
                
                .legal-section-luxury p { font-size: 1.05rem; opacity: 0.6; line-height: 1.8; }

                .legal-footer-luxury { margin-top: 6rem; text-align: center; opacity: 0.2; letter-spacing: 3px; font-size: 0.7rem; }

                @media (max-width: 640px) {
                    .legal-content-luxury { padding: 2rem; }
                    .legal-header-luxury h1 { font-size: 2.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Legal;
