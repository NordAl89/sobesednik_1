<template>
  <div>
    <h1>Список собеседников</h1>

    <div v-if="store.loading">Загрузка...</div>
    <div v-else-if="store.experts.length === 0">Нет зарегистрированных собеседников</div>

    <div v-else class="experts-list">
      <div
        v-for="expert in store.experts"
        :key="expert.id"
        class="card"
        :class="statusClass(expert)"
        @click="goToExpert(expert.id)"
      >
        <h3>{{ expert.name }}</h3>
        <p><strong>Статус:</strong> {{ expert.status }}</p>
        <p>{{ expert.age }} лет</p>
        <p>Рейтинг: {{ expert.rating }}/5</p>

        <div v-if="expert.status === 'Занят'" class="busy-label">
          🚫 Сейчас занят
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useExpertsStore } from '~/stores/expertsStore'
import { useRouter } from 'vue-router'

const store = useExpertsStore()
const router = useRouter()

onMounted(async () => {
  await store.syncWithServer()
})

const goToExpert = (id) => {
  router.push(`/experts/${id}`)
}

// Возвращает CSS-класс для подсветки карточки по статусу
const statusClass = (expert) => {
  if (expert.status === 'Занят') return 'busy'
  if (expert.status === 'active' || expert.status === 'Свободен') return 'free'
  return ''
}
</script>

<style scoped>
.experts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.card {
  border: 2px solid #ccc;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.card:hover {
  transform: translateY(-3px);
}

/* Свободный эксперт */
.card.free {
  border-color: #27ae60;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.3);
}

/* Занятый эксперт */
.card.busy {
  border-color: #e67e22;
  background-color: #fff6e6;
  opacity: 0.95;
}

.busy-label {
  color: #e67e22;
  font-weight: bold;
  margin-top: 10px;
}
</style>
