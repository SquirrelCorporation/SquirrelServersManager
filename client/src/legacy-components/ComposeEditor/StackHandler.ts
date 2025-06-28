import { MenuElements } from '@/components/ComposeEditor/Menu/MenuElements';
import { Templates } from '@/components/ComposeEditor/Menu/MenuTemplateElements';
import { MenuElementType } from '@/components/ComposeEditor/types';
import { capitalizeFirstLetter } from '@/utils/strings';

function generateRandomString(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}

const stackElementExistsInChildren = (
  children: MenuElementType[],
  elementId: string,
): boolean => {
  return children.some((child) => child.id === elementId);
};

const addElementToStack = (
  stack: MenuElementType[],
  newElement: MenuElementType,
): MenuElementType[] => {
  return [
    ...stack,
    {
      id: newElement.id,
      name: newElement.name,
      children: [
        {
          ...newElement,
          index: 0,
          children: newElement.isTemplate ? newElement.children : [],
          path: generateRandomString(10),
        },
      ],
    },
  ] as MenuElementType[];
};

const updateElementChildren = (
  stack: MenuElementType[],
  elementId: string,
  newChildElement: MenuElementType,
): MenuElementType[] => {
  return stack.map((element) => {
    if (element.id === elementId) {
      const children = element.children as MenuElementType[];
      const newIndex =
        Math.max(0, ...children.map((child) => child.index as number)) + 1;
      return {
        ...element,
        children: [
          ...children,
          {
            ...newChildElement,
            path: generateRandomString(10),
            index: newIndex,
            children: newChildElement.isTemplate
              ? newChildElement.children
              : [],
          },
        ],
      };
    }
    return element;
  });
};

export const StackAdditionHandler = (
  overId: string,
  droppedElementId: string,
  currentStack: MenuElementType[] = [],
  index?: number,
  group?: string,
): MenuElementType[] => {
  const findElement = (elements: MenuElementType[], id: string) => {
    return elements.find((element) => element.id === id);
  };

  if (overId === 'main') {
    const droppedElement = findElement(MenuElements, droppedElementId);

    if (droppedElement) {
      if (!findElement(currentStack, droppedElement.id)) {
        return addElementToStack(currentStack, droppedElement);
      }
      return updateElementChildren(
        currentStack,
        droppedElement.id,
        droppedElement,
      );
    } else {
      const templateElement = findElement(Templates, droppedElementId);
      if (templateElement) {
        if (!findElement(currentStack, templateElement.category as string)) {
          return addElementToStack(currentStack, {
            ...templateElement,
            id: templateElement.category as string,
            name: capitalizeFirstLetter(templateElement.category),
            originalId: templateElement.id,
            path: generateRandomString(10),
          });
        }
        return updateElementChildren(
          currentStack,
          templateElement.category as string,
          {
            ...templateElement,
            id: templateElement.category as string,
            name: capitalizeFirstLetter(templateElement.category),
            originalId: templateElement.id,
            path: generateRandomString(10),
          },
        );
      }
    }
  } else {
    const parentElement = findElement(MenuElements, group as string);
    const droppedElement = parentElement?.children?.find(
      (child) => child.id === droppedElementId,
    );

    if (parentElement && droppedElement) {
      return currentStack.map((stackItem) => {
        if (stackItem.id === group) {
          return {
            ...stackItem,
            children: (stackItem.children || []).map((subItem) => {
              if (subItem.index === index) {
                const subChildren = subItem.children || [];
                if (
                  !stackElementExistsInChildren(subChildren, droppedElement.id)
                ) {
                  return {
                    ...subItem,
                    children: [
                      ...subChildren,
                      {
                        ...droppedElement,
                        index: subChildren.length + 1,
                        children: [],
                      },
                    ],
                  };
                }
              }
              return subItem;
            }),
          };
        }
        return stackItem;
      });
    }
  }

  return currentStack;
};

const removeElementFromStack = (
  stack: MenuElementType[],
  elementId: string,
  idx?: number,
): MenuElementType[] => {
  if (idx !== undefined) {
    return stack.map((element) => {
      if (element.id === elementId) {
        const children = (element.children || []) as MenuElementType[];
        return {
          ...element,
          children: children.filter((child) => child.index !== idx),
        };
      }
      return element;
    });
  } else {
    return stack.filter((element) => element.id !== elementId);
  }
};

const updateElementChildrenForRemoval = (
  stack: MenuElementType[],
  elementId: string,
  childId: string,
  idx: number,
): MenuElementType[] => {
  return stack.map((element) => {
    if (element.id === elementId) {
      const children = (element.children || []) as MenuElementType[];
      return {
        ...element,
        children: children.map((child) => {
          if (child.index === idx) {
            return {
              ...child,
              children: child.children?.filter(
                (subChild) => subChild.id !== childId,
              ),
            };
          }
          return child;
        }),
      };
    }
    return element;
  });
};

export const StackRemoveHandler = (
  overId: string,
  removedElementId: string,
  currentStack: MenuElementType[] = [],
  index?: number,
  group?: string,
): MenuElementType[] => {
  if (overId === 'main') {
    return removeElementFromStack(currentStack, removedElementId, index);
  } else {
    const parentGroup = currentStack.find(
      (stackItem) => stackItem.id === group,
    );
    if (parentGroup) {
      const targetChild = (parentGroup.children?.find(
        (subItem) => subItem.index === index,
      ) || []) as MenuElementType;
      const exists = targetChild.children?.some(
        (subChild) => subChild.id === removedElementId,
      );
      if (exists) {
        return updateElementChildrenForRemoval(
          currentStack,
          group as string,
          removedElementId,
          index as number,
        );
      }
    }
  }

  return currentStack;
};
