<template>
  <div class="section-header">
    <div class="section-title">{{ title }}</div>
    <p v-if="description">{{ description }}</p>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.section-header {
  margin: 2rem 0 1rem;
}

.section-header h2 {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  border-top: none;
  padding-top: 0;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: var(--vp-c-text-2);
  margin-top: 0;
}
</style>
