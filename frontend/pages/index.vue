<template>
  <div>
    <div class="compact-hero">
      <div class="compact-hero-content">
        <p class="compact-hero-text">
          Собеседник - место, где каждый может найти искреннего друга, поддержку и понимание
        </p>
      </div>
    </div>

    <!-- Поле поиска -->
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск по имени, фамилии, логину, возрасту или Telegram..."
      />
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <label><input type="checkbox" v-model="filters.male" /> Мужчины</label>
      <label><input type="checkbox" v-model="filters.female" /> Женщины</label>
      <label><input type="checkbox" v-model="filters.adultTopics" /> Есть темы 18+</label>
      <label><input type="checkbox" v-model="filters.noForbidden" /> Нет запрещённых тем</label>
      <label><input type="checkbox" v-model="filters.freeNow" /> Сейчас свободен</label>
    </div>

    <h1>Список собеседников</h1>

    <div v-if="store.loading">Загрузка...</div>
    <div v-else-if="filteredExperts.length === 0">Нет доступных собеседников</div>

    <div v-else class="experts-list">
      <ExpertCardMini
        v-for="expert in filteredExperts"
        :key="expert.id"
        :expert="expert"
        @click="goToExpert(expert.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExpertsStore } from '~/stores/expertsStore'
import { useRouter } from 'vue-router'

const store = useExpertsStore()
const router = useRouter()

const searchQuery = ref('')
const filters = ref({
  male: false,
  female: false,
  adultTopics: false,
  noForbidden: false,
  freeNow: false
})

// Фильтруем экспертов: учитываем статус, поиск и фильтры
const filteredExperts = computed(() => {
  return store.experts.filter(expert => {
    if (expert.status === 'pending') return false

    const query = searchQuery.value.toLowerCase()
    const fullName = `${expert.name || ''} ${expert.surname || ''}`.toLowerCase()
    const login = (expert.login || '').toLowerCase()
    const age = expert.age ? expert.age.toString() : ''
    const telegram = (expert.telegram || '').toLowerCase()

    // Поиск
    const matchesSearch =
      fullName.includes(query) ||
      login.includes(query) ||
      age.includes(query) ||
      telegram.includes(query)

    if (!matchesSearch) return false

    // Фильтры
    if (filters.value.male && expert.gender !== 'male') return false
    if (filters.value.female && expert.gender !== 'female') return false
    if (filters.value.adultTopics && (!expert.allowedTopics || !expert.allowedTopics.includes('18+'))) return false
    if (filters.value.noForbidden && expert.forbiddenTopics && expert.forbiddenTopics.length > 0) return false
    if (filters.value.freeNow && expert.status !== 'Свободен') return false

    return true
  })
})

onMounted(async () => {
  await store.syncWithServer()
})

const goToExpert = (id) => {
  router.push(`/experts/${id}`)
}
</script>

<style scoped>
/* Компактный Hero блок */
body {
  background: linear-gradient(to bottom, #87ceeb 0%, #fceabb 70%, #f7e7c7 100%);
  background-attachment: fixed;
  font-family: Arial, sans-serif;
}
.compact-hero {
  background: linear-gradient(135deg, #8394e0 0%, #8666a7 100%);
  color: white;
  padding: 24px 20px;
  margin-bottom: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.compact-hero-text {
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
  max-width: 800px;
  margin: 0 auto;
}

/* Поле поиска */
.search-bar {
  margin: 20px 0;
  text-align: center;
}
.search-bar input {
  width: 300px;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

/* Фильтры */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}
.filters label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

/* Сетки карточек */
.experts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 20px;
}
</style>
