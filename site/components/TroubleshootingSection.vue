<template>
  <div class="troubleshooting-section">
    <div v-for="(issue, index) in issues" :key="index" class="troubleshooting-card">
      <h3 class="issue-title">{{ issue.title }}</h3>
      
      <div class="symptoms-section">
        <h4>Symptoms</h4>
        <ul>
          <li v-for="(symptom, sIndex) in issue.symptoms" :key="sIndex">{{ symptom }}</li>
        </ul>
      </div>
      
      <div class="solutions-section">
        <h4>Solutions</h4>
        <ul>
          <li v-for="(solution, solIndex) in issue.solutions" :key="solIndex">{{ solution }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TroubleshootingSection',
  props: {
    issues: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(issue => 
          issue.title && 
          Array.isArray(issue.symptoms) && 
          Array.isArray(issue.solutions)
        );
      }
    }
  }
}
</script>

<style scoped>
.troubleshooting-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.troubleshooting-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  background-color: var(--vp-c-bg-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.troubleshooting-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.issue-title {
  margin-top: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-brand);
  font-size: 1.2rem;
}

.symptoms-section h4, .solutions-section h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.symptoms-section {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(255, 229, 100, 0.1);
  border-radius: 4px;
}

.solutions-section {
  padding: 0.5rem;
  background-color: rgba(66, 184, 131, 0.1);
  border-radius: 4px;
}

ul {
  margin: 0;
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .troubleshooting-section {
    grid-template-columns: 1fr;
  }
}
</style>