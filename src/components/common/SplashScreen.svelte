<script>
  import { onMount } from 'svelte'

  let { onComplete } = $props()
  let isVisible = $state(true)
  let isExiting = $state(false)

  onMount(() => {
    // Start exit animation after 2 seconds
    const exitTimer = setTimeout(() => {
      isExiting = true
    }, 2000)

    // Remove splash screen after exit animation
    const completeTimer = setTimeout(() => {
      isVisible = false
      onComplete?.()
    }, 2500)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  })
</script>

{#if isVisible}
  <div class="splash-screen" class:exiting={isExiting}>
    <div class="scene">
      <!-- Smoke trail -->
      <div class="smoke-container">
        <div class="smoke smoke-1"></div>
        <div class="smoke smoke-2"></div>
        <div class="smoke smoke-3"></div>
      </div>

      <!-- Car with 3D perspective -->
      <div class="car-wrapper">
        <svg class="car" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Car shadow -->
          <ellipse cx="100" cy="75" rx="70" ry="8" fill="rgba(0,0,0,0.3)" class="shadow"/>

          <!-- Car body -->
          <path d="M30 50 L45 30 L75 25 L130 25 L160 35 L175 50 L175 55 L25 55 L25 50 Z" fill="#16588E"/>

          <!-- Roof -->
          <path d="M55 30 L70 18 L120 18 L135 30 Z" fill="#0f4270"/>

          <!-- Windows -->
          <path d="M60 28 L72 20 L95 20 L95 28 Z" fill="#81C4FF" opacity="0.6"/>
          <path d="M98 20 L118 20 L130 28 L98 28 Z" fill="#81C4FF" opacity="0.6"/>

          <!-- M stripes on body -->
          <rect x="140" y="35" width="4" height="15" fill="#81C4FF"/>
          <rect x="145" y="35" width="4" height="15" fill="#16588E"/>
          <rect x="150" y="35" width="4" height="15" fill="#E7222E"/>

          <!-- Headlights -->
          <ellipse cx="168" cy="45" rx="5" ry="4" fill="#81C4FF"/>
          <ellipse cx="32" cy="45" rx="4" ry="3" fill="#E7222E"/>

          <!-- Wheels -->
          <g class="wheel-front">
            <circle cx="55" cy="55" r="14" fill="#1a1a2e"/>
            <circle cx="55" cy="55" r="10" fill="#333"/>
            <!-- Spokes -->
            <line x1="55" y1="47" x2="55" y2="63" stroke="#555" stroke-width="2" class="spoke"/>
            <line x1="47" y1="55" x2="63" y2="55" stroke="#555" stroke-width="2" class="spoke"/>
            <circle cx="55" cy="55" r="3" fill="#16588E"/>
          </g>
          <g class="wheel-rear">
            <circle cx="145" cy="55" r="14" fill="#1a1a2e"/>
            <circle cx="145" cy="55" r="10" fill="#333"/>
            <!-- Spokes -->
            <line x1="145" y1="47" x2="145" y2="63" stroke="#555" stroke-width="2" class="spoke spoke-rear"/>
            <line x1="137" y1="55" x2="153" y2="55" stroke="#555" stroke-width="2" class="spoke spoke-rear"/>
            <circle cx="145" cy="55" r="3" fill="#16588E"/>
          </g>
        </svg>
      </div>

      <!-- Drift marks -->
      <div class="drift-marks">
        <div class="mark mark-1"></div>
        <div class="mark mark-2"></div>
      </div>
    </div>

    <div class="brand">
      <h1 class="title">Suivi Client</h1>
      <p class="tagline">Gestion automobile</p>
    </div>
  </div>
{/if}

<style>
  .splash-screen {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    overflow: hidden;
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .splash-screen.exiting {
    opacity: 0;
    transform: scale(1.1);
  }

  .scene {
    position: relative;
    width: 300px;
    height: 150px;
    perspective: 800px;
    margin-bottom: 2rem;
  }

  .car-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    animation: carDrift 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    transform-style: preserve-3d;
  }

  .car {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
  }

  .shadow {
    animation: shadowPulse 0.5s ease infinite alternate;
  }

  .spoke {
    transform-origin: 55px 55px;
    animation: wheelSpin 0.2s linear infinite;
  }

  .spoke-rear {
    transform-origin: 145px 55px;
  }

  @keyframes carDrift {
    0% {
      transform: translateX(-150%) rotateY(-30deg) rotateZ(5deg);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    40% {
      transform: translateX(-20%) rotateY(-15deg) rotateZ(8deg);
    }
    60% {
      transform: translateX(10%) rotateY(10deg) rotateZ(-5deg);
    }
    80% {
      transform: translateX(0%) rotateY(5deg) rotateZ(-2deg);
    }
    100% {
      transform: translateX(0%) rotateY(0deg) rotateZ(0deg);
    }
  }

  @keyframes wheelSpin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes shadowPulse {
    from {
      opacity: 0.3;
      rx: 70;
    }
    to {
      opacity: 0.5;
      rx: 65;
    }
  }

  .smoke-container {
    position: absolute;
    bottom: 30px;
    left: 0;
    width: 100%;
    pointer-events: none;
  }

  .smoke {
    position: absolute;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
    border-radius: 50%;
    animation: smokeRise 1.5s ease-out forwards;
    opacity: 0;
  }

  .smoke-1 {
    left: 20%;
    animation-delay: 0.3s;
  }

  .smoke-2 {
    left: 35%;
    animation-delay: 0.5s;
  }

  .smoke-3 {
    left: 50%;
    animation-delay: 0.7s;
  }

  @keyframes smokeRise {
    0% {
      transform: translateY(0) scale(0.5);
      opacity: 0;
    }
    30% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(-60px) scale(2);
      opacity: 0;
    }
  }

  .drift-marks {
    position: absolute;
    bottom: 25px;
    left: 0;
    width: 100%;
    pointer-events: none;
  }

  .mark {
    position: absolute;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(0,0,0,0.4), transparent);
    border-radius: 2px;
    animation: markAppear 1s ease-out forwards;
    opacity: 0;
  }

  .mark-1 {
    left: 10%;
    width: 80px;
    animation-delay: 0.4s;
    transform: rotate(-5deg);
  }

  .mark-2 {
    left: 25%;
    width: 100px;
    animation-delay: 0.6s;
    transform: rotate(-3deg);
  }

  @keyframes markAppear {
    0% {
      width: 0;
      opacity: 0;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 0.3;
    }
  }

  .brand {
    text-align: center;
    animation: brandFadeIn 0.8s ease-out 0.5s both;
  }

  .title {
    font-size: 2rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    text-shadow: 0 2px 20px rgba(129, 196, 255, 0.5);
  }

  .tagline {
    font-size: 1rem;
    color: #81C4FF;
    margin: 0.5rem 0 0;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  @keyframes brandFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
