import shell from 'shelljs';
import logger from "../logger";
import AnsibleTaskRepo from "../database/repository/AnsibleTaskRepo";

async function executePlaybook(playbook: string) {
    logger.info('[SHELL]-[ANSIBLE] - Starting...');
    shell.cd('/src/src/ansible/');
    const result = await new Promise<string | null>((resolve, reject)  => {
        const child = shell.exec(`sudo python3 ssm-ansible-run.py --playbook ${playbook}`, {async: true});
        child.stdout?.on('data', function(data) {
            resolve(data);
        });
        child.on('exit', function() {
            resolve(null);
        })
    });
    logger.info('[SHELL]-[ANSIBLE] - ended');
    if (result) {
        await AnsibleTaskRepo.create({ident: result, status: 'created', cmd: `playbook ${playbook}`})
        return result;
    } else {
        logger.error("[SHELL]-[ANSIBLE] - Result was not properly setted")
        throw new Error("Exec failed");
    }
}

export default {
    executePlaybook
};

