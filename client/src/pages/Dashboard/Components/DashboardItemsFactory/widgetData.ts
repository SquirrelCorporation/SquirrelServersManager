/**
 * Sample data for demo widgets
 */

export const bookingStatuses = [
  { name: 'Total profit', count: '$8,374', percentage: 10.1, color: '#52c41a' },
  { name: 'Total income', count: '$9,714', percentage: 13.6, color: '#1890ff' },
  { name: 'Total expenses', count: '$6,871', percentage: 28.2, color: '#faad14' },
];

export const toursAvailableData = [
  { type: 'Used', value: 120, color: '#52c41a' },
  { type: 'Available', value: 66, color: '#3a3a3e' },
];

export const toursLegend = [
  { name: 'Used', value: '120 items', color: '#52c41a' },
  { name: 'Available', value: '66 items', color: '#3a3a3e' },
];

export const gradientChartData = Array.from({ length: 10 }, () =>
  Math.floor(Math.random() * 50 + 10),
);

export const visitsPieData = [
  { type: 'Category A', value: 43.8, color: '#52c41a' },
  { type: 'Category B', value: 31.3, color: '#faad14' },
  { type: 'Category C', value: 18.8, color: '#1890ff' },
  { type: 'Category D', value: 6.3, color: '#ff4d4f' },
];

export const websiteVisitsData = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
].reduce(
  (acc, month) => {
    acc.push({
      month,
      team: 'Group A',
      visits: Math.floor(Math.random() * 60 + 10),
    });
    acc.push({
      month,
      team: 'Group B',
      visits: Math.floor(Math.random() * 60 + 10),
    });
    return acc;
  },
  [] as Array<{ month: string; team: 'Group A' | 'Group B'; visits: number }>,
);

export const osDownloadsData = [
  { type: 'Windows', value: 120, color: '#1890ff' },
  { type: 'macOS', value: 60, color: '#52c41a' },
  { type: 'Linux', value: 200, color: '#ff4d4f' },
  { type: 'Other', value: 35, color: '#faad14' },
];

export const performanceLineData = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
].reduce(
  (acc, day) => {
    acc.push({
      day,
      metric: 'CPU',
      value: Math.floor(Math.random() * 40 + 30),
    });
    acc.push({
      day,
      metric: 'Memory',
      value: Math.floor(Math.random() * 30 + 40),
    });
    acc.push({
      day,
      metric: 'Storage',
      value: Math.floor(Math.random() * 20 + 60),
    });
    return acc;
  },
  [] as Array<{ day: string; metric: string; value: number }>,
);

export const storageTypesData = [
  { type: 'Documents', value: 45, color: '#40a9ff' },
  { type: 'Images', value: 25, color: '#73d13d' },
  { type: 'Videos', value: 20, color: '#ffc53d' },
  { type: 'Other', value: 10, color: '#ff7a45' },
];

export const getSsmTips = () => [
  // SSM Getting Started Tips - Based on actual documentation content
  {
    tagText: "GETTING STARTED",
    title: "Password Requirements",
    description: "Create a strong password with at least 8 characters, one uppercase, one lowercase, one number, and one special character.",
    docLink: "https://squirrelserversmanager.io/docs/getting-started/first-steps"
  },
  {
    tagText: "GETTING STARTED",
    title: "Store Your Credentials",
    description: "Store your administrator credentials in a secure password manager. There's no automated password reset process in self-hosted SSM installations.",
    docLink: "https://squirrelserversmanager.io/docs/getting-started/first-steps"
  },
  {
    tagText: "GETTING STARTED",
    title: "Reset Admin Password",
    description: "If locked out, reset password via MongoDB: db.users.updateOne({email: 'your.email'}, {$set: {password: '$2b$10$CZt6MqBEVu8abVXel6mnn.A6AJuWlI8qKpPyTZ6TYWLm2jCr7HvdG'}}). This sets password to 'Password123!'",
    docLink: "https://squirrelserversmanager.io/docs/getting-started/first-steps"
  },
  {
    tagText: "GETTING STARTED",
    title: "Blank Screen Fix",
    description: "If you see a blank screen after login, check browser console (F12), verify all containers are running with 'docker compose ps', and check server logs.",
    docLink: "https://squirrelserversmanager.io/docs/getting-started/first-steps"
  },
  {
    tagText: "GETTING STARTED",
    title: "Login Troubleshooting",
    description: "Can't log in? Check your email address, verify caps lock is off, clear browser cache, or ensure browser allows local storage for cookies.",
    docLink: "https://squirrelserversmanager.io/docs/getting-started/first-steps"
  },
  {
    tagText: "SECURITY",
    title: "Ansible Vault Encryption",
    description: "SSH keys and passwords are encrypted using Ansible Vault. Credentials stored in MongoDB use additional bcrypt encryption.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },
  {
    tagText: "SECURITY",
    title: "SSH Key Security",
    description: "Private keys are encrypted before storage, support key passphrases, and are only decrypted in memory when needed for connections.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },
  {
    tagText: "SECURITY",
    title: "Strict Host Key Verification",
    description: "SSM uses strict host key verification to prevent MITM attacks. Connections close after command execution with no permanent open ports.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },
  {
    tagText: "SECURITY",
    title: "Agentless Security Benefits",
    description: "No permanent agents running on target devices means lower attack surface, no agent security patches needed, and no root-level services required.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },
  {
    tagText: "SECURITY",
    title: "Deploy Behind Reverse Proxy",
    description: "Deploy behind a reverse proxy for TLS termination if public access is required. Use firewall rules to restrict access to the SSM server.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },

  // Container Management Tips - Based on actual documentation
  {
    tagText: "CONTAINERS",
    title: "Automatic Discovery",
    description: "SSM automatically discovers Docker containers, monitors events in real-time, and performs hourly full scans to ensure synchronization.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/containers/management"
  },
  {
    tagText: "CONTAINERS",
    title: "Container Actions",
    description: "Start, stop, restart, pause/unpause, remove containers, view logs, and inspect detailed configuration - all from one interface.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/containers/management"
  },
  {
    tagText: "CONTAINERS",
    title: "Update Detection",
    description: "SSM detects newer container versions by comparing semantic versioning. Look for 'Update available' tags next to containers.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/containers/management"
  },
  {
    tagText: "CONTAINERS",
    title: "Force Refresh",
    description: "Use the 'Force Refresh' button to manually trigger a refresh of container statuses and check for available image updates.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/containers/management"
  },
  {
    tagText: "CONTAINERS",
    title: "Deploy from Store",
    description: "Navigate to Containers tab → Deploy from Store → Browse templates → Configure settings → Click Deploy.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/containers/deploy-store"
  },
  {
    tagText: "CONTAINERS",
    title: "Container Fails to Start?",
    description: "Check logs for errors, verify image name/tag, ensure required env vars are set, and check for port conflicts or missing volumes.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/containers/management"
  },
  {
    tagText: "CONTAINERS",
    title: "Service Not Reachable?",
    description: "Check container port mappings, verify service is running inside container, and check firewall rules on host and container.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/containers/management"
  },
  {
    tagText: "CONTAINERS",
    title: "Container Stacks",
    description: "For multi-container applications, use Container Stacks feature which supports Docker Compose configurations.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/stacks/containers/editor"
  },
  {
    tagText: "CONTAINERS",
    title: "Container Labeling",
    description: "Container update detection relies on labels. Configure labeling for proper version tracking and update notifications.",
    docLink: "https://squirrelserversmanager.io/docs/reference/containers/labelling"
  },
  {
    tagText: "CONTAINERS",
    title: "Private Registry Auth",
    description: "For private container images, configure registry authentication in SSM settings to enable update checking.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/settings/registry"
  },

  // Device Management Tips
  {
    tagText: "DEVICES",
    title: "Test Before Finalizing",
    description: "Always run connection tests before finalizing device setup. This ensures SSH connectivity and proper permissions.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/devices/adding-devices"
  },
  {
    tagText: "DEVICES",
    title: "Docker Group Permissions",
    description: "Add users to Docker group: 'sudo usermod -aG docker username'. This allows Docker management without sudo.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/devices/configuration/docker"
  },
  {
    tagText: "DEVICES",
    title: "Sudo Configuration",
    description: "For sudo issues, add to sudoers: 'username ALL=(ALL) NOPASSWD: /usr/bin/docker,/usr/bin/docker-compose'",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/devices/configuration/ssh"
  },
  {
    tagText: "DEVICES",
    title: "Agentless is Best",
    description: "Use the default agentless method for simplest setup. No software to install or maintain on target devices.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/agentless"
  },
  {
    tagText: "DEVICES",
    title: "Device Deletion Warning",
    description: "Device deletion is irreversible! All associated data, containers, and history will be permanently removed.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/devices/management"
  },

  // Ansible Playbook Tips
  {
    tagText: "ANSIBLE",
    title: "Built-in Playbooks",
    description: "SSM includes playbooks for health checks, system updates, Docker installation, and security hardening. Access them via quick actions or automations.",
    docLink: "https://squirrelserversmanager.io/docs/reference/ansible/built-in-playbooks"
  },
  {
    tagText: "ANSIBLE",
    title: "Health Check Playbook",
    description: "Run comprehensive health checks on your devices. This playbook verifies system resources, services, and connectivity status.",
    docLink: "https://squirrelserversmanager.io/docs/reference/ansible/built-in-playbooks"
  },
  {
    tagText: "ANSIBLE",
    title: "System Update Automation",
    description: "Automate OS updates across all devices. The update playbook handles package updates, kernel upgrades, and safe reboots.",
    docLink: "https://squirrelserversmanager.io/docs/reference/ansible/built-in-playbooks"
  },
  {
    tagText: "ANSIBLE",
    title: "Security Hardening Playbook",
    description: "Apply security best practices automatically. Configures firewall rules, SSH hardening, and system security settings.",
    docLink: "https://squirrelserversmanager.io/docs/reference/ansible/security"
  },
  {
    tagText: "ANSIBLE",
    title: "Docker Installation",
    description: "Deploy Docker on new devices with one click. The Docker installation playbook handles all dependencies and configuration.",
    docLink: "https://squirrelserversmanager.io/docs/reference/ansible/built-in-playbooks"
  },

  // Security Tips
  {
    tagText: "SECURITY",
    title: "Use 2FA Everywhere Possible",
    description: "Enable two-factor authentication on all services that support it. Use TOTP apps like Aegis or Bitwarden for secure 2FA storage.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },
  {
    tagText: "SECURITY",
    title: "Implement Network Segmentation",
    description: "Separate IoT devices, guest networks, and servers into different VLANs. This limits the blast radius of potential security breaches.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },
  {
    tagText: "SECURITY",
    title: "Use WireGuard for VPN",
    description: "WireGuard is faster and more secure than OpenVPN. It's now built into the Linux kernel and easy to configure.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },

  // Linux Tips
  {
    tagText: "LINUX",
    title: "Use SSH Config File",
    description: "Create ~/.ssh/config to define host aliases, default users, and keys. Makes SSH connections much more convenient.",
    docLink: "https://squirrelserversmanager.io/docs/reference/ssh-configuration"
  },

  // Troubleshooting Tips
  {
    tagText: "TROUBLESHOOTING",
    title: "Connection Test Failed",
    description: "If connection tests fail, verify SSH service is running, firewall allows port 22, and credentials are correct. Check SSM logs for details.",
    docLink: "https://squirrelserversmanager.io/docs/troubleshoot/faq"
  },
  {
    tagText: "TROUBLESHOOTING",
    title: "Container Not Updating",
    description: "Ensure containers have proper image labels. SSM needs 'org.opencontainers.image.source' or similar labels to track versions.",
    docLink: "https://squirrelserversmanager.io/docs/reference/containers/labelling"
  },
  {
    tagText: "TROUBLESHOOTING",
    title: "Check DNS First",
    description: "Many network issues are DNS-related. Use dig or nslookup to verify DNS resolution before diving deeper into problems.",
    docLink: "https://squirrelserversmanager.io/docs/troubleshoot/faq"
  },
  {
    tagText: "TROUBLESHOOTING",
    title: "Check Disk Space",
    description: "Full disks cause weird issues. Use 'df -h' and 'du -sh *' to find space hogs. Don't forget to check inodes with 'df -i'.",
    docLink: "https://squirrelserversmanager.io/docs/troubleshoot/faq"
  },

  // Best Practices
  {
    tagText: "BEST PRACTICES",
    title: "Use Device Groups",
    description: "Organize devices into logical groups (production, development, homelab). Apply playbooks and automations to entire groups efficiently.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/devices/management"
  },
  {
    tagText: "BEST PRACTICES",
    title: "Version Control Playbooks",
    description: "Store custom playbooks in Git repositories. SSM can sync with Git for version control and collaboration on automation scripts.",
    docLink: "https://squirrelserversmanager.io/docs/user-guides/repositories/remote-playbooks"
  },
  {
    tagText: "BEST PRACTICES",
    title: "Implement Least Privilege",
    description: "Give users and services only the permissions they need. Regularly audit and remove unnecessary privileges.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },
  {
    tagText: "BEST PRACTICES",
    title: "Document Everything",
    description: "Future you will thank present you. Document why decisions were made, not just what was done.",
    docLink: "https://squirrelserversmanager.io/docs/"
  },

  // General Tips
  {
    tagText: "GENERAL",
    title: "Start Small and Iterate",
    description: "Don't try to build everything at once. Start with core services and gradually expand as you learn and identify needs.",
    docLink: "https://squirrelserversmanager.io/docs/getting-started/first-steps"
  },
  {
    tagText: "GENERAL",
    title: "Share Your Knowledge",
    description: "Write blog posts or create videos about your homelab journey. Teaching others reinforces your own understanding.",
    docLink: "https://squirrelserversmanager.io/docs/"
  },
  {
    tagText: "GENERAL",
    title: "Have Fun!",
    description: "Homelabbing is about learning and experimenting. Don't stress about perfection - enjoy the journey of continuous improvement!",
    docLink: "https://squirrelserversmanager.io/docs/"
  }
];