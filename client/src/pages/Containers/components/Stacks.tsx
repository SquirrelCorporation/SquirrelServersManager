import { MenuElements } from '@/components/ComposeEditor/MenuElements';
import StackBuilder from '@/components/ComposeEditor/StackBuilder';
import React from 'react';

const Stacks: React.FC = () => {
  return <StackBuilder elementTypes={MenuElements} />;
};

export default Stacks;
