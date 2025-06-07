---
layout: FeatureGuideLayout
title: "Device Diagnostics"
icon: 🔍
time: 5 min read
signetColor: '#3a5ccc'
nextStep:
  icon: 🏠
  title: Device Configuration
  description: Return to device configuration overview
  link: /docs/user-guides/devices/configuration/
credits: true
---

:::tip In a Nutshell (🌰)
- Diagnose connection issues with Ansible, Docker, and system information
- Run comprehensive tests to validate device connectivity
- Troubleshoot authentication and configuration problems
- Verify that your device meets all requirements for SSM
:::

## Overview

The diagnostic tools in SSM allow you to verify the connectivity and configuration of your devices. When you encounter issues with device management, container operations, or playbook execution, the diagnostic tab provides valuable tools to identify and resolve problems.

<div class="screenshot-container">
  <img src="/images/device-configuration-diagnostic-diagnostic-1.png" alt="Diagnostic Tab" class="screenshot" />
  <div class="screenshot-caption">Device Diagnostic Interface</div>
</div>

## Available Diagnostic Tests

SSM offers several diagnostic tests to validate different aspects of device connectivity:

### Basic Connection Tests

| Test | Purpose | Requirements |
|------|---------|--------------|
| **Ansible Connection** | Validates SSH connectivity for Ansible operations | Valid SSH credentials, Python on remote device |
| **System Information** | Tests ability to retrieve basic system data | SSH connectivity in agentless mode |
| **Docker Connection** | Verifies Docker engine connectivity | Docker installed and running on device |

## Running Diagnostic Tests

<ProcessSteps :steps="[
  { title: 'Navigate to the device configuration page', description: '' },
  { title: 'Select the Diagnostic tab', description: '' },
  { title: 'Choose the test you want to run', description: '' },
  { title: 'Click the Run Test button', description: '' },
  { title: 'Wait for the test to complete', description: '' },
  { title: 'Review the results', description: '' }
]" />

Test results will display with a success indicator (green/red) and detailed information about any issues encountered.

## Interpreting Test Results

### Success Indicators

- ✅ **Green**: Test passed successfully
- ❌ **Red**: Test failed

### Common Issues and Solutions

#### Ansible Connection Issues

| Issue | Solution |
|-------|----------|
| SSH Authentication Failure | Verify your SSH credentials in the SSH configuration tab |
| Python Missing | Install Python on the remote device |
| Permission Denied | Ensure the SSH user has sufficient privileges |

#### System Information Issues

| Issue | Solution |
|-------|----------|
| Connection Timeout | Check network connectivity and firewall settings |
| Command Not Found | Verify system commands are available on the remote device |

#### Docker Connection Issues

| Issue | Solution |
|-------|----------|
| Docker Not Running | Start the Docker service on the remote device |
| Permission Denied | Add the SSH user to the docker group |
| API Version Mismatch | Update Docker to a compatible version |

## Advanced Diagnostic Workflow

For comprehensive troubleshooting, follow this workflow:

1. **Start with Basic Tests**: Run the basic connection tests first
2. **Review Logs**: Check the detailed logs for specific error messages
3. **Verify Configuration**: Review your device configuration for errors
4. **Run Advanced Tests**: If basic tests fail, run advanced diagnostic tests
5. **Apply Fixes**: Make the necessary changes based on test results
6. **Retest**: Run the tests again to verify your fixes worked

## Using Diagnostic Tools Effectively

<ComponentInfoGrid>
  <ComponentInfoCard
    headerTitle="When to Run Diagnostics"
    purpose="Situations where running diagnostics is recommended."
    subText="Situations:"
    :storesItems="[
      'After adding a new device',
      'When changing device configuration',
      'If container operations fail',
      'When playbook execution encounters errors',
      'After system updates on the device'
    ]"
  />
</ComponentInfoGrid>

<ComponentInfoGrid>
  <ComponentInfoCard
    headerTitle="Troubleshooting With Multiple Issues"
    purpose="Approaching and resolving multiple diagnostic failures."
    subText="Proceed, in order:"
    :storesItems="[
      'Start with the most fundamental issue (usually SSH connectivity)',
      'Resolve issues one at a time',
      'Rerun tests after each fix',
      'Document successful configurations for future reference'
    ]"
  />
</ComponentInfoGrid>
