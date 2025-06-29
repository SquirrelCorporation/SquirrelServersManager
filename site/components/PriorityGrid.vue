<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
    // [{ label: string, color: string, details: string[] }]
  }
});
</script>

<template>
  <div class="priority-grid">
    <div
      v-for="(item, idx) in items"
      :key="item.label + idx"
      class="priority-card"
    >
      <div class="priority-label-row">
        <div class="priority-accent" :style="{ backgroundColor: item.color }"></div>
        <div class="priority-label">{{ item.label }}</div>
      </div>
      <div class="priority-details">
        <ul>
          <li v-for="(detail, i) in item.details" :key="detail + i">{{ detail }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.priority-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.priority-card {
  background-color: #1b1b1f;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #23232b;
  display: flex;
  flex-direction: column;
}

.priority-label-row {
  display: flex;
  align-items: center;
  padding: 12px 12px 8px 16px;
  gap: 10px;
}

.priority-accent {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  flex-shrink: 0;
}

.priority-label {
  color: #dfdfd6;
  font-weight: bold;
  font-size: 16px;
  text-align: left;
}

.priority-details {
  padding: 0 16px 16px 16px;
  color: #98989f;
  font-size: 14px;
}

.priority-details ul {
  padding-left: 20px;
  margin: 0;
}

.priority-details li {
  margin-bottom: 6px;
}
</style> 