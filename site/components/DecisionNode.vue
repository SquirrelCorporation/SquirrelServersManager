<script setup>
import { defineProps } from 'vue';
import DecisionNode from './DecisionNode.vue'; // recursive import

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div v-if="node.type === 'question'" class="decision-node">
    <div class="decision-question">{{ node.question }}</div>
    <div class="decision-options">
      <div v-for="(opt, i) in node.options" :key="i" class="decision-option">
        <div class="option-label">{{ opt.label }}</div>
        <div class="option-arrow">↓</div>
        <DecisionNode :node="opt.next" />
      </div>
    </div>
  </div>
  <div v-else-if="node.type === 'result'" :class="['decision-result', node.variant || '']">
    <div class="result-title">{{ node.title }}</div>
    <div class="result-description">{{ node.description }}</div>
  </div>
</template>

<style scoped>
.decision-node {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.decision-question {
  font-weight: bold;
  margin-bottom: 0.75rem;
  text-align: center;
}
.decision-options {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}
.decision-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.option-label {
  background-color: var(--vp-c-brand);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
.option-arrow {
  font-size: 1.25rem;
  margin: 0.25rem 0;
  color: var(--vp-c-brand);
}
.decision-result {
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  padding: 0.75rem;
  width: 100%;
  text-align: center;
}
.decision-result.success {
  border-left: 4px solid #4caf50;
}
.decision-result.warning {
  border-left: 4px solid #ff9800;
}
.result-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
}
.result-description {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
@media (max-width: 768px) {
  .decision-options {
    flex-direction: column;
  }
}
</style> 