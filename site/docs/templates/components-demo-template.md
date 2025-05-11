---
layout: FeatureGuideLayout
title: "Components Demo"
icon: 🧩
time: 15 min read
signetColor: '#00bcd4'
---

This page demonstrates all reusable Vue components available in the SSM documentation system. Use this as a reference for how to implement and style each component.

## Table of Contents

- [PageHeader](#pageheader)
- [PlatformNote](#platformnote)
- [CopyButton](#copybutton)
- [NextStepCard](#nextstepcard)
- [SectionHeader](#sectionheader)
- [FeatureGrid & FeatureCard](#featuregrid--featurecard)
- [ComponentInfoGrid & ComponentInfoCard](#componentinfogrid--componentinfocard)
- [RequirementsGrid](#requirementsgrid)
- [StepPath](#steppath)
- [PlaybookCodeExample](#playbookcodeexample)
- [PlaybookModelDiagram](#playbookmodeldiagram)
- [DeviceModelDiagram](#devicemodeldiagram)
- [MentalModelDiagram](#mentalmodeldiagram)
- [ProcessSteps](#processsteps)
- [CardList](#cardlist)
- [Diagram](#diagram)
- [Swiper](#swiper)

---

## PageHeader

<PageHeader title="Demo Title" icon="🧩" time="5 min read" signetColor="#00bcd4" />

## PlatformNote

<PlatformNote platform="macOS">
This is a macOS-specific note.
</PlatformNote>

## CopyButton

<CopyButton :code="'npm install squirrel-servers-manager'" />

## NextStepCard

<NextStepCard icon="👉" title="Next Step" description="Go to the next guide" link="/docs/next-guide" />

## SectionHeader

<SectionHeader title="Section Title" />

## FeatureGrid & FeatureCard

<FeatureGrid>
  <FeatureCard title="Feature 1" description="Description for feature 1." icon="🛠️" />
  <FeatureCard title="Feature 2" description="Description for feature 2." icon="💡" />
</FeatureGrid>

## ComponentInfoGrid & ComponentInfoCard

<ComponentInfoGrid>
  <ComponentInfoCard
    headerTitle="Sample Component"
    purpose="This is a demonstration of the ComponentInfoCard within a ComponentInfoGrid."
    :storesItems="[
      'Data point A',
      'Configuration B',
      'Metric C'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Another Component"
    purpose="Illustrates how multiple cards appear in the grid layout."
    :storesItems="[
      'Log file X',
      'User preference Y',
      'Cache entry Z'
    ]"
  />
</ComponentInfoGrid>

## RequirementsGrid

<RequirementsGrid :requirements="[
  { header: 'Docker Host', items: ['Docker 20.10+', '2GB RAM'] },
  { header: 'Target Devices', items: ['SSH access', 'Python 3.8+'] }
]" />

## StepPath

<StepPath :steps="[
  { number: 1, title: 'Step One', description: 'First step', link: '#', linkText: 'Learn more' },
  { number: 2, title: 'Step Two', description: 'Second step', link: '#', linkText: 'Next' }
]" />

## PlaybookCodeExample

<PlaybookCodeExample :code="'---\n- name: Example\n  hosts: all\n  tasks:\n    - debug: msg=\'Hello\''" language="yaml" />

## PlaybookModelDiagram

<PlaybookModelDiagram />

## DeviceModelDiagram

<DeviceModelDiagram />

## MentalModelDiagram

<MentalModelDiagram title="Device Architecture" imagePath="/images/device-architecture.svg" altText="Device Architecture Diagram" caption="Figure 1: The Device Architecture in SSM" />

## ProcessSteps

<ProcessSteps :steps="[
  { number: 1, title: 'Step 1', description: 'Do this first.' },
  { number: 2, title: 'Step 2', description: 'Then do this.' }
]" />

## CardList

<CardList :cards="[
  { title: 'Card 1', description: 'Description 1' },
  { title: 'Card 2', description: 'Description 2' }
]" />

## Diagram

<Diagram :nodes="[]" :edges="[]" />

## Swiper

<Swiper :slides="[
  { title: 'Slide 1', content: 'Content 1' },
  { title: 'Slide 2', content: 'Content 2' }
]" /> 