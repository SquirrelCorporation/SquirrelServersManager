# Advanced Guides

<div class="quick-start-header">
  <div class="quick-start-icon">⚙️</div>
  <div class="quick-start-time">⏱️ Guide Overview</div>
</div>

:::tip 🌰 In a Nutshell
- Detailed guides for advanced SSM usage scenarios
- Complex configuration and deployment patterns
- Performance tuning and optimization techniques
- Security hardening and enterprise deployments
- Integration with external systems and services
:::

This section contains in-depth guides for advanced users of Squirrel Servers Manager. These guides go beyond basic usage to cover complex scenarios, customizations, and optimizations.

## Installation & Deployment

<div class="advanced-guides">
  <a href="/docs/install/dockerless" class="guide-card">
    <div class="guide-icon">🧩</div>
    <div class="guide-content">
      <h3>Dockerless Installation</h3>
      <p>Install SSM without Docker for specialized environments</p>
      <div class="difficulty-badge high">Advanced</div>
    </div>
  </a>
  
  <a href="/docs/install/proxy-free" class="guide-card">
    <div class="guide-icon">📡</div>
    <div class="guide-content">
      <h3>Proxy-Free Setup</h3>
      <p>Configure SSM without the proxy component</p>
      <div class="difficulty-badge medium">Intermediate</div>
    </div>
  </a>
  
  <a href="/docs/devmode" class="guide-card">
    <div class="guide-icon">🛠️</div>
    <div class="guide-content">
      <h3>Development Mode</h3>
      <p>Set up a development environment for SSM</p>
      <div class="difficulty-badge medium">Intermediate</div>
    </div>
  </a>
  
  <a href="/docs/technical-guide/manual-install-ssm" class="guide-card">
    <div class="guide-icon">⚙️</div>
    <div class="guide-content">
      <h3>Manual Installation</h3>
      <p>Step-by-step manual installation process</p>
      <div class="difficulty-badge high">Advanced</div>
    </div>
  </a>
</div>

<style>
.advanced-guides {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.guide-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
  position: relative;
}

.guide-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px var(--vp-c-divider);
}

.guide-icon {
  font-size: 32px;
  line-height: 1;
}

.guide-content {
  flex: 1;
}

.guide-content h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--vp-c-brand);
}

.guide-content p {
  margin-bottom: 20px;
  color: var(--vp-c-text-2);
}

.difficulty-badge {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.difficulty-badge.low {
  background-color: var(--vp-c-green-soft);
  color: var(--vp-c-green-dark);
}

.difficulty-badge.medium {
  background-color: var(--vp-c-yellow-soft);
  color: var(--vp-c-yellow-dark);
}

.difficulty-badge.high {
  background-color: var(--vp-c-red-soft);
  color: var(--vp-c-red-dark);
}
</style>

## Performance & Scaling

<div class="coming-soon-section">
  <h3>Coming Soon</h3>
  <div class="coming-soon-items">
    <div class="coming-soon-item">
      <h4>🚀 High Availability Setup</h4>
      <p>Configure SSM for high availability and redundancy</p>
    </div>
    
    <div class="coming-soon-item">
      <h4>⚡ Performance Tuning</h4>
      <p>Optimize SSM for high-throughput environments</p>
    </div>
    
    <div class="coming-soon-item">
      <h4>📈 Resource Planning</h4>
      <p>Sizing guidance for different scales of deployment</p>
    </div>
    
    <div class="coming-soon-item">
      <h4>🔄 Database Replication</h4>
      <p>Configure MongoDB replication for reliability</p>
    </div>
  </div>
</div>

<style>
.coming-soon-section {
  margin: 32px 0;
  padding: 24px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.coming-soon-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--vp-c-brand);
  text-align: center;
}

.coming-soon-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.coming-soon-item {
  padding: 16px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-mute);
  border: 1px dashed var(--vp-c-divider);
}

.coming-soon-item h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

.coming-soon-item p {
  margin-bottom: 0;
  color: var(--vp-c-text-2);
}
</style>

## Security Hardening

<div class="security-section">
  <div class="security-intro">
    <h3>Securing Your SSM Deployment</h3>
    <p>Security is a critical aspect of any infrastructure management tool. While SSM includes robust security features by default, these guides will help you further harden your deployment against potential threats.</p>
  </div>
  
  <div class="security-checklist">
    <h4>Security Best Practices</h4>
    <ul class="security-list">
      <li><span class="check">✓</span> Use strong, unique passwords for all services</li>
      <li><span class="check">✓</span> Implement HTTPS with proper certificates</li>
      <li><span class="check">✓</span> Restrict network access to SSM interfaces</li>
      <li><span class="check">✓</span> Use SSH keys instead of passwords where possible</li>
      <li><span class="check">✓</span> Keep all components updated to the latest version</li>
      <li><span class="check">✓</span> Implement proper user role permissions</li>
      <li><span class="check">✓</span> Regularly backup MongoDB data</li>
      <li><span class="check">✓</span> Monitor logs for unusual activity</li>
    </ul>
  </div>
</div>

<style>
.security-section {
  margin: 32px 0;
  padding: 24px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border-left: 4px solid var(--vp-c-brand);
}

.security-intro {
  margin-bottom: 20px;
}

.security-intro h3 {
  margin-top: 0;
  margin-bottom: 12px;
}

.security-intro p {
  margin-bottom: 0;
}

.security-checklist h4 {
  margin-top: 0;
  margin-bottom: 16px;
}

.security-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 8px 16px;
  padding: 0;
  list-style-type: none;
}

.security-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
}

.check {
  color: var(--vp-c-green);
  font-weight: bold;
}
</style>

## Enterprise Integration

<div class="enterprise-section">
  <h3>Enterprise Integration Guides</h3>
  <p>These guides are for organizations looking to integrate SSM with existing enterprise systems and workflows.</p>
  
  <div class="coming-soon-items">
    <div class="coming-soon-item">
      <h4>🔐 LDAP/SSO Integration</h4>
      <p>Connect SSM to enterprise identity providers</p>
    </div>
    
    <div class="coming-soon-item">
      <h4>📊 Enterprise Monitoring</h4>
      <p>Integration with Grafana, Datadog, and other monitoring tools</p>
    </div>
    
    <div class="coming-soon-item">
      <h4>🔔 Alerting Systems</h4>
      <p>Configure alerts with PagerDuty, OpsGenie, and more</p>
    </div>
    
    <div class="coming-soon-item">
      <h4>📝 Audit Logging</h4>
      <p>Advanced audit trails for compliance requirements</p>
    </div>
  </div>
</div>

<style>
.enterprise-section {
  margin: 32px 0;
  padding: 24px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.enterprise-section h3 {
  margin-top: 0;
  margin-bottom: 12px;
}

.enterprise-section > p {
  margin-bottom: 20px;
}
</style>

## Developer Advanced Topics

<div class="developer-section">
  <a href="/docs/developer/plugins" class="developer-topic">
    <h3>Plugin Development</h3>
    <p>Create custom plugins to extend SSM's functionality</p>
  </a>
  
  <div class="developer-coming-soon">
    <h3>Coming Soon</h3>
    <div class="developer-coming-soon-items">
      <div class="developer-coming-soon-item">API Development Guide</div>
      <div class="developer-coming-soon-item">Custom Dashboard Development</div>
      <div class="developer-coming-soon-item">External Integration APIs</div>
    </div>
  </div>
</div>

<style>
.developer-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 32px 0;
}

.developer-topic {
  padding: 24px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
}

.developer-topic:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px var(--vp-c-divider);
}

.developer-topic h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--vp-c-brand);
}

.developer-topic p {
  margin-bottom: 0;
  color: var(--vp-c-text-2);
}

.developer-coming-soon {
  padding: 24px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.developer-coming-soon h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--vp-c-brand);
}

.developer-coming-soon-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.developer-coming-soon-item {
  padding: 12px;
  border-radius: 6px;
  background-color: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  font-weight: 500;
}
</style>

## Need Help?

If you're tackling advanced configuration or deployment scenarios and need assistance:

- Join our [Discord community](https://discord.gg/cnQjsFCGKJ) for real-time help
- Check existing [GitHub issues](https://github.com/SquirrelCorporation/SquirrelServersManager/issues) for known solutions
- Submit detailed questions with your configuration and environment details

## Next Steps

Ready to dive into advanced security configurations?

<a href="/docs/advanced-guides/security" class="next-step-card">
  <div class="next-step-icon">🔒</div>
  <h2>Security Hardening</h2>
  <div class="next-step-separator"></div>
  <p>Learn how to secure your SSM deployment for production use</p>
</a>