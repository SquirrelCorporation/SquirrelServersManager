<template>
  <div class="process-steps-container">
    <div class="process-steps-header">
      <h3>Playbook Execution Process</h3>
      <p>How playbooks are processed and executed in SSM</p>
    </div>
    <div class="process-steps">
      <div class="step" v-for="(step, index) in steps" :key="index">
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-content">
          <div class="step-icon">{{ step.icon }}</div>
          <div class="step-details">
            <h4>{{ step.title }}</h4>
            <p>{{ step.description }}</p>
          </div>
        </div>
        <div class="step-connector" v-if="index < steps.length - 1">
          <div class="connector-line"></div>
          <div class="connector-arrow">▼</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const steps = [
  {
    icon: '📋',
    title: 'Playbook Selection',
    description: 'Choose a playbook from your local or remote repository to execute.'
  },
  {
    icon: '🎯',
    title: 'Target Selection',
    description: 'Select the devices or device groups that the playbook will run against.'
  },
  {
    icon: '🔄',
    title: 'Variable Configuration',
    description: 'Set or override variables that will be used during playbook execution.'
  },
  {
    icon: '🔍',
    title: 'Validation',
    description: 'SSM validates the playbook syntax and checks connectivity to target devices.'
  },
  {
    icon: '▶️',
    title: 'Execution',
    description: 'The playbook runs against the selected devices, executing tasks in sequence.'
  },
  {
    icon: '📊',
    title: 'Monitoring',
    description: 'Track real-time progress, task status, and output from each device.'
  },
  {
    icon: '📝',
    title: 'Results Collection',
    description: 'Gather execution results, logs, and changed states from all devices.'
  },
  {
    icon: '📈',
    title: 'Reporting',
    description: 'View summary reports showing success/failure status and execution details.'
  }
];
</script>

<style scoped>
.process-steps-container {
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.process-steps-header {
  background-color: #3a5ccc;
  color: white;
  padding: 1rem;
}

.process-steps-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.process-steps-header p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.process-steps {
  padding: 1.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.step-number {
  background-color: #3a5ccc;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.step-content {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.step-icon {
  font-size: 2rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.step-details {
  flex: 1;
}

.step-details h4 {
  margin: 0 0 0.5rem 0;
  color: #3a5ccc;
}

.step-details p {
  margin: 0;
  color: #495057;
  font-size: 0.9rem;
}

.step-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 40px;
  margin: 0.5rem 0;
}

.connector-line {
  width: 2px;
  height: 20px;
  background-color: #3a5ccc;
}

.connector-arrow {
  color: #3a5ccc;
  font-size: 1.2rem;
  line-height: 1;
}

@media (max-width: 768px) {
  .step-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .step-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}
</style>
