<script setup>
import { defineProps } from 'vue';
import DecisionNode from './DecisionNode.vue';

const props = defineProps({
  tree: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="auth-decision-tree">
    <DecisionNode :node="tree" />
  </div>
</template>

<style scoped>
.auth-decision-tree {
  margin: 1.5rem 0;
}
</style> 