export const getQueryStringParams = (query: string): any => {
  console.log(query);
  return query
    ? (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
          const [key, value] = param.split('=');
          (params as any)[key] = value
            ? decodeURIComponent(value.replace(/\+/g, ' '))
            : '';
          return params;
        }, {})
    : {};
};
