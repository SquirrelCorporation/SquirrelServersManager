# Quick Start

:::warning ⚠️ Please check the requirements before installing SSM
See [Requirements](/docs/requirements)
:::

## 1. Clone the main repo
```shell
git clone https://github.com/SquirrelCorporation/SquirrelServersManager
```
## 2. CD to the directory:
```shell
cd ./SquirrelServersManager
```
## 3. Open with your favorite editor
```shell
vim .env
```
## 4. Replace the value of "SECRET" and "SALT"
```
SECRET=REPLACE_ME
```
and
```
SALT=1234567890123456
```
⚠ **SALT value MUST be alphanumerical string of exactly 16 chars**

## 5. Open a terminal and execute:
```shell
docker compose up
```
or
```shell
docker-compose up
```
depending of your docker version (see [Requirements](/docs/requirements))

Docker will create a volume directory *.data.prod* in the directory for persistent data saves

## 6. Open a browser and open:

[http://localhost:8000](http://localhost:8000) or [http://127.0.0.1:8000](http://127.0.0.1:8000)
