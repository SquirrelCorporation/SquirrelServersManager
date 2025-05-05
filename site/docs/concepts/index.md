# Concepts

<div style="display: flex; align-items: center; margin-bottom: 24px;">
  <img src="/about/tldraw.svg" alt="Concepts" style="width: 32px; height: 32px; margin-right: 12px;" />
  <h2 style="margin: 0;">Understanding SSM's Core Concepts</h2>
</div>

Welcome to the Concepts section of the Squirrel Servers Manager documentation. This area is designed to help you understand the fundamental ideas and mental models that power SSM.

:::tip 🌰 In a Nutshell
Understanding these core concepts will help you get the most out of SSM and make better decisions about how to structure your server management workflow.
:::

## Why Mental Models Matter

Mental models are simplified representations of how something works. Having the right mental models for SSM helps you:

- Make better decisions about how to organize your infrastructure
- Troubleshoot problems more effectively
- Take full advantage of SSM's capabilities
- Communicate more clearly with other users and contributors

## Core Concepts

<div class="concept-grid">
  <a href="./architecture" class="concept-card">
    <div class="concept-icon">🏗️</div>
    <div class="concept-content">
      <h3>Architecture Overview</h3>
      <p>Understand how SSM's components work together to provide a seamless management experience.</p>
    </div>
  </a>
  
  <a href="./agentless" class="concept-card">
    <div class="concept-icon">🔌</div>
    <div class="concept-content">
      <h3>Agentless Operation</h3>
      <p>Learn how SSM manages servers without requiring agent software to be installed.</p>
    </div>
  </a>
  
  <a href="./device-model" class="concept-card">
    <div class="concept-icon">💻</div>
    <div class="concept-content">
      <h3>Device Data Model</h3>
      <p>Explore how SSM represents and tracks devices in your infrastructure.</p>
    </div>
  </a>
  
  <a href="./security" class="concept-card">
    <div class="concept-icon">🔒</div>
    <div class="concept-content">
      <h3>Security Model</h3>
      <p>Discover how SSM secures connections and protects sensitive information.</p>
    </div>
  </a>
  
  <a href="./plugins" class="concept-card">
    <div class="concept-icon">🧩</div>
    <div class="concept-content">
      <h3>Plugin System</h3>
      <p>Learn about SSM's extensible plugin architecture for adding new capabilities.</p>
    </div>
  </a>
</div>

## Mental Models

Understanding these mental models will help you work more effectively with SSM:

<div class="mental-model-grid">
  <a href="./models/devices" class="mental-model-card">
    <div class="mental-model-icon">💻</div>
    <div class="mental-model-content">
      <h3>Device Model</h3>
      <p>How SSM represents and manages servers, VMs, and other computing resources.</p>
    </div>
  </a>
  
  <a href="./models/containers" class="mental-model-card">
    <div class="mental-model-icon">📦</div>
    <div class="mental-model-content">
      <h3>Container Model</h3>
      <p>How containers are deployed, managed, and monitored across your infrastructure.</p>
    </div>
  </a>
  
  <a href="./models/automation" class="mental-model-card">
    <div class="mental-model-icon">🔄</div>
    <div class="mental-model-content">
      <h3>Automation Model</h3>
      <p>How automations are structured to respond to events and perform actions.</p>
    </div>
  </a>
  
  <a href="./models/playbooks" class="mental-model-card">
    <div class="mental-model-icon">📋</div>
    <div class="mental-model-content">
      <h3>Playbooks Model</h3>
      <p>How Ansible playbooks are used for configuration management and orchestration.</p>
    </div>
  </a>
</div>

## How These Concepts Work Together

<div class="concept-diagram">
  <img src="/about/ecosystem.svg" alt="SSM Ecosystem" style="max-width: 100%; height: auto;" />
  <div class="diagram-caption">Figure 1: How SSM's core concepts interact</div>
</div>

In SSM, these concepts work together to create a cohesive management experience:

1. **Devices** form the foundation of your infrastructure
2. **Containers** run on devices to provide isolated application environments
3. **Playbooks** configure devices and services consistently
4. **Automations** respond to events and perform actions across your infrastructure
5. The **Plugin System** extends SSM's capabilities for specific needs

Understanding how these concepts interact will help you build a more effective server management workflow.

<style>
.concept-grid, .mental-model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 32px 0;
}

.concept-card, .mental-model-card {
  display: flex;
  padding: 20px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.concept-card:hover, .mental-model-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.concept-icon, .mental-model-icon {
  font-size: 32px;
  margin-right: 16px;
  flex-shrink: 0;
}

.concept-content h3, .mental-model-content h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--vp-c-brand);
}

.concept-content p, .mental-model-content p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.mental-model-card {
  background-color: var(--vp-c-bg-alt);
}

.concept-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
  padding: 24px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.diagram-caption {
  margin-top: 16px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  font-style: italic;
}

@media (max-width: 640px) {
  .concept-grid, .mental-model-grid {
    grid-template-columns: 1fr;
  }
}
</style>
