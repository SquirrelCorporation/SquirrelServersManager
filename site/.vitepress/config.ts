import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Squirrel Servers Manager',
  description:
    'A user friendly, UI/UX focus server & configuration management tool',
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
          text: '→ Quick Start', link: '/docs/quickstart.md', items: [
            {
              text: 'Requirements', link: '/docs/requirements.md'
            },
            {
              text: 'Installing SSM', link: '/docs/install/install.md'
            },
            {
              text: 'Updating SSM', link: '/docs/install/update.md'
            },
            {
              text: 'Development mode', link: '/docs/devmode.md'
            }
          ]
        },
        {
          text: 'User Guide', link: '/docs/userguide.md', items: [
            { text: 'First time using SSM', link: '/docs/first-time.md' },
            {
              text: 'Devices', items: [
                {
                  text: 'Adding a device', link: '/docs/devices/add-device.md'
                },
                {
                  text: 'Adding an unmanaged device (agentless mode)', link: '/docs/devices/add-unamanaged.md'
                },
                {
                  text: 'Deleting a device', link: '/docs/devices/delete-device.md'
                },
                {
                  text: 'Device configuration', link: '/docs/devices/device-configuration.md'
                }
              ]
            },
            {
              text: 'Stacks - Playbooks', items: [
                { text: 'Overview', link: '/docs/playbooks/playbooks.md' },
                { text: 'Variables', link: '/docs/playbooks/playbooks-variables.md' },
                { text: 'Executing a playbook', link: '/docs/playbooks/exec-playbook.md' },
                ]
            },
            {
              text: 'Stacks - Container', items: [
                { text: 'Overview', link: '/docs/compose/editor.md' },
                { text: 'Remote Container Stacks Repositories', link: '/docs/compose/remote-stacks.md' }
              ]
            },
            {
              text: 'Playbooks Repositories', items: [

                { text: 'Local Playbooks Repositories', link: '/docs/playbooks/local-playbooks.md' },
                { text: 'Remote Playbooks Repositories', link: '/docs/playbooks/remote-playbooks.md' }
              ]
            },
            {
              text: 'Containers', items: [{text: 'Overview', link: '/docs/containers/containers.md'},
                {text: 'Deploy from the Store', link: '/docs/containers/deploy-store.md'}]
            },
            {
              text: 'Automations',  items: [{text: 'Overview',link: '/docs/automations/automations.md'}]
            },
            {
              text: 'Settings', items: [
                { text: 'Overview', link: '/docs/settings/settings.md' },
                { text: 'Configuring a Registry', link: '/docs/settings/registry.md' }]
            }
          ]
        },
        {
          text: 'Technical Guide', items: [
            {
              text: 'Manually installing SSM', link: '/docs/technical-guide/manual-install-ssm.md'
            },
            {
              text: 'Manually installing the agent', link: '/docs/technical-guide/manual-install-agent.md'
            },
            { text: 'SSH/Connection' , link: '/docs/technical-guide/ssh.md'},
            { text: 'Ansible', items: [
                { text: 'Principles', link: '/docs/technical-guide/ansible.md'},
                { text: 'SSH/Connection', link: '/docs/technical-guide/ansible-connection.md'},
                { text: 'Configuration', link: '/docs/technical-guide/ansible-configuration.md'},
              ]
            },
            { text: 'Docker/Containers Management', items: [
                { text: 'Principles', link: '/docs/technical-guide/docker.md'},
                { text: 'SSH/Connection', link: '/docs/technical-guide/docker-connection.md'},
                { text: 'Labels', link: '/docs/technical-guide/containers-labelling.md'}
              ]
            },
            {
              text: 'Troubleshoot', link: '/docs/technical-guide/troubleshoot.md'
            }
          ]
        },
        {
          text: 'Credits', link: '/docs/credits.md'
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
      copyright: 'Copyright © 2024-present Squirrel Team & Contributors'
    }
  },
  ignoreDeadLinks: [
    // ignore all localhost links
    /^https?:\/\/localhost/,
    /^https:\/\/localhost/
  ]
});
