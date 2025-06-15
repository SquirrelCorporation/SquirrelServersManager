import React from 'react';

/**
 * Definition of a UI slot where plugin components can be rendered
 */
export interface SlotDefinition {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  weight?: number; // Lower weights render first
  position?: 'prepend' | 'append' | 'replace';
}

/**
 * Registry for UI slots where plugins can inject content
 */
export class SlotRegistry {
  // Map of slot name -> component ID -> slot definition
  private slots: Map<string, Map<string, SlotDefinition>> = new Map();
  
  /**
   * Register a component for a slot
   * @param slotName Name of the slot
   * @param pluginId Plugin ID
   * @param componentId Component ID
   * @param definition Slot definition
   */
  registerSlot(
    slotName: string, 
    pluginId: string, 
    componentId: string, 
    definition: SlotDefinition
  ): void {
    if (!this.slots.has(slotName)) {
      this.slots.set(slotName, new Map());
    }
    
    const slotKey = `${pluginId}:${componentId}`;
    this.slots.get(slotName)?.set(slotKey, definition);
  }
  
  /**
   * Get all components for a slot
   * @param slotName Name of the slot
   * @returns Array of slot definitions
   */
  getSlotComponents(slotName: string): SlotDefinition[] {
    const slotMap = this.slots.get(slotName);
    
    if (!slotMap) {
      return [];
    }
    
    return Array.from(slotMap.values())
      .sort((a, b) => (a.weight || 0) - (b.weight || 0));
  }
  
  /**
   * Get a React component that renders all components for a slot
   * @param slotName Name of the slot
   * @returns React component
   */
  getSlotRenderer(slotName: string): React.ComponentType<any> {
    return (props: any) => {
      const components = this.getSlotComponents(slotName);
      
      if (components.length === 0) {
        return null;
      }
      
      return (
        <React.Fragment>
          {components.map((definition, index) => {
            const SlotComponent = definition.component;
            return (
              <SlotComponent 
                key={`${slotName}-${index}`}
                {...(definition.props || {})}
                {...props}
              />
            );
          })}
        </React.Fragment>
      );
    };
  }
  
  /**
   * Clear slots for a specific plugin
   * @param pluginId Plugin ID
   */
  clearPluginSlots(pluginId: string): void {
    this.slots.forEach((slotMap, slotName) => {
      Array.from(slotMap.keys())
        .filter(key => key.startsWith(`${pluginId}:`))
        .forEach(key => slotMap.delete(key));
      
      // Clean up empty slot maps
      if (slotMap.size === 0) {
        this.slots.delete(slotName);
      }
    });
  }
  
  /**
   * Get all registered slot names
   * @returns Array of slot names
   */
  getSlotNames(): string[] {
    return Array.from(this.slots.keys());
  }
}