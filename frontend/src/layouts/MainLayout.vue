<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar class="header-toolbar">
        <div class="flex items-center gap-md">
          <img src="/icons/favicon.ico" alt="Logo" class="logo-img" />
          <span class="text-h6 font-weight-bold">Combate à Dengue</span>
        </div>

        <q-space />

        <div class="row gap-md items-center q-mr-md">
          <!-- TODO: Agregar opciones de usuario autenticado (perfil, notificaciones, logout, etc) -->
          <q-btn flat dense icon="account_circle" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup></script>

<style scoped>
.header-toolbar {
  padding: 8px 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.logo-img {
  width: 32px;
  height: 32px;
}
</style>
