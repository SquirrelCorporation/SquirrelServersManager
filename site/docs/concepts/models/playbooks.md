<script setup>
import DeviceModelDiagram from '/components/DeviceModelDiagram.vue';
import NextStepCard from '/components/NextStepCard.vue';
import ProcessStepsPlaybook from '/components/ProcessStepsPlaybook.vue';
import SectionHeader from '/components/SectionHeader.vue';
import FeatureGrid from '/components/FeatureGrid.vue';
import FeatureCard from '/components/FeatureCard.vue';
</script>

<style src="./styles.css"></style>

# Playbooks Mental Model

:::tip 🌰 In a Nutshell
- Playbooks in SSM are Ansible-based automation scripts for infrastructure management
- They provide idempotent, declarative configuration across multiple devices
- Playbooks can be stored locally or in remote repositories
- Variables and templates allow for flexible, reusable playbooks
- Playbooks can be executed manually or triggered by automations
:::

## What are Playbooks in SSM?

In Squirrel Servers Manager, **playbooks** are Ansible-based automation scripts that define a series of tasks to be executed across your infrastructure. Playbooks allow you to automate complex operations, ensure consistent configurations, and manage your devices at scale.

<div class="concept-diagram">
  <img src="/home/playbook.png" alt="Playbook Architecture Diagram" class="screenshot" />
  <div class="diagram-caption">Figure 1: The Playbook Architecture in SSM</div>
</div>

## Key Components of the Playbooks Model

### 1. Playbook Structure

Playbooks are written in YAML and consist of several key elements:

- **Plays**: Groups of tasks that run against specific hosts
- **Tasks**: Individual actions to be performed
- **Handlers**: Tasks that only run when notified by other tasks
- **Roles**: Reusable collections of tasks, handlers, and variables
- **Variables**: Dynamic values that can be used throughout the playbook
- **Templates**: Files with variable placeholders that get filled in during execution

### 2. Playbook Storage

SSM supports multiple ways to store and manage playbooks:

- **Local Playbooks**: Stored directly in SSM
  - Created and edited through the SSM interface
  - Immediately available for execution
  - Version controlled within SSM

- **Remote Playbooks**: Stored in external repositories
  - Git repositories (GitHub, GitLab, etc.)
  - Integration with version control systems
  - Collaborative development workflows
  - Automatic synchronization

### 3. Playbook Execution

Playbooks can be executed in several ways:

- **Manual Execution**: Run directly by users
  - Target specific devices or groups
  - Set variables at runtime
  - Monitor execution in real-time

- **Scheduled Execution**: Run at specified times
  - Regular maintenance tasks
  - Off-hours operations
  - Recurring configurations

- **Triggered Execution**: Run in response to events
  - Device status changes
  - Container events
  - System alerts
  - External triggers

### 4. Playbook Variables

Variables make playbooks flexible and reusable:

- **Inventory Variables**: Specific to devices or groups
  - Hardware capabilities
  - Network configuration
  - Role assignments

- **Playbook Variables**: Defined within the playbook
  - Configuration options
  - Default values
  - Internal state

- **Extra Variables**: Provided at runtime
  - User inputs
  - Dynamic values from automations
  - Override defaults

## How the Playbooks Model Works

<ProcessStepsPlaybook />

## Playbook Lifecycle

Playbooks in SSM follow a defined lifecycle:

1. **Creation**: Playbook is written or imported into SSM
2. **Testing**: Playbook is tested against development or staging environments
3. **Deployment**: Playbook is made available for production use
4. **Execution**: Playbook is run against target devices
5. **Monitoring**: Execution progress and results are tracked
6. **Maintenance**: Playbook is updated as requirements change
7. **Versioning**: Changes are tracked through version control

## Real-World Examples

### Example 1: System Updates and Security Hardening

<div class="example-container">
  <div class="example-scenario">
    <h4>Problem:</h4>
    <p>You need to ensure all servers are regularly updated and follow security best practices.</p>
  </div>
  
  <div class="example-solution">
    <h4>Solution using the Playbooks Model:</h4>
    
```yaml
# system_maintenance.yml
- name: System Updates and Security Hardening
  hosts: all
  become: true
  vars:
    security_level: high
    reboot_if_needed: false
    
  tasks:
    - name: Update package cache
      apt:
        update_cache: yes
      when: ansible_os_family == "Debian"
      
    - name: Upgrade all packages
      apt:
        upgrade: dist
      when: ansible_os_family == "Debian"
      
    - name: Install security packages
      apt:
        name:
          - fail2ban
          - ufw
          - unattended-upgrades
        state: present
      when: ansible_os_family == "Debian"
      
    - name: Configure firewall
      ufw:
        rule: allow
        port: "{% raw %}{{ item }}{% endraw %}"
        proto: tcp
      loop:
        - 22
        - 80
        - 443
        
    - name: Enable firewall
      ufw:
        state: enabled
        policy: deny
        
    - name: Configure automatic updates
      template:
        src: auto-updates.j2
        dest: /etc/apt/apt.conf.d/20auto-upgrades
      when: ansible_os_family == "Debian"
      
    - name: Reboot if required
      reboot:
      when: reboot_if_needed and ansible_os_family == "Debian"
```
    
    <p>This playbook:</p>
    <ul>
      <li>Updates the package cache</li>
      <li>Upgrades all installed packages</li>
      <li>Installs security-related packages</li>
      <li>Configures and enables a firewall</li>
      <li>Sets up automatic updates</li>
      <li>Optionally reboots the system if needed</li>
    </ul>
    
    <p>You can schedule this playbook to run weekly across all your devices, ensuring consistent security practices.</p>
  </div>
</div>

### Example 2: Application Deployment

<div class="example-container">
  <div class="example-scenario">
    <h4>Problem:</h4>
    <p>You need to deploy a web application across multiple servers with environment-specific configurations.</p>
  </div>
  
  <div class="example-solution">
    <h4>Solution using the Playbooks Model:</h4>
    
```yaml
---
# deploy_webapp.yml
- name: Deploy Web Application
  hosts: web_servers
  become: true
  vars:
    app_version: "1.2.3"
    app_env: production
    app_port: 8080
    db_host: "{% raw %}{{ hostvars['db_server']['ansible_host'] }}{% endraw %}"
    
  tasks:
    - name: Install dependencies
      apt:
        name:
          - nodejs
          - npm
        state: present
      when: ansible_os_family == "Debian"
      
    - name: Create application directory
      file:
        path: /opt/myapp
        state: directory
        owner: www-data
        group: www-data
        mode: '0755'
        
    - name: Download application package
      get_url:
        url: "https://example.com/releases/myapp-{% raw %}{{ app_version }}{% endraw %}.tar.gz"
        dest: /tmp/myapp.tar.gz
        
    - name: Extract application package
      unarchive:
        src: /tmp/myapp.tar.gz
        dest: /opt/myapp
        remote_src: yes
        owner: www-data
        group: www-data
        
    - name: Configure application
      template:
        src: config.js.j2
        dest: /opt/myapp/config.js
      notify: restart application
      
    - name: Create systemd service
      template:
        src: myapp.service.j2
        dest: /etc/systemd/system/myapp.service
      notify: reload systemd
      
    - name: Start and enable application service
      systemd:
        name: myapp
        state: started
        enabled: yes
        
  handlers:
    - name: reload systemd
      systemd:
        daemon_reload: yes
        
    - name: restart application
      systemd:
        name: myapp
        state: restarted
```
    
    <p>This playbook:</p>
    <ul>
      <li>Installs required dependencies</li>
      <li>Creates the application directory</li>
      <li>Downloads and extracts the application package</li>
      <li>Configures the application with environment-specific settings</li>
      <li>Sets up a systemd service for the application</li>
      <li>Starts and enables the service</li>
    </ul>
    
    <p>You can use this playbook to deploy your application to different environments by changing the variables.</p>
  </div>
</div>

## Playbook Patterns

### 1. Configuration Management

### SSH Security Configuration

**Ensure consistent SSH security settings across all servers**

File: `configure_ssh.yml`

```yaml
---
# configure_ssh.yml
- name: Configure SSH Security
  hosts: all
  become: true
  
  tasks:
    - name: Update SSH configuration
      lineinfile:
        path: /etc/ssh/sshd_config
        regexp: '{% raw %}{{ item.regexp }}{% endraw %}'
        line: '{% raw %}{{ item.line }}{% endraw %}'
        state: present
      loop:
        - { regexp: '^#?PermitRootLogin', line: 'PermitRootLogin no' }
        - { regexp: '^#?PasswordAuthentication', line: 'PasswordAuthentication no' }
        - { regexp: '^#?X11Forwarding', line: 'X11Forwarding no' }
        - { regexp: '^#?MaxAuthTries', line: 'MaxAuthTries 3' }
      notify: restart ssh
      
  handlers:
    - name: restart ssh
      service:
        name: sshd
        state: restarted
```

- This playbook targets all hosts in your inventory
- It uses the lineinfile module to modify specific lines in the SSH configuration
- The loop allows multiple configuration changes with a single task
- Changes only happen if the current configuration differs from desired state
- The handler ensures SSH service is restarted only if configuration changes

### 2. Application Lifecycle Management

### Application Lifecycle Management

**Manage the complete lifecycle of applications with a single playbook**

File: `app_lifecycle.yml`

```yaml
---
# app_lifecycle.yml
- name: Application Lifecycle Management
  hosts: app_servers
  become: true
  vars:
    app_state: present  # Options: present, absent, updated
    app_version: '2.0.0'
    
  tasks:
    - name: Install application
      block:
        - name: Download application
          get_url:
            url: 'https://example.com/app-{% raw %}{{ app_version }}{% endraw %}.zip'
            dest: '/tmp/app-{% raw %}{{ app_version }}{% endraw %}.zip'
            
        - name: Install application
          unarchive:
            src: '/tmp/app-{% raw %}{{ app_version }}{% endraw %}.zip'
            dest: '/opt/applications/'
            remote_src: yes
      when: app_state == 'present' or app_state == 'updated'
      
    - name: Remove application
      file:
        path: '/opt/applications/app-{% raw %}{{ app_version }}{% endraw %}'
        state: absent
      when: app_state == 'absent'
```

- This playbook uses a variable (app_state) to control its behavior
- The block construct groups related tasks together
- Conditional execution (when clause) determines which actions to perform
- The same playbook handles installation, updates, and removal
- Version control is managed through variables for easy updates

### 3. Infrastructure Provisioning

### Web Server Provisioning

**Set up a complete web server with HTTPS in one playbook**

File: `provision_webserver.yml`

```yaml
---
# provision_webserver.yml
- name: Provision Web Server
  hosts: new_servers
  become: true
  
  tasks:
    - name: Install web server packages
      apt:
        name:
          - nginx
          - php-fpm
          - certbot
        state: present
        
    - name: Configure virtual host
      template:
        src: vhost.conf.j2
        dest: /etc/nginx/sites-available/{% raw %}{{ domain_name }}{% endraw %}.conf
        
    - name: Enable virtual host
      file:
        src: /etc/nginx/sites-available/{% raw %}{{ domain_name }}{% endraw %}.conf
        dest: /etc/nginx/sites-enabled/{% raw %}{{ domain_name }}{% endraw %}.conf
        state: link
        
    - name: Obtain SSL certificate
      command: >
        certbot --nginx -d {% raw %}{{ domain_name }}{% endraw %} -d www.{% raw %}{{ domain_name }}{% endraw %}
        --non-interactive --agree-tos --email {% raw %}{{ admin_email }}{% endraw %}
      args:
        creates: /etc/letsencrypt/live/{% raw %}{{ domain_name }}{% endraw %}/fullchain.pem
```

- This playbook targets newly added servers to set up a complete web stack
- It installs all required packages in a single task
- Templates are used for configuration files to customize for each domain
- Symbolic links enable the virtual host configuration
- The creates parameter ensures the SSL certificate is only obtained if it doesn't exist

## Best Practices

::: tip 💡 Do's
- Write idempotent playbooks that can be run multiple times safely
- Use roles to organize and reuse playbook components
- Test playbooks in development environments before production
- Use variables for values that might change
- Include proper error handling and validation
- Document your playbooks with comments and README files
:::

::: danger ⛔ Don'ts
- Don't hardcode sensitive information like passwords or API keys
- Don't write playbooks that make irreversible changes without confirmation
- Don't ignore failed tasks without proper handling
- Don't create overly complex playbooks that are hard to maintain
- Don't forget to version control your playbooks
:::

## Common Misconceptions

### Misconception 1: Playbooks are just scripts

**Reality**: While scripts execute commands sequentially, playbooks are declarative and idempotent. They define the desired state of the system and only make changes when necessary to achieve that state.

### Misconception 2: Playbooks require deep Ansible knowledge

**Reality**: SSM provides templates and examples that make it easy to get started with playbooks. The web interface simplifies creation, editing, and execution, reducing the learning curve.

### Misconception 3: Playbooks are only for large-scale deployments

**Reality**: Playbooks are valuable for infrastructures of any size. Even with just a few devices, playbooks ensure consistency and save time on repetitive tasks.

<SectionHeader title="Related Concepts">
  <FeatureGrid>
    <FeatureCard
      icon="💻"
      title="Device Model"
      description="How devices are managed and monitored in SSM"
      link="./devices"
    />
    
    <FeatureCard
      icon="📦"
      title="Container Model"
      description="How containers are deployed and managed"
      link="./containers"
    />
    
    <FeatureCard
      icon="🔄"
      title="Automation Model"
      description="How to create event-driven workflows"
      link="./automation"
    />
  </FeatureGrid>
</SectionHeader>

<SectionHeader title="Further Reading">
  <ul>
    <li><a href="/docs/user-guides/stacks/playbooks/overview">Playbooks Overview</a> - Introduction to using playbooks in SSM</li>
    <li><a href="/docs/user-guides/stacks/playbooks/variables">Playbook Variables</a> - Working with variables in playbooks</li>
    <li><a href="/docs/user-guides/stacks/playbooks/executing">Executing Playbooks</a> - Running playbooks on your devices</li>
    <li><a href="https://docs.ansible.com/ansible/latest/index.html">Ansible Documentation</a> - Official Ansible documentation</li>
  </ul>
</SectionHeader>

<SectionHeader title="Next Steps">
  <NextStepCard 
    title="Device Management" 
    description="Learn how to effectively manage your devices in SSM" 
    link="/docs/user-guides/devices/management" 
  />
</SectionHeader>

<style>
.example-container {
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.example-scenario {
  padding: 1rem;
  background-color: #3a5ccc;
  color: white;
}

.example-scenario h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.example-scenario p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.example-solution {
  padding: 1rem;
}

.example-solution h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #3a5ccc;
}

.example-solution ul {
  margin-top: 1rem;
  padding-left: 1.5rem;
}

.example-solution li {
  margin-bottom: 0.5rem;
  color: #495057;
}

.related-concepts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.related-concept-card {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.related-concept-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.related-concept-card h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #3a5ccc;
}

.related-concept-card p {
  color: #495057;
  margin-bottom: 1rem;
}

.related-concept-card a {
  color: #ff5d13;
  text-decoration: none;
  font-weight: bold;
  display: inline-block;
}

.related-concept-card a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .related-concepts {
    grid-template-columns: 1fr;
  }
}
</style>
