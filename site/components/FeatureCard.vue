<template>
  <component :is="link && link !== '' ? 'a' : 'div'" :href="link && link !== '' ? link : null" :class="['feature-card', { 'no-link': !link || link === '' }]">
    <p class="feature-card-title">{{ icon }} {{ title }}</p>
    <p class="feature-card-description">{{ description }}</p>
  </component>
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
    default: ''
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

.feature-card:not(.no-link):hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-decoration: none !important;
}

/* Styles for cards without a link */
.feature-card.no-link {
  background-color: var(--vp-c-bg); /* Slightly different background, or use a more distinct one */
  /* No hover effects for non-linked cards */
}

.feature-card-title {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--vp-c-brand);
  font-size: 16px;
  font-weight: 600;
  border-bottom: none;
  border-top: none;
  padding-top: 0;
  line-height: 1.5;
}

.feature-card.no-link .feature-card-title {
  color: var(--vp-c-text-1); /* Different title color for non-linked cards */
}

.feature-card-description {
  margin: 0;
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 14px;
  line-height: 1.6;
}
</style>
