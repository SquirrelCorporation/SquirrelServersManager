<template>
  <div class="feature-grid">
    <slot></slot>
  </div>
</template>

<script setup>
// No props needed for this component
</script>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
}
</style>
