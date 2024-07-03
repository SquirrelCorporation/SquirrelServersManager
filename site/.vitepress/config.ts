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
    ['meta', { name: 'twitter:site', content: '@SquirrelSrvrsMg' }]
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
            link: 'https://github.com/SquirrelCorporation/SquirrelServersManager/wiki'
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
            { text: 'Adding a device', link: '/docs/add-device.md' },
            {
              text: 'Adding an unmanaged device (agentless mode)', link: '/docs/add-unamanaged.md'
            },
            {
              text: 'Playbooks', link: '/docs/playbooks/playbooks.md', items: [
                { text: 'Local Playbooks Repository', link: '/docs/playbooks/local-playbooks.md'},
                { text: 'Remote Playbooks Repository', link: '/docs/playbooks/remote-playbooks.md'}
              ]
            },
            {
              text: 'Services', link: '/docs/services.md'
            },
            {
              text: 'Executing a playbook', link: '/docs/exec-playbook.md'
            },
            {
              text: 'Settings', link: '/docs/settings.md', items: [
                { text: 'Configuring a Registry', link: '/docs/registry.md' },]
            },
            {
              text: 'Device Configuration', link: '/docs/device-configuration.md'
            },
            {
              text: 'Deleting a device', link: '/docs/delete-device.md'
            }
          ]
        },
        {
          text: 'Technical Guide', link: '/docs/technical-guide.md', items: [
            { text: 'Ansible', link: '/docs/ansible.md' },
            { text: 'Docker', link: '/docs/docker.md' },
            {
              text: 'Manually installing the agent', link: '/docs/manual-install-agent.md'
            },
            {
              text: 'Troubleshoot', link: '/docs/troubleshoot.md'
            },
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
