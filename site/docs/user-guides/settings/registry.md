---
layout: FeatureGuideLayout
title: "Registry"
icon: "✨"
time: "5 min read"
signetColor: '#7f8c8d'
credits: true
---


SSM supports the following registries:

- ACR (Azure Container Registry)
- CUSTOM (Self-hosted Registry)
- ECR (Amazon Elastic Container Registry)
- GCR (Google Container Registry)
- GHCR (GitHub Container Registry)
- GITLAB (GitLab Container Registry)
- HUB (Docker Hub)
- LSCR (LinuxServer Container Registry)
- Quay

:::info ℹ️ Default registries
By default, the following registries will be available <b>using anonymous access</b>:
ECR, GHCR, GCR, HUB, QUAY
:::

## Configuring a registry
### 1. Go to settings, "Registries" tab
![registries-registries-1.png](/images/registries-registries-1.png)
### 2. Select a predefined integration or custom integration (see below)

## ACR (Azure Container Registry)

The `acr` registry lets you configure [ACR](https://azure.microsoft.com/services/container-registry/) integration.

### Variables

| Name           | Required     | Description                 | Supported values                                                                                                                  | Default value when missing |
|----------------|:------------:| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `clientid`     | :red_circle: | Service Principal Client ID | See [Service Principal Auth](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-service-principal) |                            |
| `clientsecret` | :red_circle: | Service Principal Secret    | See [Service Principal Auth](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-service-principal) |                            |

### Example

<!-- tabs:start -->
![registries-acr-acr.png](/images/registries-acr-acr.png)
<!-- tabs:end -->

### How to create Registry credentials on Microsoft Azure Platform

#### Create a Service Principal
Follow the [official Azure documentation](https://docs.microsoft.com/azure/active-directory/develop/howto-create-service-principal-portal).

#### Get the Client Id and the Client Secret of the created Service Principal
![registries-acr-acr_01.png](/images/registries-acr-acr_01.png)

#### Go to your Container Registry and click on the Access Control (IAM) Menu
![registries-acr-acr_02.png](/images/registries-acr-acr_02.png)

#### Click to Add a role assignment
Select the `AcrPull` role and assign it to your Service Principal
![registries-acr-acr_03.png](/images/registries-acr-acr_03.png)

## CUSTOM (Self-hosted Docker Registry)

The `custom` registry lets you configure a self-hosted [Docker Registry](https://docs.docker.com/registry/) integration.

### Variables

| Env var    | Required       | Description                                                     | Supported values                    | Default value when missing |
|------------|:--------------:| --------------------------------------------------------------- |-------------------------------------| -------------------------- |
| `url`      | :red_circle:   | Registry URL (e.g. http://localhost:5000)                       |                                     |                            |
| `login`    | :white_circle: | Login (when htpasswd auth is enabled on the registry)           | password must be defined            |                            |
| `password` | :white_circle: | Password (when htpasswd auth is enabled on the registry)        | login must be defined               |                            |
| `auth`     | :white_circle: | Htpasswd string (when htpasswd auth is enabled on the registry) | login/password  must not be defined |                            |
### Examples

#### Configure for anonymous access
<!-- tabs:start -->
![registries-custom-custom-1.png](/images/registries-custom-custom-1.png)

<!-- tabs:end -->

#### Configure [for Basic Auth](https://docs.docker.com/registry/configuration/#htpasswd)
<!-- tabs:start -->
![registries-custom-custom-2.png](/images/registries-custom-custom-2.png)
![registries-custom-custom-3.png](/images/registries-custom-custom-3.png)

<!-- tabs:end -->

## ECR (Amazon Elastic Container Registry)

The `ecr` registry lets you configure [ECR](https://aws.amazon.com/ecr/) integration.

### Variables

| Env var           | Required     | Description                   | Supported values                                                                                  | Default value when missing |
|-------------------|:------------:| ----------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| `region`          | :red_circle: | A valid AWS Region Code       | [AWS Region list](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints)    |                            |
| `accesskey`       | :red_circle: | A valid AWS Access Key Id     | [Standard AWS Credentials](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html) |                            |
| `secretaccesskey` | :red_circle: | A valid AWS Secret Access Key | [Standard AWS Credentials](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html) |                            |

!> The AmazonEC2ContainerRegistryReadOnly Policy (or higher) must be attached to the AWS IAM User.

### Examples
<!-- tabs:start -->
![registries-ecr-ecr.png](/images/registries-ecr-ecr.png)
<!-- tabs:end -->

### How to create an AWS IAM user and get programmatic access

#### 1. Login to your&nbsp;[Go to the IAM Service from your AWS Console](https://console.aws.amazon.com/iam) and create a new user
![registries-ecr-ecr_01.png](/images/registries-ecr-ecr_01.png)

#### 2. Attach the AmazonEC2ContainerRegistryReadOnly policy to the user
![registries-ecr-ecr_02.png](/images/registries-ecr-ecr_02.png)

#### 3. Get your AccessKeyId and your Secret Access Key and configure SSM with them
![registries-ecr-ecr_03.png](/images/registries-ecr-ecr_03.png)

## FORGEJO

The `forgejo` registry lets you configure a self-hosted [Forgejo](https://forgejo.org/) integration.

### Variables

| Env var    |    Required    | Description                                                     | Supported values                    | Default value when missing |
|------------|:--------------:|-----------------------------------------------------------------|-------------------------------------|----------------------------|
| `url`      |  :red_circle:  | Registry URL (e.g. https://forgejo.acme.com)                      |                                     |                            |
| `login`    | :red_circle:   | Gitea username                                                  | password must be defined            |                            |
| `password` |  :red_circle:  | Gitea password                                                  | login must be defined               |                            |
| `auth`     | :white_circle: | Htpasswd string (when htpasswd auth is enabled on the registry) | login/password  must not be defined |                            |
### Examples

#### Configure
<!-- tabs:start -->
![registries-forgejo-forgejo-1.png](/images/registries-forgejo-forgejo-1.png)
![registries-forgejo-forgejo-2.png](/images/registries-forgejo-forgejo-2.png)

<!-- tabs:end -->

## GCR (Google Container Registry)

The `gcr` registry lets you configure [GCR](https://cloud.google.com/container-registry) integration.

### Variables

| Env var       |    Required    | Description                                                       | Supported values                                                                                                     | Default value when missing |
|---------------|:--------------:|-------------------------------------------------------------------| -------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `clientemail` | :white_circle: | Service Account Client Email (required for private images access) | See [Service Account credentials](https://cloud.google.com/container-registry/docs/advanced-authentication#json-key) |                            |
| `privatekey`  | :white_circle: | Service Account Private Key (required for private images access)  | See [Service Account credentials](https://cloud.google.com/container-registry/docs/advanced-authentication#json-key) |                            |

### Examples

#### Configure for authenticated access
<!-- tabs:start -->
![registries-gcr-gcr.png](/images/registries-gcr-gcr.png)

<!-- tabs:end -->

### How to create a Service Account on Google Cloud Platform

#### 1. Go to the&nbsp;[Service Account page](https://console.cloud.google.com/iam-admin/serviceaccounts)

#### 2. Create a new Service Account

#### 3. Add the Container Registry Service Role

#### 4. Save the Service Account

#### 5. Create a new key for the newly created Service Account

#### 6. Download the keyfile JSON file and store it securely

#### 7. Open the JSON file, get the client_email and private_key values and configure SSM with them

## GHCR (GitHub Container Registry)

The `ghcr` registry lets you configure [GHCR](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-docker-registry) integration.

### Variables

| Env var    | Required       | Description     | Supported values                         | Default value when missing |
|------------|:--------------:| --------------- | ---------------------------------------- | -------------------------- |
| `username` | :white_circle: | GitHub username |                                          |                            |
| `token`    | :white_circle: | GitHub token    | GitHub password or GitHub Personal Token |                            |

### Examples

#### Configure to access private images (credentials needed)

<!-- tabs:start -->
![registries-ghcr-ghcr.png](/images/registries-ghcr-ghcr.png)

<!-- tabs:end -->

### How to create a GitHub Personal Token
#### Go to your GitHub settings and open the Personal Access Token tab
[Click here](https://github.com/settings/tokens)

#### Click on `Generate new token`
Choose an expiration time & appropriate scopes (`read:packages` is only needed for SSM) and generate.
![registries-ghcr-ghcr_01.png](/images/registries-ghcr-ghcr_01.png)

#### Copy the token & use it as the `token` value
![registries-ghcr-ghcr_02.png](/images/registries-ghcr-ghcr_02.png)

## GITEA

The `gitea` registry lets you configure a self-hosted [Gitea](https://gitea.com) integration.

### Variables

| Env var    |    Required    | Description                                                     | Supported values                    | Default value when missing |
|------------|:--------------:|-----------------------------------------------------------------|-------------------------------------|----------------------------|
| `url`      |  :red_circle:  | Registry URL (e.g. https://gitea.acme.com)                      |                                     |                            |
| `login`    | :red_circle:   | Gitea username                                                  | password must be defined            |                            |
| `password` |  :red_circle:  | Gitea password                                                  | login must be defined               |                            |
| `auth`     | :white_circle: | Htpasswd string (when htpasswd auth is enabled on the registry) | login/password  must not be defined |                            |
### Examples

#### Configure
<!-- tabs:start -->
![registries-gitea-gitea.png](/images/registries-gitea-gitea.png)
<!-- tabs:end -->

## GitLab (GitLab Container Registry)

The `gitlab` registry lets you configure [GitLab](https://docs.gitlab.com/ee/user/packages/container_registry/) integration.

### Variables

| Env var   |   Required   | Description                    | Supported values                         | Default value when missing  |
|-----------|:------------:|--------------------------------| ---------------------------------------- |-----------------------------|
| `url`     | :red_circle: | GitLab Registry base URL       |                                          | https://registry.gitlab.com |
| `authurl` | :red_circle: | GitLab Authentication base URL |                                          | https://gitlab.com          |
| `token`   | :red_circle: | GitLab Personal Access Token   |                                          |                             |

### Examples

#### Configure to access images from gitlab.com

<!-- tabs:start -->
![registries-gitlab-gitlab-1.png](/images/registries-gitlab-gitlab-1.png)
<!-- tabs:end -->

#### Configure to access images from self-hosted GitLab instance

<!-- tabs:start -->
![registries-gitlab-gitlab-2.png](/images/registries-gitlab-gitlab-2.png)
<!-- tabs:end -->

### How to create a GitLab Personal Access Token
#### Go to your GitLab settings and open the Personal Access Token page
[Click here](https://gitlab.com/-/profile/personal_access_tokens)

#### Enter the details of the token to be created
Choose an expiration time & appropriate scopes (`read_registry` is only needed for SSM) and generate.
![registries-gitlab-gitlab_01.png](/images/registries-gitlab-gitlab_01.png)

#### Copy the token & use it as the `token` value
![registries-gitlab-gitlab_02.png](/images/registries-gitlab-gitlab_02.png)

## HUB (Docker Hub including private repositories)

The `hub` registry lets you configure [Docker Hub](https://hub.docker.com/) integration.

Currently, the supported credentials are:
- Docker Hub auth + Docker Hub Access Token
- Docker Base64 credentials (like in [.docker/config.json](https://docs.docker.com/engine/reference/commandline/auth/))
- Docker Hub auth + Docker Hub password (not recommended)

!> By default, if you don't configure any registries, SSM will configure a default one with anonymous access. \
Don't forget to configure authentication if you're using [Docker Hub Private Repositories](https://docs.docker.com/docker-hub/repos/#private-repositories).

### Variables

| Env var    | Required       | Description                                                  | Supported values                 | Default value when missing |
|------------|:--------------:|--------------------------------------------------------------|----------------------------------| -------------------------- |
| `login`    | :white_circle: | A valid Docker Hub Login                                     | token must be defined            |                            |
| `password` | :white_circle: | A valid Docker Hub Token                                     | login must be defined            |                            |
| `token`    | :white_circle: | A valid Docker Hub Token (deprecated; replaced by `password`) | login must be defined            |                            |
| `auth`     | :white_circle: | A valid Docker Hub Base64 Auth String                        | login/token  must not be defined |                            |

### Examples

![registries-hub-hub-1.png](/images/registries-hub-hub-1.png)

#### Configure Authentication using Login/Token

##### 1. Login to your&nbsp;[Docker Hub Account](https://hub.docker.com/)
![registries-hub-hub_login.png](/images/registries-hub-hub_login.png)

##### 2. Go to your&nbsp;[Security Settings](https://hub.docker.com/settings/security)
- Create a new Access Token
- Copy it and use it as the `token` value

![registries-hub-hub_token.png](/images/registries-hub-hub_token.png)

<!-- tabs:start -->
![registries-hub-hub-2.png](/images/registries-hub-hub-2.png)
<!-- tabs:end -->

#### Configure Authentication using Base64 encoded credentials

##### 1. Create an Access Token
See above "Configure Authentication using Login/Token"

##### 2. Encode with Base64
Concatenate `$auth:$password` and [encode with Base64](https://www.base64encode.org/).

For example,
- if your auth is `johndoe`
- and your password is `2c1bd872-efb6-4f3a-81aa-724518a0a592`
- the resulting encoded string would be `am9obmRvZToyYzFiZDg3Mi1lZmI2LTRmM2EtODFhYS03MjQ1MThhMGE1OTI=`

<!-- tabs:start -->
![registries-hub-hub-3.png](/images/registries-hub-hub-3.png)
<!-- tabs:end -->

## LSCR (LinuxServer Container Registry)

The `lscr` registry lets you configure [LSCR](https://fleet.linuxserver.io/) integration.

### Variables

| Env var    |   Required    | Description     | Supported values                         | Default value when missing |
|------------|:-------------:|-----------------|------------------------------------------|----------------------------|
| `username` | :red_circle:  | GitHub username |                                          |                            |
| `token`    | :red_circle:  | GitHub token    | GitHub password or GitHub Personal Token |                            |

### Examples

<!-- tabs:start -->
![registries-lscr-lscr.png](/images/registries-lscr-lscr.png)
<!-- tabs:end -->

### How to create a GitHub Personal Token
#### Go to your GitHub settings and open the Personal Access Token tab
[Click here](https://github.com/settings/tokens)

#### Click on `Generate new token`
Choose an expiration time & appropriate scopes (`read:packages` is only needed for SSM) and generate.
![registries-lscr-lscr_01.png](/images/registries-lscr-lscr_01.png)

#### Copy the token & use it as the `token` value
![registries-lscr-lscr_02.png](/images/registries-lscr-lscr_02.png)

## Quay

The `quay` registry lets you configure [Quay](https://quay.io/) integration.

### Variables

| Env var     | Required        | Description    | Supported values | Default value when missing |
|-------------|:--------------:| -------------- | ---------------- | -------------------------- |
| `namespace` | :white_circle: | Quay namespace |                  |                            |
| `account`   | :white_circle: | Quay account   |                  |                            |
| `token`     | :white_circle: | Quay token     |                  |                            |

### Examples

#### Configure to access private images (credentials needed)

<!-- tabs:start -->
![registries-quay-quay.png](/images/registries-quay-quay.png)
<!-- tabs:end -->

### How to create a Quay.io robot account
#### Go to your Quay.io settings and open the Robot Accounts tab

#### Click on `Create Robot Account`
Choose a name & create it
![registries-quay-quay_01.png](/images/registries-quay-quay_01.png)

#### Copy the part before the `+` sign and set it as the `namespace` env var
#### Copy the part after the `+` sign and set it as the `account` env var
#### Copy the token value and set it as the `token` env var
![registries-quay-quay_02.png](/images/registries-quay-quay_02.png)

## Deleting a registry

### Deleting a custom registry
To delete a custom registry, simply click on "Delete" on the tile of your custom registry
![registries-registries-2.png](/images/registries-registries-2.png)
![registries-registries-3.png](/images/registries-registries-3.png)

### Resetting a default registry
To reset a default registry, simply click on "Reset" on the tile of your custom registry
![registries-registries-4.png](/images/registries-registries-4.png)
