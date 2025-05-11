import DefaultTheme from 'vitepress/theme'
import './custom.css'
import PageHeader from '../../components/PageHeader.vue'
import CopyButton from '../../components/CopyButton.vue'
import FeatureGuideLayout from './FeatureGuideLayout.vue'
import ComponentDemoLayout from './ComponentDemoLayout.vue'
import NextStepCard from '../../components/NextStepCard.vue'
import RequirementsGrid from '../../components/RequirementsGrid.vue'
import StepPath from '../../components/StepPath.vue'
import PlatformNote from '../../components/PlatformNote.vue'
import PlaybookCodeExample from '../../components/PlaybookCodeExample.vue'
import PlaybookModelDiagram from '../../components/PlaybookModelDiagram.vue'
import ProcessSteps from '../../components/ProcessSteps.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import DeviceModelDiagram from '../../components/DeviceModelDiagram.vue'
import FeatureCard from '../../components/FeatureCard.vue'
import FeatureGrid from '../../components/FeatureGrid.vue'
import MentalModelDiagram from '../../components/MentalModelDiagram.vue'
import CardList from '../../components/CardList.vue'
import Diagram from '../../components/Diagram.vue'
import Swiper from '../../components/Swiper.vue'
import AdvantagesSection from '../../components/AdvantagesSection.vue'
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createVuetify } from 'vuetify'
import ComponentInfoGrid from '../../components/ComponentInfoGrid.vue'
import ComponentInfoCard from '../../components/ComponentInfoCard.vue'
import DecisionTree from '../../components/DecisionTree.vue'
import PriorityGrid from '../../components/PriorityGrid.vue'
import SubLinkFeatureCard from '../../components/SubLinkFeatureCard.vue'

const vuetify = createVuetify({ components, directives })

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) { 
    app.use(vuetify)
    app.component('PageHeader', PageHeader)
    app.component('CopyButton', CopyButton)
    app.component('FeatureGuideLayout', FeatureGuideLayout)
    app.component('ComponentDemoLayout', ComponentDemoLayout)
    app.component('NextStepCard', NextStepCard)
    app.component('RequirementsGrid', RequirementsGrid)
    app.component('StepPath', StepPath)
    app.component('PlatformNote', PlatformNote)
    app.component('PlaybookCodeExample', PlaybookCodeExample)
    app.component('PlaybookModelDiagram', PlaybookModelDiagram)
    app.component('ProcessSteps', ProcessSteps)
    app.component('SectionHeader', SectionHeader)
    app.component('DeviceModelDiagram', DeviceModelDiagram)
    app.component('FeatureCard', FeatureCard)
    app.component('FeatureGrid', FeatureGrid)
    app.component('MentalModelDiagram', MentalModelDiagram)
    app.component('CardList', CardList)
    app.component('Diagram', Diagram)
    app.component('Swiper', Swiper)
    app.component('AdvantagesSection', AdvantagesSection)
    app.component('ComponentInfoGrid', ComponentInfoGrid)
    app.component('ComponentInfoCard', ComponentInfoCard)
    app.component('DecisionTree', DecisionTree)
    app.component('PriorityGrid', PriorityGrid)
    app.component('SubLinkFeatureCard', SubLinkFeatureCard)
  }
}
