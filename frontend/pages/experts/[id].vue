<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const expert = ref(null)
const newRating = ref(0)
const newReview = ref('')
const loading = ref(true)

// Вернуться на главную
const goBack = () => router.push('/')

// Получение данных эксперта с backend
const fetchExpert = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res = await fetch(`http://localhost:4000/experts/${id}`)
    if (!res.ok) throw new Error('Собеседник не найден')
    expert.value = await res.json()
    newRating.value = expert.value.rating || 0
  } catch (err) {
    console.error(err)
    expert.value = null
  } finally {
    loading.value = false
  }
}

// Обновление рейтинга
const setRating = async (star) => {
  if (!expert.value) return
  expert.value.rating = star
  newRating.value = star

  await fetch(`http://localhost:4000/experts/${expert.value.id}/rating`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: star })
  })
}

// Добавление отзыва
const addReview = async () => {
  if (!expert.value || !newReview.value.trim()) return
  const review = {
    text: newReview.value,
    date: new Date().toLocaleString()
  }
  await fetch(`http://localhost:4000/experts/${expert.value.id}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  })
  expert.value.reviews = expert.value.reviews || []
  expert.value.reviews.push(review)
  newReview.value = ''
}

onMounted(fetchExpert)
</script>

<template>
  <div v-if="loading">
    <p>Загрузка данных собеседника...</p>
  </div>

  <div v-else-if="expert" class="expert-detail">
    <button class="back-btn" @click="goBack">← Вернуться к списку</button>

    <div class="notice">
      💬 Вы можете договориться с Собеседником об удобной форме общения. Ваш приватный разговор может состояться в любом из доступных мессенджеров.
    </div>

    <div class="main-info">
      <img
        v-if="expert.mainPhotoUrl"
        :src="expert.mainPhotoUrl"
        alt="Фото собеседника"
        class="main-photo"
      />
      <div class="details">
        <h1>{{ expert.name }}</h1>
        <p><strong>Возраст:</strong> {{ expert.age }}</p>
        <p><strong>Статус:</strong> {{ expert.status }}</p>
        <p><strong>Стоимость часа:</strong> {{ expert.price }} ₽</p>
        <p><strong>О себе:</strong> {{ expert.about }}</p>
        <p><strong>Разрешённые темы:</strong> {{ expert.allowedTopics }}</p>
        <p><strong>Запрещённые темы:</strong> {{ expert.forbiddenTopics }}</p>
      </div>
    </div>

    <!-- Галерея -->
    <div v-if="expert.galleryUrls?.length" class="gallery">
      <h3>Галерея</h3>
      <div class="gallery-grid">
        <img v-for="(url, idx) in expert.galleryUrls" :key="idx" :src="url" class="gallery-item" />
      </div>
    </div>

    <!-- Рейтинг -->
    <div class="rating-section">
      <h3>Поставить оценку</h3>
      <div class="stars">
        <span
          v-for="star in 5"
          :key="star"
          class="star"
          :class="{ active: star <= newRating }"
          @click="setRating(star)"
        >
          ★
        </span>
      </div>
      <p>Текущий рейтинг: {{ expert.rating || 0 }}</p>
    </div>

    <!-- Отзывы -->
    <div class="reviews">
      <h3>Отзывы</h3>
      <textarea v-model="newReview" placeholder="Напишите отзыв..." rows="3"></textarea>
      <button @click="addReview">Добавить отзыв</button>

      <ul class="review-list">
        <li v-for="(review, index) in expert.reviews" :key="index">
          <p>{{ review.text }}</p>
          <small>{{ review.date }}</small>
        </li>
      </ul>
    </div>
  </div>

  <div v-else>
    <p>Собеседник не найден.</p>
  </div>
</template>

<style scoped>
.expert-detail {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}
.back-btn {
  background: none;
  border: none;
  color: #0077ff;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
}
.main-info {
  display: flex;
  gap: 1rem;
}
.main-photo {
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
}
.details p {
  margin: 0.3rem 0;
}
.gallery {
  margin-top: 2rem;
}
.gallery-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.gallery-item {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}
.stars {
  font-size: 2rem;
  color: #ccc;
  cursor: pointer;
}
.star.active {
  color: gold;
}
.reviews {
  margin-top: 2rem;
}
.review-list {
  list-style: none;
  padding: 0;
}
.review-list li {
  border-bottom: 1px solid #ccc;
  padding: 0.5rem 0;
}
</style>
