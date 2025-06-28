/**
 * Automations Wrapper Component
 * Feature flag wrapper for gradual automation migration
 */

import React, { useState } from 'react';
import { useFeatureFlag } from '@/shared/lib/feature-flags';
import { useFSDInitialized } from '@/app/providers/FSDProvider';
import { AutomationList, useAutomationEditor } from '@/features/automations';
import { AutomationExecutionMonitor } from '@/features/automations/ui/AutomationExecutionMonitor';
import type { API } from 'ssm-shared-lib';

// Import legacy component
const LegacyAutomations = React.lazy(() => import('../Automations'));

export const AutomationsWrapper: React.FC = () => {
  const fsdEnabled = useFeatureFlag('automationsFSD');
  const fsdInitialized = useFSDInitialized();
  const [executionMonitor, setExecutionMonitor] = useState<{
    automation: API.Automation | null;
    isVisible: boolean;
    executionId?: string;
  }>({
    automation: null,
    isVisible: false,
  });

  const {
    isOpen: isEditorOpen,
    openEditor,
    closeEditor,
    formData,
    isEditing,
    saveAutomation,
    validationErrors,
    isLoading: isSaving,
  } = useAutomationEditor();

  // Use FSD implementation if enabled and initialized
  if (fsdEnabled && fsdInitialized) {
    const handleCreateNew = () => {
      openEditor();
    };

    const handleEdit = (automation: API.Automation) => {
      openEditor({
        name: automation.name,
        trigger: automation.automationChains.trigger,
        cronValue: automation.automationChains.cronValue,
        actions: automation.automationChains.actions,
      });
    };

    const handleDelete = (automation: API.Automation) => {
      // TODO: Implement delete confirmation modal
      console.log('Delete automation:', automation.name);
    };

    const handleExecute = (automation: API.Automation) => {
      // Show execution monitor
      setExecutionMonitor({
        automation,
        isVisible: true,
        executionId: undefined, // Will be provided by the execution API
      });
    };

    const closeExecutionMonitor = () => {
      setExecutionMonitor({
        automation: null,
        isVisible: false,
      });
    };

    return (
      <>
        <AutomationList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExecute={handleExecute}
        />
        
        <AutomationExecutionMonitor
          automation={executionMonitor.automation}
          isVisible={executionMonitor.isVisible}
          onClose={closeExecutionMonitor}
          executionId={executionMonitor.executionId}
        />
        
        {/* TODO: Add AutomationEditor modal here */}
      </>
    );
  }

  // Fallback to legacy implementation
  return <LegacyAutomations />;
};