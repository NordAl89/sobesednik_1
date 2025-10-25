<template>
  <div>
    <div class="compact-hero">
      <div class="compact-hero-content">
        <p class="compact-hero-text">
          Собеседник - место, где каждый может найти искреннего друга, поддержку и понимание
        </p>
      </div>
    </div>
    <h1>Список собеседников</h1>

    <div v-if="store.loading">Загрузка...</div>
    <div v-else-if="filteredExperts.length === 0">Нет доступных собеседников</div>

    <div v-else class="experts-list">
      <div
        v-for="expert in filteredExperts"
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
import { onMounted, computed } from 'vue' // Добавлен импорт computed
import { useExpertsStore } from '~/stores/expertsStore'
import { useRouter } from 'vue-router'

const store = useExpertsStore()
const router = useRouter()

// Фильтруем экспертов, исключая тех, у кого статус "pending"
const filteredExperts = computed(() => 
  store.experts.filter(expert => expert.status !== 'pending')
)

onMounted(async () => {
  await store.syncWithServer()
})

const goToExpert = (id) => {
  router.push(`/experts/${id}`)
}

const statusClass = (expert) => {
  if (expert.status === 'Занят') return 'busy'
  if (expert.status === 'active' || expert.status === 'Свободен') return 'free'
  return ''
}
</script>

<style scoped>
/* Компактный Hero блок */
.compact-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 20px;
  margin-bottom: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.compact-hero-text {
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
  max-width: 800px;
  margin: 0 auto;
}
/* Стили без изменений */
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
  margin-bottom: 5px;
}
.card:hover {
  transform: translateY(-3px);
}

.card.free {
  border-color: #27ae60;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.3);
}

.card.busy {
  border-color: #dad6d3;
  background-color: #fff6e6;
  opacity: 0.4;
}

.busy-label {
  color: #e67e22;
  font-weight: bold;
  margin-top: 10px;
}
</style>