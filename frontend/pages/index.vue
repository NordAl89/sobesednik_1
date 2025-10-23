<template>
  <div>
    <h1>Список собеседников</h1>
    <div v-if="store.loading">Загрузка...</div>
    <div v-else-if="filteredExperts.length === 0">Нет зарегистрированных собеседников</div>
    <div v-else>
      <div
        v-for="expert in filteredExperts"
        :key="expert.id"
        class="card"
        @click="goToExpert(expert.id)"
      >
        <h3>{{ expert.name }}</h3>
        <p>{{ expert.status }}</p>
        <p>{{ expert.age }} лет</p>
        <p>Рейтинг: {{ expert.rating }}/5</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useExpertsStore } from '~/stores/expertsStore'
import { useRouter } from 'vue-router'

const store = useExpertsStore()
const router = useRouter()

// Фильтр экспертов для главной страницы
const filteredExperts = computed(() => {
  return store.experts.filter(expert => expert.status === 'active' && expert.adminVerified === true)
})

// При загрузке страницы синхронизируем с сервером
onMounted(async () => {
  await store.syncWithServer()
})

const goToExpert = (id) => {
  router.push(`/experts/${id}`)
}
</script>


<style scoped>
.card {
  border: 1px solid #ccc;
  padding: 12px;
  margin: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.card:hover {
  background-color: #f7f7f7;
}
</style>