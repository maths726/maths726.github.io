<script>
  import { onMount } from 'svelte'
  import navaid from 'navaid'
  import { currentRoute, darkMode } from './lib/stores/ui.js'
  import Navigation from './components/common/Navigation.svelte'
  import Toast from './components/common/Toast.svelte'
  import SplashScreen from './components/common/SplashScreen.svelte'
  import Accueil from './pages/Accueil.svelte'
  import Clients from './pages/Clients.svelte'
  import ClientDetail from './pages/ClientDetail.svelte'
  import Vehicules from './pages/Vehicules.svelte'
  import VehiculeDetail from './pages/VehiculeDetail.svelte'
  import Parametres from './pages/Parametres.svelte'

  let page = $state(null)
  let params = $state({})
  let router
  let showSplash = $state(true)

  function navigate(path) {
    router.route(path)
  }

  function handleSplashComplete() {
    showSplash = false
  }

  // Initialize dark mode on startup
  darkMode.init()

  onMount(() => {
    router = navaid('/')

    router.on('/', () => {
      page = Accueil
      params = {}
      currentRoute.set('/')
    })

    router.on('/clients', () => {
      page = Clients
      params = {}
      currentRoute.set('/clients')
    })

    router.on('/clients/:id', (p) => {
      page = ClientDetail
      params = { clientId: p.id }
      currentRoute.set('/clients/' + p.id)
    })

    router.on('/vehicules', () => {
      page = Vehicules
      params = {}
      currentRoute.set('/vehicules')
    })

    router.on('/vehicules/:id', (p) => {
      page = VehiculeDetail
      params = { vehiculeId: p.id }
      currentRoute.set('/vehicules/' + p.id)
    })

    router.on('/parametres', () => {
      page = Parametres
      params = {}
      currentRoute.set('/parametres')
    })

    router.listen()

    return () => router.unlisten()
  })
</script>

{#if showSplash}
  <SplashScreen onComplete={handleSplashComplete} />
{/if}

<div class="app" class:hidden={showSplash}>
  {#if page}
    <svelte:component this={page} {...params} {navigate} />
  {/if}
  <Navigation {navigate} />
  <Toast />
</div>

<style>
  .app {
    min-height: 100vh;
  }

  .app.hidden {
    visibility: hidden;
  }
</style>
