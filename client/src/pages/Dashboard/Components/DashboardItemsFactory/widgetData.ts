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
  {
    tagText: "PERFORMANCE",
    title: "Use Watchtower for Auto-Updates",
    description: "Watchtower automatically updates your containers when new images are available. Run it with proper schedule to keep containers secure and up-to-date.",
    docLink: "https://squirrelserversmanager.io/docs/containers/auto-update"
  },
  {
    tagText: "PERFORMANCE",
    title: "Enable Container Health Checks",
    description: "Define HEALTHCHECK in your Dockerfiles or docker-compose to monitor container health. SSM can then alert you when containers become unhealthy.",
    docLink: "https://squirrelserversmanager.io/docs/containers/health-monitoring"
  },
  {
    tagText: "PERFORMANCE",
    title: "Use Docker Build Cache",
    description: "Optimize your builds by properly ordering Dockerfile instructions. Put frequently changing steps last to maximize cache usage.",
    docLink: "https://squirrelserversmanager.io/docs/advanced/docker-optimization"
  },
  {
    tagText: "PERFORMANCE",
    title: "Monitor Resource Usage",
    description: "Set resource limits (CPU, memory) for containers to prevent single containers from consuming all host resources.",
    docLink: "https://squirrelserversmanager.io/docs/monitoring/resource-management"
  },
  {
    tagText: "PERFORMANCE",
    title: "Use Named Volumes",
    description: "Named volumes are easier to backup and manage than bind mounts. They also have better performance on some systems.",
    docLink: "https://squirrelserversmanager.io/docs/storage/volumes"
  },
  {
    tagText: "SECURITY",
    title: "Don't Run as Root",
    description: "Always use USER directive in Dockerfile to run containers as non-root. This limits damage if container is compromised.",
    docLink: "https://squirrelserversmanager.io/docs/security/best-practices"
  },
  {
    tagText: "SECURITY",
    title: "Scan Images for Vulnerabilities",
    description: "Use tools like Trivy or Clair to scan container images for known vulnerabilities before deployment.",
    docLink: "https://squirrelserversmanager.io/docs/security/vulnerability-scanning"
  },
  {
    tagText: "SECURITY",
    title: "Use Read-Only Containers",
    description: "When possible, run containers with --read-only flag. This prevents malicious processes from writing to the container filesystem.",
    docLink: "https://squirrelserversmanager.io/docs/security/hardening"
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
  {
    tagText: "SECURITY",
    title: "Harden Kernel Parameters",
    description: "Edit /etc/sysctl.conf to disable IP forwarding, enable SYN cookies, and ignore ICMP redirects for better security.",
    docLink: "https://squirrelserversmanager.io/docs/reference/ansible/security"
  },
  {
    tagText: "SECURITY",
    title: "Use CrowdSec for Protection",
    description: "CrowdSec is a collaborative IPS that shares threat intelligence. It's lighter than fail2ban and protects against more threats.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },
  {
    tagText: "HOMELAB",
    title: "Implement Centralized Authentication",
    description: "Use Authelia or Authentik for single sign-on. This allows one login for multiple services and supports 2FA.",
    docLink: "https://squirrelserversmanager.io/docs/concepts/security"
  },
  {
    tagText: "LINUX",
    title: "Use SSH Config File",
    description: "Create ~/.ssh/config to define host aliases, default users, and keys. Makes SSH connections much more convenient.",
    docLink: "https://squirrelserversmanager.io/docs/reference/ssh-configuration"
  },
  {
    tagText: "HOMELAB",
    title: "Backup Strategy: 3-2-1 Rule",
    description: "Keep 3 copies of important data, on 2 different media types, with 1 copy offsite. Consider using Restic or Borg for automated backups.",
    docLink: "https://squirrelserversmanager.io/docs/advanced/backup-strategies"
  },
  {
    tagText: "DOCKER",
    title: "Use Multi-Stage Builds",
    description: "Multi-stage builds create smaller, more secure images by separating build dependencies from runtime dependencies.",
    docLink: "https://squirrelserversmanager.io/docs/advanced/docker-optimization"
  },
  {
    tagText: "HOMELAB",
    title: "Document Your Setup",
    description: "Keep a wiki or documentation of your homelab setup. Future you will thank present you when something breaks at 2 AM.",
    docLink: "https://squirrelserversmanager.io/docs/best-practices/documentation"
  },
  {
    tagText: "LINUX",
    title: "Master systemd Timers",
    description: "systemd timers are more flexible than cron. They can run missed jobs, have better logging, and integrate with systemd dependencies.",
    docLink: "https://squirrelserversmanager.io/docs/advanced/automation"
  },
  {
    tagText: "DOCKER",
    title: "Use .dockerignore",
    description: "Like .gitignore but for Docker builds. Prevents sending unnecessary files to build context, speeding up builds significantly.",
    docLink: "https://squirrelserversmanager.io/docs/advanced/docker-optimization"
  },
  {
    tagText: "NETWORKING",
    title: "Use Traefik for Reverse Proxy",
    description: "Traefik auto-discovers containers and configures itself. It handles SSL certificates automatically with Let's Encrypt.",
    docLink: "https://squirrelserversmanager.io/docs/networking/reverse-proxy"
  },
];