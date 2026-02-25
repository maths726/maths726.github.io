<script>
  import { formatPrice, formatDate } from '../../lib/utils/format'

  let {
    interventions = [],
    clients = new Map(),
    vehicules = new Map()
  } = $props()

  // État de tri et pagination
  let sortColumn = $state('date')
  let sortDirection = $state('desc')
  let currentPage = $state(0)
  const itemsPerPage = 10

  // Fonction pour obtenir le nom du client
  function getClientName(clientId) {
    const client = clients.get(clientId)
    if (!client) return 'Inconnu'
    return `${client.nom} ${client.prenom || ''}`.trim()
  }

  // Fonction pour obtenir l'info du véhicule
  function getVehiculeInfo(vehiculeId) {
    const vehicule = vehicules.get(vehiculeId)
    if (!vehicule) return 'Inconnu'
    return `${vehicule.marque} ${vehicule.modele || ''} (${vehicule.immatriculation})`
  }

  // Calculer le total d'une intervention
  function getTotal(intervention) {
    return (Number(intervention.prixPieces) || 0) +
           (Number(intervention.mainDoeuvre) || 0) +
           (Number(intervention.marge) || 0)
  }

  // Calculer la marge totale (marge pièces + main d'œuvre)
  function getMargeTotal(intervention) {
    return (Number(intervention.marge) || 0) + (Number(intervention.mainDoeuvre) || 0)
  }

  // Tri des données
  let sortedInterventions = $derived.by(() => {
    let sorted = [...interventions]

    sorted.sort((a, b) => {
      let aVal, bVal

      switch (sortColumn) {
        case 'date':
          aVal = new Date(a.date || 0)
          bVal = new Date(b.date || 0)
          break
        case 'client':
          aVal = getClientName(a.clientId)
          bVal = getClientName(b.clientId)
          break
        case 'vehicule':
          aVal = getVehiculeInfo(a.vehiculeId)
          bVal = getVehiculeInfo(b.vehiculeId)
          break
        case 'type':
          aVal = a.type || ''
          bVal = b.type || ''
          break
        case 'pieces':
          aVal = Number(a.prixPieces) || 0
          bVal = Number(b.prixPieces) || 0
          break
        case 'mo':
          aVal = Number(a.mainDoeuvre) || 0
          bVal = Number(b.mainDoeuvre) || 0
          break
        case 'marge':
          aVal = Number(a.marge) || 0
          bVal = Number(b.marge) || 0
          break
        case 'margeTotal':
          aVal = getMargeTotal(a)
          bVal = getMargeTotal(b)
          break
        case 'total':
          aVal = getTotal(a)
          bVal = getTotal(b)
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  })

  // Pagination
  let paginatedData = $derived.by(() => {
    const start = currentPage * itemsPerPage
    return sortedInterventions.slice(start, start + itemsPerPage)
  })

  let totalPages = $derived(Math.ceil(sortedInterventions.length / itemsPerPage))

  function handleSort(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn = column
      sortDirection = 'asc'
    }
    currentPage = 0
  }

  function getSortIcon(column) {
    if (sortColumn !== column) return '↕'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  function exportCSV() {
    if (!sortedInterventions.length) return

    const headers = ['Date', 'Client', 'Véhicule', 'Type', 'Pièces', 'Main d\'œuvre', 'Marge pièces', 'Marge totale', 'Total']
    const rows = sortedInterventions.map(item => [
      formatDate(item.date),
      getClientName(item.clientId),
      getVehiculeInfo(item.vehiculeId),
      item.type || '',
      Number(item.prixPieces) || 0,
      Number(item.mainDoeuvre) || 0,
      Number(item.marge) || 0,
      getMargeTotal(item),
      getTotal(item)
    ])

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `comptabilite_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function goToPage(page) {
    if (page >= 0 && page < totalPages) {
      currentPage = page
    }
  }
</script>

<div class="details-container">
  <div class="section">
    <div class="section-header">
      <h3 class="section-title">Détail des interventions</h3>
      <button class="export-btn" onclick={exportCSV} disabled={!sortedInterventions.length}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export CSV
      </button>
    </div>

    {#if paginatedData.length > 0}
      <div class="table-wrapper">
        <table class="details-table">
          <thead>
            <tr>
              <th class="sortable" onclick={() => handleSort('date')}>
                Date <span class="sort-icon">{getSortIcon('date')}</span>
              </th>
              <th class="sortable" onclick={() => handleSort('client')}>
                Client <span class="sort-icon">{getSortIcon('client')}</span>
              </th>
              <th class="sortable" onclick={() => handleSort('vehicule')}>
                Véhicule <span class="sort-icon">{getSortIcon('vehicule')}</span>
              </th>
              <th class="sortable" onclick={() => handleSort('type')}>
                Type <span class="sort-icon">{getSortIcon('type')}</span>
              </th>
              <th class="sortable text-right" onclick={() => handleSort('pieces')}>
                Pièces <span class="sort-icon">{getSortIcon('pieces')}</span>
              </th>
              <th class="sortable text-right" onclick={() => handleSort('mo')}>
                MO <span class="sort-icon">{getSortIcon('mo')}</span>
              </th>
              <th class="sortable text-right" onclick={() => handleSort('marge')}>
                Marge P. <span class="sort-icon">{getSortIcon('marge')}</span>
              </th>
              <th class="sortable text-right" onclick={() => handleSort('margeTotal')}>
                Marge T. <span class="sort-icon">{getSortIcon('margeTotal')}</span>
              </th>
              <th class="sortable text-right" onclick={() => handleSort('total')}>
                Total <span class="sort-icon">{getSortIcon('total')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each paginatedData as item (item.id)}
              <tr class="table-row">
                <td class="date-cell">{formatDate(item.date)}</td>
                <td class="client-cell">{getClientName(item.clientId)}</td>
                <td class="vehicule-cell">{getVehiculeInfo(item.vehiculeId)}</td>
                <td>
                  <span class="type-badge">{item.type || 'N/A'}</span>
                </td>
                <td class="text-right">{formatPrice(item.prixPieces)}</td>
                <td class="text-right">{formatPrice(item.mainDoeuvre)}</td>
                <td class="text-right">{formatPrice(item.marge)}</td>
                <td class="text-right marge-cell">{formatPrice(getMargeTotal(item))}</td>
                <td class="text-right total-cell">{formatPrice(getTotal(item))}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if totalPages > 1}
        <div class="pagination">
          <button
            class="page-btn"
            onclick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ←
          </button>
          <span class="page-info">
            Page {currentPage + 1} sur {totalPages}
          </span>
          <button
            class="page-btn"
            onclick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            →
          </button>
        </div>
      {/if}

      <div class="summary-info">
        {sortedInterventions.length} intervention{sortedInterventions.length > 1 ? 's' : ''}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        </div>
        <p>Aucune intervention à afficher</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .details-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    border: 1px solid var(--border-color);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .export-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .export-btn:hover:not(:disabled) {
    background: var(--primary-dark);
  }

  .export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Table */
  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .details-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    min-width: 800px;
  }

  .details-table thead {
    background: var(--bg-hover);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .details-table th {
    padding: 0.875rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border-bottom: 2px solid var(--border-color);
    white-space: nowrap;
  }

  .details-table th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background 0.2s ease;
  }

  .details-table th.sortable:hover {
    background: var(--border-color);
  }

  .sort-icon {
    margin-left: 0.25rem;
    opacity: 0.6;
  }

  .details-table td {
    padding: 0.875rem 0.75rem;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
  }

  .table-row:nth-child(even) {
    background: rgba(255, 255, 255, 0.02);
  }

  .table-row:hover {
    background: var(--bg-hover);
  }

  .text-right {
    text-align: right;
  }

  .date-cell {
    color: var(--primary-color);
    font-weight: 500;
  }

  .client-cell {
    font-weight: 500;
  }

  .vehicule-cell {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .type-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: var(--bg-hover);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    text-transform: capitalize;
    font-weight: 500;
  }

  .marge-cell {
    color: #10B981;
    font-weight: 500;
  }

  .total-cell {
    font-weight: 700;
    color: var(--text-primary);
  }

  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }

  .page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .page-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .summary-info {
    text-align: center;
    margin-top: 1rem;
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--text-secondary);
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    background: var(--bg-hover);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: var(--text-muted);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .section {
      padding: 1rem;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .export-btn {
      width: 100%;
      justify-content: center;
    }

    .details-table th,
    .details-table td {
      padding: 0.625rem 0.5rem;
      font-size: 0.8125rem;
    }
  }
</style>
