import { request } from '@umijs/max';
import { API, SsmAnsible } from 'ssm-shared-lib';

const BASE_URL = '/api/playbooks';

export async function getPlaybooks(
  options?: Record<string, any>,
): Promise<API.Response<API.PlaybookFile[]>> {
  return request<API.Response<API.PlaybookFile[]>>(`${BASE_URL}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function readPlaybookContent(playbookUuid: string) {
  return request<API.Response<string>>(`${BASE_URL}/${playbookUuid}`, {
    method: 'GET',
    ...{},
  });
}

export async function patchPlaybook(playbookUuid: string, content: string) {
  return request<API.SimpleResult>(`${BASE_URL}/${playbookUuid}/`, {
    method: 'PATCH',
    data: { content: content },
    ...{},
  });
}

export async function executePlaybook(
  playbook: string,
  target: string[] | undefined,
  extraVars?: API.ExtraVars,
  mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
  options?: Record<string, any>,
) {
  return request<API.Exec>(`${BASE_URL}/exec/${playbook}`, {
    method: 'POST',
    data: {
      playbook: playbook,
      target: target,
      extraVars: extraVars,
      mode: mode,
    },
    ...(options || {}),
  });
}

export async function executePlaybookByQuickRef(
  quickRef: string,
  target: string[] | undefined,
  extraVars?: API.ExtraVars,
  mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
  options?: Record<string, any>,
) {
  return request<API.Exec>(`${BASE_URL}/exec/quick-ref/${quickRef}`, {
    method: 'POST',
    data: {
      quickRef: quickRef,
      target: target,
      extraVars: extraVars,
      mode: mode,
    },
    ...(options || {}),
  });
}

export async function getExecLogs(execId: string) {
  return request<API.Response<API.ExecLogs>>(
    `${BASE_URL}/exec/${execId}/logs/`,
    {
      method: 'GET',
      ...{},
    },
  );
}

export async function getTaskStatuses(execId: string) {
  return request<API.Response<API.ExecStatuses>>(
    `${BASE_URL}/exec/${execId}/status/`,
    {
      method: 'GET',
      ...{},
    },
  );
}

export async function deletePlaybook(playbookUuid: string) {
  return request<API.SimpleResult>(`${BASE_URL}/${playbookUuid}/`, {
    method: 'DELETE',
    ...{},
  });
}

export async function postPlaybookExtraVar(
  playbookUuid: string,
  extraVar: API.ExtraVar,
) {
  return request<API.SimpleResult>(`${BASE_URL}/${playbookUuid}/extravars`, {
    data: { extraVar: extraVar },
    method: 'POST',
    ...{},
  });
}

export async function deletePlaybookExtraVar(
  playbookUuid: string,
  extraVar: string,
) {
  return request<API.SimpleResult>(
    `${BASE_URL}/${playbookUuid}/extravars/${extraVar}`,
    {
      method: 'DELETE',
      ...{},
    },
  );
}

export async function postExtraVarSharedValue(
  data: { extraVar: string; value: string },
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `${BASE_URL}/extravars/${data.extraVar}`,
    {
      data: { value: data.value },
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

