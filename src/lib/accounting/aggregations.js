import {
	startOfMonth,
	endOfMonth,
	startOfQuarter,
	endOfQuarter,
	startOfYear,
	endOfYear,
	startOfWeek,
	endOfWeek,
	addWeeks,
	subMonths,
	isWithinInterval,
	format,
	toDate
} from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Filtre les interventions selon les critères spécifiés
 * @param {Array} interventions - Liste des interventions
 * @param {Object} filters - Filtres à appliquer
 * @param {string} filters.dateRange - 'month'|'3months'|'6months'|'year'|'all'
 * @param {string} filters.clientId - ID du client (optionnel)
 * @param {string} filters.vehiculeId - ID du véhicule (optionnel)
 * @returns {Array} Interventions filtrées
 */
export function filterInterventions(interventions, filters = {}) {
	if (!interventions || !Array.isArray(interventions)) {
		return [];
	}

	// Ne garder que les interventions terminées
	let filtered = interventions.filter(intervention => intervention.statut === 'termine');

	// Filtre par plage de dates
	if (filters.dateRange && filters.dateRange !== 'all') {
		const now = new Date();
		let startDate;
		let endDate = endOfDay(now);

		switch (filters.dateRange) {
			case 'month':
				startDate = startOfMonth(now);
				break;
			case '3months':
				startDate = startOfMonth(subMonths(now, 2));
				break;
			case '6months':
				startDate = startOfMonth(subMonths(now, 5));
				break;
			case 'year':
				startDate = startOfYear(now);
				break;
			default:
				startDate = null;
		}

		if (startDate) {
			filtered = filtered.filter((intervention) => {
				const interventionDate = toDate(intervention.date);
				return isWithinInterval(interventionDate, { start: startDate, end: endDate });
			});
		}
	}

	// Filtre par client
	if (filters.clientId) {
		filtered = filtered.filter((intervention) => intervention.clientId === filters.clientId);
	}

	// Filtre par véhicule
	if (filters.vehiculeId) {
		filtered = filtered.filter((intervention) => intervention.vehiculeId === filters.vehiculeId);
	}

	return filtered;
}

/**
 * Regroupe les interventions par période
 * @param {Array} interventions - Liste des interventions
 * @param {string} periodType - 'week'|'month'|'quarter'|'year'
 * @param {string} dateRange - 'month'|'3months'|'6months'|'year'|'all' pour définir la plage
 * @returns {Array} Interventions regroupées par période
 */
export function groupByPeriod(interventions, periodType = 'month', dateRange = '3months') {
	const now = new Date();
	const grouped = new Map();

	// Pour "Ce mois", utiliser la granularité semaine
	const effectivePeriodType = dateRange === 'month' ? 'week' : periodType;

	// Déterminer la plage de dates à couvrir
	let startDate, endDate;

	switch (dateRange) {
		case 'month':
			startDate = startOfMonth(now);
			endDate = endOfMonth(now);
			break;
		case '3months':
			startDate = startOfMonth(subMonths(now, 2));
			endDate = endOfMonth(now);
			break;
		case '6months':
			startDate = startOfMonth(subMonths(now, 5));
			endDate = endOfMonth(now);
			break;
		case 'year':
			startDate = startOfYear(now);
			endDate = endOfMonth(now);
			break;
		case 'all':
			// Pour "all", on prend la date de la plus ancienne intervention ou 12 mois en arrière
			if (interventions && interventions.length > 0) {
				const dates = interventions.map(i => toDate(i.date));
				startDate = startOfMonth(new Date(Math.min(...dates)));
			} else {
				startDate = startOfMonth(subMonths(now, 11));
			}
			endDate = endOfMonth(now);
			break;
		default:
			startDate = startOfMonth(subMonths(now, 2));
			endDate = endOfMonth(now);
	}

	// Générer toutes les périodes avec des valeurs à 0
	let currentDate = new Date(startDate);
	while (currentDate <= endDate) {
		let periodStart, label;

		switch (effectivePeriodType) {
			case 'week':
				periodStart = startOfWeek(currentDate, { weekStartsOn: 1, locale: fr });
				const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1, locale: fr });
				label = `${format(periodStart, 'd', { locale: fr })}-${format(weekEnd, 'd MMM', { locale: fr })}`;
				break;
			case 'quarter':
				periodStart = startOfQuarter(currentDate);
				label = `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`;
				break;
			case 'year':
				periodStart = startOfYear(currentDate);
				label = currentDate.getFullYear().toString();
				break;
			case 'month':
			default:
				periodStart = startOfMonth(currentDate);
				label = format(currentDate, 'MMM yyyy', { locale: fr });
		}

		const key = periodStart.toISOString();

		if (!grouped.has(key)) {
			grouped.set(key, {
				period: periodStart,
				label,
				revenue: 0,
				pieces: 0,
				labor: 0,
				margin: 0,
				marginPieces: 0,
				count: 0
			});
		}

		// Avancer à la période suivante
		switch (effectivePeriodType) {
			case 'week':
				currentDate = addWeeks(currentDate, 1);
				break;
			case 'quarter':
				currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 3));
				break;
			case 'year':
				currentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
				break;
			case 'month':
			default:
				currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
		}
	}

	// Ajouter les données des interventions
	if (interventions && Array.isArray(interventions)) {
		interventions.forEach((intervention) => {
			const date = toDate(intervention.date);
			let periodStart;

			switch (effectivePeriodType) {
				case 'week':
					periodStart = startOfWeek(date, { weekStartsOn: 1, locale: fr });
					break;
				case 'quarter':
					periodStart = startOfQuarter(date);
					break;
				case 'year':
					periodStart = startOfYear(date);
					break;
				case 'month':
				default:
					periodStart = startOfMonth(date);
			}

			const key = periodStart.toISOString();

			if (grouped.has(key)) {
				const group = grouped.get(key);
				const pieces = Number(intervention.prixPieces) || 0;
				const labor = Number(intervention.mainDoeuvre) || 0;
				const marginPieces = Number(intervention.marge) || 0;

				group.pieces += pieces;
				group.labor += labor;
				group.marginPieces += marginPieces;
				// La marge totale = marge pièces + main d'œuvre
				group.margin += marginPieces + labor;
				group.revenue += pieces + labor + marginPieces;
				group.count += 1;
			}
		});
	}

	// Convertir la Map en array et trier par date
	return Array.from(grouped.values()).sort((a, b) => a.period - b.period);
}

/**
 * Agrège les données financières des interventions
 * @param {Array} interventions - Liste des interventions
 * @returns {Object} Données financières agrégées
 */
export function aggregateFinancials(interventions) {
	if (!interventions || !Array.isArray(interventions) || interventions.length === 0) {
		return {
			totalRevenue: 0,
			totalPieces: 0,
			totalLabor: 0,
			totalMargin: 0,
			totalMarginPieces: 0,
			totalTemps: 0,
			totalLaborWithTemps: 0,
			count: 0
		};
	}

	let totalPieces = 0;
	let totalLabor = 0;
	let totalMarginPieces = 0;
	let totalTemps = 0;
	let totalLaborWithTemps = 0;

	interventions.forEach((intervention) => {
		totalPieces += Number(intervention.prixPieces) || 0;
		totalLabor += Number(intervention.mainDoeuvre) || 0;
		totalMarginPieces += Number(intervention.marge) || 0;
		const temps = Number(intervention.tempsTravail) || 0;
		totalTemps += temps;
		// Main d'œuvre uniquement pour les interventions avec temps renseigné
		if (temps > 0) {
			totalLaborWithTemps += Number(intervention.mainDoeuvre) || 0;
		}
	});

	const totalRevenue = totalPieces + totalLabor + totalMarginPieces;
	// La marge totale = marge pièces + main d'œuvre (la MO est entièrement considérée comme marge)
	const totalMargin = totalMarginPieces + totalLabor;

	return {
		totalRevenue,
		totalPieces,
		totalLabor,
		totalMargin,
		totalMarginPieces,
		totalTemps,
		totalLaborWithTemps,
		count: interventions.length
	};
}

/**
 * Fonction utilitaire pour obtenir la fin du jour
 * @param {Date} date - Date à traiter
 * @returns {Date} Fin du jour (23h59:59)
 */
function endOfDay(date) {
	const end = new Date(date);
	end.setHours(23, 59, 59, 999);
	return end;
}
