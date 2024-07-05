import ExtraVarView from '@/components/PlaybookSelectionModal/ExtraVarView';
import { getPlaybooks } from '@/services/rest/playbooks';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Collapse } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const PlaybookAction = () => {
  const [listOfPlaybooks, setListOfPlaybooks] = React.useState<
    API.PlaybookFile[] | undefined
  >();
  const [selectedPlaybookExtraVars, setSelectedPlaybookExtraVars] =
    React.useState<any>();
  const [overrideExtraVars, setOverrideExtraVars] = React.useState<any>([]);

  const handleSelectedPlaybook = (newValue: {
    label: string;
    value: string;
  }) => {
    const selectedPlaybook = listOfPlaybooks?.find(
      (e) => e.uuid === newValue?.value,
    );
    if (selectedPlaybook) {
      setOverrideExtraVars(
        selectedPlaybook.extraVars?.map((e) => {
          return { overrideVar: e.extraVar };
        }),
      );
      const reservedVars =
        (selectedPlaybook.extraVars &&
          selectedPlaybook.extraVars.length > 0 &&
          selectedPlaybook.extraVars.filter((e) => e.extraVar.startsWith('_'))
            .length > 0 &&
          selectedPlaybook.extraVars.filter((e) =>
            e.extraVar.startsWith('_'),
          )) ||
        undefined;
      const customVars =
        (selectedPlaybook.extraVars &&
          selectedPlaybook.extraVars.length > 0 &&
          selectedPlaybook.extraVars.filter((e) => !e.extraVar.startsWith('_'))
            .length > 0 &&
          selectedPlaybook.extraVars.filter(
            (e) => !e.extraVar.startsWith('_'),
          )) ||
        undefined;
      setSelectedPlaybookExtraVars([
        {
          key: 'reserved-vars',
          label: 'Reserved ExtraVars',
          children:
            reservedVars?.map((e) => (
              <ExtraVarView
                key={e.extraVar}
                extraVar={e}
                setOverrideExtraVars={setOverrideExtraVars}
                overrideExtraVars={overrideExtraVars}
              />
            )) || 'NONE',
        },
        {
          key: 'custom-vars',
          label: 'ExtraVars',
          children:
            customVars?.map((e) => (
              <ExtraVarView
                key={e.extraVar}
                extraVar={e}
                setOverrideExtraVars={setOverrideExtraVars}
                overrideExtraVars={overrideExtraVars}
              />
            )) || 'NONE',
        },
      ]);
    } else {
      setSelectedPlaybookExtraVars(undefined);
    }
  };

  return (
    <>
      <ProFormSelect.SearchSelect
        name="playbook"
        placeholder={'Select a playbook'}
        onChange={handleSelectedPlaybook}
        fieldProps={{
          mode: undefined,
          style: {
            minWidth: 240,
          },
        }}
        request={async () => {
          return await getPlaybooks().then((response) => {
            setListOfPlaybooks(response.data);
            return response.data.map((e) => {
              return { label: e.name, value: e.uuid };
            });
          });
        }}
      />
      {selectedPlaybookExtraVars && (
        <Collapse
          items={selectedPlaybookExtraVars}
          bordered={false}
          style={{ width: '100%' }}
        />
      )}
    </>
  );
};

export default PlaybookAction;
