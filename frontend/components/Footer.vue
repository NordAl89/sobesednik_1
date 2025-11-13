<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- 🟡 Раздел Help -->
      <div class="footer-section">
        <h3>Поддержка</h3>
        <ul>
          <li><NuxtLink to="/faq">FAQ</NuxtLink></li>
          <li>
            <a href="https://t.me/Sobesednik_support" target="_blank" rel="noopener">
              Поддержка в Telegram
            </a>
          </li>
        </ul>
      </div>

      <!-- 🟣 Раздел Company -->
      <div class="footer-section">
        <h3>Компания</h3>
        <ul>
          <li>
            <NuxtLink to="/admin-login">Админ-панель</NuxtLink>
          </li>
        </ul>
      </div>

      <!-- 🔵 Раздел Contacts -->
      <div class="footer-section">
        <h3>Контакты</h3>
        <ul>
          <!-- <li>
            <a href="mailto:support@sobesednik.com">support@sobesednik.com</a>
          </li> -->
          <li>
            <a href="https://t.me/Konstantin_Nor" target="_blank" rel="noopener">
              Telegram чат
            </a>
          </li>
          <!-- <li>
            <a href="https://vk.com/sobesednik" target="_blank" rel="noopener">VK</a>
          </li>
          <li>
            <a href="https://www.instagram.com/sobesednik" target="_blank" rel="noopener">
              Instagram
            </a>
          </li> -->
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2025 Собеседник на час. Все права защищены.</p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: linear-gradient(0deg, #fdf3d1 0%, #ffd79a 40%, #c6a4f5 100%);
  padding: 30px 20px 15px;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
  color: #333;
  font-size: 15px;
}

.footer-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  text-align: left;
  max-width: 1200px;
  margin: 0 auto;
  gap: 30px;
}

.footer-section {
  flex: 1 1 200px;
}

.footer-section h3 {
  margin-bottom: 10px;
  font-size: 1.1rem;
  color: #4b2e83;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 6px;
}

.footer-section a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #007bff;
}

.footer-bottom {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #555;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 10px;
}

/* 📱 Адаптив */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .footer-section {
    flex: none;
  }
}
</style>
