<template>
  <button
    class="copy-btn"
    :aria-label="copied ? 'Copied!' : 'Copy to clipboard'"
    @click="copy"
    @mouseleave="copied = false"
  >
    <span v-if="!copied">📋</span>
    <span v-else>✅</span>
    <span class="copy-btn-label">
      <slot>Copy</slot>
    </span>
    <span v-if="copied" class="copy-btn-tooltip">Copied!</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  text: { type: String, required: true }
})
const copied = ref(false)
const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1200)
  } catch (e) {
    copied.value = false
  }
}
</script>

<style scoped>
.copy-btn {
  position: relative;
  background: var(--vp-c-brand);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.95em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  opacity: 0.85;
  transition: opacity 0.2s;
}
.copy-btn:hover {
  opacity: 1;
}
.copy-btn-label {
  display: none;
}
.copy-btn-tooltip {
  position: absolute;
  top: -1.7em;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand);
  padding: 0.15em 0.7em;
  border-radius: 4px;
  font-size: 0.85em;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 10;
}
@media (max-width: 600px) {
  .copy-btn-label {
    display: none;
  }
}
</style> 