<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

# Quick Start Guide: [Product/Feature Name]

<PageHeader 
  title="Quick Start Guide: [Product/Feature Name]" 
  icon="🚀" 
  time="Estimated time: 10 minutes" 
/>

:::tip 🌰 In a Nutshell
- [Key outcome 1] in just a few steps
- [Key requirement 1] required
- [Key benefit 1] delivered immediately
:::

<style>
.quick-start-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.quick-start-icon {
  font-size: 48px;
  line-height: 1;
}

.quick-start-time {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
}
</style>

## Prerequisites

<div class="prerequisites">
  <div class="prerequisite">
    <div class="prerequisite-icon">✅</div>
    <div class="prerequisite-details">
      <div class="prerequisite-title">[Prerequisite 1]</div>
      <div class="prerequisite-description">[Brief description of this requirement]</div>
    </div>
  </div>
  
  <div class="prerequisite">
    <div class="prerequisite-icon">✅</div>
    <div class="prerequisite-details">
      <div class="prerequisite-title">[Prerequisite 2]</div>
      <div class="prerequisite-description">[Brief description of this requirement]</div>
    </div>
  </div>
  
  <div class="prerequisite">
    <div class="prerequisite-icon">✅</div>
    <div class="prerequisite-details">
      <div class="prerequisite-title">[Prerequisite 3]</div>
      <div class="prerequisite-description">[Brief description of this requirement]</div>
    </div>
  </div>
</div>

<style>
.prerequisites {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
}

.prerequisite {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.prerequisite-icon {
  color: #52c41a;
  font-size: 20px;
}

.prerequisite-details {
  flex: 1;
}

.prerequisite-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.prerequisite-description {
  color: rgba(0, 0, 0, 0.85);
}
</style>

## Installation

::: code-group
```bash [Docker]
# Install using Docker
curl -sL https://getssm.io | bash
```

```bash [Proxmox]
# Install on Proxmox
bash -c "$(wget -qLO - https://getssm.io/proxmox)"
```

```bash [Manual]
# Manual installation
git clone https://github.com/squirrelcorporation/ssm.git
cd ssm
./install.sh
```
:::

<div class="installation-verification">
  <div class="verification-header">Verify Installation</div>
  <div class="verification-content">
    <p>Check that installation completed successfully:</p>
    <pre><code>ssm --version</code></pre>
    <p>You should see output similar to:</p>
    <pre><code>Squirrel Servers Manager v1.2.3</code></pre>
  </div>
</div>

<style>
.installation-verification {
  margin: 24px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.verification-header {
  background-color: #1890ff;
  color: white;
  padding: 12px 16px;
  font-weight: bold;
}

.verification-content {
  padding: 16px;
}

.verification-content pre {
  margin: 12px 0;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 12px;
  border-radius: 6px;
}
</style>

## Initial Setup

<div class="steps">
  <div class="step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h3>Access the Web Interface</h3>
      <p>Open your browser and navigate to:</p>
      <div class="step-code">http://localhost:8000</div>
      <!-- Add screenshot here:
      <img src="/images/quick-start/login-screen.png" alt="Login Screen" class="step-image" />
      -->
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h3>Create Admin Account</h3>
      <p>Enter your details to create the admin account:</p>
      <ul>
        <li><strong>Full Name:</strong> Your name</li>
        <li><strong>Email:</strong> Your email address</li>
        <li><strong>Password:</strong> Secure password (min. 8 characters)</li>
      </ul>
      <div class="tip">
        <div class="tip-icon">💡</div>
        <div class="tip-content">
          Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.
        </div>
      </div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">3</div>
    <div class="step-content">
      <h3>Add Your First Device</h3>
      <p>Click on "Add Device" and enter your device details:</p>
      <div class="substeps">
        <div class="substep">
          <div class="substep-bullet">a.</div>
          <div class="substep-content">Enter device name and IP address</div>
        </div>
        <div class="substep">
          <div class="substep-bullet">b.</div>
          <div class="substep-content">Select connection method (SSH password or key)</div>
        </div>
        <div class="substep">
          <div class="substep-bullet">c.</div>
          <div class="substep-content">Test connection and save</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">4</div>
    <div class="step-content">
      <h3>Deploy Your First Container</h3>
      <p>Navigate to Containers and click "Deploy New Container":</p>
      <div class="substeps">
        <div class="substep">
          <div class="substep-bullet">a.</div>
          <div class="substep-content">Select a container template</div>
        </div>
        <div class="substep">
          <div class="substep-bullet">b.</div>
          <div class="substep-content">Configure container settings</div>
        </div>
        <div class="substep">
          <div class="substep-bullet">c.</div>
          <div class="substep-content">Deploy and verify status</div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 24px 0;
}

.step {
  display: flex;
  gap: 16px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin-top: 0;
  margin-bottom: 12px;
}

.step-code {
  margin: 12px 0;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
}

.step-image {
  margin-top: 12px;
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.tip {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(24, 144, 255, 0.1);
  border-radius: 6px;
}

.tip-icon {
  font-size: 16px;
}

.tip-content {
  flex: 1;
  font-size: 14px;
}

.substeps {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.substep {
  display: flex;
  gap: 8px;
}

.substep-bullet {
  font-weight: bold;
}

.substep-content {
  flex: 1;
}
</style>

## Next Steps

<div class="next-steps">
  <div class="next-step-card">
    <div class="next-step-icon">📊</div>
    <div class="next-step-content">
      <h3>View Dashboard</h3>
      <p>Monitor your devices and containers from the dashboard.</p>
      <a href="../user-guides/dashboard">Learn more →</a>
    </div>
  </div>
  
  <div class="next-step-card">
    <div class="next-step-icon">🔄</div>
    <div class="next-step-content">
      <h3>Set Up Automations</h3>
      <p>Create automated tasks for your infrastructure.</p>
      <a href="../user-guides/automations">Learn more →</a>
    </div>
  </div>
  
  <div class="next-step-card">
    <div class="next-step-icon">📚</div>
    <div class="next-step-content">
      <h3>Explore Documentation</h3>
      <p>Discover all features and capabilities of SSM.</p>
      <a href="../user-guides/">Browse guides →</a>
    </div>
  </div>
</div>

<style>
.next-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.next-step-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.next-step-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.next-step-icon {
  font-size: 24px;
}

.next-step-content {
  flex: 1;
}

.next-step-content h3 {
  margin-top: 0;
  margin-bottom: 8px;
}

.next-step-content p {
  margin-bottom: 8px;
}

.next-step-content a {
  font-weight: bold;
}
</style>

## Troubleshooting

<details>
<summary>Common Installation Issues</summary>

### Docker Installation Fails

**Problem**: Docker installation script fails with permission errors.

**Solution**: 
```bash
# Run with sudo
sudo curl -sL https://getssm.io | bash
```

### Cannot Access Web Interface

**Problem**: Browser cannot connect to SSM web interface.

**Solution**:
1. Verify services are running:
   ```bash
   docker ps | grep ssm
   ```
2. Check if the port is accessible:
   ```bash
   curl localhost:8000
   ```
3. Ensure no firewall is blocking the connection.

</details>

<div class="feedback-section">
  <div class="feedback-header">Was this guide helpful?</div>
  <div class="feedback-content">
    <p>We're continuously improving our documentation. Let us know how we can make it better!</p>
    <div class="feedback-links">
      <a href="https://github.com/squirrelcorporation/ssm/issues/new?template=doc_feedback.md&title=Quick+Start+Guide+Feedback" class="feedback-link">
        <span>📝</span> Submit Feedback
      </a>
      <a href="https://discord.gg/ssm" class="feedback-link">
        <span>💬</span> Join Discord
      </a>
    </div>
  </div>
</div>

<style>
.feedback-section {
  margin-top: 48px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.feedback-header {
  background-color: #1890ff;
  color: white;
  padding: 12px 16px;
  font-weight: bold;
}

.feedback-content {
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
}

.feedback-links {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.feedback-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  text-decoration: none;
  font-weight: bold;
  transition: all 0.2s ease;
}

.feedback-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}
</style>
