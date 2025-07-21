import { SsmAnsible } from 'ssm-shared-lib';

export declare namespace Playbooks {
  type HostVar = {
    ip: string[];
  };

  type HostVars = Record<string, HostVar>;

  type ConnectVars = {
    ansible_connection?: string;
    ansible_user?: string;
    ansible_ssh_pass?: any;
    ansible_become?: string;
    ansible_become_method?: string;
    ansible_ssh_extra_args?: any;
  };

  type HostGroup = {
    hosts: string[];
    vars?: ConnectVars;
  };

  type Meta = {
    _meta: {
      hostvars: HostVars;
    };
  };

  type All = {
    all: {
      children: string[];
      vars?: ConnectVars;
    };
  };

  type HostGroups = Record<string, HostGroup>;

  type Hosts = Meta & All & HostGroups;

  type PlaybookConfigurationFile = {
    playableInBatch: boolean;
    extraVars?: [
      { extraVar: string; required: boolean; type: SsmAnsible.ExtraVarsType; deletable: boolean },
    ];
    uniqueQuickRef?: string;
  };
}

/*
{ "_meta": {
                "hostvars": {
                    "Rasp1": {
                        "ip": [
                            "192.168.0.61"
                        ]
                    },
                    "Rasp2": {
                        "ip": [
                            "192.168.0.254"
                        ]
                    },
                    "Rasp3": {
                        "ip": [
                            "192.168.0.137"
                        ]
                    },
                    "Server1": {
                        "ip": [
                            "192.168.0.111"
                        ]
                    }
                }
            },
            "all": {
                "children": ["raspian", "ubuntu"],
                "vars": {
                    "ansible_connection": "ssh",
                    "ansible_become": "yes",
                    "ansible_become_method": "sudo",
                    "ansible_ssh_extra_args": "'-o StrictHostKeyChecking=no'"

                },
            },
            "raspian": {
                "hosts": [
                    "192.168.0.61",
                    "192.168.0.254",
                    "192.168.0.137"
                ],
                "vars": {
                    "ansible_user":"pi",
                    "ansible_ssh_pass":"pi"
                }
            },
            "ubuntu": {
                "hosts": [
                    "192.168.0.111"
                ],
                "vars": {}
            }
        }
 */
