<template>
  <div class="login-page">
    <h1>Вход в личный кабинет</h1>
    <form @submit.prevent="handleLogin" class="login-form">
      <label>
        Логин
        <input v-model="form.login" type="text" required />
      </label>
      
      <label>
        Пароль
        <input v-model="form.password" type="password" required />
      </label>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>
      
      <div v-if="error" class="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { useExpertsStore } from '~/stores/expertsStore'
const form = ref({
  login: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('📤 Отправка данных для входа:', form.value)
    
    const response = await $fetch('http://localhost:4000/experts/login', {
      method: 'POST',
      body: form.value
    })
    
    console.log('✅ Успешный вход. Ответ сервера:', response)
    
    const expertsStore = useExpertsStore()
    expertsStore.setCurrentExpert(response)
    
    console.log('🔄 Переход в личный кабинет...')
    await navigateTo(`/expert-profile/${response.id}`)
    
  } catch (err) {
    console.error('❌ Ошибка входа:', err)
    console.log('🔍 Детали ошибки:', err.data)
    error.value = 'Неверный логин или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px;
  background: #2b7bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: red;
  text-align: center;
  font-size: 0.9em;
}
</style>