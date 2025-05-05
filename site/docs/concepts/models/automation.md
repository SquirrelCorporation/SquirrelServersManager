<script setup>
import NextStepCard from '/components/NextStepCard.vue';
</script>

<style src="./styles.css"></style>

# Automation Mental Model

:::tip 🌰 In a Nutshell
- Automations in SSM allow you to create event-driven workflows
- Triggers initiate automations based on events, schedules, or conditions
- Actions define what happens when an automation is triggered
- Automations can manage devices, containers, and execute playbooks
- Complex workflows can be created by chaining multiple automations
:::

## What is Automation in SSM?

In Squirrel Servers Manager, **automation** refers to the system that allows you to create event-driven workflows that respond to triggers and perform actions across your infrastructure. Automations help you reduce manual work, ensure consistency, and respond quickly to events.

<div class="concept-diagram">
  <img src="/home/ibm-event-automation.svg" alt="Automation Flow Diagram" class="diagram-image" />
  <div class="diagram-caption">Figure 1: Event-Driven Automation Flow in SSM</div>
</div>

## Key Components of the Automation Model

### 1. Triggers

Triggers are events or conditions that initiate an automation:

- **Event Triggers**: Respond to specific events in the system
  - Container events (start, stop, update, failure)
  - Device events (connection, disconnection, resource thresholds)
  - System events (updates, backups, errors)

- **Schedule Triggers**: Run at specified times
  - One-time execution
  - Recurring schedules (hourly, daily, weekly, monthly)
  - Cron expressions for complex scheduling

- **Condition Triggers**: Activate when specific conditions are met
  - Resource thresholds (CPU, memory, disk usage)
  - Service status changes
  - External API responses

### 2. Actions

Actions define what happens when an automation is triggered:

- **Device Actions**
  - Reboot or shutdown
  - Run commands
  - Update system packages
  - Change configuration

- **Container Actions**
  - Start, stop, or restart containers
  - Update container images
  - Modify container configuration
  - Deploy new containers

- **Playbook Actions**
  - Execute Ansible playbooks
  - Pass variables to playbooks
  - Target specific devices or groups

- **Notification Actions**
  - Send email alerts
  - Push notifications
  - Webhook integrations
  - Log events

### 3. Conditions

Conditions allow for more complex decision-making within automations:

- **Filters**: Limit when actions are performed
  - Device properties (type, tags, status)
  - Container properties (image, status, resource usage)
  - Time-based conditions

- **Branching Logic**: Different actions based on conditions
  - If-then-else logic
  - Multiple outcome paths

### 4. Variables

Variables provide dynamic data to automations:

- **System Variables**: Built-in data about the environment
  - Current time and date
  - Trigger information
  - System status

- **Event Data**: Information from the triggering event
  - Container or device details
  - Error messages
  - Resource metrics

- **Custom Variables**: User-defined values
  - Configuration parameters
  - Thresholds
  - Target identifiers

## How the Automation Model Works

<div class="steps-container">
  <div class="step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h4>Trigger Definition</h4>
      <p>Define what event, schedule, or condition will initiate the automation.</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h4>Condition Evaluation</h4>
      <p>When triggered, evaluate any conditions to determine if actions should proceed.</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">3</div>
    <div class="step-content">
      <h4>Variable Resolution</h4>
      <p>Resolve any variables needed for the actions from system data, event data, or custom values.</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">4</div>
    <div class="step-content">
      <h4>Action Execution</h4>
      <p>Execute the defined actions in sequence or based on branching logic.</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">5</div>
    <div class="step-content">
      <h4>Result Handling</h4>
      <p>Process the results of actions, potentially triggering notifications or additional automations.</p>
    </div>
  </div>
</div>

## Automation Lifecycle

Automations in SSM follow a defined lifecycle:

1. **Creation**: Automation is defined with triggers, conditions, and actions
2. **Activation**: Automation is enabled and ready to respond to triggers
3. **Triggering**: An event, schedule, or condition activates the automation
4. **Execution**: Actions are performed according to the automation definition
5. **Completion**: Automation finishes executing all actions
6. **Logging**: Results and execution details are recorded
7. **Maintenance**: Automation is updated or modified as needed

## Real-World Examples

### Example 1: Automatic Container Updates

<div class="example-container">
  <div class="example-scenario">
    <h4>Problem:</h4>
    <p>You want to automatically update containers when new images are available, but only during maintenance windows.</p>
  </div>
  
  <div class="example-solution">
    <h4>Solution using the Automation Model:</h4>
    
    <p><strong>Trigger:</strong> Schedule (every day at 2:00 AM)</p>
    
    <p><strong>Conditions:</strong></p>
    <ul>
      <li>Day of week is Tuesday or Thursday (maintenance window)</li>
      <li>Container has updates available</li>
    </ul>
    
    <p><strong>Actions:</strong></p>
    <ol>
      <li>Check for container image updates</li>
      <li>For each container with updates:
        <ul>
          <li>Pull new image</li>
          <li>Stop current container</li>
          <li>Start new container with updated image</li>
          <li>Verify container health</li>
          <li>Send notification of successful update</li>
        </ul>
      </li>
    </ol>
  </div>
</div>

### Example 2: Resource Monitoring and Scaling

<div class="example-container">
  <div class="example-scenario">
    <h4>Problem:</h4>
    <p>You need to monitor resource usage on your web server and take action when load increases.</p>
  </div>
  
  <div class="example-solution">
    <h4>Solution using the Automation Model:</h4>
    
    <p><strong>Trigger:</strong> Condition (CPU usage > 80% for 5 minutes)</p>
    
    <p><strong>Actions:</strong></p>
    <ol>
      <li>Execute playbook to scale web server resources</li>
      <li>Restart web server container with new resource limits</li>
      <li>Send notification to administrator</li>
      <li>Create follow-up check automation to verify performance after 15 minutes</li>
    </ol>
    
    <p><strong>Variables:</strong></p>
    <ul>
      <li>Current CPU usage percentage</li>
      <li>Device identifier</li>
      <li>Container name</li>
      <li>New resource allocation values</li>
    </ul>
    
    <p><strong>Implementation:</strong></p>
    
```yaml
{% raw %}
# High CPU Usage Response Automation
trigger:
  type: condition
  resource: device
  property: cpu.usage
  operator: ">"
  value: 80
  duration: 5m
  
conditions:
  - type: device_tag
    tag: "environment:production"
  - type: time_window
    days: [1, 2, 3, 4, 5]  # Weekdays only
    start_time: "07:00"
    end_time: "19:00"
    
variables:
  new_container_memory: "{{ device.memory.total * 0.5 }}"
  new_container_cpus: "{{ device.cpu.cores * 0.75 }}"
  
actions:
  - type: playbook
    name: scale-webserver-resources
    targets: "{{ trigger.device.id }}"
    variables:
      memory_limit: "{{ variables.new_container_memory }}"
      cpu_limit: "{{ variables.new_container_cpus }}"
      
  - type: container
    action: update
    container: "web-server"
    config:
      resources:
        memory: "{{ variables.new_container_memory }}MB"
        cpus: "{{ variables.new_container_cpus }}"
    restart: true
    
  - type: notification
    method: email
    recipient: "admin@example.com"
    subject: "Web Server Scaled Due to High CPU Usage"
    body: |
      The web server on {{ trigger.device.name }} was experiencing high CPU usage ({{ trigger.value }}%).
      
      Actions taken:
      - Scaled resources to {{ variables.new_container_cpus }} CPUs and {{ variables.new_container_memory }}MB memory
      - Restarted container with new resource limits
      
      Please check the server status at your earliest convenience.
      
  - type: create_automation
    name: "Follow-up check for {{ trigger.device.name }}"
    trigger:
      type: schedule
      delay: 15m
      one_time: true
    actions:
      - type: command
        device: "{{ trigger.device.id }}"
        command: "docker stats web-server --no-stream"
      - type: notification
        method: email
        recipient: "admin@example.com"
        subject: "Follow-up: Web Server Performance Check"
        body: "Current resource usage after scaling: {{ command.output }}"
{% endraw %}
```
  </div>
</div>

### Example 3: Automated Backup and Rotation

<div class="example-container">
  <div class="example-scenario">
    <h4>Problem:</h4>
    <p>You need to automatically back up database containers, verify the backups, and maintain a rotation policy.</p>
  </div>
  
  <div class="example-solution">
    <h4>Solution using the Automation Model:</h4>
    
    <p><strong>Trigger:</strong> Schedule (Daily at 1:00 AM)</p>
    
    <p><strong>Actions:</strong></p>
    <ol>
      <li>Create database backup</li>
      <li>Verify backup integrity</li>
      <li>Upload backup to remote storage</li>
      <li>Rotate local backups (keep last 7 days)</li>
      <li>Send backup status report</li>
    </ol>
    
    <p><strong>Implementation:</strong></p>
    
```yaml
{% raw %}
# Database Backup Automation
trigger:
  type: schedule
  cron: "0 1 * * *"  # Daily at 1:00 AM
  
variables:
  backup_date: "{{ now | date('YYYY-MM-DD') }}"
  backup_path: "/backups/db-{{ variables.backup_date }}.sql.gz"
  remote_path: "s3://my-backups/databases/{{ variables.backup_date }}.sql.gz"
  
actions:
  # Step 1: Create database backup
  - type: container
    action: exec
    container: "postgres-db"
    command: |
      pg_dump -U postgres mydatabase | gzip > {{ variables.backup_path }}
    store_output: backup_result
    
  # Step 2: Verify backup integrity
  - type: command
    device: "{{ trigger.device.id }}"
    command: "gzip -t {{ variables.backup_path }} && echo 'Backup integrity verified'"
    store_output: verify_result
    
  # Step 3: Upload to remote storage
  - type: command
    device: "{{ trigger.device.id }}"
    command: "aws s3 cp {{ variables.backup_path }} {{ variables.remote_path }}"
    store_output: upload_result
    
  # Step 4: Rotate local backups (keep last 7 days)
  - type: command
    device: "{{ trigger.device.id }}"
    command: "find /backups -name 'db-*.sql.gz' -type f -mtime +7 -delete"
    store_output: rotation_result
    
  # Step 5: Send backup status report
  - type: notification
    method: email
    recipient: "dba@example.com"
    subject: "Database Backup Report - {{ variables.backup_date }}"
    body: |
      Database Backup Summary:
      
      Date: {{ variables.backup_date }}
      Backup Location: {{ variables.backup_path }}
      Remote Storage: {{ variables.remote_path }}
      
      Backup Creation: {{ backup_result.exit_code == 0 ? 'SUCCESS' : 'FAILED' }}
      Integrity Check: {{ verify_result.exit_code == 0 ? 'SUCCESS' : 'FAILED' }}
      Remote Upload: {{ upload_result.exit_code == 0 ? 'SUCCESS' : 'FAILED' }}
      Backup Rotation: {{ rotation_result.exit_code == 0 ? 'SUCCESS' : 'FAILED' }}
      
      {% if backup_result.exit_code != 0 or verify_result.exit_code != 0 or upload_result.exit_code != 0 %}
      ERROR DETAILS:
      {% if backup_result.exit_code != 0 %}
      Backup Error: {{ backup_result.stderr }}
      {% endif %}
      {% if verify_result.exit_code != 0 %}
      Verify Error: {{ verify_result.stderr }}
      {% endif %}
      {% if upload_result.exit_code != 0 %}
      Upload Error: {{ upload_result.stderr }}
      {% endif %}
      {% endif %}
      
      Please check the backup system if any errors are reported.
{% endraw %}
```
  </div>
</div>

## Visual Flowchart of Automation Triggers and Actions

<div class="concept-diagram">
  <div class="flowchart">
    <div class="flowchart-column">
      <div class="flowchart-header">Triggers</div>
      <div class="flowchart-item trigger-event">
        <div class="item-icon">🔔</div>
        <div class="item-title">Event Triggers</div>
        <div class="item-examples">Container start/stop, Device connection</div>
      </div>
      <div class="flowchart-item trigger-schedule">
        <div class="item-icon">⏰</div>
        <div class="item-title">Schedule Triggers</div>
        <div class="item-examples">Daily at 2am, Every 15 minutes</div>
      </div>
      <div class="flowchart-item trigger-condition">
        <div class="item-icon">📊</div>
        <div class="item-title">Condition Triggers</div>
        <div class="item-examples">CPU > 80%, Disk space < 10%</div>
      </div>
    </div>
    
    <div class="flowchart-arrow">→</div>
    
    <div class="flowchart-column">
      <div class="flowchart-header">Conditions</div>
      <div class="flowchart-item condition-filter">
        <div class="item-icon">🔍</div>
        <div class="item-title">Filters</div>
        <div class="item-examples">Only production devices, Only Docker containers</div>
      </div>
      <div class="flowchart-item condition-time">
        <div class="item-icon">📅</div>
        <div class="item-title">Time Windows</div>
        <div class="item-examples">Only during maintenance hours</div>
      </div>
      <div class="flowchart-item condition-state">
        <div class="item-icon">🔄</div>
        <div class="item-title">State Checks</div>
        <div class="item-examples">If container is running, If device is online</div>
      </div>
    </div>
    
    <div class="flowchart-arrow">→</div>
    
    <div class="flowchart-column">
      <div class="flowchart-header">Actions</div>
      <div class="flowchart-item action-device">
        <div class="item-icon">💻</div>
        <div class="item-title">Device Actions</div>
        <div class="item-examples">Reboot, Run command, Update packages</div>
      </div>
      <div class="flowchart-item action-container">
        <div class="item-icon">📦</div>
        <div class="item-title">Container Actions</div>
        <div class="item-examples">Start/stop, Update image, Modify config</div>
      </div>
      <div class="flowchart-item action-playbook">
        <div class="item-icon">📋</div>
        <div class="item-title">Playbook Actions</div>
        <div class="item-examples">Execute playbook, Pass variables</div>
      </div>
      <div class="flowchart-item action-notification">
        <div class="item-icon">📧</div>
        <div class="item-title">Notification Actions</div>
        <div class="item-examples">Email, Webhook, Slack message</div>
      </div>
    </div>
  </div>
  <div class="diagram-caption">Figure 2: Automation Triggers, Conditions, and Actions Flowchart</div>
</div>

<style>
.flowchart {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.flowchart-column {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 10px;
}

.flowchart-header {
  font-weight: bold;
  text-align: center;
  padding: 5px;
  background-color: var(--vp-c-brand);
  color: white;
  border-radius: 4px;
  margin-bottom: 10px;
}

.flowchart-item {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-icon {
  font-size: 1.5rem;
  text-align: center;
}

.item-title {
  font-weight: bold;
  text-align: center;
}

.item-examples {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  text-align: center;
}

.flowchart-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--vp-c-brand);
  font-weight: bold;
}

@media (max-width: 768px) {
  .flowchart {
    flex-direction: column;
  }
  
  .flowchart-arrow {
    transform: rotate(90deg);
    margin: 10px 0;
  }
}
</style>

## Automation Patterns

### 1. Monitoring and Alerting

Create automations that monitor your infrastructure and alert you to issues:

```yaml
{% raw %}
trigger:
  type: condition
  resource: device
  metric: memory
  threshold: 90%
  duration: 10m

actions:
  - type: notification
    method: email
    recipient: admin@example.com
    subject: "High Memory Usage Alert"
    body: "Device {{ device.name }} has high memory usage: {{ trigger.value }}%"
  
  - type: command
    device: "{{ device.id }}"
    command: "systemctl restart memory-intensive-service"
{% endraw %}
```

### 2. Scheduled Maintenance

Automate routine maintenance tasks:

```yaml
{% raw %}
trigger:
  type: schedule
  cron: "0 2 * * 0"  # Every Sunday at 2 AM

actions:
  - type: playbook
    name: system-updates
    targets: all-devices
    variables:
      reboot_if_needed: true
      
  - type: notification
    method: webhook
    url: https://monitoring.example.com/webhook
    payload:
      event: maintenance-complete
      timestamp: "{{ now }}"
{% endraw %}
```

### 3. Event Response

React to events in your infrastructure:

```yaml
{% raw %}
trigger:
  type: event
  source: container
  event: health_check_failed

conditions:
  - "{{ event.container.restartCount > 3 }}"

actions:
  - type: container
    action: recreate
    container: "{{ event.container.id }}"
    
  - type: notification
    method: slack
    channel: "#alerts"
    message: "Container {{ event.container.name }} failed health check and was recreated"
{% endraw %}
```

## Best Practices

::: tip 💡 Do's
- Start with simple automations and gradually increase complexity
- Test automations in a non-production environment first
- Include error handling in your automations
- Document the purpose and behavior of each automation
- Use descriptive names for automations
:::

::: danger ⛔ Don'ts
- Don't create automations that could cause cascading failures
- Don't automate critical operations without human verification
- Don't create circular dependencies between automations
- Don't overuse conditions that could make automations hard to understand
- Don't forget to monitor and maintain your automations
:::

## Common Misconceptions

### Misconception 1: Automations eliminate the need for monitoring

**Reality**: While automations can handle routine tasks and responses, they still require monitoring and maintenance. Regularly review automation logs and performance to ensure they're working as expected.

### Misconception 2: More automation is always better

**Reality**: Over-automation can lead to complex, hard-to-maintain systems. Focus on automating repetitive, well-understood tasks first, and carefully consider the implications of automating critical operations.

### Misconception 3: Automations are set-and-forget

**Reality**: Automations need to evolve as your infrastructure changes. Regularly review and update your automations to ensure they remain effective and appropriate.

## Related Concepts

<div class="related-concepts">
  <div class="related-concept-card">
    <h3>💻 Device Model</h3>
    <p>How devices are managed and monitored in SSM</p>
    <a href="./devices">Learn more →</a>
  </div>
  
  <div class="related-concept-card">
    <h3>📦 Container Model</h3>
    <p>How containers are deployed and managed</p>
    <a href="./containers">Learn more →</a>
  </div>
  
  <div class="related-concept-card">
    <h3>📋 Playbooks Model</h3>
    <p>Using Ansible playbooks for infrastructure automation</p>
    <a href="./playbooks">Learn more →</a>
  </div>
</div>

## Further Reading

- [Creating Automations](/docs/user-guides/automations/creating) - Step-by-step guide to creating automations
- [Automation Schedules](/docs/user-guides/automations/schedules) - Detailed guide to scheduling automations
- [Advanced Automation](/docs/advanced-guides/advanced-automation) - Complex automation patterns and techniques
- [Automation API](/docs/developer/api-integration) - Programmatically creating and managing automations

<NextStepCard 
  title="Playbooks Model" 
  description="Learn how to use Ansible playbooks for powerful infrastructure automation" 
  link="/docs/concepts/models/playbooks" 
/>
