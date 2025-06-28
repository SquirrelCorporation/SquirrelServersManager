import { useMemo } from 'react';
import { QuickAction } from './index';

export interface ActionDefinition {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  requiresConfirmation?: boolean;
  confirmMessage?: string;
  execute: () => void | Promise<void>;
  canExecute?: () => boolean;
  isVisible?: () => boolean;
}

export interface UseQuickActionsOptions {
  actions: ActionDefinition[];
  onBeforeExecute?: (action: ActionDefinition) => void | Promise<void>;
  onAfterExecute?: (action: ActionDefinition) => void | Promise<void>;
  onError?: (error: Error, action: ActionDefinition) => void;
}

export const useQuickActions = ({
  actions,
  onBeforeExecute,
  onAfterExecute,
  onError
}: UseQuickActionsOptions): QuickAction[] => {
  return useMemo(() => {
    return actions
      .filter(action => action.isVisible ? action.isVisible() : true)
      .map(action => ({
        key: action.key,
        label: action.label,
        icon: action.icon,
        danger: action.danger,
        disabled: action.canExecute ? !action.canExecute() : false,
        hidden: false,
        onClick: async () => {
          try {
            if (onBeforeExecute) {
              await onBeforeExecute(action);
            }
            
            if (action.requiresConfirmation) {
              // This would integrate with a confirmation modal
              // For now, we'll just execute
              console.warn('Confirmation not implemented yet for:', action.key);
            }
            
            await action.execute();
            
            if (onAfterExecute) {
              await onAfterExecute(action);
            }
          } catch (error) {
            if (onError) {
              onError(error as Error, action);
            } else {
              throw error;
            }
          }
        }
      }));
  }, [actions, onBeforeExecute, onAfterExecute, onError]);
};