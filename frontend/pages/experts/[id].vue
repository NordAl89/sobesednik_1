<template>
  <div v-if="loading">
    <p>Загрузка данных собеседника...</p>
  </div>

  <div v-else-if="expert" class="expert-detail">
    <button class="back-btn" @click="goBack">← Вернуться к списку</button>

    <div class="notice">
      💬 Вы можете договориться с Собеседником об удобной форме общения. Ваш приватный разговор может состояться в любом из доступных мессенджеров.
    </div>

    <!-- Главное фото и информация -->
    <div class="main-info">
      <img
        :src="getImageUrl(expert.mainPhotoUrl) || getDefaultAvatar()"
        alt="Фото собеседника"
        class="main-photo"
      />
      <div class="details">
        <h1>{{ expert.name }}</h1>
        <p><strong>Возраст:</strong> {{ expert.age }}</p>
        <p><strong>Пол:</strong> {{ expert.gender === 'male' ? 'Мужской' : 'Женский' }}</p>
        <p><strong>Статус:</strong> {{ expert.availability }}</p>
        <p><strong>Стоимость часа:</strong> {{ expert.price }} ₽</p>
        <p><strong>О себе:</strong> {{ expert.about }}</p>
        <p><strong>Telegram:</strong> {{ expert.telegram }}</p>
        <p><strong>Разрешённые темы:</strong> {{ expert.allowedTopics }}</p>
        <p><strong>Запрещённые темы:</strong> {{ expert.forbiddenTopics }}</p>
      </div>
    </div>

    <!-- Галерея -->
    <div v-if="galleryUrls && galleryUrls.length" class="gallery">
      <h3>Галерея</h3>
      <div class="gallery-grid">
        <div 
          v-for="(url, idx) in galleryUrls" 
          :key="idx" 
          class="gallery-item"
        >
          <img 
            v-if="isImage(url)" 
            :src="getImageUrl(url)" 
            :alt="`Фото ${idx + 1}`"
            @click="openLightbox(idx)"
          />
          <video 
            v-else 
            controls
            :src="getImageUrl(url)"
            @click="openLightbox(idx)"
          >
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      </div>
    </div>

    <!-- Лайтбокс для галереи -->
    <div v-if="lightboxVisible" class="lightbox" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">×</button>
        <button class="lightbox-nav lightbox-prev" @click="prevImage">‹</button>
        
        <div class="lightbox-media">
          <img 
            v-if="isImage(currentLightboxUrl)" 
            :src="getImageUrl(currentLightboxUrl)" 
            alt="Просмотр галереи"
          />
          <video 
            v-else 
            controls
            autoplay
            :src="getImageUrl(currentLightboxUrl)"
          >
            Ваш браузер не поддерживает видео.
          </video>
        </div>
        
        <button class="lightbox-nav lightbox-next" @click="nextImage">›</button>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'

const route = useRoute()
const router = useRouter()

const expert = ref(null)
const loading = ref(true)
const newRating = ref(0)
const newReview = ref('')

// Лайтбокс состояния
const lightboxVisible = ref(false)
const currentLightboxIndex = ref(0)

// Обрабатываем galleryUrls - может быть строкой или массивом
const galleryUrls = computed(() => {
  if (!expert.value?.galleryUrls) return []
  
  // Если galleryUrls это строка (JSON), парсим её
  if (typeof expert.value.galleryUrls === 'string') {
    try {
      return JSON.parse(expert.value.galleryUrls)
    } catch (error) {
      console.error('Ошибка парсинга galleryUrls:', error)
      return []
    }
  }
  
  // Если это уже массив, возвращаем как есть
  return expert.value.galleryUrls
})

const currentLightboxUrl = computed(() => {
  if (!galleryUrls.value.length) return ''
  return galleryUrls.value[currentLightboxIndex.value]
})

const openLightbox = (index) => {
  currentLightboxIndex.value = index
  lightboxVisible.value = true
}

const closeLightbox = () => {
  lightboxVisible.value = false
}

const nextImage = () => {
  if (!galleryUrls.value.length) return
  currentLightboxIndex.value = (currentLightboxIndex.value + 1) % galleryUrls.value.length
}

const prevImage = () => {
  if (!galleryUrls.value.length) return
  currentLightboxIndex.value = currentLightboxIndex.value === 0 
    ? galleryUrls.value.length - 1 
    : currentLightboxIndex.value - 1
}

// Функция для получения правильного URL изображения
const getImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `http://localhost:4000${url}`
}

// Функция для проверки типа файла (изображение или видео)
const isImage = (url) => {
  if (!url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext))
}

// Функция для аватарки по умолчанию
const getDefaultAvatar = () => {
  // Используем data URL для простоты, можно заменить на путь к файлу в public
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ccircle cx='100' cy='80' r='40' fill='%23ccc'/%3E%3Ccircle cx='100' cy='180' r='60' fill='%23ccc'/%3E%3C/svg%3E"
}

// Вернуться на главную
const goBack = () => router.push('/')

// Получение данных эксперта с backend
const fetchExpert = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const response = await $fetch(`http://localhost:4000/experts/${id}`)
    expert.value = response
    newRating.value = expert.value.rating || 0
    
    console.log('✅ Данные эксперта загружены:', expert.value)
    console.log('📸 Главное фото URL:', expert.value.mainPhotoUrl)
    console.log('🖼️ Галерея URLs:', expert.value.galleryUrls)
  } catch (err) {
    console.error('❌ Ошибка загрузки данных эксперта:', err)
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

  try {
    await $fetch(`http://localhost:4000/experts/${expert.value.id}/rating`, {
      method: 'PATCH',
      body: { rating: star }
    })
  } catch (error) {
    console.error('❌ Ошибка обновления рейтинга:', error)
  }
}

// Добавление отзыва
const addReview = async () => {
  if (!expert.value || !newReview.value.trim()) return
  
  const review = {
    text: newReview.value,
    date: new Date().toLocaleString()
  }
  
  try {
    await $fetch(`http://localhost:4000/experts/${expert.value.id}/reviews`, {
      method: 'POST',
      body: review
    })
    
    expert.value.reviews = expert.value.reviews || []
    expert.value.reviews.push(review)
    newReview.value = ''
  } catch (error) {
    console.error('❌ Ошибка добавления отзыва:', error)
  }
}

onMounted(fetchExpert)
</script>

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
  padding: 8px 16px;
  border: 1px solid #0077ff;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #0077ff;
  color: white;
}

.notice {
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  color: #1565c0;
}

.main-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.main-photo {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.details {
  flex: 1;
}

.details h1 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 2rem;
}

.details p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

.details strong {
  color: #34495e;
}

.gallery {
  margin: 3rem 0;
  padding: 2rem 0;
  border-top: 1px solid #e0e0e0;
}

.gallery h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.gallery-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.gallery-item img,
.gallery-item video {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

/* Стили для лайтбокса */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 36px;
  cursor: pointer;
  z-index: 1001;
  padding: 5px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 28px;
  padding: 15px 20px;
  cursor: pointer;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-prev {
  left: 20px;
}

.lightbox-next {
  right: 20px;
}

.lightbox-media {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-media img,
.lightbox-media video {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.rating-section {
  margin: 3rem 0;
  padding: 2rem 0;
  border-top: 1px solid #e0e0e0;
}

.rating-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.stars {
  font-size: 2.5rem;
  color: #ccc;
  cursor: pointer;
  margin-bottom: 1rem;
}

.star {
  margin: 0 5px;
  transition: color 0.2s ease;
}

.star:hover {
  color: #ffd700;
}

.star.active {
  color: #ffd700;
}

.rating-section p {
  font-size: 1.1rem;
  color: #666;
}

.reviews {
  margin: 3rem 0;
  padding: 2rem 0;
  border-top: 1px solid #e0e0e0;
}

.reviews h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.reviews textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.reviews button {
  background: #0077ff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.reviews button:hover {
  background: #0056cc;
}

.review-list {
  list-style: none;
  padding: 0;
  margin-top: 2rem;
}

.review-list li {
  border-bottom: 1px solid #eee;
  padding: 1.5rem 0;
}

.review-list li:last-child {
  border-bottom: none;
}

.review-list p {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

.review-list small {
  color: #666;
  font-size: 0.9rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .expert-detail {
    padding: 0.5rem;
  }

  .main-info {
    flex-direction: column;
    gap: 1rem;
  }

  .main-photo {
    width: 100%;
    max-width: 300px;
    height: 300px;
    margin: 0 auto;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .gallery-item img,
  .gallery-item video {
    height: 150px;
  }

  .lightbox-nav {
    width: 50px;
    height: 50px;
    font-size: 24px;
    padding: 10px 15px;
  }

  .lightbox-prev {
    left: 10px;
  }

  .lightbox-next {
    right: 10px;
  }

  .stars {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .details h1 {
    font-size: 1.5rem;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .gallery-item img,
  .gallery-item video {
    height: 120px;
  }
}
</style>