import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format YYYY-MM to French Month Year format (e.g. 'Juin 2026')
 */
const formatMonth = (monthStr) => {
    if (!monthStr || typeof monthStr !== 'string' || !monthStr.includes('-')) return monthStr;
    const [year, month] = monthStr.split('-');
    const months = {
        '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
        '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
        '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
    };
    return `${months[month] || month} ${year}`;
};

/**
 * Clean currency formatting to avoid unicode space rendering issues in jsPDF
 */
const formatCurrency = (value) => {
    const formatted = Number.parseFloat(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
    // Replace narrow non-breaking space (\u202f) and non-breaking space (\u00a0) with standard space
    return formatted.replace(/[\u202f\u00a0]/g, ' ') + ' €';
};

/**
 * Exports data as a luxury styled PDF.
 * @param {string} type - The type of data ('orders', 'customers', 'products', 'analytics')
 * @param {Array} data - The array of objects to export
 */
export const exportToPDF = (type, data) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Brand Colors
    const primaryColor = [127, 29, 29]; // #7f1d1d Burgundy
    const secondaryColor = [217, 119, 6]; // #d97706 Gold
    const textColor = [30, 41, 59]; // #1e293b Charcoal
    const cardBgColor = [252, 251, 249]; // Very soft warm white
    const lightDrawColor = [231, 224, 213]; // Soft gold/gray

    // Document Title & Headers mapping
    let title = '';
    let headers = [];
    let rows = [];
    let columnStyles = {};

    switch (type) {
        case 'orders':
            title = 'Rapport d\'Exportation - Commandes';
            headers = [['N° Commande', 'Client', 'Email', 'Total', 'Statut', 'Paiement', 'Date']];
            rows = data.map(item => [
                item.order_number || 'N/A',
                item.client_name || 'N/A',
                item.client_email || 'N/A',
                formatCurrency(item.total),
                (item.status || 'N/A').toUpperCase(),
                (item.payment_status || 'N/A').toUpperCase(),
                item.created_at || 'N/A'
            ]);
            columnStyles = {
                0: { halign: 'left' },
                1: { halign: 'left' },
                2: { halign: 'left' },
                3: { halign: 'right' },
                4: { halign: 'center' },
                5: { halign: 'center' },
                6: { halign: 'left' }
            };
            break;

        case 'customers':
            title = 'Rapport d\'Exportation - Clients';
            headers = [['Nom', 'Email', 'Rôle', 'Statut', 'Commandes', 'Total Dépensé', 'Inscription']];
            rows = data.map(item => [
                item.name || 'N/A',
                item.email || 'N/A',
                (item.role || 'user').toUpperCase(),
                (item.status || 'active').toUpperCase(),
                item.order_count || 0,
                formatCurrency(item.total_spent),
                item.created_at || 'N/A'
            ]);
            columnStyles = {
                0: { halign: 'left' },
                1: { halign: 'left' },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'left' }
            };
            break;

        case 'products':
            title = 'Rapport d\'Exportation - Catalogue Produits';
            headers = [['Nom', 'Catégorie', 'Prix', 'Stock', 'Note Moy.', 'Nb Avis', 'Actif']];
            rows = data.map(item => [
                item.name || 'N/A',
                item.category || 'Général',
                formatCurrency(item.price),
                item.stock_quantity === undefined ? '0' : item.stock_quantity,
                Number.parseFloat(item.rating_avg || 0).toFixed(1),
                item.rating_count || 0,
                item.is_active ? 'Oui' : 'Non'
            ]);
            columnStyles = {
                0: { halign: 'left' },
                1: { halign: 'left' },
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'center' }
            };
            break;

        case 'analytics':
            title = 'Rapport d\'Exportation - Tendance Financière';
            headers = [['Période', 'Chiffre d\'Affaires', 'Commandes', 'Panier Moyen']];
            rows = data.map(item => [
                formatMonth(item.month),
                formatCurrency(item.revenue),
                item.orders || 0,
                formatCurrency(item.avg_order)
            ]);
            columnStyles = {
                0: { halign: 'left' },
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' }
            };
            break;

        case 'saas':
            title = 'Rapport d\'Exportation - Administration SaaS';
            headers = [['Tenant', 'Domaine', 'Plan', 'Statut', 'Utilisateurs', 'Commandes', 'Revenus']];
            rows = data.map(item => [
                item.name || 'N/A',
                item.domain || 'N/A',
                (item.plan || 'free').toUpperCase(),
                item.is_active ? 'ACTIF' : 'SUSPENDU',
                item.stats?.users || 0,
                item.stats?.orders || 0,
                formatCurrency(item.stats?.revenue)
            ]);
            columnStyles = {
                0: { halign: 'left' },
                1: { halign: 'left' },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'right' }
            };
            break;

        default:
            title = 'Rapport d\'Exportation';
            headers = [[]];
            rows = [];
    }

    // Add Logo or Brand Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F'); // Burgundy header block

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MAISON DE PARFUM', 15, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Climatrack Luxury E-commerce Platform', 15, 26);

    // Decorative Gold Accent Line below header
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(1);
    doc.line(0, 35, 210, 35);

    // Subtitle / Report info
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, 15, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Muted gray
    doc.text(`Date de génération : ${new Date().toLocaleString('fr-FR')}`, 15, 54);

    // Summary Metrics Cards (KPIs)
    let kpis = [];
    if (type === 'orders') {
        const totalAmount = data.reduce((sum, item) => sum + Number.parseFloat(item.total || 0), 0);
        const avgAmount = data.length > 0 ? totalAmount / data.length : 0;
        kpis = [
            { label: 'Commandes Totales', value: `${data.length}` },
            { label: 'Chiffre d\'Affaires', value: formatCurrency(totalAmount) },
            { label: 'Panier Moyen', value: formatCurrency(avgAmount) }
        ];
    } else if (type === 'customers') {
        const totalSpent = data.reduce((sum, item) => sum + Number.parseFloat(item.total_spent || 0), 0);
        kpis = [
            { label: 'Clients Rentrés', value: `${data.length}` },
            { label: 'Volume Dépensé', value: formatCurrency(totalSpent) },
            { label: 'Panier Moyen Client', value: formatCurrency(data.length > 0 ? totalSpent / data.length : 0) }
        ];
    } else if (type === 'products') {
        const totalStock = data.reduce((sum, item) => sum + Number.parseInt(item.stock_quantity || 0, 10), 0);
        const avgPrice = data.reduce((sum, item) => sum + Number.parseFloat(item.price || 0), 0) / (data.length || 1);
        kpis = [
            { label: 'Essences Disponibles', value: `${data.length}` },
            { label: 'Stock Cumulé', value: `${totalStock}` },
            { label: 'Tarif Moyen', value: formatCurrency(avgPrice) }
        ];
    } else if (type === 'analytics') {
        const totalRevenue = data.reduce((sum, item) => sum + Number.parseFloat(item.revenue || 0), 0);
        const totalOrders = data.reduce((sum, item) => sum + Number.parseInt(item.orders || 0, 10), 0);
        const avgBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        kpis = [
            { label: 'Chiffre d\'Affaires Total', value: formatCurrency(totalRevenue) },
            { label: 'Commandes Validées', value: `${totalOrders}` },
            { label: 'Panier Moyen Global', value: formatCurrency(avgBasket) }
        ];
    } else if (type === 'saas') {
        const totalUsers = data.reduce((sum, item) => sum + Number.parseInt(item.stats?.users || 0, 10), 0);
        const totalRevenue = data.reduce((sum, item) => sum + Number.parseFloat(item.stats?.revenue || 0), 0);
        const activeCount = data.filter(item => item.is_active).length;
        kpis = [
            { label: 'Tenants Actifs', value: `${activeCount} / ${data.length}` },
            { label: 'Utilisateurs Totaux', value: `${totalUsers}` },
            { label: 'Revenus Cumulés', value: formatCurrency(totalRevenue) }
        ];
    }

    // Draw KPI Cards if defined
    let tableStartY = 65;
    if (kpis.length > 0) {
        const cardWidth = 56;
        const cardHeight = 20;
        const spacing = 6;
        const startX = 15;
        const startY = 60;

        kpis.forEach((kpi, idx) => {
            const x = startX + idx * (cardWidth + spacing);
            
            // Draw background rectangle
            doc.setFillColor(...cardBgColor);
            doc.setDrawColor(...lightDrawColor);
            doc.setLineWidth(0.3);
            doc.roundedRect(x, startY, cardWidth, cardHeight, 3, 3, 'FD');

            // Draw KPI Label
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(kpi.label, x + 4, startY + 6);

            // Draw KPI Value
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...primaryColor);
            doc.text(kpi.value, x + 4, startY + 14);
        });

        tableStartY = 88;
    }

    // Generate Table
    autoTable(doc, {
        startY: tableStartY,
        head: headers,
        body: rows,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left'
        },
        columnStyles: columnStyles,
        bodyStyles: {
            textColor: textColor,
            fontSize: 8.5
        },
        alternateRowStyles: {
            fillColor: [252, 253, 253] // Subtle white/slate alternation
        },
        margin: { top: 65, left: 15, right: 15, bottom: 20 },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            
            // Draw a line above footer
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.line(15, 275, 195, 275);
            
            doc.text('Maison de Parfum - Climatrack Admin Platform', 15, 282);
            doc.text(`Page ${data.pageNumber} sur ${pageCount}`, 195, 282, { align: 'right' });
        }
    });

    // Save the PDF
    const filename = `${type}_export_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
};
