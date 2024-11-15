# Changelog

## [Unreleased](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/HEAD)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.22...HEAD)

**Implemented enhancements:**

- \[FEAT\] Add support for multiple Git services [\#483](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/483) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Add advanced diagnostic checks for device connections [\#482](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/482) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Merged pull requests:**

- \[CHORE\] Update versions for client, shared-lib, and server [\#484](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/484) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Increase JSON request size limit to 50mb [\#480](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/480) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Prevent duplicate cache setting for masterNodeUrl [\#479](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/479) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v0.1.22](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.22) (2024-11-14)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.21...v0.1.22)

**Implemented enhancements:**

- \[FEATURE\] Provide a confirmation before reboot. [\#458](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/458)
- \[FEAT\] Git repository supports for docker compose stacks 🔥 [\#390](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/390)
- \[FEAT\] Export Volumes 🔥 [\#332](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/332)
- \[FEAT\] Add volume backup functionality [\#460](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/460) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] enhance SSH key handling [\#442](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/442) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Try to improve responsiveness [\#474](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/474) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Fixed bugs:**

- \[BUG\] `Combined Power` wrong value [\#457](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/457)
- \[BUG\] Container detection and deployment [\#440](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/440)
- \[BUG\] Unable to execute playbook from remote get repository \(request errored with status code: 500\) [\#396](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/396)
- \[BUG\] Fix save button on Docker Compose UI builder not working [\#391](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/391)
- \[BUG/CHORE\] Add masterNodeUrl and refactor ExtraVars components [\#468](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/468) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Fix CPU and memory calculations, integrate DeviceUseCases tests [\#466](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/466) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Add enhanced agent installation tests using Molecule [\#425](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/425) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Refactor StackBuilder to DockerComposeStackBuilder [\#392](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/392) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add retry logic to user fetching process [\#475](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/475) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Fix typo in CPU speed unit [\#464](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/464) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- 441 bug container image tags [\#444](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/444) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Fix containers not being sync right after device add [\#443](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/443) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Wrap playbook variable with single quotes in command [\#421](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/421) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- \[BUG\] Cannot reboot [\#459](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/459)
- I may not have tested all the functionality, but I would like to give feedback on the interface. [\#445](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/445)
- \[BUG\] Container image tags [\#441](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/441)
- \[FEAT\] Persist API URL option after first time add of agent 🔥 [\#424](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/424)
- \[FEATURE\] Filter git playbooks [\#339](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/339)
- \[BUG\] sendDeviceInfoToApi 401 error [\#338](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/338)
- \[FEATURE\] Agent in docker [\#298](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/298)
- \[CHORE\] Use Roles for Ansible Playbook 🧹 [\#286](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/286)
- \[FEATURE\]  - Docker Compose without a NginX Reverse Proxy [\#139](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/139)

**Merged pull requests:**

- \[CHORE\] Add type exports and fix response types for connection checks [\#473](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/473) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Add Docker Volume Action and Proxy-Free Install Guide [\#469](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/469) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Add confirmation prompt for critical quick actions [\#463](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/463) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump @typescript-eslint/eslint-plugin from 8.13.0 to 8.14.0 in /server [\#462](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/462) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @typescript-eslint/parser from 8.12.2 to 8.14.0 in /server [\#461](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/461) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump rc-menu from 9.15.1 to 9.16.0 in /client [\#455](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/455) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @ant-design/charts from 2.2.1 to 2.2.3 in /client [\#454](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/454) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @umijs/max from 4.3.29 to 4.3.31 in /client [\#453](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/453) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @eslint/js from 9.13.0 to 9.14.0 in /client [\#452](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/452) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-jest from 28.8.3 to 28.9.0 in /client [\#451](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/451) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump globals from 15.11.0 to 15.12.0 in /server [\#450](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/450) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @typescript-eslint/eslint-plugin from 8.12.2 to 8.13.0 in /server [\#449](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/449) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @aws-sdk/client-ecr from 3.682.0 to 3.687.0 in /server [\#448](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/448) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mongoose from 8.8.0 to 8.8.1 in /server [\#447](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/447) ([dependabot[bot]](https://github.com/apps/dependabot))
- 390 feat git repository supports for docker compose stacks [\#439](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/439) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump @umijs/max from 4.3.28 to 4.3.29 in /client [\#438](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/438) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-react-hooks from 4.6.2 to 5.0.0 in /client [\#437](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/437) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[CHORE\] Add Dockerless installation guide and update dependencies [\#429](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/429) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update dependencies to latest versions [\#428](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/428) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Add images and enhance Docker Compose editor documentation [\#427](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/427) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Add Proxmox install guide and update related docs [\#426](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/426) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update file paths and remove redundant dev dependencies [\#423](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/423) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump elliptic from 6.5.7 to 6.6.0 in /client in the npm\_and\_yarn group [\#420](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/420) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[CHORE\] Upgrade dependencies in package-lock.json [\#418](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/418) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump node from 22.9.0-alpine to 23.1.0-alpine in /server [\#417](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/417) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node from 22.9.0-alpine to 23.1.0-alpine in /client [\#413](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/413) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[TEST\] Add integration tests and mock strategy for Passport [\#395](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/395) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Add GitHub Actions workflow and update curl commands [\#393](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/393) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update release.json [\#388](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/388) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add UUIDs to ContainerVolume entries missing them [\#477](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/477) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add timeout configuration for Docker API [\#476](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/476) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Enable privilege escalation for device reboot task [\#472](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/472) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update dependencies in package-lock.json files [\#471](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/471) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Enhance logging and error messages with device context [\#470](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/470) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add unit tests for SshPrivateKeyFileManager [\#467](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/467) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Remove unused imports and enable Ansible task profiling [\#465](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/465) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add health checks to server in Docker Compose files [\#419](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/419) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update dependencies and add module mapping [\#387](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/387) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v0.1.21](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.21) (2024-10-15)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.20...v0.1.21)

**Fixed bugs:**

- \[BUG\] some playbooks Fail to execute "Attempting to decrypt but no vault secrets found" [\#365](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/365)
- \[BUGFIX\] Append --vault-id to ansible runner command [\#383](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/383) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Merged pull requests:**

- \[TEST\] Refactor package upgrade logic and add Molecule tests [\#384](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/384) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Add overview icon, update styles, expand user guide [\#380](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/380) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump @umijs/lint from 4.3.25 to 4.3.26 in /client [\#377](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/377) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[DOC\] Rename and update deploy docs, add env variables. [\#376](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/376) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump @babel/preset-env from 7.25.7 to 7.25.8 in /client [\#374](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/374) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @umijs/max from 4.3.24 to 4.3.25 in /client [\#373](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/373) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump framer-motion from 11.11.1 to 11.11.8 in /client [\#372](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/372) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @types/react-dom from 18.3.0 to 18.3.1 in /client [\#371](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/371) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @typescript-eslint/eslint-plugin from 8.8.0 to 8.8.1 in /server [\#370](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/370) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump globals from 15.10.0 to 15.11.0 in /server [\#369](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/369) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mongoose from 8.7.0 to 8.7.1 in /server [\#368](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/368) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mongodb-memory-server from 10.0.1 to 10.1.2 in /server [\#367](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/367) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @typescript-eslint/parser from 8.8.0 to 8.8.1 in /server [\#366](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/366) ([dependabot[bot]](https://github.com/apps/dependabot))
- Add Dockerized Agent option and update installation methods [\#364](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/364) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Add custom stacks data and routes, update server version [\#363](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/363) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\]\[DOC\] Refine upgrade trigger and enhance installation script [\#382](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/382) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add no devices modal and update installation guides [\#379](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/379) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update dependencies and add missing licenses [\#378](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/378) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v0.1.20](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.20) (2024-10-11)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.19...v0.1.20)

**Implemented enhancements:**

- \[FEAT\] Networks, Volumes and Images could be pre-filled in deploy when a target is selected 🔥 [\#334](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/334)
- \[FEATURE\] Update notification & tags for client/server/agent 🔥 [\#211](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/211)
- \[FEAT\] Custom stack mgr 🔥 [\#180](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/180)
- \[FEAT\] Playbooks with roles for NVM, Node js install 🔥  [\#117](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/117)
- \[FEAT\] Update query handling and improve form components [\#357](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/357) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Feat installation method [\#351](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/351) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- 117 feat playbooks with roles for nvm node js install [\#331](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/331) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Add container ports handling and display link in UI [\#328](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/328) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Feat update available widget [\#356](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/356) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Feat container details [\#350](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/350) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Fixed bugs:**

- \[BUG\] Unable to create sub-directory or playbook after creating new directory in Playbook tab [\#336](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/336)
- \[CHORE\] Popover in Services/Containers info details is buggy 🧹 [\#333](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/333)
- \[BUG\] Only 10 hosts available for automation [\#319](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/319)
- \[BUG\] Adding all LXCs and VMs very high CPU load [\#165](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/165)
- \[BUG\] Add getAllDevices API endpoint and update client calls [\#323](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/323) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Filter out undefined names in context arrays [\#358](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/358) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\]\[BUG\]Refactor directory view, enhance Docker install [\#354](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/354) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Fix update problem of NewFileDrawerForm, bump libs [\#337](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/337) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Update log path for container management [\#326](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/326) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] \*\*Refactor quick action components to include icons\*\* [\#325](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/325) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- \[BUG\]  Encounter "Response status: 500 - ExtraVar value not found !" while trying to add a new server.  [\#296](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/296)
- \[FEAT\] See open ports of containers, update UI to go to that ip/port 🔥 [\#327](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/327)

**Merged pull requests:**

- Add test sequence and debug step in Molecule configurations [\#361](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/361) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Rename job and refine Molecule test execution directory [\#360](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/360) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[TESTS\] Add Molecule tests and CI workflow integration [\#359](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/359) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump the npm\_and\_yarn group in /server with 5 updates [\#353](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/353) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump the npm\_and\_yarn group across 1 directory with 2 updates [\#352](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/352) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @stylistic/eslint-plugin from 2.8.0 to 2.9.0 in /server [\#349](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/349) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @aws-sdk/client-ecr from 3.662.0 to 3.665.0 in /server [\#348](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/348) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @eslint/compat from 1.1.1 to 1.2.0 in /server [\#347](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/347) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint from 9.11.1 to 9.12.0 in /server [\#345](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/345) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump framer-motion from 11.10.0 to 11.11.1 in /client [\#344](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/344) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @eslint/js from 9.11.1 to 9.12.0 in /client [\#343](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/343) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-react from 7.37.0 to 7.37.1 in /client [\#340](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/340) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[DOC\] Add Apps section and Vuetify support [\#329](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/329) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump rollup from 4.21.3 to 4.22.5 in /server in the npm\_and\_yarn group [\#324](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/324) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @types/react from 18.3.9 to 18.3.10 in /client [\#322](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/322) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-import-x from 4.3.0 to 4.3.1 in /server [\#320](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/320) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[FEAT\] Add ability to use automatic SSH authentication [\#318](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/318) ([btajuddin](https://github.com/btajuddin))
- Bump rollup from 4.21.0 to 4.22.5 in /site in the npm\_and\_yarn group across 1 directory [\#315](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/315) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump vite from 5.4.5 to 5.4.8 in /server in the npm\_and\_yarn group across 1 directory [\#313](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/313) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mongoose from 8.6.3 to 8.6.4 in /server [\#312](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/312) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump vite from 5.4.2 to 5.4.8 in /site in the npm\_and\_yarn group across 1 directory [\#311](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/311) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @ant-design/icons from 5.4.0 to 5.5.1 in /client [\#309](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/309) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @types/react from 18.3.5 to 18.3.8 in /client [\#307](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/307) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump antd from 5.20.6 to 5.21.0 in /client [\#306](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/306) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump framer-motion from 11.5.4 to 11.5.6 in /client [\#305](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/305) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node from 22.8.0-alpine to 22.9.0-alpine in /client [\#304](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/304) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mongoose from 8.6.2 to 8.6.3 in /server [\#302](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/302) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mongodb-memory-server from 10.0.0 to 10.0.1 in /server [\#301](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/301) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node from 22.8.0-alpine to 22.9.0-alpine in /server [\#299](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/299) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump vite from 5.4.5 to 5.4.6 in /server in the npm\_and\_yarn group [\#295](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/295) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[CHORE\] Chore update express 5 [\#335](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/335) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Rename SSHType.Automatic to SSHType.PasswordLess [\#330](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/330) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update npm dependencies and package-lock versions [\#316](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/316) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- 180 feat custom stack mgr [\#310](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/310) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v0.1.19](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.19) (2024-09-19)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.18...v0.1.19)

**Fixed bugs:**

- \[BUG\] Refactor Ansible keys usage in cache settings [\#297](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/297) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Merged pull requests:**

- Bump @types/jest from 29.5.12 to 29.5.13 in /client [\#292](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/292) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-react from 7.36.0 to 7.36.1 in /client [\#291](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/291) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @vitest/coverage-v8 from 2.0.5 to 2.1.1 in /server [\#290](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/290) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @aws-sdk/client-ecr from 3.650.0 to 3.651.1 in /server [\#289](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/289) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v0.1.18](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.18) (2024-09-13)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.18-beta.1...v0.1.18)

**Implemented enhancements:**

- \[FEAT\] Add dry run for Ansible playbook [\#268](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/268)
- \[CHORE\] Refacto ExtraVars 🧹 [\#263](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/263)
- \[FEATURE\] Compatibility for docker environments with a TLS Configuration [\#218](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/218)
- \[FEAT\] Enhanced services: Create Network, Volumes & deploy single image 🔥 [\#179](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/179)
- \[FEAT\] Create docker network & volume [\#287](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/287) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Add Ansible SmartFailure detection and handling [\#251](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/251) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Feat ansible configuration mgt [\#236](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/236) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Fixed bugs:**

- \[BUG\] Buggy Automation editor when setting template 🐛 [\#222](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/222)
- \[BUG\] Uninstalling the agent still left files behind [\#46](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/46)
- \[BUG\] Add support for agent log path management in Ansible tasks [\#266](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/266) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\]\[CHORE\] Add default values for SSH connection and host checking [\#265](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/265) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- \[CHORE\] Add testing for ansible playbooks with molecule [\#267](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/267)

**Merged pull requests:**

- \[CHORE\] Enhance PlaybookSelectionModal with Dropdown button [\#284](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/284) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Add new Swiper and Diagram components, update docs and assets [\#274](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/274) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update eslint and related dependencies [\#272](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/272) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Remove deprecated mock files and scripts [\#271](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/271) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add Molecule tests for install-agent [\#269](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/269) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update Mongoose and improve database operations [\#262](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/262) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add meta description tags and update roadmap link [\#249](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/249) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Remove unused dependencies and update TypeScript related packages [\#247](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/247) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Chore add common playbooks [\#246](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/246) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update OS logos and enhance pagination [\#241](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/241) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Refactor Docker configuration forms and centralize SSH elements [\#240](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/240) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add ANSIBLE\_CONFIG to AnsibleCmd test cases [\#237](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/237) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update dependencies and Docker base images [\#221](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/221) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v0.1.18-beta.1](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.18-beta.1) (2024-09-13)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/demo-v1...v0.1.18-beta.1)

**Implemented enhancements:**

- \[FEAT\] add dry run for ansible playbook [\#270](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/270) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Introducing variable types for playbook [\#264](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/264) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Fixed bugs:**

- \[BUG\] Set initial cronValue from formRef [\#223](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/223) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- \[FEATURE\] Manage a remote device [\#214](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/214)
- \[BUG\] Unable to create or setup an admin account [\#138](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/138)

**Merged pull requests:**

- Bump the npm\_and\_yarn group across 1 directory with 5 updates [\#288](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/288) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump framer-motion from 11.5.3 to 11.5.4 in /client [\#283](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/283) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @ant-design/plots from 2.3.1 to 2.3.2 in /client [\#280](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/280) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node from 22.7.0-alpine to 22.8.0-alpine in /server [\#279](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/279) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint from 9.9.1 to 9.10.0 in /server [\#278](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/278) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node from 22.7.0-alpine to 22.8.0-alpine in /client [\#276](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/276) ([dependabot[bot]](https://github.com/apps/dependabot))
- Move WIP warning and video iframe in index.md [\#275](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/275) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update playbooks.json and add Ansible smart failure endpoint [\#273](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/273) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump @stylistic/eslint-plugin from 2.6.4 to 2.7.2 in /server [\#261](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/261) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump axios from 1.7.5 to 1.7.7 in /server [\#259](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/259) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-import-x from 4.1.0 to 4.1.1 in /server [\#258](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/258) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @umijs/max from 4.3.17 to 4.3.18 in /client [\#257](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/257) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @types/react from 18.3.4 to 18.3.5 in /client [\#256](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/256) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @umijs/lint from 4.3.17 to 4.3.18 in /client [\#254](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/254) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump framer-motion from 11.3.30 to 11.3.31 in /client [\#253](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/253) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[CHORE\] Rename 'Services' to 'Containers' [\#252](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/252) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Update troubleshooting guide and demo link [\#250](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/250) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump webpack from 5.90.3 to 5.94.0 in /client in the npm\_and\_yarn group [\#248](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/248) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[CHORE\] Refactor device list fetching logic in Devices page [\#242](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/242) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Doc update doc [\#239](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/239) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add endpoint for fetching Ansible configuration [\#238](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/238) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump micromatch from 4.0.7 to 4.0.8 in /client in the npm\_and\_yarn group [\#235](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/235) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump framer-motion from 11.3.29 to 11.3.30 in /client [\#234](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/234) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @eslint/js from 9.9.0 to 9.9.1 in /client [\#233](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/233) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @umijs/max from 4.3.15 to 4.3.16 in /client [\#231](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/231) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @eslint/js from 9.9.0 to 9.9.1 in /server [\#229](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/229) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump axios from 1.7.4 to 1.7.5 in /server [\#228](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/228) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint from 9.9.0 to 9.9.1 in /server [\#227](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/227) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mongoose from 8.5.3 to 8.5.4 in /server [\#226](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/226) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[DOC\] Update README features following contributions to main page fixes [\#220](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/220) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Add useful links document and update site config [\#219](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/219) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update documentation and fix typos [\#217](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/217) ([rtuszik](https://github.com/rtuszik))
- Create docker-publish-demo-2.yml [\#216](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/216) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [demo-v1](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/demo-v1) (2024-08-22)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.17...demo-v1)

**Merged pull requests:**

- Feat demo [\#215](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/215) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Chore update site doc [\#213](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/213) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update README and index for Collections feature availability [\#212](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/212) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v0.1.17](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.17) (2024-08-21)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.17-alpha.7...v0.1.17)

**Implemented enhancements:**

- \[FEAT\] Advanced features for container management, 'à la ' very know container management soft 🔥 [\#178](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/178)
- \[FEAT\] Add the ability to show container logs, in real time 🔥  [\#93](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/93)
- \[FEAT\] SSH Connection terminal from SSM 🔥  [\#91](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/91)
- \[FEAT\] Add real-time updates for containers and notifications [\#208](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/208) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Feat socket real time logs / SSH Connect [\#181](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/181) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Enhanced features for services [\#177](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/177) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Fixed bugs:**

- \[BUG\] keepalived IP used instead of the normal one [\#163](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/163)
- \[BUG\] Settings a template in automation will trigger an infinite loop 🐛  [\#184](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/184)
- \[BUG\] No Playbook starts on a certain host [\#164](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/164)
- \[BUG\] Update Carousel lazyLoad and behavior settings [\#201](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/201) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Fix cron value synchronization in AutomationTriggerInnerCard [\#200](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/200) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Remove outdated comment and ensure server initialization [\#199](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/199) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- Fix code scanning alert - Database query built from user-controlled sources [\#203](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/203)
- \[CHORE\] Provide a pre-build container for NGINX 🧹 [\#102](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/102)
- \[FEAT\] Better update of Services data on container 🔥  [\#92](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/92)

**Merged pull requests:**

- \[CHORE\] Refactor updateStatus query to use strict equality. [\#204](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/204) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump rc-menu from 9.14.1 to 9.15.1 in /client [\#194](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/194) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lint-staged from 15.2.8 to 15.2.9 in /client [\#193](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/193) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump antd from 5.20.0 to 5.20.1 in /client [\#192](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/192) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @umijs/max from 4.3.11 to 4.3.14 in /client [\#191](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/191) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @typescript-eslint/eslint-plugin from 8.0.1 to 8.1.0 in /server [\#190](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/190) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @stylistic/eslint-plugin from 2.6.1 to 2.6.4 in /server [\#189](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/189) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mongoose from 8.5.2 to 8.5.3 in /server [\#188](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/188) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @aws-sdk/client-ecr from 3.624.0 to 3.632.0 in /server [\#187](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/187) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @eslint/js from 9.8.0 to 9.9.0 in /server [\#186](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/186) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump elliptic from 6.5.5 to 6.5.7 in /client in the npm\_and\_yarn group [\#185](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/185) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump axios from 1.7.3 to 1.7.4 in /server in the npm\_and\_yarn group [\#182](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/182) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @aws-sdk/client-ecr from 3.623.0 to 3.624.0 in /server [\#175](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/175) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump express-validator from 7.1.0 to 7.2.0 in /server [\#174](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/174) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node from 22.5.1-alpine to 22.6.0-alpine in /server [\#172](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/172) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @umijs/lint from 4.3.11 to 4.3.12 in /client [\#170](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/170) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-jest from 28.7.0 to 28.8.0 in /client [\#167](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/167) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node from 22.5.1-alpine to 22.6.0-alpine in /client [\#166](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/166) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[BUG\] Add SSH connection method configuration [\#209](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/209) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Standardize event names using SsmEvents enum [\#207](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/207) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Refactor layout and improve responsiveness [\#206](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/206) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Chore small improvements [\#205](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/205) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Refactor components and update UI interactions [\#202](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/202) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Chore optimization [\#198](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/198) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Refacto and clean [\#197](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/197) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Refactor imports and remove unused code [\#196](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/196) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update Node.js version in client Dockerfile [\#154](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/154) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update package versions to 0.1.17 [\#149](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/149) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Refactor container deletion and enable code splitting [\#148](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/148) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update container status handling for unreachable state [\#147](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/147) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update package dependencies [\#145](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/145) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v0.1.17-alpha.7](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.17-alpha.7) (2024-08-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.17-alpha.6...v0.1.17-alpha.7)

## [v0.1.17-alpha.6](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.17-alpha.6) (2024-08-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.17-alpha.5...v0.1.17-alpha.6)

## [v0.1.17-alpha.5](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.17-alpha.5) (2024-08-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.17-alpha.4...v0.1.17-alpha.5)

## [v0.1.17-alpha.4](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.17-alpha.4) (2024-08-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.17-alpha.3...v0.1.17-alpha.4)

**Merged pull requests:**

- Bump @aws-sdk/client-ecr from 3.622.0 to 3.623.0 in /server [\#161](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/161) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump luxon from 3.4.4 to 3.5.0 in /server [\#160](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/160) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lint-staged from 15.2.7 to 15.2.8 in /client [\#158](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/158) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-jest from 28.6.0 to 28.7.0 in /client [\#157](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/157) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump antd from 5.19.4 to 5.20.0 in /client [\#156](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/156) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v0.1.17-alpha.3](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.17-alpha.3) (2024-08-05)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.17-alpha.2...v0.1.17-alpha.3)

## [v0.1.17-alpha.2](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.17-alpha.2) (2024-08-05)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.17-alpha1...v0.1.17-alpha.2)

## [v0.1.17-alpha1](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.17-alpha1) (2024-08-04)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.16...v0.1.17-alpha1)

## [v0.1.16](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.16) (2024-08-02)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.15...v0.1.16)

**Implemented enhancements:**

- \[FEAT\] Ability to directly see automations logs [\#97](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/97)
- \[BUG\] Agent overrides IP to LAN [\#94](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/94)
- \[FEAT\] Refacto of logger for better filtering [\#88](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/88)
- \[FEAT\] Show connection or processing errors 🔥 [\#73](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/73)
- \[FEAT\] Use TreeSelect AntD component for Create button / drawer in Playbooks [\#72](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/72)
- \[FEAT\] 73 feat show connection or processing errors [\#129](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/129) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Add ability to show containers for specific device [\#109](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/109) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Update NewFileDrawerForm and TreeComponent [\#106](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/106) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Implement improved error handling and query processing [\#98](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/98) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Fixed bugs:**

- \[BUG\] Fix links on Device page [\#71](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/71)
- \[BUG\] Fix offset calculation for Ansible Galaxy service [\#116](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/116) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FIX\] Refactor extra variable handling and command reference [\#112](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/112) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- No need for custom nginx image [\#150](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/150)
- Cannot run any playbook due to a `ValueError("Invalid padding bytes.")` [\#110](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/110)
- \[Question\] Is RAM percentage displayed on dashboard based on available or free RAM [\#100](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/100)

**Merged pull requests:**

- \[CHORE\] Reorder Dockerfile COPY commands for consistency [\#151](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/151) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Switch proxy service to use prebuilt Docker image [\#146](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/146) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump the npm\_and\_yarn group in /server with 3 updates [\#144](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/144) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump pino-pretty from 11.2.1 to 11.2.2 in /server [\#143](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/143) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump pino from 9.3.1 to 9.3.2 in /server [\#142](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/142) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @types/dockerode from 3.3.30 to 3.3.31 in /server [\#141](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/141) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump antd from 5.19.1 to 5.19.3 in /client [\#137](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/137) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump dayjs from 1.11.11 to 1.11.12 in /client [\#136](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/136) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-react from 7.34.3 to 7.35.0 in /client [\#135](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/135) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump monaco-languageserver-types from 0.3.4 to 0.4.0 in /client [\#134](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/134) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump monaco-yaml from 5.2.1 to 5.2.2 in /client [\#133](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/133) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump eslint-plugin-prettier from 5.1.3 to 5.2.1 in /server [\#132](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/132) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node from 22.4.1-alpine to 22.5.1-alpine in /server [\#131](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/131) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node from 22.4.1-alpine to 22.5.1-alpine in /client [\#130](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/130) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump the npm\_and\_yarn group in /client with 6 updates [\#127](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/127) ([dependabot[bot]](https://github.com/apps/dependabot))
- \[CHORE\] Publish proxy image to ghcr [\#125](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/125) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Update site [\#121](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/121) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Validate domain [\#105](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/105) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Replace npm install with npm ci in Dockerfiles [\#128](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/128) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Internal ansible vault package [\#126](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/126) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[TEST\] Refactor project structure and update package dependencies [\#124](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/124) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Add become user field to ConnectionVars [\#123](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/123) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Automations documentation, refresh website [\#122](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/122) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Sec no funny business [\#115](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/115) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update SCHEME\_VERSION in DefaultValue enum [\#114](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/114) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update multiple package versions [\#113](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/113) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Ensure size coherence across UI by using AntD custom icon component [\#108](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/108) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update loading state in MainChartCard [\#107](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/107) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Standardize and enhance agent installation, reinstallation, and update playbooks [\#103](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/103) ([rtuszik](https://github.com/rtuszik))
- \[CHORE\] Update various package versions [\#99](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/99) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Refacto logger [\#96](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/96) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v0.1.15](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.15) (2024-07-11)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.15-alpha3...v0.1.15)

**Implemented enhancements:**

- \[FEAT\] Create default LocalPlaybooksRepository for user [\#75](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/75)
- \[FEAT\] Automations - MVP [\#54](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/54)
- \[FEAT\] Automations mvp [\#86](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/86) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Fixed bugs:**

- SSH Connection error if not on port 22 [\#65](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/65)
- Add feature to delete and resync playbooks [\#85](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/85) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update ansible URL and refine UI messages [\#84](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/84) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Refactor SSH private key file creation [\#83](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/83) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Update Carousel lazyLoad setting to progressive [\#81](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/81) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FIX\] Fix incorrect argument order in editPlaybook function [\#79](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/79) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Fix protected directory [\#77](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/77) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- BUGFIX - Fix deletion following refacto [\#76](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/76) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[BUG\] Extract ContainerAvatar to a separate component [\#68](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/68) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update InventoryTransformer to include SSH port [\#66](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/66) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- \[FEAT\] Docker Actions [\#57](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/57)

**Merged pull requests:**

- \[CHORE\] refactoring classes [\#70](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/70) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Add tests and error handling for ExtraVarsTransformer [\#69](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/69) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v0.1.15-alpha3](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.15-alpha3) (2024-07-05)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.15-alpha2...v0.1.15-alpha3)

## [v0.1.15-alpha2](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.15-alpha2) (2024-07-05)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.15-alpha-1...v0.1.15-alpha2)

**Closed issues:**

- \[BUG\] Cannot create a playbook on a local repository [\#82](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/82)

## [v0.1.15-alpha-1](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.15-alpha-1) (2024-07-03)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v.0.1.14...v0.1.15-alpha-1)

**Implemented enhancements:**

- \[CHORE\] Small optimisations & fixes [\#61](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/61)
- \[FEAT\] Add default local repository for playbooks on user creation [\#78](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/78) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\]  Actions on containers [\#64](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/64) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- \[BUG\] e.slice is not a function on services page, no default playbooks present? [\#67](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/67)
- \[BUG\] Imported Encrypted SSH Key, now api is crashing [\#42](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/42)

**Merged pull requests:**

- \[DOC\] Doc update doc [\#80](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/80) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Add loading states and optimize data fetching [\#62](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/62) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

## [v.0.1.14](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v.0.1.14) (2024-07-01)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v.0.1.13...v.0.1.14)

**Implemented enhancements:**

- \[FEAT\] Playbooks - Support directories & Git sync [\#48](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/48)

**Closed issues:**

- \[BUG\] Extra character on the documentation [\#34](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/34)
- Device Configuration shows SSH Private Key [\#22](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/22)
- Status keeps saying registering [\#10](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/10)

**Merged pull requests:**

- Chore fixes [\#59](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/59) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update version numbers and remove unused imports [\#58](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/58) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Feat playbooks git sync [\#50](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/50) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Bump @types/uuid from 9.0.8 to 10.0.0 in /server [\#45](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/45) ([dependabot[bot]](https://github.com/apps/dependabot))
- removed extra Char from Docker-compose file [\#43](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/43) ([Maxklos](https://github.com/Maxklos))
- Update doc + small fixes [\#33](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/33) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Add tests and enhancements for helper functions [\#32](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/32) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update package dependencies [\#31](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/31) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Feature ansible galaxy [\#30](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/30) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Refactor import statements for SsmAnsible and SettingsKeys [\#29](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/29) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Add sorting, filtering, and pagination functionality to devices list,… [\#27](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/27) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Chores bump eslint and clean [\#26](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/26) ([SquirrelCorporation](https://github.com/SquirrelCorporation))
- Update dependencies across server, client and system projects [\#25](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/25) ([SquirrelCorporation](https://github.com/SquirrelCorporation))

## [v.0.1.13](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v.0.1.13) (2024-06-10)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.12...v.0.1.13)

**Closed issues:**

- Invalid Type for Configuration Option Plugin\_Type: Connection Plugin: Paramiko\_Ssh Setting: Password [\#19](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/19)

**Merged pull requests:**

- Add device connection check and enhanced credential handling [\#24](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/24) ([SquirrelCorporation](https://github.com/SquirrelCorporation))
- Add tests for DockerAPIHelper and update existing test files [\#23](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/23) ([SquirrelCorporation](https://github.com/SquirrelCorporation))

## [v0.1.12](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.12) (2024-06-08)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.11...v0.1.12)

**Closed issues:**

- Server in docker keeps restarting - can't connect to mongo [\#17](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/17)

**Merged pull requests:**

- Update server and client versions to 0.1.12 [\#21](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/21) ([SquirrelCorporation](https://github.com/SquirrelCorporation))
- Add tests and update inventory builder for SSH key auth [\#20](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/20) ([SquirrelCorporation](https://github.com/SquirrelCorporation))

## [v0.1.11](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.11) (2024-06-07)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.10...v0.1.11)

**Merged pull requests:**

- Refactor agent scripts and improve Dockerfiles [\#18](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/18) ([SquirrelCorporation](https://github.com/SquirrelCorporation))

## [v0.1.10](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.10) (2024-06-07)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.9...v0.1.10)

## [v0.1.9](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.9) (2024-06-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.8...v0.1.9)

## [v0.1.8](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.8) (2024-06-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.7...v0.1.8)

## [v0.1.7](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.7) (2024-06-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.6...v0.1.7)

## [v0.1.6](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.6) (2024-06-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.5...v0.1.6)

**Closed issues:**

- Consider hosted docker images [\#12](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/12)

**Merged pull requests:**

- Update multiple dependencies across projects [\#16](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/16) ([SquirrelCorporation](https://github.com/SquirrelCorporation))

## [v0.1.5](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.5) (2024-06-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.4...v0.1.5)

## [v0.1.4](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.4) (2024-06-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.3...v0.1.4)

**Merged pull requests:**

- Update version and Dockerfiles for all services [\#15](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/15) ([SquirrelCorporation](https://github.com/SquirrelCorporation))

## [v0.1.3](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.3) (2024-06-06)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.2...v0.1.3)

## [v0.1.2](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.2) (2024-06-05)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.1...v0.1.2)

## [v0.1.1](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.1) (2024-06-05)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.0...v0.1.1)

## [v0.1.0](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/v0.1.0) (2024-06-05)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/6373c61e7f316b90208264181309c046b97f2500...v0.1.0)

**Closed issues:**

- Cannot add device - already existing? [\#9](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/9)
- Docker Compose Build fails. [\#8](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/8)

**Merged pull requests:**

- Feature: Check connection on add device [\#14](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/14) ([SquirrelCorporation](https://github.com/SquirrelCorporation))
- \[CHORES\] Housekeeping [\#13](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/13) ([SquirrelCorporation](https://github.com/SquirrelCorporation))
- Feat services [\#6](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/6) ([SquirrelCorporation](https://github.com/SquirrelCorporation))



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
