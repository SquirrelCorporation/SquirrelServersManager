import { ProFormSelect } from '@ant-design/pro-form';
import { message } from '@shared/ui/feedback/DynamicMessage';
import React, { useState } from 'react';
import { API } from 'ssm-shared-lib';

type FileMatchesFormProps = {
  selectedRecord: Partial<API.GitContainerStacksRepository>;
};

const FileMatchesForm: React.FC<FileMatchesFormProps> = (props) => {
  const [tags, setTags] = useState(
    props.selectedRecord?.matchesList || [
      'docker-compose.yml',
      'docker-compose.yaml',
    ],
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
        tooltip={'Only the following files will be added in SSM.'}
        label={'Match files'}
        name={'matchesList'}
        rules={[{ required: true }]}
        initialValue={tags}
        fieldProps={{
          mode: 'tags',
          value: tags,
          onChange: handleTagsChange,
        }}
        options={tags}
      />
    </>
  );
};

export default FileMatchesForm;
