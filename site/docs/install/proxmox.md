# Proxmox Installation

:::info ℹ️ Duration
Please note that this method can take quite a long time, as the project will be cloned and built in the container.
:::

### 1. Access the Proxmox UI Console
### 2. Access the Shell of Your Node
![shell](/install/proxmox-shell.png)
### 3. Run the Script
```shell
bash -c "$(wget -qLO - https://getssm.io/proxmox)"
```
### 4. You Should See:
![proxmox1](/install/proxmox-install-1.png)
![proxmox2](/install/proxmox-install-2.png)

Here, you can either choose the default install (default is: 10G disk space, 2 CPUs, and 4096MB RAM) or customize the settings by selecting `Advanced`.

### 5. Installation Process
![proxmox3](/install/proxmox-install-3.png)
Wait several minutes until the script finishes the installation of SSM on a new LXC container. **The process can be quite long.**

### 6. Access the UI
When the installation is complete, you should see a message like this:
![proxmox4](/install/proxmox-install-4.png)
Access the UI by entering the provided address in your browser.

## Next Steps

After installing SSM on Proxmox, you'll need to set up your administrator account and get familiar with the system.

<a href="/docs/getting-started/first-steps" class="next-step-card">
  <div class="next-step-icon">👉</div>
  <h2>First Time Setup</h2>
  <div class="next-step-separator"></div>
  <p>Create your admin account and get started with SSM</p>
</a>