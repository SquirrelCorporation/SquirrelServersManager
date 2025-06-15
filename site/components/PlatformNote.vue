<template><div class="platform-note" :style="{backgroundColor: color || 'var(--vp-c-bg-soft)'}"><span class="platform-note-icon">{{ icon }}</span><div class="platform-note-content"><h3 class="platform-note-title">{{ title }}</h3><slot /></div></div></template>
<script setup>
const props = defineProps({icon: {type: String, required: true},title: {type: String, required: true},color: {type: String, default: ''}})
</script>
<style scoped>
.platform-note{display:flex;align-items:flex-start;gap:1rem;padding:1.25rem 1rem;border-radius:8px;margin:1.25rem 0;box-shadow:0 1px 4px rgba(0,0,0,0.04);}
.platform-note-icon{font-size:2.2rem;line-height:1;flex-shrink:0;}
.platform-note-content{flex:1;}
.platform-note-title{margin:0 0 0.5rem 0;font-size:1.15rem;font-weight:600;line-height:1.2;}
:root.dark .platform-note{background:var(--vp-c-bg-soft);}
</style> 