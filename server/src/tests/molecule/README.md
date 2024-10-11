# MOLECULE TESTS

## Install

- Molecule
- Molecule Docker
- Test infra
- pytest

```shell
pip install -r requirements.txt
```

Create a Python venv

```shell
python3 -m venv ~/venv/ansible-molecule 
source ~/venv/ansible-molecule/bin/activate 
```

## Execute tests
```shell
cd ./server/src/tests
molecule test -s <scenario> 
```
