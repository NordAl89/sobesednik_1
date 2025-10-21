<template>
  <div class="admin-login">
    <div class="login-container">
      <h1>Вход в панель администратора</h1>
      
      <!-- Сообщение об истекшей сессии -->
      <div v-if="isSessionExpired" class="session-expired">
        ⚠️ Ваша сессия истекла. Пожалуйста, войдите снова.
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Логин</label>
          <input 
            v-model="form.login" 
            type="text" 
            required 
            placeholder="conversation_admin"
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label>Пароль</label>
          <input 
            v-model="form.password" 
            type="password" 
            required 
            placeholder="111"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useAdminStore } from '~/stores/adminStore'

const adminStore = useAdminStore()
const router = useRouter()

const form = ref({
  login: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const isSessionExpired = ref(false)

// Проверяем, не истекла ли сессия (для показа сообщения)
onMounted(() => {
  // Если уже авторизован - редирект в админку
  if (adminStore.checkAuth()) {
    navigateTo('/admin')
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await adminStore.login(form.value)
    // Перенаправляем в админ-панель
    await navigateTo('/admin')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Стили без изменений */
</style>