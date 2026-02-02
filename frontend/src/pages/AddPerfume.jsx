import React, { useState } from 'react';
import api from '../services/api';
import { Plus, Image as ImageIcon, Link as LinkIcon, Trash2, Sparkles, Upload } from 'lucide-react';

const AddPerfume = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        notes: '',
        price: '',
        image_url: '',
        gallery_urls: '',
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [imageType, setImageType] = useState('file');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setImageType('file');
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setGalleryImages([...galleryImages, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setGalleryPreviews([...galleryPreviews, ...newPreviews]);
    };

    const removeGalleryImage = (index) => {
        const newImages = [...galleryImages];
        newImages.splice(index, 1);
        setGalleryImages(newImages);
        const newPreviews = [...galleryPreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setGalleryPreviews(newPreviews);
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData({ ...formData, image_url: url });
        setPreview(url);
        setImageType('url');
        setImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        setErrors({});

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('notes', formData.notes);
        data.append('price', formData.price);

        if (imageType === 'file' && image) {
            data.append('image', image);
        } else if (imageType === 'url' && formData.image_url) {
            data.append('image_url', formData.image_url);
        }

        galleryImages.forEach((file, index) => {
            data.append(`gallery_images[${index}]`, file);
        });

        if (formData.gallery_urls) {
            const urls = formData.gallery_urls.split('\n').filter(url => url.trim() !== '');
            urls.forEach((url, index) => {
                data.append(`gallery_urls[${index}]`, url.trim());
            });
        }

        try {
            const response = await api.post('/perfumes', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ text: response.data.message, type: 'success' });
            setFormData({ name: '', description: '', notes: '', price: '', image_url: '', gallery_urls: '' });
            setImage(null); setPreview(null); setGalleryImages([]); setGalleryPreviews([]);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setMessage({ text: "Une erreur est survenue lors de l'ajout.", type: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-content-inner">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Créer une <span className="gradient-text-gold">Nouvelle Essence</span></h1>
                    <p>Enrichissez le patrimoine olfactif de votre Maison de Parfum.</p>
                </div>
            </header>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSubmit} style={{ maxWidth: '1000px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass-premium" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                            <h3 style={{ fontSize: '0.9rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={16} className="gold-text" /> Détails du Parfum
                            </h3>

                            <div className="form-group">
                                <label>Nom de l'Œuvre</label>
                                <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="ex: Nuit Étoilée" required />
                                {errors.name && <span className="error-text">{errors.name[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label>Histoire & Description</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Décrivez l'univers et l'inspiration..." required rows="5" />
                                {errors.description && <span className="error-text">{errors.description[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label>Pyramide Olfactive (Notes de tête, cœur et fond)</label>
                                <input id="notes" type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Jasmin, Santal, Ambre..." required />
                                {errors.notes && <span className="error-text">{errors.notes[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label>Prix d'Exception (€)</label>
                                <input id="price" type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" required />
                                {errors.price && <span className="error-text">{errors.price[0]}</span>}
                            </div>
                        </div>

                        <div className="glass-premium" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                            <h3 style={{ fontSize: '0.9rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Galerie Additionnelle</h3>
                            <div className="form-group">
                                <label>Ajouter des images à la galerie</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', aspectRatio: '1', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '15px', cursor: 'pointer', background: 'rgba(212,175,55,0.05)', color: 'var(--primary)' }}>
                                        <Plus style={{ margin: 'auto' }} />
                                        <input type="file" accept="image/*" multiple onChange={handleGalleryChange} style={{ display: 'none' }} />
                                    </label>
                                    {galleryPreviews.map((url, index) => (
                                        <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button type="button" onClick={() => removeGalleryImage(index)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '2rem' }}>
                                <label>URLs d'images additionnelles (une par ligne)</label>
                                <textarea name="gallery_urls" value={formData.gallery_urls} onChange={handleChange} placeholder="https://..." rows="3" />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass-premium" style={{ padding: '2.5rem', borderRadius: '32px', position: 'sticky', top: '2rem' }}>
                            <h3 style={{ fontSize: '0.9rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Visuel Principal</h3>

                            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <button type="button" onClick={() => setImageType('file')} style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: imageType === 'file' ? 'var(--primary)' : 'transparent', color: imageType === 'file' ? 'black' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                                    <Upload size={14} /> Fichier
                                </button>
                                <button type="button" onClick={() => setImageType('url')} style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: imageType === 'url' ? 'var(--primary)' : 'transparent', color: imageType === 'url' ? 'black' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                                    <LinkIcon size={14} /> URL
                                </button>
                            </div>

                            {imageType === 'file' ? (
                                <label style={{ display: 'block', width: '100%', aspectRatio: '1', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '24px', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                    {preview ? (
                                        <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'rgba(255,255,255,0.3)' }}>
                                            <ImageIcon size={40} />
                                            <span>Sélectionner l'image signature</span>
                                        </div>
                                    )}
                                </label>
                            ) : (
                                <div className="form-group">
                                    <input type="url" placeholder="https://..." value={formData.image_url} onChange={handleUrlChange} />
                                    {preview && (
                                        <div style={{ marginTop: '1.5rem', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '1' }}>
                                            <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <button type="submit" className="gold-button" disabled={isLoading} style={{ width: '100%', marginTop: '3rem', padding: '1.2rem' }}>
                                {isLoading ? 'Infusion en cours...' : 'Ajouter à la Collection'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddPerfume;
