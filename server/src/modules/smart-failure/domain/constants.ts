import { FailurePattern } from './entities/failure-pattern.interface';

/**
 * Common patterns to identify failure reasons, causes, and resolutions
 */
export const FAILURE_PATTERNS: FailurePattern[] = [
  {
    id: 'unreachable',
    pattern: /UNREACHABLE!|unable to connect to port|failed to connect to the host/i,
    cause: 'The device may be down or unreachable.',
    resolution: 'Check the device network connectivity and ensure you entered the right IP.',
  },
  {
    id: 'no_package',
    pattern: /No package matching/i,
    cause: 'The package name may be incorrect or the package repository is not available.',
    resolution:
      'Verify the package name and ensure the relevant repository is configured correctly.',
  },
  {
    id: 'permission_denied',
    pattern: /Permission denied|Failed to authenticate/i,
    cause: 'Incorrect SSH credentials or insufficient permissions.',
    resolution: 'Check the SSH credentials and permissions.',
  },
  {
    id: 'command_not_found',
    pattern: /command not found|command failed/i,
    cause: 'The command does not exist or is not in the PATH.',
    resolution: 'Ensure the command exists and is correctly added to the PATH.',
  },
  {
    id: 'timeout',
    pattern: /timed out|timeout/i,
    cause: 'The connection or operation timed out.',
    resolution: 'Increase the timeout setting or check network stability.',
  },
  {
    id: 'curl_option',
    pattern: /curl: option/i,
    cause: 'Invalid or incorrect curl options used in the playbook.',
    resolution:
      'Check the curl options and correct any errors. Beware of using ansible "command" instead of "shell" for curl commands.',
  },
  {
    id: 'signed_by_conflict',
    pattern: /Conflicting values set for option Signed-By regarding/i,
    cause: 'Conflicting values set for option Signed-By regarding repository',
    resolution:
      'Remove conflicting values set for option Signed-By regarding repository (e.g: Debian: /etc/apt/sources.list.d/)',
  },
  {
    id: 'disk_space',
    pattern: /disk space/i,
    cause: 'Insufficient disk space on the host.',
    resolution: 'Free up disk space or add additional storage.',
  },
  {
    id: 'syntax_error',
    pattern: /syntax error/i,
    cause: 'There is a syntax error in the playbook or roles.',
    resolution: 'Fix the syntax error in the specified line of the playbook.',
  },
  {
    id: 'user_not_found',
    pattern: /unable to find user/i,
    cause: 'The specified user does not exist on the device.',
    resolution: 'Create the user on the device.',
  },
  {
    id: 'service_not_found',
    pattern: /could not find the requested service/i,
    cause: 'The specified service does not exist or is misspelled.',
    resolution: 'Verify the service name and ensure it is correctly spelled.',
  },
  {
    id: 'ssl_problem',
    pattern: /SSL certificate problem/i,
    cause: 'SSL certificate validation failed.',
    resolution: 'Check the SSL certificate and ensure it is valid and correctly configured.',
  },
  {
    id: 'module_not_found',
    pattern: /module could not be found/i,
    cause: 'An Ansible module required for the playbook is not installed.',
    resolution: 'Install the required Ansible module.',
  },
  {
    id: 'variable_undefined',
    pattern: /variable is undefined/i,
    cause: 'An undefined variable is being used in the playbook.',
    resolution: 'Define the variable in the playbook or inventory.',
  },
  {
    id: 'redirect_failed',
    pattern: /redirect module has failed/i,
    cause: 'The redirect module in the playbook failed to execute properly.',
    resolution:
      'Check the configuration and parameters of the redirect module used in the playbook.',
  },
  {
    id: 'docker_connection_failed',
    pattern: /Failed to connect to Docker daemon/i,
    cause:
      'Ansible failed to connect to the Docker daemon, which could be due to the Docker service not running or permission issues.',
    resolution:
      'Ensure the Docker service is running on the host.\n' +
      '1. Verify Docker daemon is active using: `sudo systemctl status docker`\n' +
      '2. Check if the user has the necessary permissions to interact with Docker. Users usually need to be added to the "docker" group: `sudo usermod -aG docker $USER`\n' +
      '3. Restart the Docker service: `sudo systemctl restart docker`',
  },
  {
    id: 'container_not_found',
    pattern: /No such container/i,
    cause: 'The specified Docker container does not exist on the host.',
    resolution:
      'Verify that the container name or ID is correct and that the container is running.\n' +
      '1. List all containers to confirm: `docker ps -a`\n' +
      '2. Ensure the container name or ID used in the playbook matches one of the listed containers.',
  },
  {
    id: 'image_pull_failed',
    pattern: /Failed to pull image/i,
    cause: 'Ansible failed to pull the specified Docker image from the registry.',
    resolution:
      'Check the Docker image name and tag for correctness.\n' +
      '1. Ensure the image name and tag are correct and available in the registry: `docker pull <image_name>:<tag>`\n' +
      '2. Verify that you have the necessary permissions to pull from the registry (e.g., docker login).\n' +
      '3. Check your network connection to ensure it can reach the Docker registry.',
  },
  {
    id: 'docker_execution_failed',
    pattern: /Failed to execute command in container/i,
    cause:
      'Ansible could not execute a command inside the Docker container due to various possible issues.',
    resolution:
      "Check the command and container's state.\n" +
      '1. Ensure the container is running: `docker ps`\n' +
      "2. Verify the command is valid within the container's environment.\n" +
      '3. Check the container logs for additional error details: `docker logs <container_id>`',
  },
  {
    id: 'docker_container_config',
    pattern: /ContainerConfig/i,
    cause: 'Docker container configuration is invalid due to various possible issues.',
    resolution: 'Check the docker container configuration.',
  },
];
