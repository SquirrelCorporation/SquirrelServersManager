<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

<PageHeader 
  title="Documentation Implementation Guide" 
  icon="📝" 
  time="Reading time: 15 minutes" 
/>

:::tip 🌰 In a Nutshell
- Follow this guide to implement the new documentation structure
- Use the provided templates for consistent formatting
- Start with high-impact content areas first
:::

## Getting Started

This guide outlines the practical steps to implement the documentation improvement plan. It provides a structured approach to migrate existing content, create new documentation, and maintain consistency throughout the process.

## Implementation Phases

### Phase 1: Infrastructure Setup (Week 1)

<div class="step-container">
  <div class="step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h4>Set Up Directory Structure</h4>
      <p>Create the new directory structure according to the information architecture plan:</p>
      <div class="code-block">
```bash
mkdir -p site/docs/{getting-started,user-guides/{devices,containers,automations,stacks,playbooks},advanced-guides,concepts,reference,community}
```
      </div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h4>Update VitePress Configuration</h4>
      <p>Modify the sidebar navigation in the VitePress config file to match the new structure:</p>
      <div class="code-block">
```ts
// site/.vitepress/config.ts
export default defineConfig({
  // ... other config
  themeConfig: {
    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'First Steps', link: '/getting-started/first-steps' }
            // other items
          ]
        }
      ],
      // other sidebar sections
    }
  }
})
```
      </div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">3</div>
    <div class="step-content">
      <h4>Copy Templates to Work Directory</h4>
      <p>Make templates easily accessible for content creation:</p>
      <div class="code-block">
```bash
cp site/docs/templates/* ./.templates/
```
      </div>
    </div>
  </div>
</div>

<style>
.step-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 24px 0;
}

.step {
  display: flex;
  gap: 16px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--vp-c-brand);
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin-top: 0;
  margin-bottom: 12px;
}

.code-block {
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
}
</style>

### Phase 2: Core Content Migration (Weeks 2-3)

Begin by migrating the most important and frequently accessed content:

#### Priority Order for Migration

1. **Installation & Setup** - Getting Started section
2. **Device Management** - Core functionality for users
3. **Container Management** - High-traffic documentation
4. **Playbooks & Automations** - Advanced user functionality
5. **Reference Materials** - Supporting documentation

#### Document Migration Process

For each document being migrated:

1. **Assess the current document**
   - Review the content structure and topics covered
   - Identify missing information or outdated sections
   - Note dependencies on other documentation pages

2. **Select the appropriate template**
   - Feature Guide for functionality-focused pages
   - Concept Explanation for architectural topics
   - Troubleshooting Guide for problem-solving content
   - Quick Start for onboarding materials

3. **Create the new document structure**
   - Add the "In a Nutshell" summary section
   - Break content into logical sections with clear headings
   - Apply the VitePress components (tabs, callouts, code blocks)

4. **Enhance with visual elements**
   - Add screenshots where helpful (use placeholders initially)
   - Create diagrams for complex concepts
   - Include step-by-step visual guides for processes

5. **Update cross-references**
   - Fix links to point to new document locations
   - Add related content links at the end of documents
   - Create a cohesive navigation flow between related topics

### Phase 3: New Content Creation (Weeks 4-6)

After migrating existing content, focus on creating new documentation to fill gaps:

#### Gap Analysis

Run a systematic check to identify missing documentation:

```bash
# Create a script to identify documentation gaps
./scripts/doc-analysis.sh > doc-gaps.md
```

Common gaps to address:

- Conceptual overviews of major features
- Architectural explanations
- Advanced troubleshooting guides
- Best practices documents
- Integration examples

#### New Content Guidelines

When creating new content:

1. **Start with research**
   - Consult with developers on technical details
   - Review GitHub issues for common user questions
   - Examine community discussions for pain points

2. **Draft clear outlines**
   - Use the template structure as a guide
   - Identify the key user questions to answer
   - Plan progressive disclosure of information

3. **Follow the style guide rigorously**
   - Use consistent terminology
   - Keep sentences short and direct
   - Include "In a Nutshell" summaries

4. **Add visual elements early**
   - Sketch diagrams during the outline phase
   - Plan screenshots needed for each section
   - Create decision trees for complex processes

5. **Include practical examples**
   - Real-world use cases
   - Copy-paste ready code examples
   - Configuration snippets that work out-of-the-box

## Quality Control Process

### Documentation Review Checklist

Each migrated or new document should undergo this quality control process:

:::info 📋 Review Checklist
- [ ] Includes "In a Nutshell" summary section
- [ ] Headers follow the correct hierarchy
- [ ] Uses VitePress components appropriately
- [ ] Contains clear, short sentences
- [ ] Includes visual elements where helpful
- [ ] Code examples have language specification
- [ ] Has been tested in both light and dark themes
- [ ] All links work correctly
- [ ] Cross-references to related documentation
- [ ] No broken image references
:::

### Technical Accuracy Review

For each document, ensure technical content is accurate:

1. **Developer review**
   - Document is assigned to a subject matter expert
   - Technical details are verified for accuracy
   - Code examples are tested in a real environment

2. **User perspective review**
   - Test instructions by following them step-by-step
   - Ensure prerequisites are clearly stated
   - Verify that expected outcomes match actual results

### Editorial Review

Final editing pass to ensure consistency:

1. **Style compliance**
   - Terminology follows glossary standards
   - Tone matches documentation voice
   - Formatting follows template guidelines

2. **Readability check**
   - Content flows logically
   - Complex concepts are adequately explained
   - Progressive disclosure is properly implemented

## Workflow Automation

### GitHub Integration

Set up automation to streamline documentation workflow:

```yaml
# .github/workflows/docs-preview.yml
name: Documentation Preview
on:
  pull_request:
    paths:
      - 'site/docs/**'
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Build docs preview
        run: npm run docs:build
      - name: Deploy preview
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=site/.vitepress/dist
```

### Documentation Testing

Implement automated testing for documentation:

1. **Link checking**
   - Verify that all internal and external links work
   - Flag broken references automatically

2. **Markdown linting**
   - Enforce consistent formatting
   - Check for common Markdown errors

3. **Screenshot verification**
   - Ensure all referenced images exist
   - Check image dimensions and file sizes

## Tracking Progress

### Implementation Kanban Board

Set up a Kanban board with the following columns:

1. **Backlog** - Documents identified for migration/creation
2. **In Progress** - Currently being worked on
3. **Technical Review** - Awaiting developer verification
4. **Editorial Review** - Undergoing style and consistency check
5. **Ready for Publish** - Approved and ready to deploy
6. **Published** - Live in production

### Success Metrics Tracking

Implement analytics to measure documentation effectiveness:

1. **Page views** - Track most accessed documentation
2. **Time on page** - Measure engagement with content
3. **Search queries** - Identify what users are looking for
4. **Feedback ratings** - Collect user satisfaction data

## Rollout Communication

### Internal Announcement

Share the documentation improvements with the team:

```markdown
# Documentation Improvement Announcement

We're excited to announce the launch of our new documentation system!

## What's New
- Completely reorganized structure for easier navigation
- New "In a Nutshell" summaries at the top of complex docs
- Improved visual guides and diagrams
- Dark theme support throughout

## How to Contribute
See our new [Documentation Contribution Guide](/community/contributing-docs)
```

### User Communication

Update users about the documentation improvements:

1. **Blog post** announcing the changes and highlighting improvements
2. **Release notes** mentioning documentation updates
3. **In-app notification** pointing to new resources

## Maintenance Plan

### Regular Review Schedule

Establish a documentation maintenance cycle:

- **Weekly**: Fix reported issues and broken links
- **Monthly**: Update documentation for new features
- **Quarterly**: Comprehensive review of high-traffic sections
- **Bi-annually**: Full documentation audit and gap analysis

### Content Freshness Checking

Implement automation to identify stale content:

```bash
# Find documentation not updated in the last 6 months
find site/docs -type f -name "*.md" -mtime +180 | sort > stale-docs.txt
```

Review these files for potential updates or archiving.

## Next Steps

After completing this implementation:

1. **Gather feedback** from users on the new documentation
2. **Measure impact** using the established metrics
3. **Iterate and improve** based on user behavior data
4. **Expand templates** as new documentation patterns emerge

Remember that documentation is never "done" - it should evolve with your product and user needs.
