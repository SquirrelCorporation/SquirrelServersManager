<script setup>
import { Background } from '@vue-flow/background';
import { useVueFlow, VueFlow } from '@vue-flow/core';
import { ref } from 'vue';

const initialNodes = [
  {
    id: 'parent',
    data: { label: 'SSM Ecosystem' },
    position: { x: 90, y: 0 },
    style: {
      borderColor: 'rgba(86, 120, 255, 0.65)',
      backgroundColor: 'rgba(76, 110, 245, 0.1)',
      color: 'rgb(193, 194, 197)',
      width: '450px', height: '190px' },
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0.0625rem 0.1875rem, rgba(0, 0, 0, 0.05) 0px 1.25rem 1.5625rem -0.3125rem, rgba(0, 0, 0, 0.04) 0px 0.625rem 0.625rem -0.3125rem',

  },
  {
    id: '1',
    data: { label: '🐿️ SSM' },
    position: { x: 240, y: 40 },
    style: {
      boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0.0625rem 0.1875rem, rgba(0, 0, 0, 0.05) 0px 1.25rem 1.5625rem -0.3125rem, rgba(0, 0, 0, 0.04) 0px 0.625rem 0.625rem -0.3125rem',
      backgroundColor: 'rgb(38, 33, 161)',
      boxSizing: 'border-box',
      border: '0.0625rem solid rgb(55, 58, 64)',
      color: 'rgb(193, 194, 197)',
      borderRadius: '0.5rem',
      fontSize: '10px',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    }
  },
  {
    id: '2',
    data: { label: 'Ansible' },
    position: { x: 120, y: 130 },
    style: {
      boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0.0625rem 0.1875rem, rgba(0, 0, 0, 0.05) 0px 1.25rem 1.5625rem -0.3125rem, rgba(0, 0, 0, 0.04) 0px 0.625rem 0.625rem -0.3125rem',
      backgroundColor: 'rgb(6, 5, 22)',
      boxSizing: 'border-box',
      border: '0.0625rem solid rgb(55, 58, 64)',
      color: 'rgb(193, 194, 197)',
      borderRadius: '0.5rem',
      fontSize: '10px',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    }
  },
  {
    id: '3',
    data: { label: 'Docker' },
    position: { x: 360, y: 130 },
    style: {
      boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0.0625rem 0.1875rem, rgba(0, 0, 0, 0.05) 0px 1.25rem 1.5625rem -0.3125rem, rgba(0, 0, 0, 0.04) 0px 0.625rem 0.625rem -0.3125rem',
      backgroundColor: 'rgb(6, 5, 22)',
      boxSizing: 'border-box',
      border: '0.0625rem solid rgb(55, 58, 64)',
      color: 'rgb(193, 194, 197)',
      borderRadius: '0.5rem',
      fontSize: '10px',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    }
  },
  {
    id: '4',
    data: { label: '🌰🌰🌰 Your devices' },
    position: { x: 240, y: 230 },
    style: {
      boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0.0625rem 0.1875rem, rgba(0, 0, 0, 0.05) 0px 1.25rem 1.5625rem -0.3125rem, rgba(0, 0, 0, 0.04) 0px 0.625rem 0.625rem -0.3125rem',
      backgroundColor: 'rgb(6, 5, 22)',
      boxSizing: 'border-box',
      border: '0.0625rem solid rgb(55, 58, 64)',
      color: 'rgb(193, 194, 197)',
      borderRadius: '0.5rem',
      fontSize: '10px',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    }  }
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2'
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
  },
  {
    id: 'e2-4',
    type: 'smoothstep',
    source: '2',
    target: '4',
    label: 'SSH',
    style: { stroke: 'orange' },
    labelBgStyle: { fill: 'orange' },
    animated: true,
  },
  {
    id: 'e3-4',
    type: 'smoothstep',
    source: '3',
    target: '4',
    label: 'SSH',
    style: { stroke: 'orange' },
    labelBgStyle: { fill: 'orange' },
    animated: true,
  }
];


const nodes = ref(initialNodes);

const edges = ref(initialEdges);
const cancelOnError = ref(true);

const { onInit, onNodeDragStop, onConnect, addEdges, setViewport, toObject } = useVueFlow();
const dark = ref(true);

onInit((vueFlowInstance) => {
  // instance is the same as the return of `useVueFlow`
  vueFlowInstance.fitView();
});
</script>
<template>
  <div style="width: 680px; height: 500px">
    <VueFlow
        :nodes="nodes"
        :edges="edges"
        :class="{ dark }"
        :default-viewport="{ zoom: 1.5 }"
        :min-zoom="1.5"
        :max-zoom="1.5"
    >
      <Background bg-color="rgba(21,21,24, 0.2)" />

    </VueFlow>
  </div>
</template>

<style>
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/core@1.41.0/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/core@1.41.0/dist/theme-default.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/controls@latest/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/minimap@latest/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/node-resizer@latest/dist/style.css';

.vue-flow__handle {
  opacity: 0;
}
</style>
