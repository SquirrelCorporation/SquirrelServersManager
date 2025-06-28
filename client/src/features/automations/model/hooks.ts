/**
 * Automation Custom Hooks
 * Higher-level hooks that combine queries and mutations for common automation operations
 */

import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAutomations,
  useCreateAutomation,
  useUpdateAutomation,
  useDeleteAutomation,
  useExecuteAutomation,
  useCreateAutomationFromTemplate,
} from './queries';
import {
  filterTemplatesByCategory,
  searchTemplates,
  sortTemplatesByRelevance,
  getExecutionStatusInfo,
  getTimeSinceLastExecution,
  canExecuteAutomation,
  getExecutionRiskLevel,
} from '@/shared/lib/automations';
import type { API, Automations } from 'ssm-shared-lib';
import type { AutomationTemplate, TemplateFormData } from '@/shared/lib/automations';

// Form data type based on API.Automation structure
export type AutomationFormData = Pick<API.Automation, 'name' | 'enabled'> & {
  chain: Automations.AutomationChain;
};

// Automation List Management
export function useAutomationList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastExecution' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: automations = [], isLoading, error, refetch } = useAutomations();

  const filteredAutomations = useMemo(() => {
    // Always start with a copy to avoid mutating original data
    let filtered = [...automations];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(automation =>
        automation.name.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(automation =>
        statusFilter === 'enabled' ? automation.enabled : !automation.enabled
      );
    }

    // Sort (safe to mutate since we have a copy)
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastExecution':
          const aTime = a.lastExecutionTime ? new Date(a.lastExecutionTime).getTime() : 0;
          const bTime = b.lastExecutionTime ? new Date(b.lastExecutionTime).getTime() : 0;
          comparison = aTime - bTime;
          break;
        case 'status':
          comparison = a.lastExecutionStatus.localeCompare(b.lastExecutionStatus);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [automations, searchTerm, statusFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = automations.length;
    const enabled = automations.filter(a => a.enabled).length;
    const successful = automations.filter(a => a.lastExecutionStatus === 'success').length;
    const failed = automations.filter(a => a.lastExecutionStatus === 'failed').length;

    return {
      total,
      enabled,
      disabled: total - enabled,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
    };
  }, [automations]);

  return {
    automations: filteredAutomations,
    stats,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
}

// Automation Editor Hook
export function useAutomationEditor(automation?: API.Automation) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<AutomationFormData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const createMutation = useCreateAutomation();
  const updateMutation = useUpdateAutomation();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const openEditor = useCallback((data?: AutomationFormData) => {
    setFormData(data || {
      name: '',
      chain: { trigger: Automations.Triggers.CRON, actions: [] }
    });
    setValidationErrors([]);
    setIsOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsOpen(false);
    setFormData(null);
    setValidationErrors([]);
  }, []);

  const saveAutomation = useCallback(async (data: AutomationFormData) => {
    try {
      if (automation) {
        await updateMutation.mutateAsync({
          uuid: automation.uuid,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      closeEditor();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setValidationErrors([errorMessage]);
      return false;
    }
  }, [automation, createMutation, updateMutation, closeEditor]);

  return {
    isOpen,
    formData,
    validationErrors,
    isLoading,
    isEditing: !!automation,
    openEditor,
    closeEditor,
    saveAutomation,
    setFormData,
  };
}

// Automation Operations Hook
export function useAutomationOperations() {
  const deleteMutation = useDeleteAutomation();
  const executeMutation = useExecuteAutomation();
  const updateMutation = useUpdateAutomation();
  const createMutation = useCreateAutomation();
  const queryClient = useQueryClient();

  const deleteAutomation = useCallback(async (automation: API.Automation) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${automation.name}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      await deleteMutation.mutateAsync(automation.uuid);
    }
  }, [deleteMutation]);

  const executeAutomation = useCallback(async (automation: API.Automation) => {
    if (!canExecuteAutomation(automation)) {
      throw new Error('Automation cannot be executed (disabled or invalid configuration)');
    }

    const riskLevel = getExecutionRiskLevel(automation);
    
    if (riskLevel === 'high') {
      const confirmed = window.confirm(
        `This automation performs high-risk operations. Are you sure you want to execute "${automation.name}"?`
      );
      if (!confirmed) return;
    }

    await executeMutation.mutateAsync(automation.uuid);
  }, [executeMutation]);

  const toggleAutomation = useCallback(async (automation: API.Automation) => {
    // Update the automation's enabled state
    await updateMutation.mutateAsync({
      uuid: automation.uuid,
      name: automation.name,
      chain: automation.automationChains,
      enabled: !automation.enabled,
    });
  }, [updateMutation]);

  const duplicateAutomation = useCallback(async (automation: API.Automation) => {
    await createMutation.mutateAsync({
      name: `${automation.name} (Copy)`,
      chain: automation.automationChains,
    });
  }, [createMutation]);

  return {
    deleteAutomation,
    executeAutomation,
    toggleAutomation,
    duplicateAutomation,
    isDeleting: deleteMutation.isPending,
    isExecuting: executeMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCreating: createMutation.isPending,
  };
}

// Template Browser Hook
export function useTemplateBrowser(templates: AutomationTemplate[]) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Category filter
    if (selectedCategory) {
      filtered = filterTemplatesByCategory(filtered, selectedCategory);
    }

    // Search filter
    if (searchTerm.trim()) {
      filtered = searchTemplates(filtered, searchTerm);
    }

    // Sort by relevance
    return sortTemplatesByRelevance(filtered, searchTerm);
  }, [templates, selectedCategory, searchTerm]);

  const createFromTemplate = useCreateAutomationFromTemplate();

  const useTemplate = useCallback(async (template: AutomationTemplate, formData: TemplateFormData) => {
    try {
      await createFromTemplate.mutateAsync({
        template,
        formData,
      });
      setSelectedTemplate(null);
      return true;
    } catch (error) {
      console.error('Failed to create automation from template:', error);
      return false;
    }
  }, [createFromTemplate]);

  return {
    filteredTemplates,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    selectedTemplate,
    setSelectedTemplate,
    useTemplate,
    isCreating: createFromTemplate.isPending,
  };
}

// Automation Status Hook
export function useAutomationStatus(automation: API.Automation | undefined) {
  const statusInfo = useMemo(() => {
    if (!automation) return null;
    return getExecutionStatusInfo(automation.lastExecutionStatus);
  }, [automation]);

  const timeSinceLastExecution = useMemo(() => {
    if (!automation?.lastExecutionTime) return 'Never executed';
    return getTimeSinceLastExecution(new Date(automation.lastExecutionTime));
  }, [automation?.lastExecutionTime]);

  const canExecute = useMemo(() => {
    if (!automation) return false;
    return canExecuteAutomation(automation);
  }, [automation]);

  const riskLevel = useMemo(() => {
    if (!automation) return 'low';
    return getExecutionRiskLevel(automation);
  }, [automation]);

  return {
    statusInfo,
    timeSinceLastExecution,
    canExecute,
    riskLevel,
  };
}

// Bulk Operations Hook
export function useBulkAutomationOperations() {
  const [selectedAutomations, setSelectedAutomations] = useState<string[]>([]);
  const deleteMutation = useDeleteAutomation();
  const executeMutation = useExecuteAutomation();

  const selectAutomation = useCallback((uuid: string) => {
    setSelectedAutomations(prev => 
      prev.includes(uuid) 
        ? prev.filter(id => id !== uuid)
        : [...prev, uuid]
    );
  }, []);

  const selectAll = useCallback((automations: API.Automation[]) => {
    setSelectedAutomations(automations.map(a => a.uuid));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAutomations([]);
  }, []);

  const deleteSelected = useCallback(async (automations: API.Automation[]) => {
    const toDelete = automations.filter(a => selectedAutomations.includes(a.uuid));
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${toDelete.length} automation(s)? This action cannot be undone.`
    );
    
    if (confirmed) {
      await Promise.all(
        toDelete.map(automation => deleteMutation.mutateAsync(automation.uuid))
      );
      clearSelection();
    }
  }, [selectedAutomations, deleteMutation, clearSelection]);

  const executeSelected = useCallback(async (automations: API.Automation[]) => {
    const toExecute = automations.filter(a => 
      selectedAutomations.includes(a.uuid) && canExecuteAutomation(a)
    );
    
    const confirmed = window.confirm(
      `Are you sure you want to execute ${toExecute.length} automation(s)?`
    );
    
    if (confirmed) {
      await Promise.all(
        toExecute.map(automation => executeMutation.mutateAsync(automation.uuid))
      );
      clearSelection();
    }
  }, [selectedAutomations, executeMutation, clearSelection]);

  return {
    selectedAutomations,
    selectAutomation,
    selectAll,
    clearSelection,
    deleteSelected,
    executeSelected,
    hasSelection: selectedAutomations.length > 0,
    selectionCount: selectedAutomations.length,
  };
}