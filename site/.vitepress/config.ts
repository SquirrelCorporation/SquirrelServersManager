import { defineConfig } from 'vitepress'

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
  ],

  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'About',
        link: '/about.md',
      },
      { text: 'Documentation', link: '/docs/' },
      { text: 'Contribute', link: '/contrib-guide/' },
      {
        text: 'Resources',
        items: [
          {
            text: 'Team',
            link: '/team.md',
          },
          {
            text: 'Roadmap',
            link: 'https://github.com/SquirrelCorporation/SquirrelServersManager/wiki',
          },
          {
            items: [
              {
                text: 'Twitter',
                link: 'https://twitter.com/SquirrelSrvrsMg',
              },
            ],
          },
        ],
      },
    ],

    sidebar: {
      '/docs/': [
        { text: 'Overview', link: '/contrib-guide/' },
        {
          text: 'Quick Setup', link: '/contrib-guide/setup.md', items: [
            {
              text: 'Build', link: '/contrib-guide/build.md'
            },
            {
              text: 'Dev', link: '/contrib-guide/build.md'
            }
          ]
        },
        { text: 'Build', link: '/contrib-guide/build.md' },
        { text: 'Test', link: '/contrib-guide/test.md' },
        { text: 'Docs', link: '/contrib-guide/docs.md' },
        { text: 'Release', link: '/contrib-guide/release.md' },
        { text: 'Stack', link: '/contrib-guide/release.md' },
      ],
    },

    socialLinks: [
      { icon: 'x', link: 'https://twitter.com/SquirrelSrvrsMg' },
      { icon: 'github', link: 'https://github.com/SquirrelCorporation/SquirrelServersManager' },
    ],

    footer: {
      message: 'Made with love',
      copyright: 'Copyright © 2024-present Squirrel Team & Contributors',
    },
  },
})
