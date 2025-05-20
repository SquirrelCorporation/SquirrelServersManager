<template>
  <div class="advantages-section">
    <div class="advantages-grid">
      <div v-for="advantage in advantagesData" :key="advantage.title" class="advantage-card">
        <div class="advantage-icon">{{ advantage.icon }}</div>
        <div class="advantage-title">{{ advantage.title }}</div>
        <p class="advantage-description">{{ advantage.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  advantagesData: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>
.advantages-section {
  padding: 10px;
  background-color: var(--vp-c-bg); /* Adapts to theme */
}

.advantages-section h2 {
  text-align: center;
  font-size: 24px;
  color: var(--vp-c-text-1); /* Adapts to theme */
  margin-bottom: 24px;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.advantage-card {
  background-color: var(--vp-c-bg-soft); /* Adapts to theme */
  border: 1px solid var(--vp-c-divider); /* Adapts to theme */
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.advantage-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.advantage-icon {
  font-size: 40px; /* Larger icon */
  margin-top: 8px;
  margin-bottom: 35px;
  color: var(--vp-c-brand); /* Theme brand color */
}

.advantage-title {
  font-size: 16px; /* User-specified font size */
  color: var(--vp-c-text-1);
  font-weight: 600;
  margin-bottom: 8px;
}

.advantage-description {
  font-size: 14px; /* User-specified font size */
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
</style> 