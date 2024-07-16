# Changelog

## [Unreleased](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/HEAD)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v0.1.15...HEAD)

**Implemented enhancements:**

- \[FEAT\] Ability to directly see automations logs [\#97](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/97)
- \[BUG\] Agent overrides IP to LAN [\#94](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/94)
- \[FEAT\] Refacto of logger for better filtering [\#88](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/88)
- \[FEAT\] Use TreeSelect AntD component for Create button / drawer in Playbooks [\#72](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/72)
- \[FEAT\] Add ability to show containers for specific device [\#109](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/109) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Update NewFileDrawerForm and TreeComponent [\#106](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/106) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FEAT\] Implement improved error handling and query processing [\#98](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/98) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Fixed bugs:**

- \[BUG\] Fix links on Device page [\#71](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/71)
- \[BUG\] Fix offset calculation for Ansible Galaxy service [\#116](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/116) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[FIX\] Refactor extra variable handling and command reference [\#112](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/112) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- \[Question\] Is RAM percentage displayed on dashboard based on available or free RAM [\#100](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/100)

**Merged pull requests:**

- \[DOC\] Automations documentation, refresh website [\#122](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/122) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[DOC\] Update site [\#121](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/121) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Sec no funny business [\#115](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/115) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update SCHEME\_VERSION in DefaultValue enum [\#114](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/114) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update multiple package versions [\#113](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/113) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Ensure size coherence across UI by using AntD custom icon component [\#108](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/108) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Update loading state in MainChartCard [\#107](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/107) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- \[CHORE\] Validate domain [\#105](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/105) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
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
