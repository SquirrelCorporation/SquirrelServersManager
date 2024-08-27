import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Squirrel Servers Manager',
  description:
    'A user friendly, UI/UX focus server & configuration management tool',

  lastUpdated: true,
  cleanUrls: true,

  /* prettier-ignore */
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#ff7e17' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'SSM | Squirrel Servers Manager' }],
    ['meta', { property: 'og:image', content: 'https://squirrelserversmanager.io/acorn.png' }],
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
        link: 'https://molecular-sibylla-squirrelserversmanager-1b05c91d.koyeb.app/'
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
                  text: 'Adding a device', link: '/docs/add-device.md'
                },
                {
                  text: 'Adding an unmanaged device (agentless mode)', link: '/docs/add-unamanaged.md'
                },
                {
                  text: 'Deleting a device', link: '/docs/delete-device.md'
                },
                {
                  text: 'Device configuration', link: '/docs/device-configuration.md'
                }
              ]
            },
            {
              text: 'Playbooks', items: [
                { text: 'Overview', link: '/docs/playbooks/playbooks.md' },
                { text: 'Executing a playbook', link: '/docs/exec-playbook.md' },
                ]
            },
            {
              text: 'Playbooks Repositories', items: [

                { text: 'Local Playbooks Repositories', link: '/docs/playbooks/local-playbooks.md' },
                { text: 'Remote Playbooks Repositories', link: '/docs/playbooks/remote-playbooks.md' }
              ]
            },
            {
              text: 'Services', items: [{text: 'Overview', link: '/docs/services.md'}]
            },
            {
              text: 'Automations',  items: [{text: 'Overview',link: '/docs/automations/automations.md'}]
            },
            {
              text: 'Settings', items: [
                { text: 'Overview', link: '/docs/settings.md' },
                { text: 'Configuring a Registry', link: '/docs/registry.md' }]
            }
          ]
        },
        {
          text: 'Technical Guide', items: [
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
            },{
              text: 'Manually installing the agent', link: '/docs/technical-guide/manual-install-agent.md'
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
      { icon: 'github', link: 'https://github.com/SquirrelCorporation/SquirrelServersManager' }
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
