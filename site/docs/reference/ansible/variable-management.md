---
layout: FeatureGuideLayout
title: "Ansible Variable Management in SSM"
icon: "🔧"
time: "5 min read"
signetColor: '#23233e' # Reference color
nextStep:
  icon: "➡️"
  title: "Ansible Security"
  description: "Learn how SSM handles credentials securely."
  link: "/docs/reference/ansible/security"
credits: true
---
Squirrel Servers Manager (SSM) provides a robust system for passing variables (known as "extra vars" in Ansible terminology) to your playbooks during execution. This allows for dynamic and customized automation.


:::tip In a Nutshell (🌰)
- SSM passes variables to playbooks using Ansible's `--extra-vars` mechanism.
- Handles transformation from SSM's format to Ansible's expected JSON format.
- Supports complex data structures and secure handling of sensitive values.
:::


## Passing Extra Variables

When you execute a playbook through SSM (e.g., via Stacks or Automations), you can provide variables that will be passed to the `ansible-runner` using the `--extra-vars` command-line argument. SSM uses internal services (like `ExtraVarsService` and `ExtraVarsTransformerService`) to manage this process.

### Transformation

SSM often stores or receives variables in a specific format (e.g., an array of key-value pairs via its API). The `ExtraVarsTransformerService` is responsible for converting this format into the JSON string format expected by Ansible's `--extra-vars`.

Example internal transformation logic (conceptual):

```typescript
// Example of how SSM might prepare the --extra-vars argument
function getExtraVarsArgument(extraVars?: API.ExtraVar[]): string {
  if (!extraVars || extraVars.length === 0) {
    return '';
  }
  
  // Transform the API format (e.g., [{key: 'myVar', value: 'myVal'}]) 
  // into an Ansible-compatible object (e.g., { myVar: 'myVal' })
  const ansibleVars = transformToAnsibleObject(extraVars);
  
  // Return the formatted command-line argument
  return `--extra-vars '${JSON.stringify(ansibleVars)}'`;
}
```

### Key Features

- **Format Transformation**: Converts variables from SSM's internal/API format to the JSON structure Ansible requires.
- **Secure Value Handling**: Integrates with SSM's credential management to handle sensitive variables marked for vault encryption.
- **Data Structure Support**: Allows passing complex data types like lists, dictionaries (objects), booleans, and numbers, not just simple strings.
- **Validation**: May include validation steps to ensure variable formats are correct before passing them to Ansible.

## Variable Precedence

Remember that variables passed via `--extra-vars` have the highest precedence in Ansible, overriding variables defined in inventories, playbooks (`vars` sections), or roles. For a full understanding of Ansible's variable precedence rules, consult the official [Ansible documentation on variable precedence](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#variable-precedence-where-should-i-put-a-variable). 