import React from 'react';
import { HelpCircle, ChevronRight, Sparkles } from 'lucide-react';

const FAQ = () => {
    const questions = [
        { q: "Quels sont les délais de livraison ?", a: "Nous expédions vos essences précieuses sous 48 heures. La livraison par nos partenaires logistiques de prestige prend généralement 3 à 5 jours ouvrés." },
        { q: "L'authenticité des flacons est-elle garantie ?", a: "Absolument. Chaque sillage provient directement des maisons de parfumerie. Nous garantissons l'origine et l'intégrité de chaque goutte." },
        { q: "Puis-je effectuer un retour ?", a: "Par mesure d'excellence et d'hygiène, seuls les coffrets scellés peuvent être retournés sous 14 jours dans leur écrin d'origine." },
        { q: "Proposez-vous des échantillons ?", a: "Chaque commande est accompagnée de miniatures sélectionnées selon votre profil olfactif pour de nouvelles découvertes." }
    ];

    return (
        <div className="container-premium faq-page-luxury animate-fade-in">
            <header className="faq-header-luxury">
                <h5 className="gradient-text-gold font-serif">ASSISTANCE</h5>
                <h1 className="font-serif">Questions <span className="gradient-text-gold">Fréquentes</span></h1>
                <p className="aesthetic-hint">Toutes les réponses pour parfaire votre voyage au sein de notre Maison.</p>
            </header>

            <div className="faq-list-luxury">
                {questions.map((item, i) => (
                    <div key={i} className="faq-item-luxury glass-premium animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="faq-q-luxury">
                            <HelpCircle size={20} className="gold-icon" />
                            <h3 className="font-serif">{item.q}</h3>
                        </div>
                        <div className="faq-a-luxury">
                            <p>{item.a}</p>
                        </div>
                        <ChevronRight size={16} className="faq-arrow-luxury" />
                    </div>
                ))}
            </div>

            <div className="faq-cta-luxury glass-premium">
                <Sparkles size={24} className="gold-icon" />
                <p className="font-serif">Vous ne trouvez pas votre sillage ?</p>
                <a href="/contact" className="btn-premium">CONTACTER NOTRE CONCIERGERIE</a>
            </div>

            <style>{`
                .faq-page-luxury { padding-top: 6rem; padding-bottom: 8rem; max-width: 900px !important; }
                .faq-header-luxury { text-align: center; margin-bottom: 6rem; }
                .faq-header-luxury h5 { letter-spacing: 5px; margin-bottom: 1.5rem; }
                .faq-header-luxury h1 { font-size: 3.5rem; margin-top: 1rem; }
                .aesthetic-hint { opacity: 0.5; font-size: 1.1rem; max-width: 600px; margin: 1.5rem auto 0; }

                .faq-list-luxury { display: flex; flex-direction: column; gap: 2rem; margin-bottom: 6rem; }
                .faq-item-luxury { padding: 3rem; border-radius: 24px; position: relative; transition: 0.4s; }
                .faq-item-luxury:hover { transform: translateX(15px); background: var(--glass-hover); border-color: var(--primary); }
                
                .faq-q-luxury { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
                .faq-q-luxury h3 { font-size: 1.25rem; letter-spacing: 1px; color: #fff; }
                
                .faq-a-luxury p { font-size: 1rem; opacity: 0.5; line-height: 1.8; max-width: 90%; text-align: left; }
                
                .faq-arrow-luxury { position: absolute; right: 3rem; top: 50%; transform: translateY(-50%); opacity: 0.2; }

                .faq-cta-luxury { padding: 4rem; border-radius: 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2rem; }
                .faq-cta-luxury p { font-size: 1.25rem; letter-spacing: 1px; }

                @media (max-width: 640px) {
                    .faq-item-luxury { padding: 2rem; }
                    .faq-header-luxury h1 { font-size: 2.5rem; }
                }
            `}</style>
        </div>
    );
};

export default FAQ;
