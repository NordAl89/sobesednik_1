<template>
  <div class="expert-registration">
    <form @submit.prevent="handleSubmit" class="expert-form" enctype="multipart/form-data">
      <h2>{{ isEditMode ? 'Редактирование профиля' : 'Регистрация собеседника' }}</h2>

      <!-- Основные поля -->
      <div class="form-section">
        <h3>Основная информация</h3>
        <p>* Поля обязательные для заполнения </p>
        
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
          Пол *
          <select v-model="form.gender" required>
            <option value="">Выберите пол</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
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
          <textarea
            v-model="form.about"
            required
            placeholder="Коротко о себе, ваших интересах и предпочтениях. В конце можете указать стоимость видео, аудио, письменного общения (до 500 символов)"
            maxlength="500"
          ></textarea>
          <small>{{ form.about.length }}/500</small>
        </label>

        <label>
          Предпочтительные темы *
          <input v-model="form.allowedTopics" type="text" required
            placeholder="Укажите темы наиболее интересные для вас" />
        </label>

        <label>
          Запрещённые темы 
          <input v-model="form.forbiddenTopics" type="text" placeholder="Пропустите это поле, если вы, действительно, готовы обсуждать любые темы" />
        </label>

        <label>
          Стоимость часа общения от*
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
          <label class="checkbox">
            <input type="checkbox" v-model="form.alwaysAvailable" />
            <span>Готов откликаться 24/7</span>            
          </label>
        </div>
      </div>

      <!-- Секция загрузки файлов -->
      <div class="form-section">
        <h3>Фотографии и видео</h3>

        <!-- Главное фото -->
        <label>
          Главное фото (аватар) *
          <input 
            type="file" 
            @change="handleMainPhotoChange"
            accept="image/*"
            :required="!isEditMode"
          />
          <small>Рекомендуемый размер: 500x500px, формат JPG/PNG</small>
          <div v-if="mainPhotoPreview" class="image-preview">
            <img :src="mainPhotoPreview" alt="Предпросмотр главного фото" />
          </div>
        </label>

        <!-- Галерея -->
        <label>
          Галерея (до 10 файлов)
          <input 
            type="file" 
            multiple 
            @change="handleGalleryChange"
            accept="image/*,video/*"
            ref="galleryInput"
          />
          <small>Можно загружать фото и видео до 10MB каждый. Максимум 10 файлов.</small>
          
          <!-- Предпросмотр галереи -->
          <div v-if="galleryPreviews.length" class="gallery-previews">
            <div 
              v-for="(preview, index) in galleryPreviews" 
              :key="index"
              class="gallery-preview-item"
            >
              <img v-if="preview.type === 'image'" :src="preview.url" :alt="`Галерея ${index + 1}`" />
              <video v-else controls :src="preview.url"></video>
              <button 
                type="button" 
                @click="removeGalleryFile(index)"
                class="remove-file-btn"
              >
                ×
              </button>
            </div>
          </div>
          
          <div class="file-count">
            Загружено файлов: {{ galleryFiles.length }}/10
          </div>
        </label>
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
  gender: '', // Добавлено поле пола
  availability: 'Свободен',
  about: '',
  telegram: '',
  otherMessengers: '',
  allowedTopics: '',
  forbiddenTopics: '',
  price: 0,
  adultTopics: false,
  noForbiddenTopics: false,
  alwaysAvailable: false,
})

// Данные для файлов
const mainPhotoFile = ref(null)
const mainPhotoPreview = ref('')
const galleryFiles = ref([])
const galleryPreviews = ref([])
const galleryInput = ref(null)

// Валидация формы
const isFormValid = computed(() => {
  const requiredFields = [
    form.value.login,
    form.value.password,
    form.value.name,
    form.value.age,
    form.value.gender,
    form.value.telegram,
    form.value.about,
    form.value.allowedTopics,
    // form.value.forbiddenTopics,
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
      
      
      // Если есть существующее фото, показываем его
      if (existingExpert.value.mainPhotoUrl) {
        mainPhotoPreview.value = `http://localhost:4000${existingExpert.value.mainPhotoUrl}`
      }
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

// Обработчик главного фото
const handleMainPhotoChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Проверка размера
  if (file.size > 10 * 1024 * 1024) {
    alert('Файл слишком большой. Максимальный размер: 10MB')
    event.target.value = ''
    return
  }

  mainPhotoFile.value = file
  
  // Создание preview
  const reader = new FileReader()
  reader.onload = (e) => {
    mainPhotoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Обработчик галереи
const handleGalleryChange = (event) => {
  const files = Array.from(event.target.files)
  
  // Проверка количества файлов
  if (galleryFiles.value.length + files.length > 10) {
    alert('Максимум можно загрузить 10 файлов')
    event.target.value = ''
    return
  }

  files.forEach(file => {
    // Проверка размера
    if (file.size > 10 * 1024 * 1024) {
      alert(`Файл ${file.name} слишком большой. Максимальный размер: 10MB`)
      return
    }

    // Проверка типа
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert(`Файл ${file.name} должен быть изображением или видео`)
      return
    }

    galleryFiles.value.push(file)
    
    // Создание preview
    const reader = new FileReader()
    reader.onload = (e) => {
      galleryPreviews.value.push({
        url: e.target.result,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      })
    }
    reader.readAsDataURL(file)
  })

  // Очистка input
  if (galleryInput.value) {
    galleryInput.value.value = ''
  }
}

// Удаление файла из галереи
const removeGalleryFile = (index) => {
  galleryFiles.value.splice(index, 1)
  galleryPreviews.value.splice(index, 1)
}

// Основная функция отправки
const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('Пожалуйста, заполните все обязательные поля (отмечены *)')
    return
  }

  // Проверка главного фото только для новой регистрации
  if (!mainPhotoFile.value && !isEditMode.value) {
    alert('Пожалуйста, загрузите главное фото')
    return
  }

  loading.value = true

  try {
    if (isEditMode.value && existingExpert.value) {
      // Режим редактирования (без файлов для простоты)
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

// Подтверждение оплаты с отправкой файлов
const confirmPayment = async () => {
  paymentLoading.value = true
  
  try {
    // Создаем FormData для отправки файлов
    const formData = new FormData()
    
    // Добавляем все поля формы
    Object.keys(form.value).forEach(key => {
      if (form.value[key] !== null && form.value[key] !== undefined) {
        formData.append(key, form.value[key])
      }
    })
    
    // Добавляем файлы
    if (mainPhotoFile.value) {
      formData.append('mainPhoto', mainPhotoFile.value)
    }
    
    galleryFiles.value.forEach((file) => {
      formData.append('gallery', file)
    })
    
    // Добавляем дополнительные данные
    formData.append('paymentCode', paymentCode.value)
    formData.append('status', 'pending')
    
    // Отправляем с файлами
    await expertsStore.addExpertWithFiles(formData)
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

/* Добавьте стили для preview */
.image-preview {
  margin-top: 10px;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.gallery-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.gallery-preview-item {
  position: relative;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.gallery-preview-item img,
.gallery-preview-item video {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.remove-file-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.file-count {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

input[type="file"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
}
</style>