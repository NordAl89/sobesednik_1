<template>
  <div @scroll.passive="handleScroll" class="page-container">
    <div class="compact-hero">
      <div class="compact-hero-content">
        <p class="compact-hero-text">
          Собеседник — место, где каждый может найти искреннего друга, поддержку и понимание
        </p>
      </div>
    </div>

    <!-- Поиск -->
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

    <!-- Список экспертов -->
    <div v-else class="experts-list">
      <ExpertCardMini
        v-for="expert in paginatedExperts"
        :key="expert.id"
        :expert="expert"
        @click="goToExpert(expert.id)"
      />
    </div>

    <!-- Кнопка "Показать ещё" -->
    <div v-if="hasMoreExperts" class="show-more">
      <button @click="showMore" :disabled="isLoadingMore">
        {{ isLoadingMore ? 'Загрузка...' : 'Показать ещё' }}
      </button>
    </div>

    <!-- Нумерация страниц -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="{ active: page === currentPage }"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useExpertsStore } from '~/stores/expertsStore'
import { useRouter } from 'vue-router'

const store = useExpertsStore()
const router = useRouter()

// состояние
const searchQuery = ref('')
const filters = ref({
  male: false,
  female: false,
  adultTopics: false,
  noForbidden: false,
  freeNow: false
})
const expertsPerPage = 5
const currentPage = ref(1)
const isLoadingMore = ref(false)

// фильтрация
const filteredExperts = computed(() => {
  return store.experts.filter(expert => {
    if (expert.status === 'pending') return false

    const query = searchQuery.value.toLowerCase()
    const fullName = `${expert.name || ''} ${expert.surname || ''}`.toLowerCase()
    const login = (expert.login || '').toLowerCase()
    const age = expert.age ? expert.age.toString() : ''
    const telegram = (expert.telegram || '').toLowerCase()

    const matchesSearch =
      fullName.includes(query) ||
      login.includes(query) ||
      age.includes(query) ||
      telegram.includes(query)

    if (!matchesSearch) return false
    if (filters.value.male && expert.gender !== 'male') return false
    if (filters.value.female && expert.gender !== 'female') return false
    if (filters.value.adultTopics && (!expert.allowedTopics || !expert.allowedTopics.includes('18+'))) return false
    if (filters.value.noForbidden && expert.forbiddenTopics && expert.forbiddenTopics.length > 0) return false
    if (filters.value.freeNow && expert.status !== 'Свободен') return false

    return true
  })
})

// страничная логика
const totalPages = computed(() => Math.ceil(filteredExperts.value.length / expertsPerPage))
const paginatedExperts = computed(() => filteredExperts.value.slice(0, currentPage.value * expertsPerPage))
const hasMoreExperts = computed(() => paginatedExperts.value.length < filteredExperts.value.length)

function showMore() {
  if (!hasMoreExperts.value) return
  isLoadingMore.value = true
  setTimeout(() => {
    currentPage.value++
    isLoadingMore.value = false
  }, 600)
}

function goToPage(page) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScroll(e) {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 100 && hasMoreExperts.value && !isLoadingMore.value) {
    showMore()
  }
}

onMounted(async () => {
  await store.syncWithServer()
})

// при изменении фильтров или поиска — сброс страницы
watch([searchQuery, filters], () => {
  currentPage.value = 1
})
const goToExpert = (id) => router.push(`/experts/${id}`)
</script>

<style scoped>
.page-container {
  height: 100vh;
  overflow-y: auto;
  padding: 0 16px 40px;
  max-width: 1600px;
  margin: 0 auto;
}

/* ---------- Фон и шрифт ---------- */
body {
  background: linear-gradient(to bottom, #87ceeb 0%, #fceabb 70%, #f7e7c7 100%);
  background-attachment: fixed;
  font-family: "Inter", "Arial", sans-serif;
  color: #222;
}

/* ---------- Hero ---------- */
.compact-hero {
  background: linear-gradient(135deg, #8394e0 0%, #8666a7 100%);
  color: white;
  padding: clamp(16px, 4vw, 32px);
  margin-bottom: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.compact-hero-text {
  font-size: clamp(1rem, 2vw, 1.4rem);
  line-height: 1.5;
  font-weight: 500;
  max-width: 800px;
  margin: 0 auto;
}

/* ---------- Поиск ---------- */
.search-bar {
  margin: 20px 0;
  text-align: center;
}
.search-bar input {
  width: 100%;
  max-width: 400px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
  transition: 0.2s;
}
.search-bar input:focus {
  border-color: #667eea;
  outline: none;
}

/* ---------- Фильтры ---------- */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}
.filters label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  background: #f7f7fa;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.filters label:hover {
  background: #eee;
}

/* ---------- Сетка карточек ---------- */
.experts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

/* ---------- Кнопка "Показать ещё" ---------- */
.show-more {
  text-align: center;
  margin-top: 20px;
}
.show-more button {
  padding: 10px 18px;
  background-color: #667eea;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.3s;
}
.show-more button:hover {
  background-color: #556cd6;
}
.show-more button:disabled {
  opacity: 0.7;
  cursor: default;
}

/* ---------- Пагинация ---------- */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
  flex-wrap: wrap;
}
.pagination button {
  background: #f0f0f0;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.3s;
}
.pagination button:hover {
  background: #dcdcdc;
}
.pagination button.active {
  background: #667eea;
  color: white;
}

/* ==========================================================
   📱 АДАПТИВНОСТЬ
   ========================================================== */

/* === 320px — маленькие смартфоны === */
@media (max-width: 320px) {
  .compact-hero {
    padding: 14px;
  }
  .compact-hero-text {
    font-size: 0.9rem;
  }
  .filters {
    gap: 8px;
    flex-direction: column;
    align-items: flex-start;
  }
  .filters label {
    font-size: 13px;
    width: 100%;
  }
}

/* === 480px — обычные смартфоны === */
@media (max-width: 480px) {
  .experts-list {
    grid-template-columns: 1fr; /* 1 колонка */
  }

  .filters {
    overflow-x: auto;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 10px;
  }

  .filters label {
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* 🟢 Бургер-меню включаем на этом уровне */
  .burger {
    display: block;
    position: absolute;
    top: 12px;
    left: 12px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
  }
  .nav {
    display: none;
  }
  .nav.open {
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.8);
    position: absolute;
    top: 50px;
    left: 0;
    width: 100%;
    padding: 12px;
  }
}

/* === 768px — планшеты === */
@media (min-width: 481px) and (max-width: 768px) {
  .experts-list {
    grid-template-columns: repeat(2, 1fr);
  }
  .search-bar input {
    max-width: 340px;
  }
}

/* === 1024px — ноутбуки === */
@media (min-width: 769px) and (max-width: 1024px) {
  .experts-list {
    grid-template-columns: repeat(3, 1fr);
  }
  .filters {
    justify-content: center;
  }
}

/* === 1600px — большие мониторы === */
@media (min-width: 1025px) and (max-width: 1600px) {
  .experts-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* === 1920px+ — сверхширокие экраны === */
@media (min-width: 1601px) {
  .experts-list {
    grid-template-columns: repeat(5, 1fr);
  }
  .page-container {
    max-width: 1800px;
  }
}
</style>

