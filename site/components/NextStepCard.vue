<script setup>
defineProps({
  icon: {
    type: String,
    default: '📝'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
});
</script>

<template>
  <a :href="link" class="next-step-card">
    <div class="next-step-icon">{{ icon }}</div>
    <div class="next-step-content">
      <div class="next-step-title">{{ title }}</div>
      <p>{{ description }}</p>
    </div>
    <div class="next-step-arrow">→</div>
  </a>
</template>

<style scoped>
.next-step-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  margin: 32px 0;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 0 !important;
}

.next-step-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-decoration: none;
}

.next-step-icon {
  font-size: 32px;
  margin-right: 20px;
  flex-shrink: 0;
}

.next-step-content {
  flex: 1;
}

.next-step-content h2 {
  margin: 0;
  font-size: 18px;
  color: var(--vp-c-brand);
  border-bottom: none;
}

.next-step-title {
  margin: 0;
  font-size: 18px;
  color: var(--vp-c-brand);
  font-weight: 600;
}

.next-step-content p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.next-step-arrow {
  font-size: 24px;
  margin-left: 20px;
  color: var(--vp-c-brand);
}

@media (max-width: 640px) {
  .next-step-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .next-step-icon {
    margin-bottom: 12px;
  }
  
  .next-step-arrow {
    display: none;
  }
}
</style>
