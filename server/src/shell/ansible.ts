import shell from 'shelljs';
import logger from "../logger";
import AnsibleTaskRepo from "../database/repository/AnsibleTaskRepo";

async function executePlaybook(playbook: string) {
    logger.info('[SHELL]-[ANSIBLE] - executePlaybook - Starting...');
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
    logger.info('[SHELL]-[ANSIBLE] - executePlaybook - ended');
    if (result) {
        await AnsibleTaskRepo.create({ident: result, status: 'created', cmd: `playbook ${playbook}`})
        return result;
    } else {
        logger.error("[SHELL]-[ANSIBLE] - executePlaybook - Result was not properly setted")
        throw new Error("Exec failed");
    }
}

async function listPlaybooks() {
    try {
        logger.info('[SHELL]-[ANSIBLE] - listPlaybook - Starting...');
        shell.cd('/src/src/ansible/');
        const listOfPlaybooks: string[] = [];
        shell.ls('*.yml').forEach(function (file) {
            listOfPlaybooks.push(file);
        });
        logger.info('[SHELL]-[ANSIBLE] - listPlaybook - ended');
        return listOfPlaybooks;
    } catch (error) {
        logger.error("[SHELL]-[ANSIBLE] - listPlaybook")
        throw new Error("Exec failed");
    }
}

async function readPlaybook(playbook: string) {
    try {
        logger.info('[SHELL]-[ANSIBLE] - readPlaybook - Starting...');
        shell.cd('/src/src/ansible/');
        return shell.cat(playbook).toString();
    } catch (error) {
        logger.error("[SHELL]-[ANSIBLE] - readPlaybook")
        throw new Error("Exec failed");
    }
}

async function editPlaybook(playbook: string, content: string) {
    try {
        logger.info('[SHELL]-[ANSIBLE] - editPlaybook - Starting...');
        shell.cd('/src/src/ansible/');
        shell.ShellString(content).to(playbook);
    } catch (error) {
        logger.error("[SHELL]-[ANSIBLE] - editPlaybook")
        throw new Error("Exec failed");
    }
}

async function newPlaybook(playbook: string) {
    try {
        logger.info('[SHELL]-[ANSIBLE] - newPlaybook - Starting...');
        shell.cd('/src/src/ansible/');
        shell.touch(playbook + ".yml");
    } catch (error) {
        logger.error("[SHELL]-[ANSIBLE] - newPlaybook")
        throw new Error("Exec failed");
    }
}

async function deletePlaybook(playbook: string) {
    try {
        logger.info('[SHELL]-[ANSIBLE] - newPlaybook - Starting...');
        shell.cd('/src/src/ansible/');
        shell.rm(playbook);
    } catch (error) {
        logger.error("[SHELL]-[ANSIBLE] - newPlaybook")
        throw new Error("Exec failed");
    }
}

export default {
    executePlaybook,
    listPlaybooks,
    readPlaybook,
    editPlaybook,
    newPlaybook,
    deletePlaybook
};

