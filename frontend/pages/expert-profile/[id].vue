<template>
  <div class="expert-profile">
    <div v-if="expert" class="profile-container">
      <!-- Верхняя часть -->
      <div class="profile-header">
        <div class="name-rating">
          <h1>{{ expert.name }}</h1>
          <div class="rating">
            ⭐ {{ expert.rating }}/5
          </div>
        </div>
        <button @click="editProfile" class="edit-btn">
          Редактировать профиль
        </button>
      </div>

      <!-- Основная информация -->
      <div class="profile-info">
        <div class="info-section">
          <h3>Основная информация</h3>
          <p><strong>Статус:</strong> {{ expert.status }}</p>
          <p><strong>Возраст:</strong> {{ expert.age }} лет</p>
          <p><strong>Цена:</strong> {{ expert.price }} руб/час</p>
        </div>

        <div class="info-section">
          <h3>О себе</h3>
          <p>{{ expert.about || 'Нет информации' }}</p>
        </div>

        <div class="info-section">
          <h3>Темы</h3>
          <p><strong>Разрешённые:</strong> {{ expert.allowedTopics || 'Все' }}</p>
          <p><strong>Запрещённые:</strong> {{ expert.forbiddenTopics || 'Нет' }}</p>
        </div>
      </div>

      <!-- Отзывы -->
      <div class="reviews-section">
        <h3>Отзывы</h3>
        <div v-if="expert.reviews && expert.reviews.length > 0" class="reviews-list">
          <div v-for="review in expert.reviews" :key="review.id" class="review">
            <div class="review-header">
              <span class="review-author">{{ review.author }}</span>
              <span class="review-rating">⭐ {{ review.rating }}/5</span>
            </div>
            <p class="review-text">{{ review.text }}</p>
            <span class="review-date">{{ review.date }}</span>
          </div>
        </div>
        <div v-else class="no-reviews">
          Пока нет отзывов
        </div>
      </div>

      <button @click="logout" class="logout-btn">
        Выйти
      </button>
    </div>

    <div v-else-if="loading" class="loading">
      Загрузка...
    </div>

    <div v-else class="error">
      Эксперт не найден
    </div>
  </div>
</template>

<script setup>
// ДОБАВИТЬ ЭТИ ИМПОРТЫ:
import { useExpertsStore } from '~/stores/expertsStore'

const route = useRoute();
const router = useRouter();
const expertsStore = useExpertsStore();

const expert = ref(null);
const loading = ref(true);

// Загружаем данные профиля
onMounted(async () => {
  const expertId = route.params.id;
  
  try {
    // Проверяем, авторизован ли пользователь
    if (!expertsStore.currentExpert || expertsStore.currentExpert.id !== expertId) {
      await navigateTo('/expert-login');
      return;
    }

    // Загружаем актуальные данные
    const response = await $fetch(`http://localhost:4000/experts/profile/${expertId}`);
    expert.value = response;
    
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    await navigateTo('/expert-login');
  } finally {
    loading.value = false;
  }
});

const editProfile = () => {
  // Переходим на страницу редактирования с предзаполненными данными
  navigateTo(`/become-expert?edit=${expert.value.id}`);
};

const logout = () => {
  expertsStore.logoutExpert();
  navigateTo('/');
};
</script>

<style scoped>
.expert-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.name-rating {
  display: flex;
  align-items: center;
  gap: 20px;
}

.name-rating h1 {
  margin: 0;
  color: #333;
}

.rating {
  font-size: 1.2em;
  font-weight: bold;
  color: #ffa500;
}

.edit-btn {
  padding: 10px 20px;
  background: #2b7bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.profile-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.info-section {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #f9f9f9;
}

.info-section h3 {
  margin-top: 0;
  color: #333;
}

.reviews-section {
  margin-bottom: 30px;
}

.review {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.review-author {
  font-weight: bold;
}

.review-rating {
  color: #ffa500;
}

.review-date {
  font-size: 0.9em;
  color: #666;
}

.no-reviews {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px;
}

.logout-btn {
  padding: 10px 20px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 50px;
}
</style>