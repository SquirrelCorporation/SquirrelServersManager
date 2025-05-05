<script setup>
defineProps({
  time: {
    type: String,
    default: null
  }
});
</script>

<template>
  <div v-if="time" class="quick-start-time"><span class="time-icon">⏱️</span> {{ time }}</div>
  <slot></slot>
</template>

<style scoped>
.quick-start-time {
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background-color: rgba(100, 100, 100, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(100, 100, 100, 0.1);
}

.time-icon {
  margin-right: 4px;
}
</style>
