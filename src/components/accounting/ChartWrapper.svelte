<script>
  import { onMount, onDestroy } from 'svelte'
  import { Chart, registerables } from 'chart.js'

  Chart.register(...registerables)

  let { type = 'line', data = {}, options = {} } = $props()

  let canvas
  let chart
  let resizeObserver

  function getComputedColor(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  }

  function isDarkMode() {
    const textPrimary = getComputedColor('--text-primary')
    // Convertir RGB en luminosité
    const parts = textPrimary.match(/\d+/g)
    if (parts && parts.length >= 3) {
      const luminance = (parts[0] * 299 + parts[1] * 587 + parts[2] * 114) / 1000
      return luminance > 128 // Texte clair = dark mode
    }
    return false
  }

  function getChartColors() {
    const dark = isDarkMode()
    return {
      gridColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      textColor: dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      borderColor: dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    }
  }

  function createChart() {
    if (!canvas || chart) return

    const colors = getChartColors()
    const chartOptions = {
      ...options,
      plugins: {
        ...options.plugins,
        legend: {
          ...options.plugins?.legend,
          labels: {
            ...options.plugins?.legend?.labels,
            color: colors.textColor,
            font: {
              size: 12,
              weight: '500',
              ...options.plugins?.legend?.labels?.font,
            },
          },
        },
      },
      scales: {
        ...options.scales,
        x: {
          ...options.scales?.x,
          grid: {
            ...options.scales?.x?.grid,
            color: colors.gridColor,
          },
          ticks: {
            ...options.scales?.x?.ticks,
            color: colors.textColor,
          },
        },
        y: {
          ...options.scales?.y,
          grid: {
            ...options.scales?.y?.grid,
            color: colors.gridColor,
          },
          ticks: {
            ...options.scales?.y?.ticks,
            color: colors.textColor,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: true,
      ...options,
    }

    chart = new Chart(canvas, {
      type,
      data,
      options: chartOptions,
    })
  }

  function updateChart() {
    if (!chart) return

    chart.data = data
    chart.type = type

    const colors = getChartColors()
    if (chart.options.plugins?.legend?.labels) {
      chart.options.plugins.legend.labels.color = colors.textColor
    }
    if (chart.options.scales?.x?.grid) {
      chart.options.scales.x.grid.color = colors.gridColor
    }
    if (chart.options.scales?.y?.grid) {
      chart.options.scales.y.grid.color = colors.gridColor
    }

    chart.update()
  }

  function destroyChart() {
    if (chart) {
      chart.destroy()
      chart = null
    }
  }

  onMount(() => {
    createChart()

    // Observer pour redimensionnement
    resizeObserver = new ResizeObserver(() => {
      if (chart) {
        chart.resize()
      }
    })
    resizeObserver.observe(canvas.parentElement)

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  })

  onDestroy(() => {
    destroyChart()
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })

  $effect(() => {
    if (data && Object.keys(data).length > 0) {
      if (chart) {
        updateChart()
      } else {
        createChart()
      }
    }
  })

  $effect(() => {
    if (type && chart) {
      updateChart()
    }
  })
</script>

<div class="chart-wrapper">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .chart-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  canvas {
    max-height: 100%;
  }
</style>
