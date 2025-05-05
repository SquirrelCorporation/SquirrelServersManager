# Recommended Vue Components for Documentation

This guide lists the recommended Vue components and libraries to use in the Squirrel Servers Manager documentation. These components have been carefully selected to create a world-class documentation experience.

## 🌟 Core Documentation Components

### 1. Vue Flow

**Purpose**: Create interactive flowcharts and diagrams for architecture visualization

**Installation**:
```bash
npm install @vue-flow/core @vue-flow/background @vue-flow/minimap
```

**Key Features**:
- Interactive node-based diagrams
- Customizable node types and styles
- Panning and zooming capabilities
- Background patterns and minimap
- Event handling for interactive documentation

**Example Usage**:
```vue
<template>
  <div style="height: 400px; width: 100%;">
    <VueFlow v-model="elements" :default-zoom="1.5" :min-zoom="0.2" :max-zoom="4">
      <Background pattern-color="#aaa" gap="8" />
      <MiniMap />
      <Controls />
    </VueFlow>
  </div>
</template>

<script setup>
import { VueFlow, Background, MiniMap, Controls } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/minimap/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import { ref } from 'vue';

const elements = ref([
  { id: '1', type: 'input', label: 'Device', position: { x: 250, y: 5 } },
  { id: '2', label: 'Container', position: { x: 100, y: 100 } },
  { id: '3', label: 'Service', position: { x: 400, y: 100 } },
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' }
]);
</script>
```

### 2. Swiper

**Purpose**: Create interactive carousels and sliders for showcasing features

**Installation**:
```bash
npm install swiper
```

**Key Features**:
- Touch-enabled slider component
- Multiple slide layouts
- Navigation controls
- Pagination options
- Autoplay capabilities

**Example Usage**:
```vue
<template>
  <swiper
    :slides-per-view="1"
    :space-between="30"
    :pagination="{ clickable: true }"
    :navigation="true"
    :modules="modules"
    class="feature-swiper"
  >
    <swiper-slide>
      <img src="/screenshots/dashboard.png" alt="Dashboard" />
      <div class="slide-caption">Main Dashboard</div>
    </swiper-slide>
    <swiper-slide>
      <img src="/screenshots/devices.png" alt="Devices" />
      <div class="slide-caption">Device Management</div>
    </swiper-slide>
  </swiper>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const modules = [Navigation, Pagination];
</script>
```

### 3. VueUse

**Purpose**: Collection of essential Vue composition utilities

**Installation**:
```bash
npm install @vueuse/core
```

**Key Features**:
- State management utilities
- Sensor hooks (mouse, scroll, etc.)
- Animation utilities
- Browser APIs
- Component utilities

**Example Usage**:
```vue
<template>
  <div ref="element" class="tracked-element">
    <div v-if="isInViewport">This content appears when scrolled into view!</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

const element = ref(null);
const isInViewport = ref(false);

useIntersectionObserver(element, ([{ isIntersecting }]) => {
  isInViewport.value = isIntersecting;
});
</script>
```

## 🎨 UI Enhancement Components

### 1. Vue Prism Editor

**Purpose**: Interactive code editor with syntax highlighting

**Installation**:
```bash
npm install vue-prism-editor prismjs
```

**Key Features**:
- Syntax highlighting for multiple languages
- Line numbers
- Code folding
- Editable code examples
- Theme customization

**Example Usage**:
```vue
<template>
  <prism-editor
    v-model="code"
    :highlight="highlighter"
    line-numbers
    class="code-editor"
  ></prism-editor>
</template>

<script setup>
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { highlight, languages } from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import { ref } from 'vue';

const code = ref(`// Example Docker Compose file
version: '3'
services:
  web:
    image: nginx
    ports:
      - "80:80"`);

const highlighter = (code) => {
  return highlight(code, languages.yaml, 'yaml');
};
</script>
```

### 2. Vue Markdown Editor

**Purpose**: WYSIWYG markdown editor for interactive examples

**Installation**:
```bash
npm install @kangc/v-md-editor
```

**Key Features**:
- Live preview
- Toolbar for common markdown operations
- Image upload support
- Customizable themes
- Code highlighting

**Example Usage**:
```vue
<template>
  <v-md-editor v-model="content" height="400px"></v-md-editor>
</template>

<script setup>
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import { ref } from 'vue';

VMdEditor.use(vuepressTheme);

const content = ref('# Try editing this markdown\n\nThis is an interactive editor.');
</script>
```

### 3. Vue Terminal UI

**Purpose**: Terminal emulator for command examples

**Installation**:
```bash
npm install vue-terminal-ui
```

**Key Features**:
- Simulated terminal interface
- Command history
- Custom commands
- Theming options
- Copy-to-clipboard functionality

**Example Usage**:
```vue
<template>
  <vue-terminal-ui
    :commands="commands"
    :line-delay="500"
    :cmd-delay="1000"
    :intro="intro"
  />
</template>

<script setup>
import VueTerminalUi from 'vue-terminal-ui';
import { ref } from 'vue';

const intro = ref('Welcome to SSM CLI demo');

const commands = ref([
  { text: 'ssm device list', response: 'Listing all devices...\nserver1 [ONLINE]\nserver2 [OFFLINE]' },
  { text: 'ssm container deploy nginx', response: 'Deploying nginx container...\nContainer deployed successfully!' }
]);
</script>
```

## 📊 Data Visualization Components

### 1. Vue Chart.js

**Purpose**: Create interactive charts and graphs

**Installation**:
```bash
npm install vue-chartjs chart.js
```

**Key Features**:
- Various chart types (line, bar, pie, etc.)
- Responsive design
- Animation options
- Interactive tooltips
- Data updates

**Example Usage**:
```vue
<template>
  <div class="chart-container">
    <bar-chart :chart-data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { BarChart } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { ref } from 'vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const chartData = ref({
  labels: ['CPU', 'Memory', 'Disk', 'Network'],
  datasets: [
    {
      label: 'Resource Usage',
      backgroundColor: '#f87979',
      data: [40, 60, 30, 70]
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
});
</script>
```

### 2. Vue JSON Viewer

**Purpose**: Display formatted JSON data

**Installation**:
```bash
npm install vue-json-viewer
```

**Key Features**:
- Collapsible JSON tree
- Syntax highlighting
- Copy to clipboard
- Search functionality
- Customizable themes

**Example Usage**:
```vue
<template>
  <json-viewer :value="jsonData" :expand-depth="2" copyable boxed sort></json-viewer>
</template>

<script setup>
import JsonViewer from 'vue-json-viewer';
import 'vue-json-viewer/style.css';

const jsonData = {
  device: {
    id: 'server1',
    status: 'online',
    ip: '192.168.1.100',
    services: [
      { name: 'nginx', status: 'running' },
      { name: 'mysql', status: 'stopped' }
    ]
  }
};
</script>
```

## 🧩 Interactive Documentation Components

### 1. Vue Step Wizard

**Purpose**: Create step-by-step guides

**Installation**:
```bash
npm install vue-step-wizard
```

**Key Features**:
- Multi-step wizard interface
- Progress tracking
- Navigation controls
- Validation options
- Customizable themes

**Example Usage**:
```vue
<template>
  <step-wizard>
    <wizard-step title="Install SSM">
      <h3>Step 1: Installation</h3>
      <p>Run the following command to install SSM:</p>
      <code-block language="bash">curl -s install.squirrelserversmanager.io | bash</code-block>
    </wizard-step>
    <wizard-step title="Add Device">
      <h3>Step 2: Add Your First Device</h3>
      <p>Navigate to the Devices section and click "Add Device"</p>
      <img src="/screenshots/add-device.png" alt="Add Device Screen" />
    </wizard-step>
    <wizard-step title="Deploy Container">
      <h3>Step 3: Deploy Your First Container</h3>
      <p>Select your device and click "Deploy Container"</p>
      <img src="/screenshots/deploy-container.png" alt="Deploy Container Screen" />
    </wizard-step>
  </step-wizard>
</template>

<script setup>
import { StepWizard, WizardStep } from 'vue-step-wizard';
import 'vue-step-wizard/dist/vue-step-wizard.css';
</script>
```

### 2. Vue Tabs

**Purpose**: Create tabbed interfaces for platform-specific instructions

**Installation**:
```bash
npm install @vueuse/core
```

**Key Features**:
- Tab navigation
- Content switching
- Responsive design
- Customizable styling
- Accessibility features

**Example Usage**:
```vue
<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index"
        @click="activeTab = index"
        :class="{ active: activeTab === index }"
        class="tab-button"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content">
      <div v-show="activeTab === 0" class="tab-pane">
        <h3>Docker Installation</h3>
        <code-block language="bash">curl -s install.squirrelserversmanager.io | bash</code-block>
      </div>
      <div v-show="activeTab === 1" class="tab-pane">
        <h3>Proxmox Installation</h3>
        <code-block language="bash">bash -c "$(wget -qLO - install.squirrelserversmanager.io/proxmox)"</code-block>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tabs = [
  { label: 'Docker' },
  { label: 'Proxmox' }
];

const activeTab = ref(0);
</script>
```

### 3. Vue Accordion

**Purpose**: Create collapsible content sections

**Installation**:
```bash
npm install @vueuse/core
```

**Key Features**:
- Expandable/collapsible sections
- Smooth animations
- Multiple or single open sections
- Customizable styling
- Accessibility support

**Example Usage**:
```vue
<template>
  <div class="accordion">
    <div class="accordion-item">
      <div 
        class="accordion-header" 
        @click="toggleItem(0)"
        :class="{ active: activeItems.includes(0) }"
      >
        <h3>Basic Configuration</h3>
        <span class="accordion-icon">{{ activeItems.includes(0) ? '−' : '+' }}</span>
      </div>
      <div 
        class="accordion-content"
        :style="{ maxHeight: activeItems.includes(0) ? '1000px' : '0' }"
      >
        <p>Configure the basic settings for your SSM installation:</p>
        <ul>
          <li>Server port</li>
          <li>Database connection</li>
          <li>Authentication settings</li>
        </ul>
      </div>
    </div>
    
    <div class="accordion-item">
      <div 
        class="accordion-header" 
        @click="toggleItem(1)"
        :class="{ active: activeItems.includes(1) }"
      >
        <h3>Advanced Configuration</h3>
        <span class="accordion-icon">{{ activeItems.includes(1) ? '−' : '+' }}</span>
      </div>
      <div 
        class="accordion-content"
        :style="{ maxHeight: activeItems.includes(1) ? '1000px' : '0' }"
      >
        <p>Advanced configuration options for power users:</p>
        <ul>
          <li>Custom SSL certificates</li>
          <li>Proxy configuration</li>
          <li>High availability setup</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeItems = ref([]);

function toggleItem(index) {
  if (activeItems.value.includes(index)) {
    activeItems.value = activeItems.value.filter(item => item !== index);
  } else {
    activeItems.value.push(index);
  }
}
</script>

<style>
.accordion-item {
  border: 1px solid #ddd;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background-color: #f5f5f5;
  cursor: pointer;
}

.accordion-header.active {
  background-color: #e0e0e0;
}

.accordion-content {
  transition: max-height 0.3s ease-out;
  overflow: hidden;
  padding: 0 15px;
}
</style>
```

## 🔄 Implementation Guidelines

1. **Component Registration**:
   - Register components globally in the VitePress configuration
   - Import components locally when used in specific documentation pages

2. **Styling Consistency**:
   - Use external CSS files for all styling
   - Follow the project's color scheme and design language
   - Ensure responsive behavior on all screen sizes

3. **Accessibility**:
   - Ensure all components are keyboard navigable
   - Include proper ARIA attributes
   - Test with screen readers

4. **Performance**:
   - Lazy load components when possible
   - Optimize images and animations
   - Monitor bundle size impact

By using these recommended Vue components, the Squirrel Servers Manager documentation will provide an interactive, engaging, and informative experience for users of all skill levels.
