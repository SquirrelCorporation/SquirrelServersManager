<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

# Feature Guide: [Feature Name]

<PageHeader 
  title="Feature Name" 
  icon="📝" 
  time="Estimated time: XX minutes" 
/>

:::tip 🌰 In a Nutshell
- [Key point 1 about this feature]
- [Key point 2 about this feature]
- [Key point 3 about this feature]
- [Key point 4 about this feature]
- [Key point 5 about this feature]
:::

## Overview

[Brief description of the feature in 2-3 short sentences. Be clear and direct.]

<div class="screenshot-container">
  <div class="screenshot-placeholder">[Screenshot: Feature Overview]</div>
  <div class="screenshot-caption">Brief description of what's shown in the screenshot</div>
</div>

## Prerequisites

Before using this feature, ensure you have:

- [Prerequisite 1]
- [Prerequisite 2]
- [Prerequisite 3]

## Basic Usage

### Step 1: [First Action]

1. Navigate to [location]
2. Click on [element]
3. Enter [information]

<div class="screenshot-container">
  <div class="screenshot-placeholder">[Screenshot: Step 1 Action]</div>
  <div class="screenshot-caption">Description of step 1 action</div>
</div>

### Step 2: [Second Action]

1. Select [option]
2. Configure [settings]
3. Save your changes

<div class="screenshot-container">
  <div class="screenshot-placeholder">[Screenshot: Step 2 Action]</div>
  <div class="screenshot-caption">Description of step 2 action</div>
</div>

::: warning ⚠️ Important
[Critical information users should know before proceeding]
:::

### Step 3: [Third Action]

1. Review [details]
2. Confirm by clicking [button]
3. Wait for [result]

<div class="screenshot-container">
  <div class="screenshot-placeholder">[Screenshot: Step 3 Action]</div>
  <div class="screenshot-caption">Description of step 3 action</div>
</div>

## Common Use Cases

### [Use Case 1]

::: code-group
```yaml [Configuration]
# Example configuration for use case 1
example:
  setting1: value1
  setting2: value2
```

```bash [Command Line]
# Example command for use case 1
ssm feature execute --option1=value1 --option2=value2
```
:::

### [Use Case 2]

::: tip 🌟 Recommended Approach
This approach is recommended for most production environments.
:::

## Advanced Options

<details>
<summary>Advanced Configuration Options</summary>

### [Advanced Option 1]

Use this option when you need to [specific scenario].

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `option1` | [Description] | `default1` | `example1` |
| `option2` | [Description] | `default2` | `example2` |

### [Advanced Option 2]

This is useful for [specific scenario].

```json
{
  "advancedSetting": {
    "parameter1": "value1",
    "parameter2": "value2",
    "parameter3": {
      "nestedOption": true
    }
  }
}
```

</details>

## Troubleshooting

### [Common Issue 1]

**Symptom**: [Description of what users will observe]

**Solution**: 
1. Check [specific setting]
2. Verify [particular condition]
3. Restart [component] if necessary

::: danger 🔥 Warning
Never [dangerous action] as it may result in [negative consequence].
:::

### [Common Issue 2]

**Symptom**: [Description of what users will observe]

**Solution**: [Step-by-step resolution]

## Related Features

- [Related Feature 1](/path/to/related1) - Brief description of relationship
- [Related Feature 2](/path/to/related2) - Brief description of relationship
- [Related Feature 3](/path/to/related3) - Brief description of relationship

## Next Steps

After mastering this feature, learn about related functionality:

<a href="/path/to/next-feature" class="next-step-card">
  <div class="next-step-icon">⏭️</div>
  <h2>Next Feature Name</h2>
  <div class="next-step-separator"></div>
  <p>Brief description of the next logical feature to explore</p>
</a>
