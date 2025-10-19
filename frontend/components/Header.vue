<template>
  <header>
    <nav>
      <ul>
        <li><NuxtLink to="/">Главная</NuxtLink></li>
        <li><NuxtLink to="/become-expert">Стать собеседником</NuxtLink></li>
        <li><NuxtLink to="/about">О нас</NuxtLink></li>
        <li v-if="!store.isLoggedIn">
          <NuxtLink to="/expert-login">Вход для экспертов</NuxtLink>
        </li>
        <li v-else>
          <NuxtLink :to="`/expert-profile/${store.currentExpert.id}`" class="profile-link">
            👤 Личный кабинет
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { useExpertsStore } from '~/stores/expertsStore'

const store = useExpertsStore()
</script>

<style scoped>
header {
  background-color: #f8f8f8;
  padding: 10px 20px;
}

nav ul {
  list-style: none;
  display: flex;
  gap: 20px;
  padding: 0;
  margin: 0;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

nav a:hover {
  color: #007bff;
  background-color: #f0f0f0;
}

.profile-link {
  background-color: #007bff;
  color: white !important;
}

.profile-link:hover {
  background-color: #0056b3;
  color: white !important;
}
</style>