import { ReactNode } from 'react';

export type MenuElementType = {
  name: string;
  icon: ReactNode;
  id: string;
  children?: MenuElementType[];
  color: string;
  fieldType?: string;
  listItemType?: string;
  fields?: { name: string; id: string; fieldType: string }[];
  selectOptions?: string[];
  multiple?: boolean;
};

export interface ExtendedMenuElementType extends MenuElementType {
  inUse?: boolean;
}
