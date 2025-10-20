<template>
  <div class="expert-registration">
    <form @submit.prevent="handleSubmit" class="expert-form">
      <h2>{{ isEditMode ? 'Редактирование профиля' : 'Регистрация собеседника' }}</h2>

      <!-- Основные поля -->
      <div class="form-section">
        <h3>Основная информация</h3>
        
        <label>
          Логин *
          <input v-model="form.login" type="text" required />
        </label>

        <label>
          Пароль *
          <input v-model="form.password" type="password" required />
        </label>

        <label>
          Имя и Фамилия *
          <input v-model="form.name" type="text" required />
        </label>

        <label>
          Возраст *
          <input v-model.number="form.age" type="number" min="18" required />
        </label>

        <label>
          Telegram *
          <input v-model="form.telegram" type="text" placeholder="@username" required />
        </label>

        <label>
          Другие мессенджеры
          <input v-model="form.otherMessengers" type="text" placeholder="WhatsApp, Viber, etc." />
        </label>
      </div>

      <!-- Темы и настройки -->
      <div class="form-section">
        <h3>Темы и настройки</h3>

        <label>
          Занятость
          <select v-model="form.availability">
            <option value="Свободен">Свободен</option>
            <option value="Занят">Занят</option>
          </select>
        </label>

        <label>
          Информация о себе *
          <textarea v-model="form.about" required></textarea>
        </label>

        <label>
          Разрешённые темы *
          <input v-model="form.allowedTopics" type="text" required />
        </label>

        <label>
          Запрещённые темы *
          <input v-model="form.forbiddenTopics" type="text" required />
        </label>

        <label>
          Стоимость часа общения *
          <input v-model.number="form.price" type="number" min="0" required />
        </label>

        <div class="checkboxes">
          <label class="checkbox">
            <input type="checkbox" v-model="form.adultTopics" />
            <span>Готов обсуждать темы 18+</span>
          </label>

          <label class="checkbox">
            <input type="checkbox" v-model="form.noForbiddenTopics" />
            <span>Запрещённых тем нет</span>
          </label>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="action-buttons">
        <button 
          type="submit" 
          :disabled="loading || !isFormValid"
          class="submit-btn"
        >
          {{ loading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Стать собеседником') }}
        </button>

        <button 
          v-if="isEditMode && existingExpert && !existingExpert.adminVerified"
          type="button"
          @click="requestModeration"
          class="moderation-btn"
        >
          Пройти модерацию
        </button>
      </div>
    </form>

    <!-- Модальное окно оплаты -->
    <div v-if="showPaymentModal" class="modal-overlay">
      <div class="payment-modal">
        <h3>Оплата публикации анкеты</h3>
        
        <div class="payment-info">
          <p><strong>Сумма к оплате:</strong> 1000 рублей</p>
          <p><strong>Срок публикации:</strong> 30 дней</p>
          <p><strong>Реквизиты:</strong> 2200 0000 0000 0000 (Тинькофф)</p>
          <p><strong>Код оплаты:</strong> <span class="payment-code">{{ paymentCode }}</span></p>
          <p class="important">Обязательно укажите этот код в комментарии к платежу!</p>
        </div>

        <div class="payment-actions">
          <button @click="confirmPayment" :disabled="paymentLoading" class="confirm-btn">
            {{ paymentLoading ? 'Подтверждение...' : 'Оплата произведена' }}
          </button>
          <button @click="showPaymentModal = false" class="cancel-btn">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { useExpertsStore } from '~/stores/expertsStore'

const route = useRoute()
const router = useRouter()
const expertsStore = useExpertsStore()

// Режимы и состояния
const isEditMode = computed(() => route.query.edit)
const existingExpert = ref(null)
const loading = ref(false)
const paymentLoading = ref(false)
const showPaymentModal = ref(false)
const paymentCode = ref('')

// Данные формы
const form = ref({
  login: '',
  password: '',
  name: '',
  age: null,
  availability: 'Свободен',
  about: '',
  telegram: '',
  otherMessengers: '',
  allowedTopics: '',
  forbiddenTopics: '',
  price: 0,
  adultTopics: false,
  noForbiddenTopics: false
})

// Валидация формы
const isFormValid = computed(() => {
  const requiredFields = [
    form.value.login,
    form.value.password,
    form.value.name,
    form.value.age,
    form.value.telegram,
    form.value.about,
    form.value.allowedTopics,
    form.value.forbiddenTopics,
    form.value.price
  ]
  return requiredFields.every(field => field !== '' && field !== null && field !== 0)
})

// Загрузка данных для редактирования
onMounted(async () => {
  if (isEditMode.value) {
    try {
      const response = await $fetch(`http://localhost:4000/experts/profile/${isEditMode.value}`)
      existingExpert.value = response
      
      // Заполняем форму данными эксперта
      Object.keys(form.value).forEach(key => {
        if (key in existingExpert.value) {
          form.value[key] = existingExpert.value[key]
        }
      })
    } catch (error) {
      console.error('Ошибка загрузки данных эксперта:', error)
    }
  }
})

// Генерация кода оплаты
const generatePaymentCode = () => {
  const randomDigits = Math.floor(100 + Math.random() * 900) // 100-999
  return `${form.value.login}${randomDigits}`
}

// Основная функция отправки
const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('Пожалуйста, заполните все обязательные поля (отмечены *)')
    return
  }

  loading.value = true

  try {
    if (isEditMode.value && existingExpert.value) {
      // Режим редактирования
      await expertsStore.updateExpertProfile(existingExpert.value.id, form.value)
      await navigateTo(`/expert-profile/${existingExpert.value.id}`)
    } else {
      // Режим создания - показываем окно оплаты
      paymentCode.value = generatePaymentCode()
      showPaymentModal.value = true
    }
  } catch (err) {
    console.error('Ошибка:', err)
    alert('Произошла ошибка: ' + err.message)
  } finally {
    loading.value = false
  }
}

// Подтверждение оплаты
const confirmPayment = async () => {
  paymentLoading.value = true
  
  try {
    // Создаем эксперта со статусом pending
    const expertData = {
      ...form.value,
      paymentCode: paymentCode.value,
      status: 'pending'
    }
    
    await expertsStore.addExpert(expertData)
    showPaymentModal.value = false
    await navigateTo('/')
    alert('Анкета отправлена на модерацию! После проверки оплаты она будет опубликована.')
  } catch (err) {
    console.error('Ошибка при создании эксперта:', err)
    alert('Ошибка при создании анкеты: ' + err.message)
  } finally {
    paymentLoading.value = false
  }
}

// Запрос модерации
const requestModeration = async () => {
  try {
    await expertsStore.requestModeration(existingExpert.value.id)
    alert('Запрос на модерацию отправлен! Администратор проверит ваши данные.')
  } catch (err) {
    console.error('Ошибка запроса модерации:', err)
    alert('Ошибка при отправке запроса: ' + err.message)
  }
}
</script>

<style scoped>
.expert-registration {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.expert-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  border: 1px solid #e0e0e0;
  padding: 20px;
  border-radius: 8px;
  background: #fafafa;
}

.form-section h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  margin-bottom: 15px;
}

input,
select,
textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 5px;
}

small {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-weight: normal;
}

.checkboxes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  font-weight: normal;
}

.checkbox input {
  margin-right: 10px;
  margin-top: 0;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.submit-btn {
  flex: 1;
  padding: 15px;
  background: #2b7bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.moderation-btn {
  padding: 15px 20px;
  background: #ffa500;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Стили модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.payment-modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
}

.payment-info {
  margin: 20px 0;
}

.payment-code {
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  color: #2b7bff;
}

.important {
  color: #e74c3c;
  font-weight: bold;
}

.payment-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 10px 20px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 10px 20px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>