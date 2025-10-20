<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h1>Панель администратора</h1>
      <p>Управление анкетами собеседников</p>
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <select v-model="statusFilter" @change="filterExperts">
        <option value="">Все статусы</option>
        <option value="pending">Ожидают оплаты</option>
        <option value="active">Активные</option>
        <option value="draft">Черновики</option>
        <option value="expired">Истекшие</option>
        <option value="rejected">Отклоненные</option>
      </select>
      
      <button @click="refreshData" class="refresh-btn">🔄 Обновить</button>
    </div>

    <!-- Статистика -->
    <div class="stats">
      <div class="stat-card">
        <h3>Всего анкет</h3>
        <p>{{ experts.length }}</p>
      </div>
      <div class="stat-card pending">
        <h3>Ожидают оплаты</h3>
        <p>{{ pendingCount }}</p>
      </div>
      <div class="stat-card active">
        <h3>Активные</h3>
        <p>{{ activeCount }}</p>
      </div>
    </div>

    <!-- Список экспертов -->
    <div class="experts-list">
      <div v-if="loading" class="loading">Загрузка данных...</div>
      
      <div v-else-if="filteredExperts.length === 0" class="empty-state">
        Нет анкет с выбранным фильтром
      </div>

      <div v-else class="expert-cards">
        <div 
          v-for="expert in filteredExperts" 
          :key="expert.id" 
          class="expert-card"
          :class="expert.status"
        >
          <div class="expert-info">
            <h3>{{ expert.name }}</h3>
            <p><strong>Логин:</strong> {{ expert.login }}</p>
            <p><strong>Телеграм:</strong> {{ expert.telegram }}</p>
            <p><strong>Код оплаты:</strong> {{ expert.paymentCode || 'нет' }}</p>
            <p><strong>Статус:</strong> 
              <span :class="`status-${expert.status}`">
                {{ getStatusText(expert.status) }}
              </span>
            </p>
            <p><strong>Создано:</strong> {{ formatDate(expert.createdAt) }}</p>
            <p><strong>Цена:</strong> {{ expert.price }} руб/час</p>
            <p><strong>Темы 18+:</strong> {{ expert.adultTopics ? 'Да' : 'Нет' }}</p>
            <p><strong>Запрещенных тем нет:</strong> {{ expert.noForbiddenTopics ? 'Да' : 'Нет' }}</p>
          </div>

          <div class="admin-actions">
            <button 
              v-if="expert.status === 'pending'" 
              @click="approveExpert(expert.id)"
              class="approve-btn"
            >
              ✅ Одобрить
            </button>
            <button 
              v-if="expert.status === 'pending'" 
              @click="rejectExpert(expert.id)"
              class="reject-btn"
            >
              ❌ Отклонить
            </button>
            <button 
              @click="contactExpert(expert)" 
              class="contact-btn"
            >
              📞 Связаться
            </button>
            <button 
              @click="viewDetails(expert.id)" 
              class="details-btn"
            >
              👁️ Подробнее
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '#app'

const router = useRouter()

const experts = ref([])
const loading = ref(false)
const statusFilter = ref('pending') // По умолчанию показываем ожидающие оплаты

// Загрузка данных
const loadExperts = async () => {
  loading.value = true
  try {
    const response = await $fetch('http://localhost:4000/experts')
    experts.value = response
    console.log('✅ Загружено экспертов:', experts.value.length)
  } catch (error) {
    console.error('❌ Ошибка загрузки экспертов:', error)
    alert('Ошибка загрузки данных')
  } finally {
    loading.value = false
  }
}

// Фильтрация экспертов
const filteredExperts = computed(() => {
  if (!statusFilter.value) return experts.value
  return experts.value.filter(expert => expert.status === statusFilter.value)
})

// Статистика
const pendingCount = computed(() => experts.value.filter(e => e.status === 'pending').length)
const activeCount = computed(() => experts.value.filter(e => e.status === 'active').length)

// Действия администратора
const approveExpert = async (expertId) => {
  try {
    console.log('✅ Одобрение эксперта:', expertId)
    
    const response = await $fetch(`http://localhost:4000/experts/admin/${expertId}/approve`, {
      method: 'POST'
    })
    
    console.log('✅ Ответ от сервера:', response)
    
    // Обновляем локальные данные
    const index = experts.value.findIndex(e => e.id === expertId)
    if (index !== -1) {
      experts.value[index] = { ...experts.value[index], ...response }
    }
    
    alert('Анкета одобрена и опубликована!')
  } catch (error) {
    console.error('❌ Ошибка одобрения:', error)
    alert('Ошибка при одобрении анкеты: ' + error.data?.message || error.message)
  }
}

const rejectExpert = async (expertId) => {
  const reason = prompt('Укажите причину отклонения:')
  if (!reason) return
  
  try {
    console.log('❌ Отклонение эксперта:', expertId, 'Причина:', reason)
    
    const response = await $fetch(`http://localhost:4000/experts/admin/${expertId}/reject`, {
      method: 'POST',
      body: { reason }
    })
    
    console.log('✅ Ответ от сервера:', response)
    
    // Обновляем локальные данные
    const index = experts.value.findIndex(e => e.id === expertId)
    if (index !== -1) {
      experts.value[index] = { ...experts.value[index], ...response }
    }
    
    alert('Анкета отклонена!')
  } catch (error) {
    console.error('❌ Ошибка отклонения:', error)
    alert('Ошибка при отклонении анкеты: ' + error.data?.message || error.message)
  }
}

const contactExpert = (expert) => {
  const telegramUrl = `https://t.me/${expert.telegram.replace('@', '')}`
  window.open(telegramUrl, '_blank')
}

const viewDetails = (expertId) => {
  router.push(`/experts/${expertId}`)
}

// Вспомогательные функции
const getStatusText = (status) => {
  const statusMap = {
    'draft': 'Черновик',
    'pending': 'Ожидает оплаты',
    'active': 'Активна',
    'expired': 'Истекла',
    'rejected': 'Отклонена'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const refreshData = () => {
  loadExperts()
}

// Загрузка при монтировании
onMounted(() => {
  loadExperts()
})
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.refresh-btn {
  padding: 8px 16px;
  background: #2b7bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  text-align: center;
}

.stat-card.pending {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
}

.stat-card.active {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
}

.expert-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.expert-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.expert-card.pending {
  border-left: 4px solid #ffc107;
  background: #fffdf6;
}

.expert-card.active {
  border-left: 4px solid #28a745;
}

.expert-card.rejected {
  border-left: 4px solid #dc3545;
  background: #fef7f7;
}

.expert-info h3 {
  margin-top: 0;
  color: #333;
}

.expert-info p {
  margin: 5px 0;
  font-size: 14px;
}

.status-pending {
  color: #ffc107;
  font-weight: bold;
}

.status-active {
  color: #28a745;
  font-weight: bold;
}

.status-rejected {
  color: #dc3545;
  font-weight: bold;
}

.admin-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.approve-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reject-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.contact-btn {
  padding: 8px 16px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.details-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}
</style>