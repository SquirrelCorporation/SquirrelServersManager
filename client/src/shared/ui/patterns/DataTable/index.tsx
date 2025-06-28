import React, { useState, useMemo } from 'react';
import { Table, TableProps, Input, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Card } from '@shared/ui/primitives';

export interface DataTableColumn<T> {
  key: string;
  title: string;
  dataIndex?: string | string[];
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sorter?: boolean | ((a: T, b: T) => number);
  filter?: boolean;
  searchable?: boolean;
}

export interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: DataTableColumn<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  title?: string;
  compact?: boolean;
}

export function DataTable<T extends { key?: React.Key; id?: React.Key }>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  actions,
  onRefresh,
  refreshing = false,
  title,
  compact = false,
  ...tableProps
}: DataTableProps<T>) {
  const [searchText, setSearchText] = useState('');
  
  // Convert our column format to Ant Design format
  const antColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      key: col.key,
      title: col.title,
      dataIndex: col.dataIndex || col.key,
      render: col.render,
      width: col.width,
      align: col.align,
      sorter: col.sorter === true ? (a: any, b: any) => {
        const aVal = col.dataIndex ? a[col.dataIndex as string] : a[col.key];
        const bVal = col.dataIndex ? b[col.dataIndex as string] : b[col.key];
        if (typeof aVal === 'string') return aVal.localeCompare(bVal);
        return aVal - bVal;
      } : col.sorter,
      // Add search functionality if column is searchable
      ...(col.searchable && searchable ? {
        filteredValue: searchText ? [searchText] : null,
        onFilter: (value: any, record: T) => {
          const recordValue = col.dataIndex 
            ? (record as any)[col.dataIndex as string] 
            : (record as any)[col.key];
          return String(recordValue)
            .toLowerCase()
            .includes(String(value).toLowerCase());
        }
      } : {})
    }));
  }, [columns, searchText, searchable]);
  
  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchText || !searchable) return data;
    
    return data.filter(item => {
      return columns.some(col => {
        if (!col.searchable) return false;
        const value = col.dataIndex 
          ? (item as any)[col.dataIndex as string] 
          : (item as any)[col.key];
        return String(value).toLowerCase().includes(searchText.toLowerCase());
      });
    });
  }, [data, searchText, columns, searchable]);
  
  const headerContent = (
    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <Space>
        {title && <h3 style={{ margin: 0 }}>{title}</h3>}
      </Space>
      <Space>
        {searchable && (
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
        )}
        {onRefresh && (
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        )}
        {actions}
      </Space>
    </Space>
  );
  
  const tableContent = (
    <Table<T>
      columns={antColumns as any}
      dataSource={filteredData}
      size={compact ? 'small' : 'middle'}
      rowKey={record => (record as any).key || (record as any).id || Math.random()}
      {...tableProps}
    />
  );
  
  if (title || searchable || onRefresh || actions) {
    return (
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {headerContent}
          {tableContent}
        </Space>
      </Card>
    );
  }
  
  return tableContent;
}