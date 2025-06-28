export type MenuElementType = {
  name: string;
  index?: number;
  id: string;
  children?: MenuElementType[];
  fieldType?: string;
  listItemType?: string;
  fields?: Field[];
  selectOptions?: string[];
  isTemplate?: boolean;
  category?: string;
  value?: any;
  originalId?: string;
  path?: string;
};

export type Field = {
  name: string;
  id: string;
  fieldType: string;
  listItemType?: string;
  fields?: Field[];
  value?: any;
};
