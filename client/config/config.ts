// https://umijs.org/config/
import { defineConfig } from '@umijs/max';
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
const { REACT_APP_ENV = 'dev' } = process.env;

export default defineConfig({
  /**
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,
  /**
   * @doc https://umijs.org/docs/api/config#alias
   */
  alias: {
    '@app': '@/app',
    '@features': '@/features',
    '@shared': '@/shared',
    '@pages': '@/pages',
    '@legacy': '@/legacy',
  },
  /**
   * @doc https://umijs.org/docs/guides/routes
   */
  // umi routes: https://umijs.org/docs/routing
  routes,
  /**
   * @doc  https://ant.design/docs/react/customize-theme-cn
   * @doc  https://umijs.org/docs/api/config#theme
   */
  theme: {
    'root-entry-name': 'variable',
    token: {
      colorPrimary: '#0A84FF',
      colorInfo: '#0A84FF',
      colorBgBase: '#0a0a0a', // Matte black base instead of gradient
      colorBgContainer: 'rgba(255,255,255,0.05)', // Soft frosted look for surfaces
      colorText: '#ffffff',
      colorTextSecondary: '#a6a6a6',
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: 12,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    },
    components: {
      Layout: {
        colorBgLayout: '#0a0a0a', // Kill the background gradient
      },
      Card: {
        colorBgContainer: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
      },
      Modal: {
        colorBgContainer: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        boxShadow: '0 10px 40px rgba(0,0,0,0.65)',
      },
      Button: {
        borderRadius: 50,
        colorPrimaryBg: '#0A84FF',
        colorPrimaryBgHover: '#409CFF',
      },
      Input: {
        borderRadius: 50,
        colorBgContainer: 'rgba(255,255,255,0.08)',
        colorBorder: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
      },
      Tabs: {
        borderRadius: 999,
        colorBgContainer: 'rgba(255,255,255,0.06)',
        itemSelectedColor: '#0A84FF',
        itemHoverColor: '#0A84FF',
        itemActiveColor: '#0A84FF',
      },
    },
  },
  /**
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  ignoreMomentLocale: true,
  /**
   * @doc https://umijs.org/docs/guides/proxy
   * @doc https://umijs.org/docs/api/config#proxy
   */
  proxy: proxy[REACT_APP_ENV as keyof typeof proxy],
  fastRefresh: true,
  //============== 以下都是max的插件配置 ===============
  /**
   * @@doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {},
  /**
   * @name layout
   * @doc https://umijs.org/docs/max/layout-menu
   */
  title: 'Squirrel Servers Manager',
  layout: {
    locale: true,
    ...defaultSettings,
  },
  /**
   * @name moment2dayjs 插件
   * @doc https://umijs.org/docs/max/moment2dayjs
   */
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },

  locale: {
    default: 'en-US',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: false,
  },
  /**
   * @doc https://umijs.org/docs/max/i18n
   */ /**
   * @doc https://umijs.org/docs/max/antd#antd
   */
  antd: {
    theme: {
      token: {
        colorPrimary: '#0A84FF',
        colorInfo: '#0A84FF',
        colorBgBase: '#0a0a0a', // Matte black base instead of gradient
        colorBgContainer: 'rgba(255,255,255,0.05)', // Soft frosted look for surfaces
        colorText: '#ffffff',
        colorTextSecondary: '#a6a6a6',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      },
      components: {
        Layout: {
          colorBgLayout: '#0a0a0a', // Kill the background gradient
        },
        Card: {
          colorBgContainer: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
        },
        Modal: {
          colorBgContainer: 'rgba(255,255,255,0.06)',
          borderRadius: 16,
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          boxShadow: '0 10px 40px rgba(0,0,0,0.65)',
        },
        Button: {
          borderRadius: 50,
          colorPrimaryBg: '#0A84FF',
          colorPrimaryBgHover: '#409CFF',
        },
        Input: {
          borderRadius: 50,
          colorBgContainer: 'rgba(255,255,255,0.08)',
          colorBorder: 'rgba(255,255,255,0.2)',
          borderWidth: 1,
        },
        Tabs: {
          borderRadius: 999,
          colorBgContainer: 'rgba(255,255,255,0.06)',
          itemSelectedColor: '#0A84FF',
          itemHoverColor: '#0A84FF',
          itemActiveColor: '#0A84FF',
        },
      },
    },
  },
  /**
   * @doc https://umijs.org/docs/max/request
   */
  request: {},
  /**
   * @doc https://umijs.org/docs/max/access
   */
  access: {},
  headScripts: [
    {
      src: '/scripts/loading.js',
      async: true,
    },
  ],
  //================ pro =================
  presets: ['umi-presets-pro'], // Re-enabled preset
  /**
   * @doc https://pro.ant.design/zh-cn/docs/openapi/
   */
  mfsu: {
    strategy: 'normal',
    shared: {
      react: { singleton: true, eager: true, requiredVersion: false },
      'react-dom': { singleton: true, eager: true, requiredVersion: false },
      antd: { singleton: true, eager: true, requiredVersion: false },
    },
  },
  esbuildMinifyIIFE: true,
  requestRecord: {}, // Re-enabled
  clientLoader: {}, // Re-enabled
  chainWebpack(memo: any) {
    // Re-enabled
    // Ensure MonacoWebpackPlugin is imported if uncommenting chainWebpack
    // import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';
    memo.plugin('monaco-editor').use(MonacoEditorWebpackPlugin, []);
    return memo;
  },
  codeSplitting: {
    // Re-enabled
    jsStrategy: 'granularChunks',
  },
});
