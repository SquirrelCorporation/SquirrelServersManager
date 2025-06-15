<template>
  <a :href="link" class="sublink-feature-card">
    <div class="feature-header">
      <span v-if="icon" class="feature-icon-span">{{ icon }}</span>
      <p class="feature-card-title">{{ title }}</p>
    </div>
    <p class="feature-card-description">{{ description }}</p>
    <div v-if="subLinks && subLinks.length" class="feature-sublinks">
      <template v-for="(subLink, index) in subLinks" :key="subLink.href">
        <a :href="subLink.href" class="sublink">{{ subLink.text }}</a>
        <span v-if="index < subLinks.length - 1" class="sublink-divider"> · </span>
      </template>
    </div>
  </a>
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
  icon: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    required: true
  },
  subLinks: {
    type: Array,
    default: () => [] // Array of objects: { text: String, href: String }
  }
});
</script>

<style scoped>
.sublink-feature-card {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 20px;
  text-decoration: none !important;
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure cards in a row have same height */
}

.sublink-feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* Softer shadow */
  text-decoration: none !important;
}

.feature-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px; /* Increased margin */
}

.feature-icon-span {
  font-size: 20px; /* Slightly larger icon */
  margin-right: 10px;
  line-height: 1;
}

.feature-card-title {
  margin: 0;
  color: var(--vp-c-brand);
  font-size: 1.1em; /* Slightly larger title */
  font-weight: 600;
  line-height: 1.4;
}

.feature-card-description {
  margin: 0 0 12px 0; /* Margin bottom for spacing */
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.6;
  flex-grow: 1; /* Allows description to push sublinks down */
}

.feature-sublinks {
  margin-top: auto; /* Pushes sublinks to the bottom */
  padding-top: 12px; /* Space above sublinks */
  border-top: 1px solid var(--vp-c-divider-light); /* Subtle separator */
}

.sublink {
  color: var(--vp-c-text-2); /* Subtler color for sublinks */
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.2s;
}

.sublink:hover {
  color: var(--vp-c-brand);
  text-decoration: underline;
}

.sublink-divider {
  color: var(--vp-c-text-3);
  margin: 0 0.25rem;
  font-size: 0.85rem;
}
</style> 