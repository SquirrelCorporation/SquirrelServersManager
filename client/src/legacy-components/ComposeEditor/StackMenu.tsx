// components/StackMenu.tsx
import { MenuElements } from '@/components/ComposeEditor/Menu/MenuElements';
import { Templates } from '@/components/ComposeEditor/Menu/MenuTemplateElements';
import StackMenuIconsGrid from '@/components/ComposeEditor/Menu/StackMenuIconsGrid';
import { capitalizeFirstLetter } from '@/utils/strings';
import { Card, Divider, Segmented } from 'antd';
import React, { useState } from 'react';
import { MenuElementType } from './types';

type StackMenuProps = {
  currentStack?: MenuElementType[];
  elementTypes: MenuElementType[];
  currentElement?: MenuElementType;
  setCurrentElement: (element?: MenuElementType) => void;
};

const StackMenu: React.FC<StackMenuProps> = ({
  currentStack,
  elementTypes,
  currentElement,
  setCurrentElement,
}) => {
  const [menu, setMenu] = useState<string>('Builder');
  const [templateMenu, setTemplateMenu] = useState<string>(
    Array.from(
      new Set(Templates.map((template) => template.category)),
    )[0] as string,
  );

  return (
    <Card>
      <Segmented
        options={['Builder', 'Templates']}
        block
        style={{ marginBottom: 10 }}
        onChange={(value) => setMenu(value)}
      />
      {(menu === 'Builder' && (
        <>
          <Segmented
            options={[
              'Main',
              ...(
                currentStack?.map((e) => {
                  const children = elementTypes.find(
                    (f) => f.name === e.name,
                  )?.children;
                  return children && children.length > 0 ? e.name : undefined;
                }) || []
              ).filter(Boolean), // This will remove any undefined values
            ]}
            block
            size="small"
            style={{ marginBottom: 10 }}
            onChange={(value) =>
              setCurrentElement(
                value === 'Main'
                  ? undefined
                  : elementTypes.find((f) => f.name === value),
              )
            }
            value={currentElement?.name || 'Main'}
          />
          <Divider dashed>
            {currentElement ? currentElement.name : 'Main'} Elements
          </Divider>
          <StackMenuIconsGrid
            elementsList={MenuElements}
            currentElement={currentElement}
          />
        </>
      )) || (
        <>
          <Segmented
            options={Array.from(
              new Set(Templates.map((template) => template.category)),
            ).map((category) => {
              return {
                value: category,
                label: capitalizeFirstLetter(category),
              };
            })}
            block
            size="small"
            style={{ marginBottom: 10 }}
            value={templateMenu}
            onChange={(value) => setTemplateMenu(value as string)}
          />
          <Divider dashed>
            {capitalizeFirstLetter(templateMenu)} Template Elements
          </Divider>
          <StackMenuIconsGrid
            elementsList={Templates.filter((e) => e.category === templateMenu)}
          />
        </>
      )}
    </Card>
  );
};

export default StackMenu;
