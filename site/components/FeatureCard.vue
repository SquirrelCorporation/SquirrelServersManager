<template>
  <a :href="link" class="feature-card">
    <h3>{{ icon }} {{ title }}</h3>
    <p>{{ description }}</p>
  </a>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.feature-card {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 20px;
  text-decoration: none !important;
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s, box-shadow 0.2s;
  display: block;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-decoration: none !important;
}

.feature-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--vp-c-brand);
  font-size: 18px;
  border-bottom: none;
  border-top: none;
  padding-top: 0;
}

.feature-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  text-decoration: none;
}
</style>
