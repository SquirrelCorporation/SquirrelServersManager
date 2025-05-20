---
layout: FeatureGuideLayout
title: "Proxmox"
icon: "🔄" # Proxmox/virtualization icon
time: "5 min read"
signetColor: '#f1c40f'
nextStep:
  icon: "👉"
  title: "First Time Setup"
  description: "Create your admin account and get started with SSM"
  link: "/docs/getting-started/first-steps"
credits: true
---
 
# Proxmox Installation 

:::info ℹ️ Duration
Please note that this method can take quite a long time, as the project will be cloned and built in the container.
:::

### 1. Access the Proxmox UI Console
### 2. Access the Shell of Your Node
![install-proxmox-shell.png](/images/install-proxmox-shell.png)
### 3. Run the Script
```shell
bash -c "$(wget -qLO - https://getssm.io/proxmox)"
```
### 4. You Should See:
![install-proxmox-install-1.png](/images/install-proxmox-install-1.png)
![install-proxmox-install-2.png](/images/install-proxmox-install-2.png)

Here, you can either choose the default install (default is: 10G disk space, 2 CPUs, and 4096MB RAM) or customize the settings by selecting `Advanced`.

### 5. Installation Process
![install-proxmox-install-3.png](/images/install-proxmox-install-3.png)
Wait several minutes until the script finishes the installation of SSM on a new LXC container. **The process can be quite long.**

### 6. Access the UI
When the installation is complete, you should see a message like this:
![install-proxmox-install-4.png](/images/install-proxmox-install-4.png)
Access the UI by entering the provided address in your browser.
