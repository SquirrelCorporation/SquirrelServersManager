<template>
    <div class="vp-doc">
        <h2>Feedback & Support</h2>
    </div>
  <div class="feedback-section">
    <div class="feedback-header">Need Help?</div>
    <div class="feedback-content">
      <p>If you encounter any issues, reach out for support or check common solutions:</p>
      <div class="feedback-links">
        <a href="https://github.com/SquirrelCorporation/SquirrelServersManager/issues" target="_blank" rel="noopener noreferrer" class="feedback-link github">
          <span class="icon">🐛</span> Report an Issue
        </a>
        <a href="https://discord.gg/cnQjsFCGKJ" target="_blank" rel="noopener noreferrer" class="feedback-link discord">
          <span class="icon">💬</span> Ask on Discord
        </a>
        <a href="/docs/troubleshoot/" class="feedback-link troubleshoot">
          <span class="icon">🔧</span> Troubleshooting Guide
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props needed for this static component
</script>

<style scoped>
.feedback-section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin-top: 2rem;
  background-color: var(--vp-c-bg-soft);
  overflow: hidden; /* Ensures border-radius applies to children */
}

.feedback-header {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-dark);
  padding: 12px 16px;
  font-weight: 600;
  font-size: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.feedback-content {
  padding: 16px;
}

.feedback-content p {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.feedback-links {
  display: flex;
  flex-wrap: wrap; /* Allow links to wrap on smaller screens */
  gap: 12px;
}

.feedback-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.2s ease;
  font-size: 0.9rem;
  border: 1px solid transparent;
}

.feedback-link .icon {
  margin-right: 8px;
  font-size: 1.1em; /* Slightly larger icon */
}

/* Specific styles for GitHub link */
.feedback-link.github {
  background-color: var(--vp-c-gray-soft);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-gray-light-1);
}

.feedback-link.github:hover {
  background-color: var(--vp-c-gray-light-1);
  transform: translateY(-1px);
}

/* Specific styles for Discord link */
.feedback-link.discord {
  background-color: #7289da; /* Discord purple */
  color: #ffffff;
  border-color: #5f73bc;
}

.feedback-link.discord:hover {
  background-color: #5f73bc;
  transform: translateY(-1px);
}

/* Dark mode specific adjustments if needed */
.dark .feedback-link.github {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}

.dark .feedback-link.github:hover {
  background-color: var(--vp-c-bg-mute);
}

.dark .feedback-link.discord {
  background-color: #5865f2; /* Slightly brighter Discord purple for dark mode */
  border-color: #4f5bd5;
}

.dark .feedback-link.discord:hover {
    background-color: #4f5bd5;
}

/* Specific styles for Troubleshooting link */
.feedback-link.troubleshoot {
  background-color: var(--vp-c-green-soft);
  color: var(--vp-c-green-darker);
  border-color: var(--vp-c-green-dimm-1);
}

.feedback-link.troubleshoot:hover {
  background-color: var(--vp-c-green-dimm-1);
  transform: translateY(-1px);
}

.dark .feedback-link.troubleshoot {
  background-color: var(--vp-c-green-soft);
  color: var(--vp-c-green-darker);
  border-color: var(--vp-c-green-dimm-1);
}

.dark .feedback-link.troubleshoot:hover {
  background-color: var(--vp-c-green-dimm-1);
}

</style> 