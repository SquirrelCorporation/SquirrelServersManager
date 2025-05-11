<template>
  <div class="code-example-container">
    <div class="code-example-header">
      <div class="code-example-title">
        <div class="code-example-icon">📄</div>
        <div>
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
        </div>
      </div>
      <div class="code-example-filename">{{ fileName }}</div>
    </div>
    <div class="code-example-content">
      <div class="code-block">
        <pre><code>{{ code }}</code></pre>
      </div>
      <div class="code-example-explanation">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.code-example-container {
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-family: var(--vp-font-family-base);
}

.code-example-header {
  padding: 1rem;
  background-color: var(--vp-c-brand);
  color: var(--vp-c-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-example-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.code-example-icon {
  font-size: 2rem;
}

.code-example-title h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--vp-c-text-1);
}

.code-example-title p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
  color: var(--vp-c-text-2);
}

.code-example-filename {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
}

.code-example-content {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .code-example-content {
    grid-template-columns: 3fr 2fr;
  }
}

.code-block {
  padding: 1rem;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  overflow-x: auto;
  font-family: var(--vp-font-family-mono);
}

.code-block pre {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  line-height: 1.5;
}

.code-example-explanation {
  padding: 1rem;
  background-color: var(--vp-c-bg);
  border-left: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

@media (max-width: 767px) {
  .code-example-explanation {
    border-left: none;
    border-top: 1px solid var(--vp-c-divider);
  }
}

.code-example-explanation :deep(ul) {
  padding-left: 1.5rem;
  margin: 0;
}

.code-example-explanation :deep(li) {
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-2);
}
</style>
