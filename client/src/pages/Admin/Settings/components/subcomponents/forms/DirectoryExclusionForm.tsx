import { ProFormSelect } from '@ant-design/pro-form';
import { message } from 'antd';
import React, { useState } from 'react';
import { API } from 'ssm-shared-lib';

type DirectoryExclusionFormProps = {
  selectedRecord: Partial<API.LocalPlaybooksRepository>;
};

const DirectoryExclusionForm: React.FC<DirectoryExclusionFormProps> = (
  props,
) => {
  const [tags, setTags] = useState(
    props.selectedRecord?.directoryExclusionList || [],
  );

  const validateTag = (tag: string): boolean => {
    const pattern = /^[^\\/]+$/;
    return pattern.test(tag);
  };

  const handleTagsChange = (newTags: string[]) => {
    const invalidTag = newTags.find((tag) => !validateTag(tag));
    if (invalidTag) {
      void message.error('Characters / and \\ are not authorized');
    } else {
      setTags(newTags);
    }
  };

  return (
    <>
      <ProFormSelect
        width={'md'}
        tooltip={
          'Files located inside those directories will still be scanned and editable, but will not appear on the playbooks execution list.'
        }
        label={'Exclude Directories from Execution List'}
        name={'directoryExclusionList'}
        disabled={props.selectedRecord?.default === true}
        fieldProps={{
          mode: 'tags',
          value: tags,
          onChange: handleTagsChange,
        }}
        placeholder={"'roles', 'inventories', ..."}
        options={tags}
      />
    </>
  );
};

export default DirectoryExclusionForm;
