<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
    // Each step should have a title and description
    // Example: [{ title: 'Step 1', description: 'Do this first' }]
  }
});
</script>

<template>
  <div class="process-steps">
    <div v-for="(step, index) in steps" :key="index" class="process-step">
      <div class="process-step-number">{{ index + 1 }}</div>
      <div class="process-step-content">
        <h3>{{ step.title }}</h3>
        <p>{{ step.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.process-steps {
  margin: 32px 0;
}

.process-step {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.process-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 40px;
  left: 20px;
  width: 2px;
  height: calc(100% - 16px);
  background-color: var(--vp-c-border);
  z-index: 0;
}

.process-step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--vp-c-brand);
  color: white;
  font-weight: bold;
  margin-right: 20px;
  flex-shrink: 0;
  z-index: 1;
}

.process-step-content {
  flex: 1;
  padding-top: 6px;
}

.process-step-content h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--vp-c-text-1);
}

.process-step-content p {
  margin: 0;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .process-step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .process-step:not(:last-child)::after {
    top: 32px;
    left: 16px;
  }
}
</style>
