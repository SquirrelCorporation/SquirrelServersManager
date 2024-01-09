import { getPlaybooks } from '@/services/ant-design-pro/ansible';
import { RedoOutlined, SaveOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import * as monaco from '@monaco-editor/react';
import { Button, Card, Col, FloatButton, Row, Tree, message } from 'antd';
import type { DataNode, DirectoryTreeProps } from 'antd/es/tree';
import React, { useEffect } from 'react';

const { DirectoryTree } = Tree;

const Index: React.FC = () => {
  const [playbookFilesList, setPlaybookFilesList] = React.useState<DataNode[]>([]);

  const asyncFetch = async () => {
    await getPlaybooks()
      .then((list) => {
        setPlaybookFilesList(
          list.data.map((e) => {
            return {
              title: e.label,
              key: e.value,
            };
          }),
        );
      })
      .catch((error) => {
        message.error(error);
      });
  };
  useEffect(() => {
    asyncFetch();
  }, []);
  const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
    console.log('Trigger Select', keys, info);
  };

  const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
    console.log('Trigger Expand', keys, info);
  };

  const value = `
# Property descriptions are displayed when hovering over properties using your cursor
property: This property has a JSON schema description


# Titles work too!
titledProperty: Titles work too!


# Even markdown descriptions work
markdown: hover me to get a markdown based description 😮


# Enums can be autocompleted by placing the cursor after the colon and pressing Ctrl+Space
enum:


# Unused anchors will be reported
unused anchor: &unused anchor


# Of course numbers are supported!
number: 12


# As well as booleans!
boolean: true


# And strings
string: I am a string


# This property is using the JSON schema recursively
reference:
  boolean: Not a boolean


# Also works in arrays
array:
  - string: 12
    enum: Mewtwo
    reference:
      reference:
        boolean: true


# JSON referenses can be clicked for navigation
pointer:
  $ref: '#/array'


# This anchor can be referenced
anchorRef: &anchor can be clicked as well


# Press control while hovering over the anchor
anchorPointer: *anchor


formatting:       Formatting is supported too! Under the hood this is powered by Prettier. Just press Ctrl+Shift+I or right click and press Format to format this document.






`.replace(/:$/m, ': ');

  return (
    <PageContainer>
      <FloatButton.Group shape="square" style={{ right: 94 }}>
        <FloatButton icon={<SaveOutlined style={{ color: 'red' }} />} />
        <FloatButton icon={<RedoOutlined />} />
        <FloatButton.BackTop visibilityHeight={0} />
      </FloatButton.Group>
      <Row wrap={false} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col flex={2}>
          <Card
            title="List of playbooks"
            bordered={false}
            style={{ width: '300px', minHeight: '90vh' }}
          >
            <DirectoryTree
              multiple
              defaultExpandAll
              onSelect={onSelect}
              onExpand={onExpand}
              treeData={playbookFilesList}
            />
            <Button type="primary" style={{ marginTop: '8px' }} block>
              New
            </Button>
          </Card>
        </Col>
        <Col flex={'auto'}>
          <monaco.Editor
            theme="vs-dark"
            height="90vh"
            defaultLanguage="yaml"
            path={'test.yaml'}
            value={value}
          />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Index;
