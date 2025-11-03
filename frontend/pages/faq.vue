<template>
  <div class="faq-page">
    <h1>Часто задаваемые вопросы (FAQ)</h1>

    <section v-for="(item, index) in faqList" :key="index" class="faq-item">
      <button class="faq-question" @click="toggle(index)">
        <span>{{ item.question }}</span>
        <span class="arrow" :class="{ open: openIndex === index }">▼</span>
      </button>

      <transition name="fade">
        <p v-if="openIndex === index" class="faq-answer">
          {{ item.answer }}
        </p>
      </transition>
    </section>

    <div class="faq-support">
      <p>Не нашли ответ? Напишите нам в <a href="https://t.me/sobesednik_support" target="_blank">Telegram</a> или на почту <a href="mailto:support@sobesednik.site">support@sobesednik.site</a>.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const openIndex = ref(null)

const faqList = [
  {
    question: 'Что такое “Собеседник на час”?',
    answer: 'Это онлайн-платформа доверительного общения, где вы можете выбрать собеседника-эксперта для приватного разговора в формате чата, голосового или видеозвонка.'
  },
  {
    question: 'Как стать собеседником?',
    answer: 'Для этого перейдите в раздел “Стать собеседником” и заполните анкету. После проверки администратором ваш профиль появится в каталоге экспертов.'
  },
  {
    question: 'Как происходит оплата?',
    answer: 'Вы выбираете собеседника, оплачиваете разговор, после чего получаете возможность связаться с ним через встроенный чат или видеоформат.'
  },
  {
    question: 'Безопасны ли разговоры?',
    answer: 'Да. Все беседы приватны и не записываются. Ваши данные и личная информация полностью защищены.'
  },
  {
    question: 'Что делать, если собеседник не вышел на связь?',
    answer: 'Свяжитесь с поддержкой через Telegram или напишите на нашу почту. Мы проверим ситуацию и вернём оплату при подтверждении.'
  }
]

function toggle(index) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<style scoped>
.faq-page {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background: linear-gradient(180deg, #fff9e6 0%, #f2e1ff 100%);
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #4b3e8e;
}

.faq-item {
  border-bottom: 1px solid rgba(0,0,0,0.1);
  padding: 10px 0;
}

.faq-question {
  background: none;
  border: none;
  outline: none;
  width: 100%;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 1.05em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;
}

.faq-question:hover {
  color: #5d6adb;
}

.arrow {
  transition: transform 0.3s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 8px 4px 12px;
  color: #555;
  line-height: 1.6;
  font-size: 0.97em;
}

.faq-support {
  margin-top: 30px;
  text-align: center;
  font-size: 0.95em;
}

.faq-support a {
  color: #5d6adb;
  text-decoration: none;
  font-weight: 600;
}

.faq-support a:hover {
  text-decoration: underline;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .faq-page {
    padding: 15px;
    margin: 20px;
  }

  h1 {
    font-size: 1.4em;
  }
}
</style>
