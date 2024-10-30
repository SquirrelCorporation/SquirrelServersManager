# Manually installing SSM (aka Build the project yourself)

### 1. Clone the main repository
```shell
git clone https://github.com/SquirrelCorporation/SquirrelServersManager
```
### 2. Navigate to the project directory:
```shell
cd ./SquirrelServersManager
```
### 3. Open with your favorite editor
```shell
vim .env
```
### 4. Replace the values of "SECRET", "SALT", and "VAULT_PWD"
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

### 5. Open a terminal and execute:
```shell
docker compose -f docker-compose.prod.yml up
```
or
```shell
docker-compose -f docker-compose.prod.yml  up
```
depending on your Docker version (see [Requirements](/docs/requirements))

Docker will create a volume directory *.data.prod* in the directory for persistent data storage

### 6. Open a browser and navigate to:

[http://localhost:8000](http://localhost:8000) or [http://127.0.0.1:8000](http://127.0.0.1:8000)


