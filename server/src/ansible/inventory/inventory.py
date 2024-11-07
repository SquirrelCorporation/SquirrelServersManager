#!/usr/bin/env python3

import json
import os
import argparse
import requests

try:
    FileNotFoundError
except NameError:
    FileNotFoundError = IOError

def main():
    args = parse_args()
    try:
        inventory = load_inventory()
        if args.list:
            print(json.dumps(inventory, indent=4, sort_keys=True, default=str))
        elif args.host:
             try:
                 print(
                     json.dumps(
                         inventory["_meta"]["hostvars"][args.host],
                         indent=4,
                         sort_keys=True,
                         default=str,
                     )
                 )
             except KeyError as e:
                 print('\033[91mHost "%s" not Found!\033[0m' % e)
                 print(e)
    except requests.exceptions.RequestException as e:
        print("error")
        print(e)
        exit(1)
    exit(0)

def parse_args():
    arg_parser = argparse.ArgumentParser(
        description="SSM Inventory Script"
    )
    group = arg_parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--list", action="store_true", help="List active servers")
    group.add_argument(
        "--host", help="List details about the specified host", default=None
    )
    return arg_parser.parse_args()


def load_inventory():
    headers = {'Accept': 'application/json', 'Authorization': "Bearer {}".format(os.getenv("SSM_API_KEY"))}
    r = requests.get('http://localhost:3000/playbooks/inventory?execUuid={}'.format(os.getenv('SSM_EXEC_UUID')), headers=headers)
    return r.json()['data']



if __name__ == "__main__":
    main()
