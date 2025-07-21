<template>
  <div class="VPDoc" :class="{ 'has-aside': true }">
    <div class="container">
      <div class="content">
        <div class="content-container">
          <PageHeader
            :title="frontmatter.title"
            :icon="frontmatter.icon"
            :time="frontmatter.time"
            :signetColor="frontmatter.signetColor"
          />
          <slot />
          <main class="main">
            <Content class="vp-doc" />
          </main>          
          <FeedbackSupportSection v-if="frontmatter.feedbackSupport" v-bind="frontmatter.feedbackSupport" />
           <div class="vp-doc" v-if="frontmatter.nextStep">
            <h2>Next step</h2>
          </div> 
          <NextStepCard v-if="frontmatter.nextStep" v-bind="frontmatter.nextStep" />
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="aside">
        <div class="aside-curtain"></div>
        <div class="aside-container">
          <div class="aside-content">
            <VPDocAsideOutline />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import PageHeader from '../../components/PageHeader.vue'
import NextStepCard from '../../components/NextStepCard.vue'
import VPDocAsideOutline from 'vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue'
import FeedbackSupportSection from '../../components/FeedbackSupportSection.vue'

const { frontmatter } = useData()
</script>

<style scoped>
.VPDoc {
  padding: 32px 24px 96px;
  width: 100%;
}

@media (min-width: 768px) {
  .VPDoc {
    padding: 48px 32px 128px;
  }
}

@media (min-width: 960px) {
  .VPDoc {
    padding: 48px 32px 0;
  }
}

.container {
  margin: 0 auto;
  width: 100%;
  display: flex;
}

.content {
  position: relative;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 960px) {
  .content {
    padding: 0 32px 128px;
  }
}

@media (min-width: 1280px) {
  .content {
    order: 1;
    margin: 0;
    min-width: 640px;
  }
}

.content-container {
  margin: 0 auto;
  max-width: 688px;
}

.aside {
  position: relative;
  display: none;
  order: 2;
  flex-grow: 1;
  padding-left: 32px;
  width: 100%;
  max-width: 256px;
}

.aside-curtain {
  position: fixed;
  bottom: 0;
  z-index: 10;
  width: 224px;
  height: 32px;
  background: linear-gradient(transparent, var(--vp-c-bg) 70%);
}

.aside-container {
  position: fixed;
  top: 0;
  padding-top: calc(var(--vp-nav-height) + 48px);
  width: 224px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
}

.aside-container::-webkit-scrollbar {
  display: none;
}

.aside-content {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - (var(--vp-nav-height) + 48px));
  padding-bottom: 32px;
}

@media (min-width: 1280px) {
  .aside {
    display: block;
  }
}
</style>