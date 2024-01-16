import { request } from '@umijs/max';

export async function executePlaybook(options?: { [key: string]: any }) {
  return request<API.Exec>('/api/ansible/exec/playbook', {
    method: 'POST',
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

export async function getTasks() {
  return request<API.Tasks>(`/api/ansible/tasks`, {
    method: 'GET',
    ...{},
  });
}

export async function getPlaybooks() {
  return request<API.Playbooks>('/api/ansible/playbooks', {
    method: 'GET',
    ...{},
  });
}

export async function readPlaybookContent(playbook: string) {
  return request<API.PlaybookContent>(`/api/ansible/playbooks/${playbook}/content`, {
    method: 'GET',
    ...{},
  });
}

export async function patchPlaybook(playbook: string, content: string) {
  return request<API.PlaybookOpResponse>(`/api/ansible/playbooks/${playbook}/`, {
    method: 'PATCH',
    data: { content: content },
    ...{},
  });
}

export async function newPlaybook(playbook: string) {
  return request<API.PlaybookOpResponse>(`/api/ansible/playbooks/${playbook}/`, {
    method: 'PUT',
    ...{},
  });
}

export async function deletePlaybook(playbook: string) {
  return request<API.PlaybookOpResponse>(`/api/ansible/playbooks/${playbook}/`, {
    method: 'DELETE',
    ...{},
  });
}
