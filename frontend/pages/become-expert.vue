<template>
  <form @submit.prevent="handleSubmit" class="expert-form">
    <h2>{{ isEditMode ? 'Редактирование профиля' : 'Регистрация' }}</h2>

    <label>
      Логин
      <input v-model="form.login" type="text" required />
    </label>

    <label>
      Пароль
      <input v-model="form.password" type="password" required />
    </label>

    <label>
      Имя и Фамилия
      <input v-model="form.name" type="text" required />
    </label>

    <label>
      Возраст
      <input v-model.number="form.age" type="number" min="18" required />
    </label>

    <label>
      Занятость
      <select v-model="form.status">
        <option value="Свободен">Свободен</option>
        <option value="Занят">Занят</option>
      </select>
    </label>

    <label>
      Информация о себе
      <textarea v-model="form.about"></textarea>
    </label>

    <label>
      Разрешённые темы
      <input v-model="form.allowedTopics" type="text" />
    </label>

    <label>
      Запрещённые темы
      <input v-model="form.forbiddenTopics" type="text" />
    </label>

    <label>
      Стоимость часа общения
      <input v-model.number="form.price" type="number" min="0" />
    </label>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Стать собеседником') }}
    </button>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { useExpertsStore } from '~/stores/expertsStore'

const route = useRoute()
const router = useRouter()
const expertsStore = useExpertsStore()

// Определяем, редактируем ли мы существующий профиль
const isEditMode = computed(() => route.query.edit)
const existingExpert = ref(null)
const loading = ref(false)

const form = ref({
  login: '',
  password: '',
  name: '',
  age: null,
  status: 'Свободен',
  about: '',
  allowedTopics: '',
  forbiddenTopics: '',
  price: 0
})

// Загружаем данные для редактирования
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

// Единственная функция handleSubmit
const handleSubmit = async () => {
  loading.value = true

  try {
    if (isEditMode.value && existingExpert.value) {
      console.log('🔄 Режим редактирования через хранилище')
      
      // Используем метод хранилища
      await expertsStore.updateExpertProfile(existingExpert.value.id, form.value)
      await navigateTo(`/expert-profile/${existingExpert.value.id}`)
    } else {
      await expertsStore.addExpert(form.value)
      await navigateTo('/')
    }
  } catch (err) {
    console.error('Ошибка:', err)
    alert('Произошла ошибка: ' + err.message)
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.expert-form {
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 30px auto;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
}

input,
select,
textarea {
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  margin-top: 20px;
  padding: 10px;
  background: #2b7bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>