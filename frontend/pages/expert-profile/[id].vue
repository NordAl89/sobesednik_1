<template>
  <div class="expert-profile">
    <div v-if="expert" class="profile-container">
      <!-- Отладочная информация -->
      <div class="debug-info" v-if="showDebug">
        <strong>Отладка:</strong> 
        Статус: {{ expert.status }}, 
        expiresAt: {{ expert.expiresAt }}, 
        publishedAt: {{ expert.publishedAt }},
        Осталось дней: {{ daysLeft }}
        <button @click="showDebug = false" class="hide-debug">Скрыть</button>
      </div>

      <!-- Баннер истечения срока -->
      <div v-if="isExpired" class="expired-banner">
        ⚠️ Срок публикации вашей анкеты истек. Для продления обратитесь к администратору.
      </div>

      <div v-else-if="daysLeft <= 7 && daysLeft > 0" class="warning-banner">
        ⏳ До окончания публикации осталось {{ daysLeft }} {{ daysText }}. Для продления обратитесь к администратору.
      </div>

      <!-- Верхняя часть -->
      <div class="profile-header">
        <div class="name-rating">
          <h1>{{ expert.name }}</h1>
          <div class="rating">
            ⭐ {{ expert.rating }}/5
          </div>
          <button @click="showDebug = !showDebug" class="debug-btn" v-if="!showDebug">🐛</button>
        </div>
        <div class="header-actions">
          <button @click="editProfile" class="edit-btn" :disabled="isExpired">
            Редактировать профиль
          </button>
          <div class="expiration-info">
            <span v-if="!isExpired && daysLeft > 0">Активна ещё: {{ daysLeft }} {{ daysText }}</span>
            <span v-else-if="isExpired" style="color: #ff4757;">Анкета истекла</span>
            <span v-else-if="expert.status === 'active'" style="color: #f39c12;">Срок не установлен</span>
            <span v-else>{{ getStatusText(expert.status) }}</span>
          </div>
        </div>
      </div>

      <!-- Основная информация -->
      <div class="profile-info">
        <div class="info-section">
          <h3>Основная информация</h3>
          <p><strong>Статус:</strong> 
            <span :class="statusClass">{{ getStatusText(expert.status) }}</span>
          </p>
          <p><strong>Возраст:</strong> {{ expert.age }} лет</p>
          <p><strong>Цена:</strong> {{ expert.price }} руб/час</p>
          <p><strong>Опубликована:</strong> {{ formatDate(expert.publishedAt) }}</p>
          <p><strong>Действует до:</strong> {{ formatDate(expert.expiresAt) }}</p>
          <p><strong>Осталось дней:</strong> 
            <span v-if="daysLeft > 0 && !isExpired">{{ daysLeft }} {{ daysText }}</span>
            <span v-else-if="isExpired" style="color: #ff4757;">0 (анкета истекла)</span>
            <span v-else style="color: #f39c12;">не установлено</span>
          </p>
          <p v-if="expert.adminVerified !== undefined">
            <strong>Проверен администратором:</strong> 
            {{ expert.adminVerified ? '✅ Да' : '❌ Нет' }}
          </p>
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

        <!-- Контактная информация -->
        <div class="info-section">
          <h3>Контактная информация</h3>
          <p><strong>Telegram:</strong> {{ expert.telegram || 'Не указан' }}</p>
          <p v-if="expert.otherMessengers"><strong>Другие мессенджеры:</strong> {{ expert.otherMessengers }}</p>
          <p><strong>Темы 18+:</strong> {{ expert.adultTopics ? '✅ Да' : '❌ Нет' }}</p>
          <p><strong>Запрещенных тем нет:</strong> {{ expert.noForbiddenTopics ? '✅ Да' : '❌ Нет' }}</p>
        </div>
      </div>

      <!-- Действия -->
      <div class="action-section" v-if="!isExpired">
        <h3>Действия</h3>
        <div class="action-buttons">
          <button @click="requestModeration" class="moderation-btn" v-if="expert.status === 'draft'">
            Отправить на модерацию
          </button>
          <button @click="contactAdmin" class="contact-admin-btn">
            Связаться с администратором
          </button>
          <!-- Временная кнопка для установки дат -->
          <button @click="setTestDates" class="test-btn" v-if="expert.status === 'active' && !expert.expiresAt">
            🛠 Установить тестовые даты
          </button>
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
import { useExpertsStore } from '~/stores/expertsStore'

const route = useRoute();
const router = useRouter();
const expertsStore = useExpertsStore();

const expert = ref(null);
const loading = ref(true);
const isExpired = ref(false);
const daysLeft = ref(0);
const daysText = ref('');
const showDebug = ref(false);

// Загружаем данные профиля
onMounted(async () => {
  const expertId = route.params.id;
  
  try {
    // Проверяем, авторизован ли пользователь
    if (!expertsStore.currentExpert || expertsStore.currentExpert.id !== expertId) {
      await navigateTo('/expert-login');
      return;
    }

    // Загружаем актуальные данные - используем findOne вместо profile для получения всех полей
    const response = await $fetch(`http://localhost:4000/experts/${expertId}`);
    expert.value = response;
    
    console.log('📊 Полные данные эксперта:', expert.value);
    
    // Проверяем срок действия анкеты
    checkExpiration();
    
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    // Пробуем загрузить через profile endpoint
    try {
      const response = await $fetch(`http://localhost:4000/experts/profile/${expertId}`);
      expert.value = response;
      checkExpiration();
    } catch (secondError) {
      console.error('Ошибка загрузки через profile endpoint:', secondError);
      await navigateTo('/expert-login');
    }
  } finally {
    loading.value = false;
  }
});

// Проверка срока действия анкеты
const checkExpiration = () => {
  if (!expert.value.expiresAt) {
    console.log('⚠️ expiresAt не установлен');
    daysLeft.value = 0;
    
    // Если статус active, но expiresAt не установлен - временно рассчитываем
    if (expert.value.status === 'active') {
      const publishedAt = expert.value.publishedAt ? new Date(expert.value.publishedAt) : new Date();
      const expiresAt = new Date(publishedAt);
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const now = new Date();
      const timeDiff = expiresAt.getTime() - now.getTime();
      daysLeft.value = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
    }
    
    isExpired.value = false;
    return;
  }
  
  const now = new Date();
  const expiresAt = new Date(expert.value.expiresAt);
  
  console.log('📅 Проверка срока:', {
    сейчас: now.toISOString(),
    истекает: expiresAt.toISOString()
  });
  
  // Правильный расчет разницы в днях
  const timeDiff = expiresAt.getTime() - now.getTime();
  daysLeft.value = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
  
  console.log('📈 Расчет дней:', {
    разницаВМс: timeDiff,
    днейОсталось: daysLeft.value
  });
  
  // Определяем текст для склонения
  if (daysLeft.value === 1) daysText.value = 'день';
  else if (daysLeft.value >= 2 && daysLeft.value <= 4) daysText.value = 'дня';
  else daysText.value = 'дней';
  
  // Проверяем, истекла ли анкета
  if (timeDiff <= 0 && expert.value.status === 'active') {
    isExpired.value = true;
    console.log('🔴 Анкета истекла, обновляем статус...');
    // Автоматически обновляем статус на expired
    updateExpiredStatus();
  } else if (expert.value.status === 'expired') {
    isExpired.value = true;
    daysLeft.value = 0;
  } else {
    isExpired.value = false;
  }
  
  console.log('✅ Результат проверки:', {
    истекла: isExpired.value,
    днейОсталось: daysLeft.value,
    текст: daysText.value
  });
};

// Обновление статуса на expired
const updateExpiredStatus = async () => {
  try {
    console.log('🔄 Обновление статуса на expired...');
    await expertsStore.updateExpertProfile(expert.value.id, { 
      status: 'expired',
      availability: 'Неактивен'
    });
    expert.value.status = 'expired';
    expert.value.availability = 'Неактивen';
    console.log('✅ Статус обновлен на expired');
  } catch (error) {
    console.error('❌ Ошибка при обновлении статуса:', error);
  }
};

// Установить тестовые даты
const setTestDates = async () => {
  try {
    const publishedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const updateData = {
      publishedAt: publishedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    
    console.log('🛠 Установка тестовых дат:', updateData);
    
    await expertsStore.updateExpertProfile(expert.value.id, updateData);
    
    // Обновляем локальные данные
    expert.value.publishedAt = updateData.publishedAt;
    expert.value.expiresAt = updateData.expiresAt;
    
    // Пересчитываем дни
    checkExpiration();
    
    alert('✅ Тестовые даты установлены! Осталось дней: ' + daysLeft.value);
  } catch (error) {
    console.error('❌ Ошибка установки дат:', error);
    alert('Ошибка: ' + error.message);
  }
};

// Текстовое представление статуса
const getStatusText = (status) => {
  const statusMap = {
    'draft': 'Черновик',
    'pending': 'Ожидает модерации',
    'active': 'Активна',
    'expired': 'Истекла',
    'rejected': 'Отклонена'
  };
  return statusMap[status] || status;
};

// CSS класс для статуса
const statusClass = computed(() => {
  switch (expert.value?.status) {
    case 'active': return 'status-active';
    case 'expired': return 'status-expired';
    case 'pending': return 'status-pending';
    case 'draft': return 'status-draft';
    case 'rejected': return 'status-rejected';
    default: return '';
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'не указана';
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'ошибка формата';
  }
};

const editProfile = () => {
  if (isExpired.value) {
    alert('Анкета истекла. Для редактирования обратитесь к администратору.');
    return;
  }
  navigateTo(`/become-expert?edit=${expert.value.id}`);
};

const requestModeration = async () => {
  try {
    await expertsStore.requestModeration(expert.value.id);
    alert('Запрос на модерацию отправлен!');
    // Обновляем данные
    const response = await $fetch(`http://localhost:4000/experts/profile/${expert.value.id}`);
    expert.value = response;
    checkExpiration();
  } catch (error) {
    console.error('Ошибка запроса модерации:', error);
    alert('Ошибка при отправке запроса: ' + error.message);
  }
};

const contactAdmin = () => {
  const adminTelegram = 'https://t.me/your_admin_username';
  window.open(adminTelegram, '_blank');
};

const logout = () => {
  expertsStore.logoutExpert();
  navigateTo('/');
};
</script>

<style scoped>
/* Добавьте эти стили к существующим */
.debug-info {
  background: #f8f9fa;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hide-debug {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
}

.debug-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 5px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  margin-left: 10px;
}

.test-btn {
  padding: 10px 15px;
  background: #9b59b6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}

/* Остальные стили без изменений */
</style>