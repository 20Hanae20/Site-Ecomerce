import { Droplets, Wind, Heart, Gem, ShieldCheck, Award, Users, Globe } from 'lucide-react';

const About = () => {
    return (
        <div className="container about-page py-5">
            <header className="about-header">
                <span className="badge badge-primary">À propos</span>
                <h1>Notre mission est de rendre<br />le parfum accessible à tous</h1>
                <p className="about-subtitle">
                    Depuis notre création, nous sélectionnons avec rigueur des essences exceptionnelles
                    pour offrir à nos clients une expérience sensorielle unique et authentique.
                </p>
            </header>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-item">
                    <span className="stat-value">500+</span>
                    <span className="stat-label">Références</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">10K+</span>
                    <span className="stat-label">Clients satisfaits</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">50+</span>
                    <span className="stat-label">Marques partenaires</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">4.8</span>
                    <span className="stat-label">Note moyenne</span>
                </div>
            </div>

            {/* Philosophy */}
            <section className="saas-card philosophy-section">
                <div className="philosophy-content">
                    <h2>Notre philosophie</h2>
                    <p>
                        Plus qu'une simple boutique, notre plateforme est un espace dédié à la haute parfumerie.
                        Nous croyons que chaque parfum est une signature, une émotion capable de transcender
                        le temps et l'espace.
                    </p>
                    <p>
                        Nous sélectionnons avec une rigueur absolue des essences rares et des compositions
                        audacieuses pour offrir à nos clients une expérience sensorielle sans pareille.
                    </p>
                </div>
                <div className="philosophy-visual">
                    <div className="visual-icon-box">
                        <Gem size={48} style={{ color: 'var(--primary)' }} />
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="values-section">
                <h2 className="section-title">Nos valeurs fondamentales</h2>
                <div className="values-grid">
                    <div className="saas-card value-card">
                        <div className="value-icon"><Droplets size={24} /></div>
                        <h3>Essences rares</h3>
                        <p>Nous parcourons le monde pour dénicher les matières premières les plus précieuses, du jasmin de Grasse au oud le plus mystérieux.</p>
                    </div>
                    <div className="saas-card value-card">
                        <div className="value-icon"><Wind size={24} /></div>
                        <h3>Signature unique</h3>
                        <p>Chaque sillage est pensé comme une œuvre d'art, une composition équilibrée entre tradition et avant-garde.</p>
                    </div>
                    <div className="saas-card value-card">
                        <div className="value-icon"><Heart size={24} /></div>
                        <h3>Passion artisanale</h3>
                        <p>L'expertise de nos conseillers garantit une sélection authentique et passionnée pour sublimer votre identité.</p>
                    </div>
                </div>
            </section>

            {/* Commitments */}
            <section className="saas-card commitments-section">
                <h2>Nos engagements qualité</h2>
                <div className="commitments-grid">
                    <div className="commitment-item">
                        <ShieldCheck size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                        <div>
                            <strong>Authenticité garantie</strong>
                            <span>Chaque flacon est certifié et vérifié</span>
                        </div>
                    </div>
                    <div className="commitment-item">
                        <Award size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <div>
                            <strong>Expédition sécurisée</strong>
                            <span>Emballage protecteur et suivi en temps réel</span>
                        </div>
                    </div>
                    <div className="commitment-item">
                        <Users size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                        <div>
                            <strong>Conseil personnalisé</strong>
                            <span>Notre équipe d'experts à votre service</span>
                        </div>
                    </div>
                    <div className="commitment-item">
                        <Globe size={20} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                        <div>
                            <strong>Livraison internationale</strong>
                            <span>Expéditions dans toute l'Europe</span>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .about-page { padding-bottom: 6rem; }

                .about-header {
                    text-align: center;
                    margin-bottom: 4rem;
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .about-header h1 {
                    font-size: 2.25rem;
                    line-height: 1.3;
                    margin-top: 1rem;
                    margin-bottom: 1rem;
                }
                .about-subtitle {
                    color: var(--text-muted);
                    font-size: 1.05rem;
                    line-height: 1.7;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 4rem;
                }
                .stat-item {
                    text-align: center;
                    padding: 1.5rem;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    background: var(--bg-surface);
                }
                .stat-value {
                    display: block;
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--primary);
                    margin-bottom: 0.25rem;
                }
                .stat-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .philosophy-section {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 3rem;
                    padding: 3rem;
                    align-items: center;
                    margin-bottom: 4rem;
                }
                .philosophy-content h2 {
                    font-size: 1.75rem;
                    margin-bottom: 1.25rem;
                }
                .philosophy-content p {
                    color: var(--text-muted);
                    line-height: 1.7;
                    margin-bottom: 1rem;
                    font-size: 0.95rem;
                }
                .philosophy-visual {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .visual-icon-box {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    background: var(--primary-light);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .section-title {
                    font-size: 1.5rem;
                    margin-bottom: 2rem;
                }

                .values-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 4rem;
                }
                .value-card {
                    padding: 2rem;
                    text-align: center;
                }
                .value-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--primary-light);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.25rem;
                }
                .value-card h3 {
                    font-size: 1.1rem;
                    margin-bottom: 0.75rem;
                }
                .value-card p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    line-height: 1.6;
                }

                .commitments-section {
                    padding: 2.5rem;
                }
                .commitments-section h2 {
                    font-size: 1.5rem;
                    margin-bottom: 2rem;
                    text-align: center;
                }
                .commitments-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }
                .commitment-item {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    padding: 1rem;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                }
                .commitment-item strong {
                    display: block;
                    font-size: 0.9rem;
                    margin-bottom: 0.125rem;
                }
                .commitment-item span {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                @media (max-width: 1024px) {
                    .philosophy-section { grid-template-columns: 1fr; text-align: center; }
                    .values-grid { grid-template-columns: 1fr; }
                    .stats-row { grid-template-columns: repeat(2, 1fr); }
                    .commitments-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default About;
