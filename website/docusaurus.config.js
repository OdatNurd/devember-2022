// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Omphalos',
  tagline: 'Put some Oomph into your Live Streams',
  url: 'https://devember-2022.ruinouspileofcrap.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/omphalos.png',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}],
          ],
        },

        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */

    ({
      announcementBar: {
        id: 'archived',
        content: 'This is an old project! <a href="/docs/readme">read why</a>, then check out <a target="_blank" rel="noopener noreferrer" href="https://omphalos.ruinouspileofcrap.com">the full project</a>',
        backgroundColor: '#C10009',
        textColor: '#fff',
        isCloseable: false,
      },

      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

      navbar: {
        title: 'Omphalos',
        logo: {
          alt: 'The Omphalos Logo, a grey rock',
          src: 'img/omphalos.svg',
        },
        items: [
          {
            label: 'Why that name?',
            to: 'name'
          },
          {
            label: 'What is it?',
            to: '/docs/intro'
          },
          {
            type: 'doc',
            docId: 'readme',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/OdatNurd/devember-2022',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: "What does 'Omphalos' mean?",
                to: '/name'
              },
              {
                label: 'What is Omphalos?',
                to: '/docs/intro',
              },
              {
                label: "Get Started!",
                to: '/docs/quickstart/installation'
              },
            ],
          },
          {
            title: 'Social',
            items: [
              {
                label: 'Twitch',
                href: 'https://twitch.tv/odatnurd',
              },
              {
                label: 'YouTube',
                href: 'https://youtube.com/@odatnurd',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/b3x5AuwVVY',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/odatnurd',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Get the Code',
                href: 'https://github.com/OdatNurd/devember-2022',
              },
            ],
          },
        ],
        copyright: `Copyright ?? ${new Date().getFullYear()} Terence Martin (OdatNurd). Docs by Docusaurus.`,
      },
      prism: {
        defaultLanguage: 'javascript',
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
