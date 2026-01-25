import React from 'react';

const Legal = () => {
    return (
        <div className="page-container legal-page">
            <h1>Mentions Légales</h1>
            <div className="luxury-divider"></div>
            <div className="legal-content glass">
                <section>
                    <h2>1. Éditeur du site</h2>
                    <p>Ce site est un projet académique (PFE) réalisé dans le cadre d'un cursus de développement web.</p>
                </section>
                <section>
                    <h2>2. Hébergement</h2>
                    <p>Le site est hébergé localement à des fins de démonstration.</p>
                </section>
                <section>
                    <h2>3. Propriété intellectuelle</h2>
                    <p>Les contenus et visuels utilisés le sont à titre illustratif dans le cadre d'un projet d'études.</p>
                </section>
            </div>
            <style>{`
                .legal-page { max-width: 800px; margin: 0 auto; padding-top: 6rem; padding-bottom: 8rem; }
                .legal-content { padding: 4rem; border-radius: 2rem; margin-top: 4rem; text-align: left; }
                .legal-content h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; color: var(--primary); }
                .legal-content p { font-size: 1rem; text-align: left; margin-bottom: 1rem; }
            `}</style>
        </div>
    );
};

export default Legal;
