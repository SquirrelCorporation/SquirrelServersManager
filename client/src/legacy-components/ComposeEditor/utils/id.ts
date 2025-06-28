import { MenuElementType } from '@/components/ComposeEditor/types';

export function generateId(e: MenuElementType, index: number) {
  return `${e.id}-${index}`;
}
