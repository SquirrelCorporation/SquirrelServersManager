import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Squirrel Servers Manager',
  description:
    'The most powerfully designed and user-friendly containers & configuration management tool.',
  appearance: 'force-dark',
  lastUpdated: true,
  cleanUrls: true,
  vite: {
    ssr: {
      noExternal: [/^vuetify/],
    },
  },
  /* prettier-ignore */
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#ff7e17' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'SSM | Squirrel Servers Manager' }],
    ['meta', { property: 'og:image', content: 'https://squirrelserversmanager.io/acorn.png' }],
    ['meta', { property: 'og:description', content: 'A user-friendly, UI/UX focused server & configuration management tool, powered by Ansible & Docker' }],
    ['meta', { property: 'description', content: 'A user-friendly, UI/UX focused server & configuration management tool, powered by Ansible & Docker' }],
    ['meta', { property: 'og:site_name', content: 'SquirrelServersManager' }],
    ['meta', { property: 'og:url', content: 'https://squirrelserversmanager.io' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@SquirrelSrvrsMg' }],
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-E48803PZJL' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-E48803PZJL');`
    ]
  ],

  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/SquirrelCorporation/SquirrelServersManager/tree/master/site/:path'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'About',
        link: '/about.md'
      },
      {
        text:'Demo',
        link: 'https://demo.squirrelserversmanager.io/'
      },
      {
        text: 'Apps',
        link: '/apps/'
      },
      { text: 'Documentation', link: '/docs/' },
      { text: 'Contribute', link: '/contribute/' },
      {
        text: 'Resources',
        items: [
          {
            text: 'Team',
            link: '/team.md'
          },
          {
            text: 'Roadmap',
            link: 'https://github.com/orgs/SquirrelCorporation/projects/2/views/1'
          },
          {
            text: 'Useful links',
            link: '/useful-links.md'
          },
          {
            items: [
              {
                text: 'Twitter',
                link: 'https://twitter.com/SquirrelSrvrsMg'
              }
            ]
          }
        ]
      }
    ],

    sidebar: {
      '/contribute/': [
        {
          text: 'Contribution Guide', link: '/contribute/', items: [
            { text: 'Conventions', link: '/contribute/conventions.md' },
            { text: 'Release', link: '/contribute/release.md' },
            { text: 'Stack', link: '/contribute/stack.md' }
          ]
        }
      ],
      '/docs/': [
        { text: 'Overview', link: '/docs/' },
        {
          text: 'Getting Started', link: '/docs/getting-started/', items: [
            { text: 'Installation', link: '/docs/getting-started/installation' },
            { text: 'First Steps', link: '/docs/getting-started/first-steps' },
            { text: 'Requirements', link: '/docs/requirements' },
            { text: 'Updating SSM', link: '/docs/install/update' },
            { text: 'Troubleshooting', link: '/docs/troubleshoot/troubleshoot' }
          ]
        },
        {
          text: 'User Guides', link: '/docs/user-guides/', items: [
            {
              text: 'Devices', collapsed: false, items: [
                { text: 'Adding Devices', link: '/docs/user-guides/devices/adding-devices' },
                { text: 'Device Management', link: '/docs/user-guides/devices/management' },
                { 
                  text: 'Device Configuration', link: '/docs/user-guides/devices/configuration/', items: [
                    { text: 'SSH', link: '/docs/user-guides/devices/configuration/ssh' },
                    { text: 'Docker', link: '/docs/user-guides/devices/configuration/docker' },
                    { text: 'Proxmox', link: '/docs/user-guides/devices/configuration/proxmox' },
                    { text: 'Diagnostic', link: '/docs/user-guides/devices/configuration/diagnostic' }
                  ]
                }
              ]
            },
            {
              text: 'Containers', collapsed: false, items: [
                { text: 'Overview', link: '/docs/user-guides/containers/management' },
                { 
                  text: 'Docker', items: [
                    { text: 'Deploy from Store', link: '/docs/user-guides/containers/deploy-store' }
                  ]
                },
                {
                  text: 'Proxmox', items: [
                    { text: 'Qemu/LXC Containers', link: '/docs/user-guides/containers/qemu-lxc-containers' }
                  ]
                }
              ]
            },
            {
              text: 'Automations', collapsed: false, items: [
                { text: 'Overview', link: '/docs/user-guides/automations/overview' },
                { text: 'Creating Automations', link: '/docs/user-guides/automations/creating' },
                { text: 'Managing Schedules', link: '/docs/user-guides/automations/schedules' }
              ]
            },
            {
              text: 'Stacks', collapsed: false, items: [
                { text: 'Playbooks', items: [
                    { text: 'Overview', link: '/docs/user-guides/stacks/playbooks/overview' },
                    { text: 'Variables', link: '/docs/user-guides/stacks/playbooks/variables' },
                    { text: 'Executing a Playbook', link: '/docs/user-guides/stacks/playbooks/executing' }
                  ]
                },
                { text: 'Container Stacks', items: [
                    { text: 'Compose Editor', link: '/docs/user-guides/stacks/containers/editor' },
                    { text: 'Remote Stack Repositories', link: '/docs/user-guides/stacks/containers/remote-stacks' }
                  ]
                }
              ]
            },
            {
              text: 'Repositories', collapsed: true, items: [
                { text: 'Local Playbooks', link: '/docs/user-guides/repositories/local-playbooks' },
                { text: 'Remote Playbooks', link: '/docs/user-guides/repositories/remote-playbooks' }
              ]
            },
            {
              text: 'Settings', collapsed: true, items: [
                { text: 'Overview', link: '/docs/user-guides/settings/overview' },
                { text: 'Configuring a Registry', link: '/docs/user-guides/settings/registry' },
                { text: 'MCP Settings', link: '/docs/user-guides/settings/mcp' }
              ]
            }
          ]
        },
        {
          text: 'Advanced Guides', collapsed: true, items: [
            { text: 'Development Mode', link: '/docs/advanced-guides/devmode' },
            { text: 'Advanced Automation', link: '/docs/advanced-guides/advanced-automation' },
            { text: 'Security Hardening', link: '/docs/advanced-guides/security' },
            { text: 'Alternative Installs', link: '/docs/advanced-guides/alternative-installs' }
          ]
        },
        {
          text: 'Concepts', collapsed: false, items: [
            { text: 'Architecture Overview', link: '/docs/concepts/architecture' },
            { text: 'Agentless Operation', link: '/docs/concepts/agentless' },
            { text: 'Device Data Model', link: '/docs/concepts/device-model' },
            { text: 'Security Model', link: '/docs/concepts/security' },
            { text: 'Plugin System', link: '/docs/concepts/plugins' },
            { text: 'Mental Models', items: [
                { text: 'Devices', link: '/docs/concepts/models/devices' },
                { text: 'Containers', link: '/docs/concepts/models/containers' },
                { text: 'Automation', link: '/docs/concepts/models/automation' },
                { text: 'Playbooks', link: '/docs/concepts/models/playbooks' }
              ]
            }
          ]
        },
        {
          text: 'Reference', collapsed: true, items: [
            { text: 'Environment Variables', link: '/docs/reference/environment-variables' },
            { text: 'SSH Configuration', link: '/docs/reference/ssh-configuration' },
            { text: 'Docker Configuration', link: '/docs/reference/docker-configuration' },
            { text: 'Technical Guide', items: [
                { text: 'Manual Installation', link: '/docs/reference/technical-guide/manual-install-ssm' },
                { text: 'Manual Agent Installation', link: '/docs/reference/technical-guide/manual-install-agent' },
                { text: 'SSH/Connection', link: '/docs/reference/technical-guide/ssh' },
                { text: 'Ansible', items: [
                    { text: 'Principles', link: '/docs/reference/technical-guide/ansible' },
                    { text: 'SSH/Connection', link: '/docs/reference/technical-guide/ansible-connection' },
                    { text: 'Configuration', link: '/docs/reference/technical-guide/ansible-configuration' }
                  ]
                },
                { text: 'Docker/Containers', items: [
                    { text: 'Principles', link: '/docs/reference/technical-guide/docker' },
                    { text: 'SSH/Connection', link: '/docs/reference/technical-guide/docker-connection' },
                    { text: 'Labels', link: '/docs/reference/technical-guide/containers-labelling' }
                  ]
                }
              ]
            }
          ]
        },
        {
          text: 'Developer', collapsed: true, items: [
            { text: 'Plugins Overview', link: '/docs/developer/plugins' },
            { text: 'Why Create a Plugin', link: '/docs/developer/why-create-a-plugin' },
            { text: 'API Integration', link: '/docs/developer/api-integration' },
            { text: 'Documentation Template', link: '/docs/developer/documentation-template' }
          ]
        },
        {
          text: 'Community', collapsed: true, items: [
            { text: 'Contributing', link: '/docs/community/contributing' },
            { text: 'Support', link: '/docs/community/support' },
            { text: 'Roadmap', link: '/docs/community/roadmap' }
          ]
        },
        {
          text: 'Credits', link: '/docs/credits'
        }
      ]
    },

    socialLinks: [
      { icon: 'x', link: 'https://twitter.com/SquirrelSrvrsMg' },
      { icon: 'github', link: 'https://github.com/SquirrelCorporation/SquirrelServersManager' },
      { icon: 'discord', link: 'https://discord.gg/cnQjsFCGKJ' }
    ],

    footer: {
      message: 'Made with love',
      copyright: 'Copyright © 2025-present Squirrel Team & Contributors'
    }
  },
  ignoreDeadLinks: true
});
