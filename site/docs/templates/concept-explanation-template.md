<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

<PageHeader 
  title="What is [Concept Name]?" 
  icon="🧠" 
  time="Reading time: 8 minutes" 
/>

:::tip 🌰 In a Nutshell
- [Essential point 1 about this concept]
- [Essential point 2 about this concept]
- [Essential point 3 about this concept]
:::

## Definition

[Clear, concise definition of the concept in 1-2 sentences.]

## Why It Matters

[Brief explanation of why this concept is important for users to understand. Keep sentences short and direct.]

## Visual Explanation

<div class="concept-diagram">
  <!-- Add your diagram here:
  <img src="/images/concepts/concept-name-diagram.svg" alt="[Concept Name] Diagram" />
  -->
  <p class="diagram-caption">Figure 1: How [Concept Name] works in SSM</p>
  <div class="diagram-placeholder">[Diagram: Visual representation of the concept]</div>
</div>

<style>
.diagram-placeholder {
  padding: 60px 20px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 8px;
}
</style>

<style>
.concept-diagram {
  margin: 24px 0;
  text-align: center;
}

.concept-diagram img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.diagram-caption {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.65);
  font-style: italic;
}
</style>

## Key Components

### [Component 1]

[Brief description of this component and its purpose.]

:::info 🔍 Example
[Concrete example of this component in action.]
:::

### [Component 2]

[Brief description of this component and its purpose.]

:::info 🔍 Example
[Concrete example of this component in action.]
:::

### [Component 3]

[Brief description of this component and its purpose.]

:::info 🔍 Example
[Concrete example of this component in action.]
:::

## How It Works

<div class="steps-container">
  <div class="step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h4>[Step 1 Title]</h4>
      <p>[Explanation of the first step]</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h4>[Step 2 Title]</h4>
      <p>[Explanation of the second step]</p>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">3</div>
    <div class="step-content">
      <h4>[Step 3 Title]</h4>
      <p>[Explanation of the third step]</p>
    </div>
  </div>
</div>

<style>
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
}

.step {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  font-weight: bold;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin-top: 0;
  margin-bottom: 8px;
}
</style>

## Real-World Example

### Scenario: [Practical Scenario]

<div class="example-container">
  <div class="example-scenario">
    <h4>Problem:</h4>
    <p>[Description of a problem the user might face]</p>
  </div>
  
  <div class="example-solution">
    <h4>Solution using [Concept Name]:</h4>
    <p>[How this concept helps solve the problem]</p>
    
    <div class="code-block">
      <pre><code>[Example code or configuration]</code></pre>
    </div>
    
    <p>[Explanation of the result]</p>
  </div>
</div>

<style>
.example-container {
  margin: 24px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.example-scenario {
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.example-scenario h4, .example-solution h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

.example-solution {
  padding: 16px;
}

.code-block {
  margin: 16px 0;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  padding: 16px;
  overflow-x: auto;
}
</style>

## Best Practices

::: tip 💡 Do's
- [Best practice 1]
- [Best practice 2]
- [Best practice 3]
:::

::: danger ⛔ Don'ts
- [Practice to avoid 1]
- [Practice to avoid 2]
- [Practice to avoid 3]
:::

## Common Misconceptions

### Misconception 1: [Common misunderstanding]

**Reality**: [Correction with clear explanation]

### Misconception 2: [Common misunderstanding]

**Reality**: [Correction with clear explanation]

## Related Concepts

<div class="related-concepts">
  <div class="related-concept-card">
    <h3>🔄 [Related Concept 1]</h3>
    <p>[Brief description of how it relates]</p>
    <a href="../path/to/related-concept1">Learn more →</a>
  </div>
  
  <div class="related-concept-card">
    <h3>🔄 [Related Concept 2]</h3>
    <p>[Brief description of how it relates]</p>
    <a href="../path/to/related-concept2">Learn more →</a>
  </div>
  
  <div class="related-concept-card">
    <h3>🔄 [Related Concept 3]</h3>
    <p>[Brief description of how it relates]</p>
    <a href="../path/to/related-concept3">Learn more →</a>
  </div>
</div>

<style>
.related-concepts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.related-concept-card {
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.related-concept-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.related-concept-card h3 {
  margin-top: 0;
}

.related-concept-card a {
  display: inline-block;
  margin-top: 8px;
  font-weight: bold;
}
</style>

## Further Reading

- [Additional Resource 1](#) - [Brief description]
- [Additional Resource 2](#) - [Brief description]
- [Additional Resource 3](#) - [Brief description]
