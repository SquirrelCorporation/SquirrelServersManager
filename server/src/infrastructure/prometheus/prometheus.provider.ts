import { Provider } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { prometheusConf } from '../../config';
import { PrometheusService } from './prometheus.service';

export const PROMETHEUS_SERVICE = 'PROMETHEUS_SERVICE';

export const PrometheusProvider: Provider = {
  provide: PROMETHEUS_SERVICE,
  useFactory: (httpService: HttpService) => {
    return new PrometheusService(httpService, {
      endpoint: prometheusConf.host,
      baseURL: prometheusConf.baseURL,
      username: prometheusConf.user,
      password: prometheusConf.password,
    });
  },
  inject: [HttpService],
};
