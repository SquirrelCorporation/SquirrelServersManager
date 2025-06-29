<template>
  <div class="component-info-grid">
    <slot></slot>
  </div>
</template>

<script setup>
// No props needed for this component
</script>

<style scoped>
.component-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Adjust minmax as needed */
  gap: 20px; /* Adjust gap as needed */
  margin: 24px 0;
}
</style> 