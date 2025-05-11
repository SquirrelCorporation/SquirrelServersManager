<script setup>
import { computed } from 'vue'
const props = defineProps({
  steps: {
    type: Array,
    required: true
  }
})
const steps = computed(() => props.steps)
</script>

<template>
  <div class="step-path">
    <div class="path-step" v-for="step in steps" :key="step.number">
      <div class="step-header">
        <div class="step-number">{{ step.number }}</div>
        <p class="step-title">{{ step.title }}</p>
      </div>
      <div class="step-content">
        <p>{{ step.description }}</p>
        <a :href="step.link" class="step-link">{{ step.linkText }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-path {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}
.path-step {
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.5rem 1.25rem;
  min-width: 0;
  max-width: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.step-number {
  font-size: 1rem;
  font-weight: bold;
  color: var(--vp-c-brand);
  background: var(--vp-c-bg);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  flex-shrink: 0;
}
.step-title {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.step-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.step-content p {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
.step-link {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  font-size: 0.9rem;
  margin-top: auto;
}
.step-link:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}
@media (max-width: 600px) {
  .step-path {
    gap: 1rem;
  }
  .path-step {
  }
}
</style> 