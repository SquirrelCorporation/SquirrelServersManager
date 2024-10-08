# Development Mode

:::warning ⚠️ Development Mode
Please be advised that development mode is for development purposes only and not for production use.

In this mode, logs can leak credentials, passwords, and other sensitive information. It is not recommended to use it in production.
If you don't understand React or TypeScript, or have security concerns, do not use this mode.
:::

### 1. Clone the main repo
```shell
git clone https://github.com/SquirrelCorporation/SquirrelServersManager
```

### 2. CD to the directory and open with your favorite editor:
```shell
vim .env.dev
```

### 3. Replace the value of "SECRET", "SALT" and "VAULT_PWD"
```
SECRET=REPLACE_ME
```
and
```
SALT=1234567890123456
```
⚠ **SALT value MUST be an alphanumeric string of exactly 16 characters**

and
```
VAULT_PWD=REPLACE_ME
```

### 4. Execute:
```shell
docker-compose --verbose -f docker-compose.dev.yml up
```
or
```shell
docker compose --verbose -f docker-compose.dev.yml up
```
### Ports
- The default port is **:8000**
- The MongoDB port will be exposed at **:27017**
### Volumes
- Docker Compose will create a volume directory *.data.dev* in the directory for persistent data storage
- It will also mount *./client/src/* and *./server/src* and run *Nodemon* to listen for any changes in those directories

