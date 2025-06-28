/**
 * Automation TanStack Query Hooks
 * Integrates automation business logic with TanStack Query for state management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  getAutomations,
  getAutomation,
  putAutomation,
  postAutomation,
  deleteAutomation,
  executeAutomation,
  getTemplate,
} from '@/services/rest/automations/automations';
import { getCrons } from '@/services/rest/scheduler/scheduler';
import {
  validateCompleteAutomation,
  validateTemplateFormData,
  transformTemplateChain,
  getExecutionStatusInfo,
  calculateExecutionStats,
  needsAttention,
} from '@/shared/lib/automations';
import { useAutomationExecution } from '@/shared/lib/websocket/automation-hooks';
import { queryKeys, QueryKeyPatterns } from '@/shared/lib/query-keys/query-keys';
import type { API, Automations } from 'ssm-shared-lib';
import type { AutomationTemplate, TemplateFormData } from '@/shared/lib/automations';

// Automation Queries
export function useAutomations() {
  return useQuery({
    queryKey: queryKeys.automations.list(),
    queryFn: async () => {
      const response = await getAutomations();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAutomation(uuid: string | undefined) {
  return useQuery({
    queryKey: QueryKeyPatterns.automationDetail(uuid!),
    queryFn: async () => {
      const response = await getAutomation(uuid!);
      return response.data;
    },
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSystemCrons() {
  return useQuery({
    queryKey: queryKeys.automations.nested(['crons']),
    queryFn: async () => {
      const response = await getCrons();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - system crons change rarely
  });
}

export function useAutomationTemplate(templateId: number | undefined) {
  return useQuery({
    queryKey: QueryKeyPatterns.automationTemplate(templateId!),
    queryFn: async () => {
      const response = await getTemplate(templateId!);
      return response.data;
    },
    enabled: !!templateId,
    staleTime: 30 * 60 * 1000, // 30 minutes - templates rarely change
  });
}

// Automation Mutations
export function useCreateAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; chain: Automations.AutomationChain }) => {
      // Validate before creating
      const existingAutomations = queryClient.getQueryData<API.Automation[]>(
        queryKeys.automations.list()
      ) || [];
      
      const validation = validateCompleteAutomation(
        data.name,
        data.chain,
        existingAutomations
      );

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await putAutomation(data.name, data.chain);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the automations list cache
      queryClient.setQueryData<API.Automation[]>(
        queryKeys.automations.list(),
        (oldData) => oldData ? [...oldData, data] : [data]
      );
      
      message.success('Automation created successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to create automation: ${error.message}`);
    },
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      uuid: string; 
      name: string; 
      chain: Automations.AutomationChain;
    }) => {
      // Validate before updating
      const existingAutomations = queryClient.getQueryData<API.Automation[]>(
        queryKeys.automations.list()
      ) || [];
      
      const validation = validateCompleteAutomation(
        data.name,
        data.chain,
        existingAutomations,
        data.uuid
      );

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await postAutomation(data.uuid, data.name, data.chain);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the automations list cache
      queryClient.setQueryData<API.Automation[]>(
        queryKeys.automations.list(),
        (oldData) => 
          oldData?.map(automation => 
            automation.uuid === data.uuid ? data : automation
          ) || []
      );
      
      // Update individual automation cache
      queryClient.setQueryData(
        QueryKeyPatterns.automationDetail(data.uuid),
        data
      );
      
      message.success('Automation updated successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to update automation: ${error.message}`);
    },
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await deleteAutomation(uuid);
      return uuid;
    },
    onSuccess: (uuid) => {
      // Remove from automations list cache
      queryClient.setQueryData<API.Automation[]>(
        queryKeys.automations.list(),
        (oldData) => oldData?.filter(automation => automation.uuid !== uuid) || []
      );
      
      // Remove individual automation cache
      queryClient.removeQueries({
        queryKey: QueryKeyPatterns.automationDetail(uuid),
      });
      
      message.success('Automation deleted successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to delete automation: ${error.message}`);
    },
  });
}

export function useExecuteAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await executeAutomation(uuid);
      return response.data;
    },
    onSuccess: (data, uuid) => {
      // Update automation's last execution time
      queryClient.setQueryData<API.Automation[]>(
        queryKeys.automations.list(),
        (oldData) => 
          oldData?.map(automation => 
            automation.uuid === uuid 
              ? { ...automation, lastExecutionTime: new Date() }
              : automation
          ) || []
      );
      
      // Also invalidate detail cache to get fresh execution data
      queryClient.invalidateQueries({
        queryKey: QueryKeyPatterns.automationDetail(uuid),
      });
      
      // Invalidate execution logs
      queryClient.invalidateQueries({
        queryKey: QueryKeyPatterns.automationExecutions(uuid),
      });
      
      message.success('Automation executed successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to execute automation: ${error.message}`);
    },
  });
}

// Template Hooks
export function useCreateAutomationFromTemplate() {
  const createAutomation = useCreateAutomation();
  
  return useMutation({
    mutationFn: async (data: {
      template: AutomationTemplate;
      formData: TemplateFormData;
    }) => {
      // Validate template form data
      const validation = validateTemplateFormData(data.template, data.formData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Transform template with variables
      const chain = transformTemplateChain(data.template, data.formData.variables);
      
      // Create automation
      return createAutomation.mutateAsync({
        name: data.formData.name,
        chain,
      });
    },
    onError: (error: Error) => {
      message.error(`Failed to create automation from template: ${error.message}`);
    },
  });
}

// Enhanced Automation Hooks with Business Logic
export function useAutomationsWithStatus() {
  const { data: automations = [], ...query } = useAutomations();
  
  const automationsWithStatus = automations.map(automation => {
    const statusInfo = getExecutionStatusInfo(automation.lastExecutionStatus);
    const attention = needsAttention(automation, []); // TODO: Add execution logs
    
    return {
      ...automation,
      statusInfo,
      needsAttention: attention.needsAttention,
      attentionReason: attention.reason,
    };
  });

  return {
    ...query,
    data: automationsWithStatus,
  };
}

export interface AutomationExecutionLog {
  id: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'running';
  message: string;
  duration?: number;
}

export function useAutomationStats(uuid: string | undefined) {
  const { data: automation } = useAutomation(uuid);
  // TODO: Implement execution logs query
  const executionLogs: AutomationExecutionLog[] = []; // Placeholder
  
  return {
    stats: automation ? calculateExecutionStats(automation, executionLogs) : null,
    automation,
  };
}

// Validation Hooks
export function useAutomationValidation() {
  const { data: existingAutomations = [] } = useAutomations();
  
  return {
    validateName: (name: string, currentUuid?: string) => 
      validateCompleteAutomation(name, { trigger: Automations.Triggers.CRON, actions: [] }, existingAutomations, currentUuid),
    validateChain: (chain: Automations.AutomationChain) =>
      validateCompleteAutomation('', chain, existingAutomations),
    existingAutomations,
  };
}

// WebSocket Integration
export function useAutomationExecutionStatus(uuid: string | undefined) {
  const [executionState, setExecutionState] = useState({
    isExecuting: false,
    progress: 0,
    currentStep: '',
    logs: [] as AutomationExecutionLog[],
  });

  const { subscribeToExecution } = useAutomationExecution(uuid);

  useEffect(() => {
    if (!uuid) return;

    const cleanup = subscribeToExecution(
      // Progress updates
      (progressUpdate) => {
        setExecutionState(prev => ({
          ...prev,
          isExecuting: true,
          progress: progressUpdate.progress,
          currentStep: progressUpdate.currentStep,
        }));
      },
      // Log updates
      (logUpdate) => {
        setExecutionState(prev => ({
          ...prev,
          logs: [...prev.logs, logUpdate],
        }));
      },
      // Completion updates
      (completionUpdate) => {
        setExecutionState(prev => ({
          ...prev,
          isExecuting: false,
          progress: 100,
          currentStep: completionUpdate.status === 'success' ? 'Completed' : 'Failed',
        }));
      }
    );

    return cleanup;
  }, [uuid, subscribeToExecution]);

  return executionState;
}