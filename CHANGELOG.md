# Changelog

## [Unreleased](https://github.com/SquirrelCorporation/SquirrelServersManager/tree/HEAD)

[Full Changelog](https://github.com/SquirrelCorporation/SquirrelServersManager/compare/v.0.1.14...HEAD)

**Implemented enhancements:**

- \[CHORE\] Small optimisations & fixes [\#61](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/61)
- \[FEAT\]  Actions on containers [\#64](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/64) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Fixed bugs:**

- SSH Connection error if not on port 22 [\#65](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/65)
- \[BUG\] Extract ContainerAvatar to a separate component [\#68](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/68) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
- Update InventoryTransformer to include SSH port [\#66](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/66) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))

**Closed issues:**

- \[BUG\] e.slice is not a function on services page, no default playbooks present? [\#67](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/67)
- \[FEAT\] Docker Actions [\#57](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/57)
- \[BUG\] Imported Encrypted SSH Key, now api is crashing [\#42](https://github.com/SquirrelCorporation/SquirrelServersManager/issues/42)

**Merged pull requests:**

- Add tests and error handling for ExtraVarsTransformer [\#69](https://github.com/SquirrelCorporation/SquirrelServersManager/pull/69) ([SquirrelDeveloper](https://github.com/SquirrelDeveloper))
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
