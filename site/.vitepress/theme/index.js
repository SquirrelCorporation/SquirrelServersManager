import DefaultTheme from 'vitepress/theme'
import './custom.css'
import QuickStartHeader from '../../components/QuickStartHeader.vue'
import PageHeader from '../../components/PageHeader.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuickStartHeader', QuickStartHeader)
    app.component('PageHeader', PageHeader)
  }
}
