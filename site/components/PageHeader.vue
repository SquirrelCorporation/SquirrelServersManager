<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: null
  }
});
</script>

<template>
  <div class="page-header">
    <div class="header-left">
      <div class="icon-avatar">{{ icon }}</div>
      <h1 class="title">{{ title }}</h1>
    </div>
    <div v-if="time" class="time-estimation">
      <span class="time-icon">⏱️</span> {{ time }}
    </div>
  </div>
  <slot></slot>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 24px;
  background-color: rgba(100, 100, 100, 0.1);
  border-radius: 50%;
  border: 1px solid rgba(100, 100, 100, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.title {
  margin: 0;
  padding: 0;
}

.time-estimation {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background-color: rgba(100, 100, 100, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(100, 100, 100, 0.1);
}

.time-icon {
  margin-right: 4px;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time-estimation {
    margin-top: 8px;
  }
}
</style>
