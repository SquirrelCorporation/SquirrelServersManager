import { ProFormSelect } from '@ant-design/pro-form';
import { message } from '@shared/ui/feedback/DynamicMessage';
import React, { useState } from 'react';
import { API } from 'ssm-shared-lib';

type DirectoryExclusionFormProps = {
  selectedRecord: Partial<API.LocalPlaybooksRepository>;
};

const DirectoryExclusionForm: React.FC<DirectoryExclusionFormProps> = (
  props,
) => {
  const [tags, setTags] = useState(
    props.selectedRecord?.directoryExclusionList || [
      'production',
      'staging',
      'group_vars',
      'host_vars',
      'library',
      'module_utils',
      'filters_plugin',
      'roles',
      'inventories',
    ],
  );

  const validateTag = (tag: string): boolean => {
    const pattern = /^[^\\/]+$/;
    return pattern.test(tag);
  };

  const handleTagsChange = (newTags: string[]) => {
    const invalidTag = newTags.find((tag) => !validateTag(tag));
    if (invalidTag) {
      void message.error({
        content: 'Characters / and \\ are not authorized',
        duration: 6,
      });
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
