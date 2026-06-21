<template>
  <div class="min-h-screen flex flex-col bg-milk-white">
    <div class="version-badge">VERSION 2.0.0</div>

    <!-- HEADER / ROW 2 BRAND & NAV -->
    <header class="max-w-[1400px] w-full mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-8 border-b border-khaki-mid/5">
      <div class="flex items-center gap-5 cursor-pointer" @click="reloadPage">
        <div class="w-16 h-16 bg-khaki-dark rounded-[1.5rem] flex items-center justify-center text-neon-lemon text-4xl font-black italic shadow-xl">C</div>
        <div>
          <h1 class="text-3xl font-black tracking-tighter text-khaki-dark leading-none uppercase">Комбо Маркет</h1>
          <p class="text-[11px] font-bold text-khaki-mid tracking-[0.3em] mt-2 italic uppercase opacity-80">Каждый может больше</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button @click="showCatalog = true" class="nav-btn border-neon-lemon bg-neon-lemon/10">КАТАЛОГ</button>
        <button @click="showCity = true" class="nav-btn">ГОРОД: {{ currentCity }}</button>
        <button @click="showReg = true" class="nav-btn">РЕГИСТРАЦИЯ</button>
        <button @click="showLogin = true" class="nav-btn bg-khaki-dark text-white border-khaki-dark">ВОЙТИ</button>
        <button @click="showAbout = true" class="nav-btn">О НАС</button>
      </div>
    </header>

    <!-- MAIN PAGE CONTENT -->
    <main class="flex-1 w-full">
      <slot />
    </main>

    <!-- FOOTER -->
    <footer class="bg-khaki-dark text-white py-12 mt-12 border-t-4 border-neon-lemon">
      <div class="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-2xl font-black text-neon-lemon italic">C</span>
            <span class="text-xl font-black uppercase tracking-tight text-white">Combo Market</span>
          </div>
          <p class="text-xs text-white/50 mt-2 font-medium">© 2026 Combo Market. Все права защищены.</p>
        </div>
        <div class="flex gap-6">
          <button @click="showAbout = true" class="text-xs font-bold text-white/60 hover:text-neon-lemon transition-colors">О проекте</button>
          <button @click="showSupport = true" class="text-xs font-bold text-white/60 hover:text-neon-lemon transition-colors">Поддержка</button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { showCatalog, showCity, showReg, showLogin, showAbout, showSupport, currentCity } = useComboState()

const reloadPage = () => {
  window.location.reload()
}
</script>

<style scoped>
.version-badge {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #2D3419;
  color: #DFFF00;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 900;
  z-index: 100;
  border: 1px solid #DFFF00;
}
</style>
