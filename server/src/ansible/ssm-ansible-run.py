import ansible_runner
import os
import requests
import requests_unixsocket
import logging
import argparse
import sys

logger = logging.getLogger('ansible-runner')

def send_request(url, data, headers={}, urlpath=None):
    if os.path.exists(url):
        url_actual = "http+unix://{}".format(url.replace("/", "%2F"))
        if urlpath is not None:
            url_actual += urlpath
        session = requests_unixsocket.Session()
    else:
        url_actual = url
        session = requests.Session()
    logger.debug("Sending payload to {}".format(url_actual))
    return session.post(url_actual, headers=headers, json=(data))


def get_configuration(url):
    runner_url = url #runner_config.settings.get("runner_http_url", None)
    #runner_url = os.getenv("RUNNER_HTTP_URL", runner_url)
    runner_path = None
    runner_headers = None
    return dict(runner_url=runner_url,
                runner_path=runner_path,
                runner_headers=runner_headers)


def status_handler(data, runner_config):
    plugin_config = get_configuration('http://localhost:3000/api/ansible/hook/task/status')
    if plugin_config['runner_url'] is not None:
        status = send_request(plugin_config['runner_url'],
                              data=data,
                              headers=plugin_config['runner_headers'],
                              urlpath=plugin_config['runner_path'])
        logger.debug("POST Response {}".format(status))
    else:
        logger.info("HTTP Plugin Skipped")

def event_handler(data):
    plugin_config = get_configuration('http://localhost:3000/api/ansible/hook/task/event')
    if plugin_config['runner_url'] is not None:
        status = send_request(plugin_config['runner_url'],
                              data=data,
                              headers=plugin_config['runner_headers'],
                              urlpath=plugin_config['runner_path'])
        logger.debug("POST Response {}".format(status))
    else:
        logger.info("HTTP Plugin Skipped")

def parse_args():
    arg_parser = argparse.ArgumentParser(
        description="SSM Ansible Run"
    )
    group = arg_parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--playbook",  help="Playbook path")
    return arg_parser.parse_args()

def execute():
    args = parse_args()

    thread_obj, runner_obj = ansible_runner.run_async(
        private_data_dir='./',
        playbook=args.playbook,
        host_pattern='all',
        event_handler=event_handler,
        status_handler=status_handler,
        rotate_artifacts=10
       )
    sys.stdout.write(runner_obj.config.ident)
execute()
