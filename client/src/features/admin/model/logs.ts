import { useState, useEffect } from 'react';
import { useSearchParams } from '@umijs/max';
import { ProForm } from '@ant-design/pro-form/lib';
import { ColumnsState } from '@ant-design/pro-components';

/**
 * Hook for managing logs page state and form initialization
 */
export const useLogsPageState = () => {
  const [form] = ProForm.useForm<any>();
  const [searchParams] = useSearchParams();

  // Column visibility state for ProTable
  const [columnsStateMap, setColumnsStateMap] = useState<
    Record<string, ColumnsState>
  >({
    req: { show: false },
    res: { show: false },
    err: { show: false },
  });

  // Initialize form with URL search params
  useEffect(() => {
    const formValues: any = {};
    
    if (searchParams.get('module')) {
      formValues.module = searchParams.get('module');
    }
    if (searchParams.get('moduleId')) {
      formValues.moduleId = searchParams.get('moduleId');
    }
    if (searchParams.get('msg')) {
      formValues.msg = searchParams.get('msg');
    }

    if (Object.keys(formValues).length > 0) {
      form.setFieldsValue(formValues);
    }
  }, [searchParams, form]);

  return {
    form,
    columnsStateMap,
    setColumnsStateMap
  };
};