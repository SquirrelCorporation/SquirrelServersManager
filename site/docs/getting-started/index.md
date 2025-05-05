<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import SectionHeader from '/components/SectionHeader.vue';
import FeatureGrid from '/components/FeatureGrid.vue';
import FeatureCard from '/components/FeatureCard.vue';
</script>

# Getting Started with SSM

:::tip 🌰 In a Nutshell
- Install SSM and create your admin account
- Add your first device using SSH
- Deploy and manage your first container
- Monitor device health and performance
:::

Welcome to Squirrel Servers Manager (SSM)! This section will guide you through the installation process, initial setup, and basic usage of SSM.

## Quick Start Path

<div class="quickstart-path">
  <div class="path-step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h3>Installation</h3>
      <p>Install SSM using Docker or on Proxmox</p>
      <a href="/docs/getting-started/installation" class="step-link">Installation Guide →</a>
    </div>
  </div>
  
  <div class="path-step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h3>First-Time Setup</h3>
      <p>Create admin account and log in</p>
      <a href="/docs/getting-started/first-steps" class="step-link">First Steps Guide →</a>
    </div>
  </div>
  
  <div class="path-step">
    <div class="step-number">3</div>
    <div class="step-content">
      <h3>Add a Device</h3>
      <p>Connect your first server or device</p>
      <a href="/docs/devices/add-device" class="step-link">Device Setup →</a>
    </div>
  </div>
  
  <div class="path-step">
    <div class="step-number">4</div>
    <div class="step-content">
      <h3>Deploy a Container</h3>
      <p>Deploy and manage your first container</p>
      <a href="/docs/containers/containers" class="step-link">Container Guide →</a>
    </div>
  </div>
</div>


## System Requirements

Before installing SSM, ensure your system meets the following requirements:

<div class="requirements-grid">
  <div class="requirement-card">
    <div class="requirement-header">Docker Host</div>
    <div class="requirement-content">
      <div class="req-item"><span class="req-check">✓</span> Docker 20.10+ or Docker Engine</div>
      <div class="req-item"><span class="req-check">✓</span> Docker Compose V2</div>
      <div class="req-item"><span class="req-check">✓</span> 2GB RAM (minimum)</div>
      <div class="req-item"><span class="req-check">✓</span> 10GB free disk space</div>
      <div class="req-item"><span class="req-check">✓</span> Linux-based OS</div>
    </div>
  </div>
  
  <div class="requirement-card">
    <div class="requirement-header">Target Devices</div>
    <div class="requirement-content">
      <div class="req-item"><span class="req-check">✓</span> SSH access (password or key)</div>
      <div class="req-item"><span class="req-check">✓</span> Python 3.8+ for Ansible features</div>
      <div class="req-item"><span class="req-check">✓</span> Sudo privileges for container management</div>
      <div class="req-item"><span class="req-check">✓</span> Docker for container features</div>
    </div>
  </div>

  <div class="requirement-card">
    <div class="requirement-header">Browser Support</div>
    <div class="requirement-content">
      <div class="req-item"><span class="req-check">✓</span> Chrome 90+</div>
      <div class="req-item"><span class="req-check">✓</span> Firefox 90+</div>
      <div class="req-item"><span class="req-check">✓</span> Safari 15+</div>
      <div class="req-item"><span class="req-check">✓</span> Edge 90+</div>
    </div>
  </div>
  
  <div class="requirement-card">
    <div class="requirement-header">Network</div>
    <div class="requirement-content">
      <div class="req-item"><span class="req-check">✓</span> Open port 8000 for web interface</div>
      <div class="req-item"><span class="req-check">✓</span> Outbound SSH access to devices</div>
      <div class="req-item"><span class="req-check">✓</span> Internet access for updates</div>
    </div>
  </div>
</div>



## Installation Methods

SSM offers multiple installation methods to fit your needs:

1. **Docker Installation** - The recommended method using Docker and Docker Compose
2. **Proxmox Installation** - Optimized for Proxmox Virtual Environment hosts
3. **Manual Installation** - For advanced users who want to customize the setup
4. **Dockerless Setup** - For environments where Docker is not available

See the [Installation Guide](/docs/getting-started/installation) for detailed instructions.

## Next Steps

<NextStepCard 
  icon="👉" 
  title="First Time Setup" 
  description="Create your admin account and get started with SSM" 
  link="/docs/getting-started/first-steps" 
/>


## Where to Go Next

After completing the initial setup, explore these areas to get the most out of SSM:

<FeatureGrid>
  <FeatureCard
    icon="📱"
    title="Device Management"
    description="Learn to manage and monitor your devices"
    link="/docs/user-guides/devices/"
  />
  
  <FeatureCard
    icon="🐳"
    title="Container Management"
    description="Deploy and manage Docker containers"
    link="/docs/user-guides/containers/"
  />
  
  <FeatureCard
    icon="🤖"
    title="Automations"
    description="Set up automated tasks and workflows"
    link="/docs/user-guides/automations/"
  />
  
  <FeatureCard
    icon="📚"
    title="Playbooks"
    description="Use Ansible playbooks for configuration"
    link="/docs/user-guides/playbooks/"
  />
</FeatureGrid>


## Getting Help

If you encounter any issues during installation or setup:

- Check the <a href="/docs/troubleshoot/troubleshoot">Troubleshooting Guide</a> for common solutions
- Join our <a href="https://discord.gg/cnQjsFCGKJ">Discord community</a> for real-time support
- Open an issue on <a href="https://github.com/SquirrelCorporation/SquirrelServersManager/issues">GitHub</a> for bug reports
