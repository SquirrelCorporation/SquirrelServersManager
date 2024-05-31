import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function executePlaybook(
  playbook: string,
  target: string[] | undefined,
  extraVars?: API.ExtraVars,
  options?: Record<string, any>,
) {
  return request<API.Exec>(`/api/ansible/exec/playbook/${playbook}`, {
    method: 'POST',
    data: { playbook: playbook, target: target, extraVars: extraVars },
    ...(options || {}),
  });
}

export async function getExecLogs(execId: string) {
  return request<API.ExecLogs>(`/api/ansible/exec/${execId}/logs`, {
    method: 'GET',
    ...{},
  });
}

export async function getTaskStatuses(execId: string) {
  return request<API.ExecStatuses>(`/api/ansible/exec/${execId}/status`, {
    method: 'GET',
    ...{},
  });
}

export async function getPlaybooks(): Promise<API.Playbooks> {
  return request<API.Playbooks>('/api/ansible/playbooks', {
    method: 'GET',
    ...{},
  });
}

export async function readPlaybookContent(playbook: string) {
  return request<API.PlaybookContent>(`/api/ansible/playbooks/${playbook}`, {
    method: 'GET',
    ...{},
  });
}

export async function patchPlaybook(playbook: string, content: string) {
  return request<API.PlaybookOpResponse>(
    `/api/ansible/playbooks/${playbook}/`,
    {
      method: 'PATCH',
      data: { content: content },
      ...{},
    },
  );
}

export async function newPlaybook(playbook: string) {
  return request<API.PlaybookOpResponse>(
    `/api/ansible/playbooks/${playbook}/`,
    {
      method: 'PUT',
      ...{},
    },
  );
}

export async function deletePlaybook(playbook: string) {
  return request<API.PlaybookOpResponse>(
    `/api/ansible/playbooks/${playbook}/`,
    {
      method: 'DELETE',
      ...{},
    },
  );
}

export async function postPlaybookExtraVar(
  playbook: string,
  extraVar: API.ExtraVar,
) {
  return request<API.PlaybookOpResponse>(
    `/api/ansible/playbooks/${playbook}/extravars`,
    {
      data: { extraVar: extraVar },
      method: 'POST',
      ...{},
    },
  );
}

export async function deletePlaybookExtraVar(
  playbook: string,
  extraVar: string,
) {
  return request<API.PlaybookOpResponse>(
    `/api/ansible/playbooks/${playbook}/extravars/${extraVar}`,
    {
      method: 'DELETE',
      ...{},
    },
  );
}

export async function postExtraVarValue(extraVar: string, value: string) {
  return request<API.PlaybookOpResponse>(`/api/ansible/extravars/${extraVar}`, {
    data: { value: value },
    method: 'POST',
    ...{},
  });
}
