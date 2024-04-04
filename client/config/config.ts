// https://umijs.org/config/
import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
const { REACT_APP_ENV = 'dev' } = process.env;
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';

export default defineConfig({
  /**
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,
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
    components: {
      Modal: {
        contentBg: '#1d222e',
        headerBg: '#1d222e',
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
        colorBgElevated: '#1d222e',
        colorBgContainer: '#151921',
      },
      components: {
        Message: {
          contentBg: 'white',
        },
        Modal: {
          contentBg: '#1d222e',
          headerBg: '#1d222e',
        },
        Input: {
          activeBg: '#1d222e',
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
  presets: ['umi-presets-pro'],
  /**
   * @doc https://pro.ant.design/zh-cn/docs/openapi/
   */
  mfsu: {
    strategy: 'normal',
  },
  esbuildMinifyIIFE: true,
  requestRecord: {},
  clientLoader: {},
  chainWebpack(memo: any) {
    memo.plugin('monaco-editor').use(MonacoEditorWebpackPlugin, []);
    return memo;
  },
});
