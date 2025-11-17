<template>
  <div
    class="expert-card-mini"
    :class="statusClass"
    @click="$emit('click', expert.id)"
  >
    <!-- Фото -->
    <NuxtImg
      :src="getImageUrl(expert.mainPhotoUrl) || getDefaultAvatar()"
      alt="Фото собеседника"
      class="main-photo"
      width="220"
      height="180"
      format="webp"
    />

    <!-- Информация -->
    <div class="expert-info">
<!-- <pre>{{ expert }}</pre>  -->
      <h3>
        {{ expert.name }} 
        <span
          v-if="expert.alwaysAvailable"
          class="always-available" 
          title="Эксперт доступен круглосуточно"
        >24/7</span>
         <!-- Значок верификации -->
        <img
         v-if="expert.adminVerified"
          src="/images/verified_expert2.png"
          alt="Проверенный эксперт"
          class="verified-badge"
          title="Личность собеседника подтверждена администрацией"
        />
         <img
         v-if="expert.noForbiddenTopics && expert.forbiddenTopics.length === 0"
          src="/images/unlocked_icon.png"
          alt="Запретных тем нет"
          class="verified-badge"
          title="Собеседник готов общаться на любые темы"
        />
      </h3>
      <p>Возраст: {{ expert.age }} {{ getAgeWord(expert.age) }}</p>
      <!-- <p>Пол: {{ expert.gender === 'male' ? 'Мужской' : 'Женский' }}</p> -->

     <p class="status-text">
        Статус: 
        <span :class="getStatusClass(expert.availability)">
          {{ getStatusText(expert.availability) }}
        </span>
      </p>

      <p class="price"><span class="price_simple">Цена от:</span> {{ expert.price }} руб/час</p>

      <p v-if="expert.allowedTopics">Предпочитаю темы: {{ expert.allowedTopics }}</p>
      <p v-if="expert.forbiddenTopics">Запрещённые темы: {{ expert.forbiddenTopics }}</p>
      
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
  if (props.expert.availability === 'Занят') return 'busy'
  if (props.expert.availability === 'Свободен') return 'free'
  return ''
})

const getStatusText = (availability) => {
  return availability === 'Занят' ? 'Занят' : 'Свободен'
}

// Класс для окраски текста статуса
const getStatusClass = (availability) => {
  if (availability === 'Занят') return 'status-busy'
  if (availability === 'Свободен') return 'status-free'
  return ''
}

const getAgeWord = (age) => {
  if (!age && age !== 0) return 'лет'
  const lastDigit = age % 10
  const lastTwoDigits = age % 100
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'лет'
  switch (lastDigit) {
    case 1: return 'год'
    case 2:
    case 3:
    case 4: return 'года'
    default: return 'лет'
  }
}

function getImageUrl(url) {
  if (!url) return null
  return url.startsWith('/uploads')
    ? `http://localhost:4000${url}`
    : `http://localhost:4000/uploads/${url}`
}

const getDefaultAvatar = () => '/images/expert-default.svg'
</script>

<style scoped>
.expert-card-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 12px;
  margin: 8px;
  cursor: pointer;
  width: 230px;
  background-color: #edeef0;
  transition: 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.expert-card-mini:hover {
  transform: translateY(-3px);
}

.expert-card-mini.free {
  border-color: #99cdf0;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.3);
}
.expert-card-mini.busy {
  border-color: #e67e22;
  background-color: #fff6e6;
  opacity: 0.95;
}

.main-photo {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.expert-info {
  width: 100%;
}

/* ——— Цвета статусов ——— */
.status {
  font-weight: 600;
}

.status-text {
  font-weight: normal;
  color: #555; /* обычный текст */
}

.status-busy {
  color: #e67e22; /* оранжевый для "Занят" */
  font-weight: 600;
}

.status-free {
  color: #3498db; /* голубой для "Свободен" */
  font-weight: 600;
}

.busy-label {
  margin-top: 8px;
  color: #e67e22;
  font-weight: bold;
}

h3 {
  margin: 0 0 6px 0;
  color: #2c3e50;
  font-size: 18px;
}

p {
  margin: 3px 0;
  color: #555;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.price {
  color: #27ae60;
  font-weight: bold;
  font-size: 16px;
  margin-top: 5px;
}
.price span {
  font-weight: normal;
  color: #555;
  font-size: 14px;
}
.always-available {
  background-color: #27ae60;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}
.expert-name {
  display: flex;
  align-items: center;
  gap: 6px;
  
}

.verified-badge {
  width: 24px;
  height: 24px;
  vertical-align: middle;
  margin-left: 6px;
}

/* ---------- 📱 Мобильная версия ---------- */
@media (max-width: 768px) {
  .expert-card-mini {
    flex-direction: row;
    width: 100%;
    align-items: flex-start;
    padding: 10px;
  }

  .main-photo {
    width: 100px;
    height: 100px;
    margin-right: 12px;
    margin-bottom: 0;
  }

  .expert-info {
    flex: 1;
  }

  h3 {
    font-size: 16px;
    margin-bottom: 4px;
  }

  p {
    font-size: 13px;
    -webkit-line-clamp: 1;
  }

  .price {
    font-size: 14px;
  }
}
</style>
