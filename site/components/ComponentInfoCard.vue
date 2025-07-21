<template>
  <div class="component-info-card">
    <div class="component-info-card-header">{{ headerTitle }}</div>
    <div class="component-info-card-content">
      <p v-if="purpose"><strong>Purpose:</strong> {{ purpose }}</p>
      <p v-if="storesItems && storesItems.length > 0"><strong>{{ subText }}</strong></p>
      <ul v-if="storesItems && storesItems.length > 0">
        <li v-for="item in storesItems" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  headerTitle: {
    type: String,
    required: true 
  },
  purpose: {
    type: String,
    required: true
  },
  subText: {
    type: String,
    required: false,
    default: "Stores:"
  },
  storesItems: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.component-info-card {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
}

.component-info-card-header {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-brand);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.component-info-card-content p {
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.6;
}

.component-info-card-content p strong {
  color: var(--vp-c-text-1); /* Ensure strong tag inherits or has a specific color */
}

.component-info-card-content ul {
  list-style-type: disc;
  margin: 0 0 0 20px; /* Adjusted for better alignment */
  padding-left: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.component-info-card-content li {
  margin-bottom: 4px;
}
</style> 