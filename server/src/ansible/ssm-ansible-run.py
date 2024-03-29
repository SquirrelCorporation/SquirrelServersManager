import ansible_runner
import os
import requests
import requests_unixsocket
import logging
import argparse
import sys
import json

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
    plugin_config = get_configuration('http://localhost:3000/ansible/hook/task/status')
    if plugin_config['runner_url'] is not None:
        status = send_request(plugin_config['runner_url'],
                              data=data,
                              headers=plugin_config['runner_headers'],
                              urlpath=plugin_config['runner_path'])
        logger.debug("POST Response {}".format(status))
    else:
        logger.info("HTTP Plugin Skipped")

def event_handler(data):
    plugin_config = get_configuration('http://localhost:3000/ansible/hook/task/event')
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
    arg_parser.add_argument("--playbook",  help="Playbook path", required=True)
    arg_parser.add_argument("--log-level",  help="Verbosity", type=int, required=False, default=None)
    arg_parser.add_argument("--extra-vars",  help="Extra vars", required=False, default=None)
    group = arg_parser.add_mutually_exclusive_group(required=False)
    group.add_argument("--specific-host", help="Specify a host manually in json", default=None)
    group.add_argument("--host-pattern", help="Specify a host pattern in inventory", default="all")
    return arg_parser.parse_args()

def execute():
    args = parse_args()
    extra_vars = None
    if args.extra_vars is not None:
        extra_vars = json.loads(args.extra_vars)

    thread_obj, runner_obj = ansible_runner.run_async(
        private_data_dir='./',
        playbook=args.playbook,
        host_pattern=args.host_pattern,
        event_handler=event_handler,
        status_handler=status_handler,
        rotate_artifacts=10,
        inventory=args.specific_host,
        extravars=extra_vars,
        #debug=False,
        #ignore_logging=False
        verbosity=args.log_level
       )
    sys.stdout.write(runner_obj.config.ident)
execute()

# -> Working with specific_host
#sudo python3 ssm-ansible-run.py --playbook _reboot.yml --specific-host '{"all":{"children":"4697a14e-2936-4cf4-ad4f-af94428e2740"},"4697a14e-2936-4cf4-ad4f-af94428e2740":{"hosts":"192.168.0.187","vars":{"ansible_connection":"ssh","ansible_become":"yes","ansible_become_method":"sudo","ansible_user":"root","ansible_ssh_pass":"root"}}}'
#sudo python3 ssm-ansible-run.py --playbook _reboot.yml --specific-host '{"all":{"host4697a14e29364cf4ad4faf94428e2740":"device4697a14e29364cf4ad4faf94428e2740"},"device4697a14e29364cf4ad4faf94428e2740":{"hosts":"192.168.0.187","vars":{"ansible_connection":"ssh","ansible_become":"yes","ansible_become_method":"sudo","ansible_ssh_extra_args":"'\''-o StrictHostKeyChecking=no''\''","ansible_user":"root","ansible_ssh_pass":"root"}}}'
#sudo python3 ssm-ansible-run.py --playbook _reboot.yml --specific-host '{"all":{"children":"4697a14e-2936-4cf4-ad4f-af94428e2740"},"4697a14e-2936-4cf4-ad4f-af94428e2740":{"hosts":"192.168.0.187","vars":{"ansible_connection":"ssh","ansible_become":"yes","ansible_become_method":"sudo","ansible_user":"root","ansible_ssh_pass":"root"}},"4697a14e-2936-4cf4-ad4f-af94428e2740":{"hosts":"192.168.0.187","vars":{"ansible_connection":"ssh","ansible_become":"yes","ansible_become_method":"sudo","ansible_user":"root","ansible_ssh_pass":"root"}}}'
