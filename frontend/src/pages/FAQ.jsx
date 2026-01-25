import React from 'react';

const FAQ = () => {
    const questions = [
        { q: "Quels sont les délais de livraison ?", a: "Nous expédions vos essences sous 48h. La livraison prend généralement 3 à 5 jours ouvrés." },
        { q: "Les produits sont-ils authentiques ?", a: "Chaque parfum est certifié et provient directement des maisons de parfumerie sélectionnées." },
        { q: "Puis-je retourner mon parfum ?", a: "Par mesure d'hygiène, seuls les produits non ouverts et scellés peuvent être retournés sous 14 jours." }
    ];

    return (
        <div className="page-container faq-page">
            <h1>Foire aux Questions</h1>
            <div className="luxury-divider"></div>
            <div className="faq-list">
                {questions.map((item, i) => (
                    <div key={i} className="faq-item glass">
                        <h3>{item.q}</h3>
                        <p>{item.a}</p>
                    </div>
                ))}
            </div>
            <style>{`
                .faq-page { max-width: 900px; margin: 0 auto; padding-top: 6rem; padding-bottom: 8rem; }
                .faq-list { display: flex; flex-direction: column; gap: 2rem; margin-top: 4rem; }
                .faq-item { padding: 2.5rem; border-radius: 1.5rem; text-align: left; transition: all 0.3s; }
                .faq-item:hover { border-color: var(--primary); transform: translateX(10px); }
                .faq-item h3 { font-size: 1.3rem; margin-bottom: 1rem; color: var(--primary); font-weight: 500; }
                .faq-item p { font-size: 1rem; color: var(--text-muted); text-align: left; }
            `}</style>
        </div>
    );
};

export default FAQ;
