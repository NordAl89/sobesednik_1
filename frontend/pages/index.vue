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
      <input type="text" v-model="searchQuery"
        placeholder="Поиск по имени, фамилии, логину, возрасту или Telegram..." />
    </div>
    <div class="sort-bar">
      <label>Сортировка:
        <select v-model="sortOption">
          <option value="">Без сортировки</option>
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>


    <!-- Фильтры -->
    <div class="filters">
      <label><input type="checkbox" v-model="filters.male" /> Мужчины</label>
      <label><input type="checkbox" v-model="filters.female" /> Женщины</label>
      <label><input type="checkbox" v-model="filters.adultTopics" /> Есть темы 18+</label>
      <label><input type="checkbox" v-model="filters.noForbidden" /> Нет запрещённых тем</label>
      <label><input type="checkbox" v-model="filters.freeNow" /> Сейчас свободен</label>
      <label><input type="checkbox" v-model="filters.alwaysAvailable" /> 24/7</label>
      <label><input type="checkbox" v-model="filters.verifiedExpert" /> Подтвержденный собеседник</label>
    </div>

    <h1>Список собеседников</h1>

    <div v-if="store.loading">Загрузка...</div>
    <div v-else-if="sortedExperts.length === 0">Нет доступных собеседников</div>

    <!-- Список экспертов -->
    <div v-else class="experts-list">
      <ExpertCardMini v-for="expert in paginatedExperts" :key="expert.id" :expert="expert"
        @click="goToExpert(expert.id)" />
    </div>

    <!-- Кнопка "Показать ещё" -->
    <div v-if="hasMoreExperts" class="show-more">
      <button @click="showMore" :disabled="isLoadingMore">
        {{ isLoadingMore ? 'Загрузка...' : 'Показать ещё' }}
      </button>
    </div>

    <!-- Нумерация страниц -->
    <div v-if="totalPages > 1" class="pagination">
      <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="{ active: page === currentPage }">
        {{ page }}
      </button>
    </div>

    <!-- SEO Блок -->
    <div class="seo-block">
      <h2>Онлайн-собеседники для доверительного общения</h2>

      <p>
        «Собеседник на час» — это русскоязычная онлайн-платформа доверительного общения, где каждый может найти
        собеседника для приватной беседы в формате чата, аудио или видео.
        Здесь вы можете получить эмоциональную поддержку, обсудить важные темы и просто поговорить без осуждения и
        давления.
      </p>

      
      
      <button @click="showSeo = !showSeo" class="seo-toggle">
        {{ showSeo ? 'Свернуть' : 'Подробнее' }}
      </button>

      <div v-if="showSeo" class="seo-text">
        <p>
          Подробная информация о платформе: каталог экспертов, фильтры по полу, возрасту, темам, рейтингу и цене.
          Эксперты проходят верификацию, чтобы гарантировать качественное доверительное общение.
          Выбирайте собеседника, связывайтесь через чат, аудио или видео, оплачивайте напрямую или через платформу.
          Ключевые слова: онлайн-собеседник, доверительное общение, чат с экспертом, видеоразговор, аудиосвязь,
          эмоциональная поддержка.
        </p>
        <h3>Преимущества нашей платформы</h3>
      <ul>
        <li>Выбор экспертов по интересам, возрасту, формату связи и стоимости.</li>
        <li>Безопасное и анонимное общение с подтверждёнными экспертами.</li>
        <li>Эксперты с высокой эмпатией и опытом доверительного общения.</li>
        <li>Удобные фильтры по доступности, рейтингу, наличию тем 18+ и статусу «Свободен сейчас».</li>
        <li>Возможность мгновенной связи или планирования беседы на удобное время.</li>
      </ul>
        <h3>Как работает «Собеседник на час»</h3>
      <ol>
        <li>Выбираете собеседника в каталоге по фильтрам: пол, возраст, темы, рейтинг, цена.</li>
        <li>Открываете профиль эксперта: фото, видео-презентацию, темы общения, тарифы.</li>
        <li>Связываетесь через чат, аудио или видео — мгновенно или по расписанию.</li>
        <li>Оплачиваете услугу через платформу или напрямую эксперту.</li>
      </ol>

      <h3>Кому будет полезно</h3>
      <p>
        Платформа подходит взрослым пользователям 18–65 лет, которые ищут эмоциональную поддержку, хотят поделиться
        переживаниями, снять стресс или просто поговорить с понимающим человеком.
        Особенно полезно людям из эмоционально нагруженных профессий — медицине, образовании, IT — а также тем, кто
        чувствует одиночество или усталость.
      </p>

      <h3>Почему выбирают нас</h3>
      <p>
        Мы создаём безопасное и комфортное пространство для доверительного общения, где каждый может быть услышан.
        Сервис работает по всему миру и ориентирован на русскоязычную аудиторию.
        Онлайн-собеседники доступны в формате чата, аудио и видео, с гибкими фильтрами по доступности, рейтингу и
        тематике беседы.
      </p>

      </div>
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
  freeNow: false,
  alwaysAvailable: false,
  verifiedExpert: false,
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
    if (filters.value.alwaysAvailable && !expert.alwaysAvailable) return false
    if (filters.value.verifiedExpert && !expert.verifiedExpert) return false

    return true
  })
})

const sortOption = ref('') // текущая сортировка: '', 'rating', 'reviews', 'new', 'old'

const sortOptions = [
  { label: 'Высокий рейтинг', value: 'rating' },
  { label: 'Количество отзывов', value: 'reviews' },
  { label: 'Сначала новые', value: 'new' },
  { label: 'Сначала старые', value: 'old' }
]

const sortedExperts = computed(() => {
  const experts = [...filteredExperts.value] // создаём копию, чтобы не мутировать исходный массив

  switch (sortOption.value) {
    case 'rating':
      return experts.sort((a, b) => b.rating - a.rating)
    case 'reviews':
      return experts.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0))
    case 'new':
      return experts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'old':
      return experts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    default:
      return experts
  }
})

// страничная логика
const totalPages = computed(() => Math.ceil(sortedExperts.value.length / expertsPerPage))
const paginatedExperts = computed(() => sortedExperts.value.slice(0, currentPage.value * expertsPerPage))
const hasMoreExperts = computed(() => paginatedExperts.value.length < sortedExperts.value.length)

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

//SEO блок
//Микроразметка Schema.org для платформы
onMounted(() => {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Собеседник на час",
    "description": "Онлайн-платформа доверительного общения: чат, аудио и видео с русскоязычными экспертами для эмоциональной поддержки.",
    "provider": {
      "@type": "Organization",
      "name": "Собеседник на час",
      "url": "https://example.com",
      "sameAs": [
        "https://t.me/example",
        "https://vk.com/example"
      ]
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Русскоязычные взрослые пользователи 18–65 лет, ищущие эмоциональную поддержку"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "RUB",
      "url": "https://example.com/experts",
      "availability": "https://schema.org/InStock"
    }
  })
  document.head.appendChild(script)
})
const showSeo = ref(false)

</script>

<style scoped>
.page-container {
  min-height: 100vh; /* вместо height: 100vh */
  overflow-y: auto;
  padding: 0 16px 40px;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box; /* учитывает padding */
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

.sort-bar {
  margin: 10px 0 20px 0;
  text-align: center;
}

.sort-bar select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
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
    grid-template-columns: 1fr;
    /* 1 колонка */
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

/* ---------- SEO Блок ---------- */
.seo-block {
  background: linear-gradient(
    0deg,
    #fef7e3 0%,  
    #f7eddf 40%, 
    #e2d8f3 100%  
  );
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 40px 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
}

.seo-block h2 {
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  color: #1a202c;
  margin-bottom: 16px;
  text-align: center;
}

.seo-block h3 {
  font-size: clamp(1.1rem, 1.5vw, 1.3rem);
  color: #2d3748;
  margin-top: 20px;
  margin-bottom: 12px;
}

.seo-block p {
  margin-bottom: 12px;
}

.seo-block ul,
.seo-block ol {
  padding-left: 20px;
  margin-bottom: 12px;
}

.seo-block li {
  margin-bottom: 6px;
}

.seo-toggle {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.3s;
}

.seo-toggle:hover {
  background-color: #556cd6;
}

.seo-text {
  margin-top: 16px;
  transition: all 0.3s ease;
}

@media (max-width: 480px) {
  .seo-block {
    padding: 16px;
    font-size: 0.9rem;
  }

  .seo-toggle {
    width: 100%;
    text-align: center;
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
