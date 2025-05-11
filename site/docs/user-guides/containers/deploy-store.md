---
layout: FeatureGuideLayout
title: "Deploy Store"
icon: "🐳" # Docker whale icon
time: "5 min read"
signetColor: '#27ae60'
credits: true
---

## Store
In the `Store` section of the `Containers` page, you can easily deploy a container on any of your devices from a list of various self-hosted software options.

![services-deploy-store.png](/images/services-deploy-store.png)

## Deploy Configuration

![services-deploy-conf.png](/images/services-deploy-conf.png)

The configuration is pre-filled. Verify every option before deploying to ensure it fits your setup and environment.

## Steps to Deploy a Service

1. **Navigate to the Store**: Go to the `Containers` page and select the `Store` tab.
2. **Choose a container**: Browse through the available self-hosted software and select the one you wish to deploy.
3. **Review Configuration**:
    - Ensure all fields are correctly filled.
    - Customize any settings as necessary to match your environment.
    - Pay special attention to network settings, resource limits, and volume mounts.
4. **Deploy the Container**:
    - Once you have reviewed and adjusted the configuration, click the `Deploy` button.
    - Monitor the deployment process through the service logs and status indicators.

## Post-Deployment
After deployment, verify the container is running correctly. Perform necessary checks such as:
- Accessing the service through its intended endpoint.
- Verifying resource usage.
- Ensuring that all configurations are applied as expected.

Regularly monitor and maintain the container to keep it up-to-date and secure.

_In a future version, SSM will automatically perform the post-deployment health checks_
