<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
    // Each step should have: { title: String, description: String, icon?: String }
    // Example: [{ title: 'Step 1', description: 'Do this first', icon: '🔑' }]
  }
});
</script>

<template>
  <div class="ssh-flow-diagram">
    <template v-for="(step, index) in steps" :key="index">
      <div class="flow-step">
        <div :class="['flow-icon', { 'has-emoji-icon': step.icon }]">{{ step.icon ? step.icon : index + 1 }}</div>
        <div class="flow-content">
          <h4>{{ step.title }}</h4>
          <p>{{ step.description }}</p>
        </div>
      </div>
      <div v-if="index < steps.length - 1" class="flow-arrow">↓</div>
    </template>
  </div>
</template>

<style scoped>
/* Styles adapted from custom.css and original ProcessSteps.vue */
.ssh-flow-diagram {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centers the whole diagram if it's narrower than container */
  gap: 0.5rem;      /* Gap between flow-step and flow-arrow */
  margin: 1.5rem 0;
}

.flow-step {
  display: flex;
  align-items: center; 
  gap: 1rem;          
  background-color: var(--vp-c-bg-soft);
  padding: 1rem;      
  border-radius: 8px; 
  width: 100%;        
  max-width: 600px;   
}

.flow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; 
  height: 40px; 
  border-radius: 50%; 
  background-color: var(--vp-c-brand); 
  color: var(--vp-c-bg); /* Default color for numbers */
  font-weight: bold; 
  font-size: 1.1rem; /* Default font size for numbers */
  flex-shrink: 0; 
}

.flow-icon.has-emoji-icon {
  background-color: transparent;
  color: inherit; /* Emojis use their native colors */
  font-size: 1.5rem; /* Larger font size for emojis */
}

.flow-content {
  flex: 1; 
}

.flow-content h4 {
  margin-top: 0;
  margin-bottom: 0.25rem; 
  color: var(--vp-c-text-1); 
  font-family: var(--vp-font-family-base); 
  font-size: 1.1em; 
}

.flow-content p {
  margin: 0; 
  color: var(--vp-c-text-2); 
  font-family: var(--vp-font-family-base); 
  font-size: 0.9em; 
}

.flow-arrow {
  font-size: 1.5rem; 
  color: var(--vp-c-brand); 
}

@media (max-width: 640px) {
  .flow-icon {
    width: 32px;
    height: 32px;
    /* font-size for numbers in mobile view is implicitly 1.1rem from base .flow-icon */
  }
  .flow-icon.has-emoji-icon {
    font-size: 1.3rem; /* Slightly adjust emoji size for mobile if needed */
  }
}
</style>
