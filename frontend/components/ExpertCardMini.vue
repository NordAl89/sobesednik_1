<template>
  <div class="expert-card-mini" @click="$emit('click', expert.id)">
    <img :src="expert.mainPhoto ? URL.createObjectURL(expert.mainPhoto) : ''" alt="Фото" class="main-photo" />
    <h3>{{ expert.name }}</h3>
    <p>Возраст: {{ expert.age }}</p>
    <p>Статус: {{ expert.status }}</p>
    <p>Разрешённые темы: {{ expert.allowedTopics }}</p>
    <p>Запрещённые темы: {{ expert.forbiddenTopics }}</p>
  </div>
</template>

<script setup>
defineProps({
  expert: Object
})
</script>

<style scoped>
.expert-card-mini {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  cursor: pointer;
  width: 200px;
}
.main-photo {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
</style>
