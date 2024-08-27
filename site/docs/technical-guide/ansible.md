# SSM & Ansible

SSM is essentially a wrapper around Ansible, specifically [Ansible Runner](https://github.com/ansible/ansible-runner).

The inventory is built dynamically following your commands in SSM. All execution logs are saved in SSM and viewable in the `Configuration`/`Logs` - Task Logs.

Each and every execution has a unique UUID. This UUID is used to track the progress of the task, retrieve the logs, and more.

The main Python script that launches the execution is `ssm-ansible-run.py` ([source](https://github.com/SquirrelCorporation/SquirrelServersManager/blob/master/server/src/ansible/ssm-ansible-run.py)).

Vaulted variables are decrypted dynamically using another script, `ssm-ansible-vault-password-client.py` ([source](https://github.com/SquirrelCorporation/SquirrelServersManager/blob/master/server/src/ansible/ssm-ansible-vault-password-client.py)). This method ensures that the Vault password is never passed into the CLI.

Before drafting your own playbooks, ensure that the user used for the SSH connection has the correct permissions.

## Ansible Galaxy
SSM offers a way to directly install Ansible Galaxy collections inside the Docker environment to benefit from thousands of pre-made roles and playbooks. These can be installed in `Playbooks`/`Store`.

![ansible-galaxy](/technical-guide/ansible/ansible-galaxy.gif)
