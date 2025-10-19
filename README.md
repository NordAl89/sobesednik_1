# Создаем README файл
echo "# Sobesednik - Платформа для поиска собеседников

## Описание
Платформа для связи экспертов-собеседников с клиентами.

## Технологии
- Frontend: Nuxt 3 + Vue 3 + Pinia
- Backend: NestJS + TypeORM + SQLite

## Запуск
\`\`\`bash
# Frontend
cd frontend && npm install && npm run dev

# Backend  
cd backend && npm install && npm run start:dev
\`\`\`
" > README.md

# Добавляем README
git add README.md
git commit -m "docs: add README with project description"
git push
