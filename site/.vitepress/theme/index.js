import DefaultTheme from 'vitepress/theme';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({ components, directives })

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(vuetify)
  },
}
