#!/usr/bin/env python
import argparse
import logging
import os
from sys import stdout

import requests

logger = logging.getLogger('ansible-runner')

def send_request(vault_id):
    url_actual = "http://localhost:3000/ansible/vaults/{}/password".format(vault_id)
    headers = { 'Authorization': "Bearer {}".format(os.getenv("SSM_API_KEY"))}
    session = requests.Session()
    logger.debug("Getting {}".format(url_actual))
    return session.get(url_actual, headers=headers)

 
def parse_args():
  arg_parser = argparse.ArgumentParser(
    description="SSM Ansible Vault Password Client"
  )
  arg_parser.add_argument("--vault-id",  help="Vault id", required=True)
  return arg_parser.parse_args()

def main():
  args = parse_args()
  vault_id = args.vault_id
  response = send_request(vault_id)
  stdout.write("{}\n".format(response.json()['data']['pwd']))


if __name__ == "__main__":
    main()
