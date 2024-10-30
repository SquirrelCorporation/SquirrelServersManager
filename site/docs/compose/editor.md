# Container Stacks

## 🌰 In a Nutshell

:::info Summary
- **Overview**: SSM offers a Docker Compose visual stack editor with a context-aware UI that autocompletes existing networks, images, dependencies, or volumes across multiple devices.
- **Adding a New Stack**: Compose new Docker Compose stacks visually by dragging and dropping elements or by editing the code directly in the code editor.
- **Code Translation**: SSM automatically translates your UI stack to code, and you can switch to the code editor to view the generated code.
- **Validation**: Check the syntax of your code with the `Check format` feature to ensure basic validation.
- **Templates**: Access a selection of templates for the most commonly used services.
:::

<img src="/compose/compose-1.png" alt="dashboard" style="border-radius: 10px; border: 2px solid #000; margin-top: 15px; margin-bottom: 55px;" />

## Overview

SSM is one of the few, if not the only one, to offer a Docker Compose visual stack editor.
The UI builder is context-aware of your setup, meaning it will autocomplete existing networks, images, dependencies, or volumes across multiple devices.

### Adding a New Stack

You can compose a new Docker Compose stack visually by dragging and dropping elements and filling them in, or directly edit the code in the code editor.

![build1](/compose/compose-build-1.gif)

SSM will automatically translate your UI stack to code. To see the generated code, just click `Switch to Code Editor`.

![build1](/compose/compose-switch.gif)

### Validate

Validate your code by clicking on `Check format`. Basic validation checks will be performed so you know if your code is at least syntactically correct.

### Templates
A selection of templates is available for most used services
![build1](/compose/compose-build-2.png)
