<script setup>
import DeviceModelDiagram from '/components/DeviceModelDiagram.vue';
import NextStepCard from '/components/NextStepCard.vue';
</script>

# Container Mental Model

:::tip 🌰 In a Nutshell
- Containers in SSM represent isolated, portable application environments
- SSM manages Docker containers across all your devices from a central interface
- Container stacks (Docker Compose) allow multi-container application deployment
- Container templates provide one-click deployment of common applications
- SSM tracks container health, updates, and resource usage automatically
:::

## What is a Container in SSM?

In Squirrel Servers Manager, a **container** is a standardized, isolated package that includes an application and all its dependencies. SSM primarily works with Docker containers, providing a unified interface to manage containers across your entire infrastructure.

<div class="concept-diagram">
  <img src="/home/services.png" alt="Container Services Management Interface" class="screenshot" />
  <div class="diagram-caption">Figure 1: Container Services Management in SSM</div>
</div>

## Key Components of the Container Model

### 1. Container Instances

Individual containers running on your devices have several key attributes:

- **Image**: The base container image (e.g., `nginx:latest`, `postgres:14`)
- **Name**: A unique identifier for the container
- **Status**: Current running state (running, stopped, restarting, etc.)
- **Ports**: Network port mappings between host and container
- **Volumes**: Persistent storage mappings
- **Environment Variables**: Configuration settings
- **Labels**: Metadata tags for organization and automation
- **Resource Limits**: CPU, memory, and other resource constraints

:::info 🔍 Example
A web server container might use the `nginx:latest` image, expose port 80, mount a volume for website files, and have environment variables for configuration.
:::

### 2. Container Stacks

Container stacks (based on Docker Compose) allow you to define and run multi-container applications:

- **Stack Definition**: YAML configuration defining multiple containers
- **Services**: Individual container definitions within a stack
- **Networks**: Custom networks connecting containers
- **Dependencies**: Relationships between containers (e.g., database → application → web server)
- **Volumes**: Shared storage between containers

<div class="concept-diagram">
  <img src="/home/stacks.png" alt="Container Stacks Management Interface" class="screenshot" />
  <div class="diagram-caption">Figure 2: Container Stacks Management in SSM</div>
</div>

### 3. Container Templates

SSM provides pre-configured templates for common applications:

- **Application Templates**: Ready-to-deploy configurations for popular software
- **Custom Templates**: User-created templates for frequently used configurations
- **Template Variables**: Customizable parameters for flexible deployment

<div class="concept-diagram">
  <img src="/home/store.png" alt="Container Templates Store Interface" class="screenshot" />
  <div class="diagram-caption">Figure 3: Container Templates Store in SSM</div>
</div>

### 4. Container Registry Integration

SSM connects with container registries to access and manage images:

- **Public Registries**: Docker Hub, GitHub Container Registry, etc.
- **Private Registries**: Self-hosted or cloud-based private registries
- **Authentication**: Secure access to protected registries
- **Image Pulling**: Automatic or manual image retrieval

<div class="concept-diagram">
  <img src="/home/registries.png" alt="Container Registry Management Interface" class="screenshot" />
  <div class="diagram-caption">Figure 4: Container Registry Management in SSM</div>
</div>

## How the Container Model Works

<div class="steps-container">
  <div class="step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h4>Image Selection</h4>
      <p>Choose a container image from a registry or template that contains your desired application.</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h4>Configuration</h4>
      <p>Configure container settings including ports, volumes, environment variables, and resource limits.</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">3</div>
    <div class="step-content">
      <h4>Deployment</h4>
      <p>Deploy the container to one or more devices in your infrastructure.</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">4</div>
    <div class="step-content">
      <h4>Monitoring</h4>
      <p>SSM automatically begins monitoring the container's health, resource usage, and status.</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">5</div>
    <div class="step-content">
      <h4>Management</h4>
      <p>Perform ongoing management tasks like updates, backups, scaling, and configuration changes.</p>
    </div>
  </div>
</div>

## Container Lifecycle

Containers in SSM follow a defined lifecycle:

1. **Creation**: Container is defined but not yet deployed
2. **Deployment**: Container is deployed to a device
3. **Running**: Container is operational and executing its workload
4. **Paused/Stopped**: Container execution is temporarily halted
5. **Updated**: Container image or configuration is changed
6. **Redeployed**: Container is recreated with new settings
7. **Removed**: Container is deleted from the device

## Real-World Examples

### Scenario 1: Deploying a Web Application Stack

<div class="example-container">
  <div class="example-scenario">
    <h4>Problem:</h4>
    <p>You need to deploy a web application with a database backend and a reverse proxy.</p>
  </div>
  
  <div class="example-solution">
    <h4>Solution using the Container Model:</h4>
    <p>Create a container stack with three services:</p>
    
```yaml
# Example stack definition
version: '3'
services:
  db:
    image: postgres:14
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_DB: ${DB_NAME}
    restart: unless-stopped
    
  app:
    image: myapp:latest
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
    restart: unless-stopped
    
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    restart: unless-stopped
    
volumes:
  db_data:
```
    
    <p>Deploy this stack to your target device, and SSM will:</p>
    <ol>
      <li>Pull all required images</li>
      <li>Create the defined volumes</li>
      <li>Launch containers in the correct order</li>
      <li>Configure networking between containers</li>
      <li>Monitor the health and status of all containers</li>
    </ol>
  </div>
</div>

### Scenario 2: Monitoring Stack with Resource Limits

<div class="example-container">
  <div class="example-scenario">
    <h4>Problem:</h4>
    <p>You need to deploy a monitoring solution with Prometheus and Grafana, but with strict resource limits to prevent overloading your server.</p>
  </div>
  
  <div class="example-solution">
    <h4>Solution using the Container Model:</h4>
    <p>Create a container stack with resource constraints:</p>
    
```yaml
# Example monitoring stack with resource limits
version: '3'
services:
  prometheus:
    image: prom/prometheus:v2.40.0
    volumes:
      - prometheus_data:/prometheus
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 500M
        reservations:
          cpus: '0.1'
          memory: 200M
    restart: unless-stopped
    
  grafana:
    image: grafana/grafana:9.3.0
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    depends_on:
      - prometheus
    deploy:
      resources:
        limits:
          cpus: '0.3'
          memory: 300M
        reservations:
          cpus: '0.1'
          memory: 100M
    restart: unless-stopped
    
volumes:
  prometheus_data:
  grafana_data:
```
    
    <p>Key features of this configuration:</p>
    <ul>
      <li>CPU limits prevent containers from using more than their allocated CPU share</li>
      <li>Memory limits protect the host from out-of-memory conditions</li>
      <li>Resource reservations ensure minimum resources are always available</li>
      <li>Persistent volumes ensure monitoring data survives container restarts</li>
      <li>Environment variables configure Grafana security settings</li>
    </ul>
  </div>
</div>

### Scenario 3: Microservices with Custom Networking

<div class="example-container">
  <div class="example-scenario">
    <h4>Problem:</h4>
    <p>You need to deploy a microservices application with isolated networks for frontend, backend, and database services.</p>
  </div>
  
  <div class="example-solution">
    <h4>Solution using the Container Model:</h4>
    <p>Create a container stack with custom networks:</p>
    
```yaml
# Example microservices stack with custom networking
version: '3'

services:
  frontend:
    image: my-frontend:1.0
    ports:
      - "80:80"
    networks:
      - frontend-network
    depends_on:
      - api
    restart: unless-stopped
    labels:
      com.example.description: "Frontend web interface"
      com.example.service: "frontend"
      
  api:
    image: my-backend-api:1.0
    networks:
      - frontend-network
      - backend-network
    environment:
      - DATABASE_URL=mongodb://db:27017/myapp
      - API_SECRET=${API_SECRET}
    restart: unless-stopped
    labels:
      com.example.description: "Backend API service"
      com.example.service: "api"
      
  worker:
    image: my-worker:1.0
    networks:
      - backend-network
    environment:
      - DATABASE_URL=mongodb://db:27017/myapp
      - REDIS_URL=redis://cache:6379
    restart: unless-stopped
    labels:
      com.example.description: "Background worker"
      com.example.service: "worker"
      
  db:
    image: mongo:5
    volumes:
      - db_data:/data/db
    networks:
      - backend-network
    restart: unless-stopped
    labels:
      com.example.description: "MongoDB database"
      com.example.service: "database"
      
  cache:
    image: redis:6
    volumes:
      - cache_data:/data
    networks:
      - backend-network
    restart: unless-stopped
    labels:
      com.example.description: "Redis cache"
      com.example.service: "cache"

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true  # No external connectivity
    
volumes:
  db_data:
  cache_data:
```
    
    <p>Key features of this configuration:</p>
    <ul>
      <li>Custom networks isolate traffic between service groups</li>
      <li>The backend network is marked as internal, preventing direct internet access</li>
      <li>The API service bridges both networks, allowing controlled communication</li>
      <li>Descriptive labels help with organization and automation</li>
      <li>Environment variables pass configuration without hardcoding</li>
      <li>Persistent volumes ensure data survives container restarts</li>
    </ul>
  </div>
</div>

## Container Management Features

SSM provides several powerful features for container management:

### 1. Centralized Control

Manage containers across all your devices from a single interface:
- Deploy to multiple devices simultaneously
- View container status across your infrastructure
- Apply consistent configurations

### 2. Update Management

Keep containers up-to-date with minimal effort:
- Detect available image updates
- Schedule automatic updates
- Roll back problematic updates

### 3. Resource Monitoring

Track container performance and resource usage:
- CPU and memory utilization
- Network traffic
- Disk I/O
- Log monitoring

### 4. Health Checks

Ensure containers are functioning correctly:
- Automatic health probes
- Restart policies for failed containers
- Notification alerts for issues

## Best Practices

### Container Security

::: tip 💡 Security Best Practices
- Use specific image tags instead of `latest` for production
- Scan images for vulnerabilities before deployment
- Run containers with the least privileges necessary
- Use read-only file systems where possible
- Implement network policies to restrict container communication
- Keep host systems and Docker updated with security patches
- Use secrets management for sensitive data instead of environment variables
:::

### Resource Management

::: tip 💡 Resource Best Practices
- Set appropriate CPU and memory limits for all containers
- Use resource reservations for critical services
- Monitor resource usage and adjust limits as needed
- Implement health checks to detect and restart failed containers
- Use rolling updates to avoid downtime during deployments
- Configure appropriate restart policies based on service requirements
:::

### Data Management

::: tip 💡 Data Best Practices
- Use named volumes for persistent data instead of bind mounts
- Implement regular backup strategies for container volumes
- Document volume mappings and data locations
- Use volume drivers appropriate for your storage needs
- Consider using external storage services for critical data
- Test data recovery procedures regularly
:::

### Container Organization

::: tip 💡 Organization Best Practices
- Apply consistent labeling to all containers and volumes
- Group related services using Docker Compose
- Use meaningful container names that reflect their purpose
- Document container dependencies and communication patterns
- Implement logging strategies for container output
- Use environment-specific configuration files
:::

::: danger ⛔ Common Pitfalls to Avoid
- Don't expose unnecessary ports to the internet
- Don't store sensitive data in container images or environment variables
- Don't run containers with root privileges when avoidable
- Don't ignore container update notifications
- Don't deploy without considering resource requirements
- Don't use the same image tags for different versions
- Don't neglect container logs for troubleshooting
- Don't hardcode configuration values in container images
:::

## Common Misconceptions

### Misconception 1: Containers are lightweight virtual machines

**Reality**: While containers provide isolation, they share the host's kernel and are much more lightweight than VMs. They're designed for application packaging, not full system virtualization.

### Misconception 2: Containers automatically persist data

**Reality**: By default, data in containers is ephemeral and will be lost when the container is removed. Persistent data requires explicit volume configuration.

### Misconception 3: Container images are always secure

**Reality**: Container images can contain vulnerabilities or malicious code. Always use trusted sources and implement proper scanning and security practices.

## Related Concepts

<div class="related-concepts">
  <div class="related-concept-card">
    <h3>💻 Device Model</h3>
    <p>How devices host and run containers in SSM</p>
    <a href="./devices">Learn more →</a>
  </div>
  
  <div class="related-concept-card">
    <h3>🔄 Automation Model</h3>
    <p>How to automate container management tasks</p>
    <a href="./automation">Learn more →</a>
  </div>
  
  <div class="related-concept-card">
    <h3>📋 Playbooks Model</h3>
    <p>Using Ansible playbooks for advanced container orchestration</p>
    <a href="./playbooks">Learn more →</a>
  </div>
</div>

## Further Reading

- [Container Management](/docs/user-guides/containers/management) - How to manage containers effectively
- [Deploy from Store](/docs/user-guides/containers/deploy-store) - Using container templates
- [Compose Editor](/docs/user-guides/stacks/containers/editor) - Creating and editing container stacks
- [Docker Configuration](/docs/reference/docker-configuration) - Detailed Docker configuration reference

<NextStepCard 
  title="Automation Model" 
  description="Learn how to automate container and device management tasks" 
  link="/docs/concepts/models/automation" 
/>
