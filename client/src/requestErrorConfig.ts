import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';

enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  errorConfig: {
    errorThrower: (res: any) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error;
      }
    },
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      //  errorThrower 。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error({ content: errorMessage, duration: 6 });
          }
        }
      } else if (error.response) {
        // Axios
        message.error({
          content: `Response status: ${error.response.status}${error.response?.data?.message ? ' - ' + error.response.data.message : ''}`,
          duration: 6,
        });
      } else if (error.request) {
        // \`error.request\` XMLHttpRequest ，
        // node.js http.ClientRequest
        message.error({ content: 'None response! Please retry.', duration: 6 });
      } else {
        message.error({ content: 'Request error, please retry.', duration: 6 });
      }
    },
  },

  responseInterceptors: [
    (response: any) => {
      const { data } = response as unknown as ResponseStructure;

      if (data?.success === false) {
        message.error('Request failed！');
      }
      return response;
    },
  ],
};
