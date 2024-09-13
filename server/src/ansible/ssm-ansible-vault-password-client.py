#!/usr/bin/env python
import logging
import os
from sys import stdout

import requests

logger = logging.getLogger('ansible-runner')

def send_request():
    url_actual = "http://localhost:3000/playbooks/vault"
    headers = { 'Authorization': "Bearer {}".format(os.getenv("SSM_API_KEY"))}
    session = requests.Session()
    logger.debug("Getting {}".format(url_actual))
    return session.get(url_actual, headers=headers)


def main():
  response = send_request()
  stdout.write("{}\n".format(response.json()['data']['pwd']))


if __name__ == "__main__":
    main()
