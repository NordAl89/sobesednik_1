<template>
  <div class="expert-profile">
    <div v-if="expert" class="profile-container">
      <!-- Таймер обратного отсчета -->
      <!-- <div v-if="!isExpired && timeLeft > 0" class="countdown-timer">
        <div class="timer-content">
          <span class="timer-icon">⏰</span>
          <span class="timer-text">До удаления анкеты:</span>
          <span class="timer-display">{{ formattedTime }}</span>
        </div>
        <div class="timer-progress">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div> -->

      <!-- Баннер истечения срока -->
      <div v-if="isExpired" class="expired-banner">
        ⚠️ Срок публикации вашей анкеты истек. Анкета будет удалена.
      </div>

      <!-- Верхняя часть -->
      <div class="profile-header">
        <div class="name-rating">
          <h1>{{ expert.name }}</h1>
          <div class="rating">
            ⭐ {{ expert.rating }}/5
          </div>
        </div>
        <div class="header-actions">
          <button @click="editProfile" class="edit-btn" :disabled="isExpired">
            Редактировать профиль
          </button>
          <!-- <div class="expiration-info">
            <span v-if="!isExpired && timeLeft > 0">Осталось: {{ formattedTime }}</span>
            <span v-else-if="isExpired" style="color: #ff4757;">Анкета истекла</span>
            <span v-else style="color: #f39c12;">Срок не установлен</span>
          </div> -->
        </div>
      </div>

      <!-- Основная информация -->
      <div class="profile-info">
        <div class="info-section">
          <h3>Основная информация</h3>
          <!-- Таймер обратного отсчета -->
            <div v-if="!isExpired && timeLeft > 0" class="countdown-timer">
             ⏰ Осталось времени до удаления анкеты: {{ formattedTime }}
            </div>
            <div v-else-if="isExpired" class="expired-banner">
              ⚠️ Срок публикации вашей анкеты истек. Анкета будет удалена.
            </div>
          <p><strong>Статус:</strong> 
            <span :class="statusClass">{{ getStatusText(expert.status) }}</span>
          </p>
          <p><strong>Возраст:</strong> {{ expert.age }} лет</p>
          <p><strong>Цена от:</strong> {{ expert.price }} руб/час</p>
          <p><strong>Опубликована:</strong> {{ formatDate(expert.publishedAt) }}</p>
          <p><strong>Действует до:</strong> {{ formatDate(expert.expiresAt) }}</p>
         
        </div>

        <div class="info-section">
          <h3>О себе</h3>
          <p>{{ expert.about || 'Нет информации' }}</p>
        </div>

        <div class="info-section">
          <h3>Темы</h3>
          <p><strong>Разрешённые:</strong> {{ expert.allowedTopics || 'Все' }}</p>
          <p><strong>Запрещённые:</strong> {{ expert.forbiddenTopics || 'Нет' }}</p>
          <p><strong>Темы 18+:</strong> {{ expert.adultTopics ? '✅ Да' : '❌ Нет' }}</p>
          <p><strong>Запрещенных тем нет:</strong> {{ expert.noForbiddenTopics ? '✅ Да' : '❌ Нет' }}</p>
        </div>

        <!-- Контактная информация -->
        <div class="info-section">
          <h3>Контактная информация</h3>
          <p><strong>Telegram:</strong> {{ expert.telegram || 'Не указан' }}</p>
          <p v-if="expert.otherMessengers"><strong>Другие мессенджеры:</strong> {{ expert.otherMessengers }}</p>
          
        </div>
      </div>

      <!-- Действия -->
      <div class="action-section" v-if="!isExpired">
        <h3>Действия</h3>
        <p>Для верификации данных (необязательная процедура) и по другим вопросам вы можете связаться с администратором. Возможно, ответы на Ваши вопросы уже есть в нашем
         <NuxtLink to="/faq" class="faq-link">FAQ</NuxtLink>. 
        </p>
        <div class="action-buttons">
          <button @click="requestModeration" class="moderation-btn" v-if="expert.status === 'draft'">
            Отправить на модерацию
          </button>
          <button @click="contactAdmin" class="contact-admin-btn">
            Связаться с администратором
          </button>
          <button @click="extendPublication" class="extend-publication-btn">
            Продлить публикацию
          </button>
          <button @click="toMyProfile" class="to-my-profile-btn">
            Моя анкета
          </button>
          <button @click="deleteProfile" class="delete-btn">
            Удалить анкету
          </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExpertsStore } from '~/stores/expertsStore';

const route = useRoute();
const router = useRouter();
const expertsStore = useExpertsStore();

const expert = ref(null);
const loading = ref(true);
const isExpired = ref(false);
const timeLeft = ref(5); // минуты
const countdownInterval = ref(null);

// Таймер обратного отсчета
const startCountdown = () => {
  if (!expert.value?.expiresAt) return;

  const updateCountdown = () => {
    const now = new Date().getTime();
    const expiresAt = new Date(expert.value.expiresAt).getTime();
    const diffMinutes = Math.ceil((expiresAt - now) / (60 * 1000));

    timeLeft.value = Math.max(diffMinutes, 0);

    if (timeLeft.value <= 0) {
      isExpired.value = true;
      clearInterval(countdownInterval.value);
      alert('⏰ Время жизни анкеты истекло! Анкета будет удалена.');
      checkExpertStatus();
    }
  };

  updateCountdown(); // сразу
  countdownInterval.value = setInterval(updateCountdown, 60 * 1000); // каждая минута
};

// Форматирование времени для отображения
const formattedTime = computed(() => `${timeLeft.value} мин`);

// Проверка статуса анкеты
const checkExpertStatus = async () => {
  try {
    const response = await $fetch(`http://localhost:4000/experts/${expert.value.id}`);
    // Обновляем статус на expired
    await expertsStore.updateExpertProfile(expert.value.id, { 
      status: 'expired',
      availability: 'Неактивен'
    });
    expert.value.status = 'expired';
  } catch (error) {
    if (error.status === 404) {
      alert('Анкета была удалена с сервера.');
      await router.push('/');
    } else {
      console.error('Ошибка проверки статуса:', error);
    }
  }
};

// Загрузка данных эксперта
onMounted(async () => {
  const expertId = route.params.id;
  
  try {
    if (!expertsStore.currentExpert || expertsStore.currentExpert.id !== expertId) {
      await router.push('/expert-login');
      return;
    }

    const response = await $fetch(`http://localhost:4000/experts/${expertId}`);
    expert.value = response;

    startCountdown();
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    await router.push('/expert-login');
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (countdownInterval.value) clearInterval(countdownInterval.value);
});

// Другие функции
const editProfile = () => {
  if (isExpired.value) {
    alert('Анкета истекла. Для редактирования обратитесь к администратору.');
    return;
  }
  router.push(`/become-expert?edit=${expert.value.id}`);
};

const requestModeration = async () => {
  try {
    await expertsStore.requestModeration(expert.value.id);
    alert('Запрос на модерацию отправлен!');
    const response = await $fetch(`http://localhost:4000/experts/profile/${expert.value.id}`);
    expert.value = response;
  } catch (error) {
    console.error('Ошибка запроса модерации:', error);
    alert('Ошибка при отправке запроса: ' + error.message);
  }
};

const contactAdmin = () => {
  window.open('https://t.me/alaskaRiver39', '_blank');
};
const extendPublication = () => {
  alert('Здесь нужно сделать переадресацию на продление публикации');
};
const toMyProfile = () => {
  router.push(`/experts/${expertsStore.currentExpert.id}?edit=${expert.value.id}`);
};

const logout = () => {
  expertsStore.logoutExpert();
  router.push('/');
};

const deleteProfile = async () => {
  if (!confirm('Вы уверены, что хотите удалить свою анкету?')) return;

  try {
    await $fetch(`http://localhost:4000/experts/${expert.value.id}`, { method: 'DELETE' });
    alert('Анкета удалена.');
    expertsStore.logoutExpert();
    router.push('/');
  } catch (error) {
    console.error('Ошибка при удалении анкеты:', error);
    alert('Не удалось удалить анкету.');
  }
};

// Статусы
const getStatusText = (status) => ({
  draft: 'Черновик',
  pending: 'Ожидает модерации',
  active: 'Активна',
  expired: 'Истекла',
  rejected: 'Отклонена'
}[status] || status);

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
  } catch {
    return 'ошибка формата';
  }
};
</script>


<style scoped>
.expert-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Таймер обратного отсчета */
.countdown-timer {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.timer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.timer-icon {
  font-size: 24px;
}

.timer-text {
  font-weight: 600;
  font-size: 16px;
}

.timer-display {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 5px;
}

.timer-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: white;
  transition: width 1s linear;
  border-radius: 3px;
}

.timer-value {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #ff6b6b;
  font-size: 16px;
}

/* Баннеры */
.expired-banner {
  background: #ff4757;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.warning-banner {
  background: #ffa502;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.edit-btn {
  padding: 10px 20px;
  background: #2b7bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.expiration-info {
  font-size: 0.9em;
  color: #666;
  text-align: right;
}

/* Статусы */
.status-active {
  color: #27ae60;
  font-weight: bold;
}

.status-expired {
  color: #ff4757;
  font-weight: bold;
}

.status-pending {
  color: #f39c12;
  font-weight: bold;
}

.status-draft {
  color: #95a5a6;
  font-weight: bold;
}

.status-rejected {
  color: #e74c3c;
  font-weight: bold;
}

.profile-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

/* Секция действий */
.action-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e3f2fd;
  border-radius: 8px;
  background: #f3f9ff;
}

.faq-link {
  color: #1976d2;
  text-decoration: underline;
  font-weight: 500;
}

.faq-link:hover {
  color: #0d47a1;
  text-decoration: none;
}


.action-section h3 {
  margin-top: 0;
  color: #1976d2;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.moderation-btn {
  padding: 10px 20px;
  background: #ffa500;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.contact-admin-btn {
  padding: 10px 20px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.extend-publication-btn
{
  padding: 10px 20px;
  background: #1e9970;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.to-my-profile-btn
{
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.delete-btn {
  padding: 10px 20px;
  background: #8b0000;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.delete-btn:hover {
  background: #b22222;
}


/* Отладочная секция */
.debug-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  background: #fff9e6;
}

.debug-section h3 {
  margin-top: 0;
  color: #e67e22;
}

.debug-info {
  font-size: 14px;
  color: #7f8c8d;
}

.debug-info p {
  margin: 5px 0;
}

/* Отзывы */
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

.error {
  text-align: center;
  padding: 50px;
  color: #ff4757;
}

/* Адаптивность */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .header-actions {
    align-items: flex-start;
    width: 100%;
  }
  
  .profile-info {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .timer-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>