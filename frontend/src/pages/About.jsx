import React from 'react';
import { Sparkles, Wind, Droplets, Heart, Gem, ShieldCheck } from 'lucide-react';

const About = () => {
    return (
        <div className="container-premium about-page-luxury animate-fade-in">
            <header className="about-header-luxury">
                <h5 className="gradient-text-gold font-serif">L'HÉRITAGE</h5>
                <h1 className="font-serif">L'Art du <span className="gradient-text-gold">Sillage</span> Immortel</h1>
                <p className="aesthetic-hint">Découvrez la philosophie d'une Maison dédiée à l'excellence olfactive et à la capture de l'invisible.</p>
            </header>

            <section className="about-story-luxury">
                <div className="story-content-luxury glass-premium">
                    <div className="story-text">
                        <h2 className="font-serif">Notre Philosophie</h2>
                        <p>Plus qu'une simple boutique, notre Maison est un sanctuaire dédié à la haute parfumerie. Nous croyons que chaque parfum est une signature, une émotion liquide capable de transcender le temps et l'espace.</p>
                        <p>Depuis notre création, nous sélectionnons avec une rigueur absolue des essences rares et des compositions audacieuses pour offrir à nos clients une expérience sensorielle sans pareille.</p>
                    </div>
                    <div className="story-visual">
                        <div className="visual-circle gold-glow">
                            <Sparkles size={80} className="gold-icon" strokeWidth={1} />
                        </div>
                    </div>
                </div>
            </section>

            <div className="about-values-grid">
                <div className="value-card-luxury glass-premium">
                    <Droplets size={32} className="gold-icon" />
                    <h3 className="font-serif">Essences Rares</h3>
                    <p>Nous parcourons le monde pour dénicher les matières premières les plus précieuses, du jasmin de Grasse au oud le plus mystérieux.</p>
                </div>

                <div className="value-card-luxury glass-premium">
                    <Wind size={32} className="gold-icon" />
                    <h3 className="font-serif">Signature Unique</h3>
                    <p>Chaque sillage est pensé comme une œuvre d'art, une composition équilibrée entre tradition et avant-garde.</p>
                </div>

                <div className="value-card-luxury glass-premium">
                    <Heart size={32} className="gold-icon" />
                    <h3 className="font-serif">Passion Artisanale</h3>
                    <p>L'expertise de nos sommeliers du parfum garantit une sélection authentique et passionnée pour sublimer votre identité.</p>
                </div>
            </div>

            <section className="about-commitment-luxury glass-premium">
                <div className="commitment-header">
                    <Gem size={24} className="gold-icon" />
                    <h2 className="font-serif">L'Engagement Sillage-Secure</h2>
                </div>
                <div className="commitment-grid">
                    <div className="commitment-item">
                        <ShieldCheck size={20} className="gold-icon" />
                        <p>Authenticité garantie de chaque flacon</p>
                    </div>
                    <div className="commitment-item">
                        <ShieldCheck size={20} className="gold-icon" />
                        <p>Expédition sécurisée dans des écrins protecteurs</p>
                    </div>
                    <div className="commitment-item">
                        <ShieldCheck size={20} className="gold-icon" />
                        <p>Conseil personnalisé par nos experts</p>
                    </div>
                </div>
            </section>

            <style>{`
                .about-page-luxury { padding-top: 6rem; padding-bottom: 8rem; }
                .about-header-luxury { text-align: center; margin-bottom: 8rem; }
                .about-header-luxury h5 { letter-spacing: 5px; margin-bottom: 1.5rem; }
                .about-header-luxury h1 { font-size: 4.5rem; margin-top: 1rem; }
                .aesthetic-hint { opacity: 0.5; font-size: 1.25rem; max-width: 800px; margin: 2rem auto 0; line-height: 1.6; font-style: italic; }

                .about-story-luxury { margin-bottom: 6rem; }
                .story-content-luxury { 
                    display: grid; 
                    grid-template-columns: 1.2fr 0.8fr; 
                    gap: 4rem; 
                    padding: 5rem; 
                    border-radius: 40px; 
                    align-items: center;
                }
                .story-text h2 { font-size: 2.5rem; margin-bottom: 2rem; color: var(--primary); }
                .story-text p { font-size: 1.1rem; opacity: 0.7; line-height: 1.8; margin-bottom: 1.5rem; }

                .story-visual { display: flex; justify-content: center; align-items: center; }
                .visual-circle { 
                    width: 250px; height: 250px; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    border: 1px solid var(--glass-border);
                    position: relative;
                }
                .gold-glow { box-shadow: 0 0 50px rgba(212, 175, 55, 0.1); }

                .about-values-grid { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 3rem; 
                    margin-bottom: 6rem; 
                }
                .value-card-luxury { padding: 4rem 3rem; border-radius: 30px; text-align: center; transition: 0.4s; }
                .value-card-luxury:hover { transform: translateY(-10px); background: var(--glass-hover); }
                .value-card-luxury h3 { font-size: 1.5rem; margin: 2rem 0 1.5rem; color: var(--primary); letter-spacing: 1px; }
                .value-card-luxury p { font-size: 0.95rem; opacity: 0.6; line-height: 1.6; }

                .about-commitment-luxury { padding: 5rem; border-radius: 40px; text-align: center; }
                .commitment-header { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 4rem; }
                .commitment-header h2 { font-size: 2rem; letter-spacing: 2px; }
                
                .commitment-grid { display: flex; justify-content: center; gap: 4rem; flex-wrap: wrap; }
                .commitment-item { display: flex; align-items: center; gap: 1rem; font-size: 0.9rem; opacity: 0.7; letter-spacing: 1px; }

                @media (max-width: 1024px) {
                    .story-content-luxury { grid-template-columns: 1fr; padding: 3rem; text-align: center; }
                    .about-values-grid { grid-template-columns: 1fr; }
                    .commitment-grid { flex-direction: column; gap: 2rem; align-items: center; }
                }
            `}</style>
        </div>
    );
};

export default About;
