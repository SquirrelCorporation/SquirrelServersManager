import { Line } from '@ant-design/plots';
import { useEffect, useState } from 'react';

const DemoLine = () => {
  const [data, setData] = useState([]);
  const asyncFetch = () => {
    fetch('https://gw.alipayobjects.com/os/bmw-prod/55424a73-7cb8-4f79-b60d-3ab627ac5698.json')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  useEffect(() => {
    asyncFetch();
  }, []);

  const config = {
    data,
    xField: 'year',
    yField: 'value',
    colorField: 'category',
    theme: 'dark',
    height: 300,
    yAxis: {
      label: {
        // 数值格式化为千分位
        formatter: (v: any) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
      },
    },
    color: ['#d62728', '#2ca02c', '#000000'],
  };

  return <Line {...config} />;
};

export default DemoLine;
