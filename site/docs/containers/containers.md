# Containers

## 🌰 In a Nutshell

:::info ℹ️ Sum-up
Once a device is added, SSM will automatically get the running containers ; allow you to manage them and detect images update.
:::

## Overview
The Containers page allows you to view and manage the Docker containers currently installed on your devices.
![edit-file](/services/services-overview.gif)

Currently, SSM uses a modified version of WhatsUpDocker, utilizing the same [flags and filters](/docs/technical-guide/containers-labelling.md).

## Update available flag
When an update for a container's image is available, a tag is displayed on the tile.
![service1](/services/services-3.png)

If your container image is stored in a `Private Registry`, you must add a [private registry authentication](/docs/settings/registry.md)

## Force refresh
You can force a refresh of the current container statuses and available updates by clicking on the button in the top right corner.
![service1](/services/services-2.png)
