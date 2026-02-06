<template>
  <div class="fun-hero-visual" aria-hidden="true">
    <!-- Neon orbs -->
    <div class="fun-hero-visual__orb fun-hero-visual__orb--1"></div>
    <div class="fun-hero-visual__orb fun-hero-visual__orb--2"></div>
    <div class="fun-hero-visual__orb fun-hero-visual__orb--3"></div>
    <!-- Floating icons with staggered animation -->
    <div class="fun-hero-visual__float fun-hero-visual__float--1">🎮</div>
    <div class="fun-hero-visual__float fun-hero-visual__float--2">🍕</div>
    <div class="fun-hero-visual__float fun-hero-visual__float--3">🥤</div>
    <div class="fun-hero-visual__float fun-hero-visual__float--4">🎲</div>
    <div class="fun-hero-visual__float fun-hero-visual__float--5">✨</div>
    <div class="fun-hero-visual__float fun-hero-visual__float--6">🎯</div>
    <!-- Neon ring -->
    <div class="fun-hero-visual__ring"></div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.fun-hero-visual {
  position: relative;
  width: min(340px, 90vw);
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fun-hero-visual__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.5;
  will-change: transform, opacity;
}

.fun-hero-visual__orb--1 {
  width: 180px;
  height: 180px;
  background: rgba(0, 245, 255, 0.35);
  top: 10%;
  left: 5%;
  animation: funOrb1 8s ease-in-out infinite;
}

.fun-hero-visual__orb--2 {
  width: 140px;
  height: 140px;
  background: rgba(255, 0, 128, 0.35);
  top: 40%;
  right: 0;
  animation: funOrb2 10s ease-in-out infinite;
  animation-delay: -2s;
}

.fun-hero-visual__orb--3 {
  width: 100px;
  height: 100px;
  background: rgba(168, 85, 247, 0.4);
  bottom: 15%;
  left: 15%;
  animation: funOrb3 9s ease-in-out infinite;
  animation-delay: -4s;
}

@keyframes funOrb1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  33% { transform: translate(15px, -20px) scale(1.1); opacity: 0.7; }
  66% { transform: translate(-10px, 10px) scale(0.95); opacity: 0.4; }
}

@keyframes funOrb2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  50% { transform: translate(-20px, -15px) scale(1.15); opacity: 0.6; }
}

@keyframes funOrb3 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  50% { transform: translate(10px, -25px) scale(1.2); opacity: 0.6; }
}

.fun-hero-visual__float {
  position: absolute;
  font-size: 1.75rem;
  filter: drop-shadow(0 0 12px currentColor);
  will-change: transform;
  opacity: 0.9;
}

.fun-hero-visual__float--1 { top: 18%; left: 20%; animation: funFloat 6s ease-in-out infinite; color: rgba(0, 245, 255, 0.95); }
.fun-hero-visual__float--2 { top: 25%; right: 22%; animation: funFloat 7s ease-in-out infinite 0.5s; color: rgba(255, 100, 150, 0.95); }
.fun-hero-visual__float--3 { bottom: 30%; left: 18%; animation: funFloat 5.5s ease-in-out infinite 1s; color: rgba(0, 255, 136, 0.95); }
.fun-hero-visual__float--4 { bottom: 25%; right: 20%; animation: funFloat 6.5s ease-in-out infinite 0.3s; color: rgba(255, 200, 0, 0.95); }
.fun-hero-visual__float--5 { top: 50%; left: 50%; transform: translate(-50%, -50%); animation: funFloatCenter 5s ease-in-out infinite 0.7s; color: rgba(255, 255, 255, 0.9); font-size: 2rem; }
.fun-hero-visual__float--6 { top: 12%; left: 50%; transform: translateX(-50%); animation: funFloatCenterX 6.2s ease-in-out infinite 0.2s; color: rgba(168, 85, 247, 0.95); }

@keyframes funFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes funFloatCenter {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-12px); }
}

@keyframes funFloatCenterX {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-15px); }
}

.fun-hero-visual__ring {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 2px solid rgba(0, 245, 255, 0.25);
  box-shadow: 0 0 30px rgba(0, 245, 255, 0.2), inset 0 0 30px rgba(0, 245, 255, 0.05);
  animation: funRingPulse 4s ease-in-out infinite;
}

@keyframes funRingPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@media (max-width: 768px) {
  .fun-hero-visual {
    height: 220px;
    width: min(280px, 88vw);
  }

  .fun-hero-visual__orb--1,
  .fun-hero-visual__orb--2,
  .fun-hero-visual__orb--3 {
    filter: none;
  }

  .fun-hero-visual__float {
    font-size: 1.35rem;
  }

  .fun-hero-visual__float--5 { font-size: 1.5rem; }

  .fun-hero-visual__ring {
    width: 150px;
    height: 150px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fun-hero-visual__orb,
  .fun-hero-visual__float,
  .fun-hero-visual__ring {
    animation: none !important;
  }
}
</style>
