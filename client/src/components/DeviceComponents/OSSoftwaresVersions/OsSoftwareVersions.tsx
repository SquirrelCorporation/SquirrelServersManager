import SoftwareIcon from '@/components/DeviceComponents/OSSoftwaresVersions/SoftwareIcon';
import { Avatar, Table, TableColumnsType } from 'antd';
import React from 'react';
import { Systeminformation } from 'ssm-shared-lib';

type OsSoftwareVersionsType = {
  versions: Systeminformation.VersionData;
};

const OsSoftwareVersions: React.FC<OsSoftwareVersionsType> = ({ versions }) => {
  interface DataType {
    key: React.Key;
    name: string;
    version: string | undefined;
  }
  const data: DataType[] = [];

  const keys = Object.keys(versions);

  keys.forEach((key) => {
    if (versions[key as keyof typeof versions]) {
      data.push({
        key: key,
        name: key,
        version: versions[key as keyof typeof versions],
      });
    }
  });
  const columns: TableColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
      render: (value) => {
        return (
          <>
            <Avatar
              style={{ backgroundColor: 'black' }}
              shape="square"
              src={<SoftwareIcon name={value} />}
            />{' '}
            {value}
          </>
        );
      },
    },
    {
      title: 'Version',
      dataIndex: 'version',
      width: 150,
    },
  ];
  return (
    <Table
      size={'small'}
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 50 }}
      scroll={{ y: 500 }}
    />
  );
};

export default OsSoftwareVersions;
