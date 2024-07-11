import { Actions as SsmContainerActions } from '../enums/container';
import {ExtraVars} from '../types/api'
export enum Triggers {
  CRON = 'cron'
}

export enum Actions {
  PLAYBOOK = 'PLAYBOOK',
  DOCKER = 'DOCKER',
}

export type TriggerChain = {
  trigger: Triggers.CRON, cronValue: string;
}

export type ActionChainDocker = {
  action: Actions.DOCKER, dockerAction: SsmContainerActions, dockerContainers: string[]
}

export type ActionChainPlaybook = {
  action: Actions.PLAYBOOK, playbook: string, actionDevices: string[], extraVarsForcedValues?: ExtraVars
}

export type ActionChain = {
  actions: (ActionChainDocker | ActionChainPlaybook)[];
}

export type AutomationChain = TriggerChain & ActionChain;

