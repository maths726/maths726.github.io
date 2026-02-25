/**
 * Calcule les indicateurs clés de performance (KPIs)
 * @param {Object} aggregated - Données agrégées
 * @param {number} aggregated.totalRevenue - Revenu total
 * @param {number} aggregated.totalPieces - Total prix pièces
 * @param {number} aggregated.totalLabor - Total main d'œuvre
 * @param {number} aggregated.totalMargin - Total marge
 * @param {number} aggregated.count - Nombre d'interventions
 * @returns {Object} KPIs calculés
 */
export function calculateKPIs(aggregated) {
	const {
		totalRevenue = 0,
		totalPieces = 0,
		totalLabor = 0,
		totalMargin = 0,
		totalTemps = 0,
		totalLaborWithTemps = 0,
		count = 0
	} = aggregated || {};

	const revenue = Math.round(totalRevenue * 100) / 100;
	const margin = Math.round(totalMargin * 100) / 100;

	// Le taux de marge est calculé par rapport au CA total
	const marginPercent = totalRevenue > 0
		? Math.round((totalMargin / totalRevenue) * 1000) / 10
		: 0;

	const avgRevenue = count > 0
		? Math.round((totalRevenue / count) * 100) / 100
		: 0;

	// Heures totales et taux horaire (uniquement interventions avec temps renseigné)
	const totalHours = Math.round(totalTemps * 10) / 10;
	const hourlyRate = totalTemps > 0
		? Math.round((totalLaborWithTemps / totalTemps) * 100) / 100
		: 0;

	return {
		revenue,
		margin,
		marginPercent,
		interventionCount: count,
		avgRevenue,
		totalHours,
		hourlyRate
	};
}

/**
 * Compare deux périodes et calcule les variations
 * @param {Object} current - Données de la période actuelle
 * @param {Object} previous - Données de la période précédente
 * @returns {Object} Variations en pourcentage
 */
export function calculatePeriodComparison(current, previous) {
	const currentData = current || { totalRevenue: 0, totalMargin: 0, count: 0 };
	const previousData = previous || { totalRevenue: 0, totalMargin: 0, count: 0 };

	const calculateGrowth = (currentVal, previousVal) => {
		if (previousVal === 0) {
			return currentVal > 0 ? 100 : 0;
		}
		return Math.round(((currentVal - previousVal) / previousVal) * 1000) / 10;
	};

	return {
		revenueGrowth: calculateGrowth(
			currentData.totalRevenue || 0,
			previousData.totalRevenue || 0
		),
		marginGrowth: calculateGrowth(
			currentData.totalMargin || 0,
			previousData.totalMargin || 0
		),
		countGrowth: calculateGrowth(
			currentData.count || 0,
			previousData.count || 0
		)
	};
}

/**
 * Calcule la répartition des composants (pièces, MO, marge)
 * @param {Object} aggregated - Données agrégées
 * @returns {Array} Tableau des composants avec nom, valeur et pourcentage
 */
export function calculateComponentRatios(aggregated) {
	const {
		totalPieces = 0,
		totalLabor = 0,
		totalMargin = 0,
		totalMarginPieces = 0,
		totalRevenue = 0
	} = aggregated || {};

	const calculatePercent = (value) => {
		if (totalRevenue === 0) return 0;
		return Math.round((value / totalRevenue) * 1000) / 10;
	};

	return [
		{
			name: 'Pièces',
			value: Math.round(totalPieces * 100) / 100,
			percent: calculatePercent(totalPieces)
		},
		{
			name: 'Main d\'œuvre',
			value: Math.round(totalLabor * 100) / 100,
			percent: calculatePercent(totalLabor)
		},
		{
			name: 'Marge pièces',
			value: Math.round(totalMarginPieces * 100) / 100,
			percent: calculatePercent(totalMarginPieces)
		},
		{
			name: 'Marge totale',
			value: Math.round(totalMargin * 100) / 100,
			percent: calculatePercent(totalMargin),
			isTotal: true
		}
	];
}

/**
 * Récupère les top items par chiffre d'affaires
 * @param {Array} interventions - Liste des interventions
 * @param {string} groupBy - 'client' ou 'vehicle'
 * @param {number} limit - Nombre d'items à retourner (défaut: 5)
 * @returns {Array} Top items triés par CA décroissant
 */
export function getTopItems(interventions, groupBy, limit = 5) {
	if (!interventions || !Array.isArray(interventions) || interventions.length === 0) {
		return [];
	}

	if (!['client', 'vehicle'].includes(groupBy)) {
		return [];
	}

	const grouped = new Map();
	const idField = groupBy === 'client' ? 'clientId' : 'vehiculeId';

	interventions.forEach((intervention) => {
		const id = intervention[idField];
		if (!id) return;

		if (!grouped.has(id)) {
			grouped.set(id, {
				id,
				revenue: 0,
				count: 0
			});
		}

		const group = grouped.get(id);
		const revenue = (Number(intervention.prixPieces) || 0) +
			(Number(intervention.mainDoeuvre) || 0) +
			(Number(intervention.marge) || 0);

		group.revenue += revenue;
		group.count += 1;
	});

	// Convertir en array, calculer moyenne et trier
	const result = Array.from(grouped.values())
		.map((item) => ({
			...item,
			revenue: Math.round(item.revenue * 100) / 100,
			avgRevenue: item.count > 0
				? Math.round((item.revenue / item.count) * 100) / 100
				: 0
		}))
		.sort((a, b) => b.revenue - a.revenue)
		.slice(0, limit);

	return result;
}

/**
 * Calcule le taux de marge pour chaque période
 * @param {Array} timeSeriesData - Données par période
 * @returns {Array} Données avec taux de marge ajouté
 */
export function calculateMarginRates(timeSeriesData) {
	if (!timeSeriesData || !Array.isArray(timeSeriesData)) {
		return [];
	}

	return timeSeriesData.map((period) => ({
		...period,
		marginPercent: period.revenue > 0
			? Math.round((period.margin / period.revenue) * 1000) / 10
			: 0
	}));
}
