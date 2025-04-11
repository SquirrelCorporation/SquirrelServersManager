import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/container-images';

export async function getImages(
    params?: any,
    options?: Record<string, any>,
): Promise<API.Response<API.ContainerImage[]>> {
    return request<API.Response<API.ContainerImage[]>>(`${BASE_URL}`, {
        method: 'GET',
        params: {
            ...params,
        },
        ...(options || {}),
    });
}