<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  altText: {
    type: String,
    default: 'Mental Model Diagram'
  },
  caption: {
    type: String,
    default: ''
  },
  placeholderText: {
    type: String,
    default: '[Diagram placeholder]'
  }
});
</script>

<template>
  <div class="mental-model-diagram">
    <div v-if="title" class="diagram-title">{{ title }}</div>
    
    <div class="diagram-container">
      <img :src="imagePath" :alt="altText" class="diagram-image" />
      
      <div v-if="!imagePath" class="diagram-placeholder">
        {{ placeholderText }}
      </div>
    </div>
    
    <div v-if="caption" class="diagram-caption">
      {{ caption }}
    </div>
  </div>
</template>

<style scoped>
.mental-model-diagram {
  margin: 32px 0;
  padding: 24px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.diagram-title {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--vp-c-brand);
  font-size: 20px;
  font-weight: bold;
}

.diagram-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0;
  min-height: 200px;
}

.diagram-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.diagram-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--vp-c-bg-alt);
  border: 2px dashed var(--vp-c-border);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  font-style: italic;
  color: var(--vp-c-text-2);
}

.diagram-caption {
  margin-top: 16px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  text-align: center;
  font-style: italic;
}

@media (max-width: 640px) {
  .mental-model-diagram {
    padding: 16px;
  }
  
  .diagram-container {
    min-height: 150px;
  }
}
</style>
