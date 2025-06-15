---
layout: FeatureGuideLayout
title: "Ansible Security and Credential Handling"
icon: "🔐"
time: "8 min read"
signetColor: '#23233e' # Reference color
nextStep:
  icon: "➡️"
  title: "Built-in Playbooks"
  description: "Explore the playbooks included with SSM."
  link: "/docs/reference/ansible/built-in-playbooks"
credits: true
---
Squirrel Servers Manager (SSM) prioritizes security when handling credentials required for Ansible automation. Several mechanisms work together to protect sensitive information.



:::tip In a Nutshell (🌰)
- SSM encrypts sensitive data like passwords and keys using Ansible Vault.
- A custom vault password client securely provides the decryption key to Ansible.
- SSH private keys are managed using temporary files with strict permissions.
- Internal API calls are secured with API key authentication.
:::

## Secure Credential Handling Mechanisms

SSM implements a multi-layered approach to secure credential handling for Ansible operations:

1.  **Credential Encryption (Ansible Vault)**
    -   **What:** All sensitive data stored within SSM that needs to be passed to Ansible (e.g., SSH passwords, SSH key passphrases, sudo passwords, sensitive `extra_vars`) is encrypted at rest.
    -   **How:** SSM utilizes Ansible Vault, typically with AES-256 encryption, to protect this data in its database or configuration files.
    -   **Indicator:** You'll often see vault-encrypted variables represented like `{ "__ansible_vault": "...encrypted_data..." }` in inventory or variable structures passed internally.

2.  **Vault Password Service**
    -   **What:** Ansible needs the vault password to decrypt the data mentioned above during playbook execution.
    -   **How:** SSM uses a custom vault password client script (e.g., `ssm-ansible-vault-password-client.py`). When `ansible-runner` needs the vault password, it executes this script, which securely retrieves the necessary vault password (often stored securely within SSM's configuration, protected by the main application `SECRET`) and provides it directly to the Ansible process without exposing it in logs or command lines.

3.  **Temporary Key Files**
    -   **What:** When using SSH key-based authentication, the private key material needs to be accessible to the Ansible process.
    -   **How:** SSM securely retrieves the (potentially encrypted) private key from its storage, decrypts it if necessary using the stored passphrase (which itself might be vault-encrypted), and writes the plaintext private key to a temporary file on the filesystem where `ansible-runner` executes.
    -   **Security:** Critical measures are taken:
        -   The temporary file is created with strict filesystem permissions (e.g., readable only by the user running Ansible).
        -   The path to this temporary file is passed to Ansible (e.g., via `ansible_ssh_private_key_file`).
        -   SSM ensures these temporary key files are reliably deleted immediately after the playbook execution finishes (whether successful or not).

4.  **API Authentication**
    -   **What:** Internal communication between SSM components (e.g., between the main server and a potential vault password service or other helper scripts) needs to be authenticated.
    -   **How:** SSM often uses internal API keys or other secure tokens to authenticate these internal service calls, ensuring that only authorized components can request sensitive information like vault passwords.

## Security Best Practices

<ComponentInfoGrid>
  <ComponentInfoCard
    headerTitle="Security Best Practices"
    purpose="Recommended actions for securing your Ansible setup."
    subText="You should:"
    :storesItems="[
      'Strong Vault Password: Ensure the Ansible Vault password used by SSM (potentially derived from VAULT_PWD in the .env file during manual setup) is strong and kept confidential.',
      'Restrict Access: Limit access to the SSM server and its configuration files (.env).',
      'SSH Key Management: Use strong passphrases for your SSH keys stored in SSM.',
      'Regular Audits: Periodically review task logs and system access for any suspicious activity.'
    ]"
  />
</ComponentInfoGrid>

By combining these techniques, SSM aims to provide a secure environment for executing powerful Ansible automations across your infrastructure. 