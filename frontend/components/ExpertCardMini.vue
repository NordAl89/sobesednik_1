<template>
  <div
    class="expert-card-mini"
    :class="statusClass"
    @click="$emit('click', expert.id)"
  >
    <!-- Главное фото -->
    <NuxtImg
  :src="getImageUrl(expert.mainPhotoUrl) || getDefaultAvatar()"
  alt="Фото собеседника"
  class="main-photo"
  width="220"
  height="180"
  format="webp"
/>

    <h3>{{ expert.name }}</h3>
    <p>Возраст: {{ expert.age }} {{ getAgeWord(expert.age) }}</p>
    <p>Пол: {{ expert.gender === 'male' ? 'Мужской' : 'Женский' }}</p>
    <p>Статус: {{ getStatusText(expert.availability) }}</p>
    <p class="price">{{ expert.price }} руб/час</p>

    <p v-if="expert.allowedTopics">Разрешённые темы: {{ expert.allowedTopics }}</p>
    <p v-if="expert.forbiddenTopics">Запрещённые темы: {{ expert.forbiddenTopics }}</p>

    <div v-if="expert.status === 'Занят'" class="busy-label">
      🚫 Сейчас занят
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  expert: {
    type: Object,
    required: true,
  },
})

const statusClass = computed(() => {
  if (props.expert.status === 'Занят') return 'busy'
  if (props.expert.status === 'active' || props.expert.status === 'Свободен') return 'free'
  return ''
})

const getStatusText = (availability) => {
  return availability === 'Занят' ? 'Занят' : 'Свободен'
}

// Функция для правильного склонения слова "год"
const getAgeWord = (age) => {
  if (!age && age !== 0) return 'лет'

  const lastDigit = age % 10
  const lastTwoDigits = age % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'лет'

  switch (lastDigit) {
    case 1:
      return 'год'
    case 2:
    case 3:
    case 4:
      return 'года'
    default:
      return 'лет'
  }
}

// Формирование URL для изображений
function getImageUrl(url) {
  if (!url) return null
  return url.startsWith('/uploads')
    ? `http://localhost:4000${url}`  // твой backend
    : `http://localhost:4000/uploads/${url}`
}

const getDefaultAvatar = () => '/images/default-avatar.jpg' // из public
</script>

<style scoped>
.expert-card-mini {
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 12px;
  margin: 8px;
  cursor: pointer;
  width: 220px;
  background-color: #edeef0;
  transition: 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.expert-card-mini:hover {
  transform: translateY(-3px);
}

/* Для свободных */
.expert-card-mini.free {
  border-color: #99cdf0;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.3);
}

/* Для занятых */
.expert-card-mini.busy {
  border-color: #e67e22;
  background-color: #fff6e6;
  opacity: 0.95;
}

.busy-label {
  margin-top: 8px;
  color: #e67e22;
  font-weight: bold;
}

.main-photo {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
}

p {
  margin: 4px 0;
  color: #555;
  font-size: 14px;
}

.price {
  color: #27ae60;
  font-weight: bold;
  font-size: 16px;
}
</style>
