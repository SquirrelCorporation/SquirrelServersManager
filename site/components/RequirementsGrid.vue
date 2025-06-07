<script setup>
const props = defineProps({
  requirements: {
    type: Array,
    required: true
    // [{ header: string, items: string[] }]
  }
})
</script>

<template>
  <div class="requirements-grid">
    <div class="requirement-card" v-for="section in requirements" :key="section.header">
      <div class="requirement-header">{{ section.header }}</div>
      <div class="requirement-content">
        <div class="req-item" v-for="item in section.items" :key="item">
          <span class="req-check">✓</span> {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.requirement-card {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.requirement-header {
  background-color: #3a5ccc;
  color: white;
  padding: 12px 16px;
  font-weight: bold;
  font-size: 16px;
}

.requirement-content {
  padding: 16px;
}

.req-item {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  font-size: 14px;
}

.req-item:last-child {
  margin-bottom: 0;
}

.req-check {
  color: #4caf50;
  font-weight: bold;
  margin-right: 8px;
}
</style> 