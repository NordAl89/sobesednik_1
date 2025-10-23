<template>
  <div
    class="expert-card-mini"
    :class="statusClass"
    @click="$emit('click', expert.id)"
  >
    <img
      :src="expert.mainPhotoUrl || '/default-photo.jpg'"
      alt="Фото"
      class="main-photo"
    />

    <h3>{{ expert.name }}</h3>
    <p>Возраст: {{ expert.age }}</p>
    <p>Статус: {{ expert.status }}</p>

    <p v-if="expert.allowedTopics">Разрешённые темы: {{ expert.allowedTopics }}</p>
    <p v-if="expert.forbiddenTopics">Запрещённые темы: {{ expert.forbiddenTopics }}</p>

    <div v-if="expert.status === 'Занят'" class="busy-label">
      🚫 Сейчас занят
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  expert: {
    type: Object,
    required: true,
  },
})

const statusClass = computed(() => {
  if (props.expert.status === 'Занят') return 'busy'
  if (props.expert.status === 'active' || props.expert.status === 'Свободен') return 'free'
  return ''
})
</script>

<style scoped>
.expert-card-mini {
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 12px;
  margin: 8px;
  cursor: pointer;
  width: 220px;
  background-color: #fff;
  transition: 0.3s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.expert-card-mini:hover {
  transform: translateY(-3px);
}

/* Для свободных */
.expert-card-mini.free {
  border-color: #27ae60;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.3);
}

/* Для занятых */
.expert-card-mini.busy {
  border-color: #e67e22;
  background-color: #fff6e6;
  opacity: 0.95;
}

.busy-label {
  margin-top: 8px;
  color: #e67e22;
  font-weight: bold;
}

.main-photo {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
