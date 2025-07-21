import { HookCallback } from '../interfaces/plugin.interface';

/**
 * Registry for plugin hooks
 */
export class HookRegistry {
  private hooks: Map<
    string,
    Array<{ pluginId: string; callback: HookCallback }>
  > = new Map();

  /**
   * Register a hook
   * @param pluginId Plugin ID
   * @param hookName Hook name
   * @param callback Hook callback
   */
  registerHook(
    pluginId: string,
    hookName: string,
    callback: HookCallback,
  ): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    this.hooks.get(hookName)?.push({ pluginId, callback });
  }

  /**
   * Execute all callbacks for a specific hook
   * @param hookName Hook name
   * @param args Arguments to pass to the hook callbacks
   * @returns Array of hook execution results
   */
  async executeHook(hookName: string, ...args: any[]): Promise<any[]> {
    const hookCallbacks = this.hooks.get(hookName) || [];

    if (hookCallbacks.length === 0) {
      return [];
    }

    const results = [];

    for (const { pluginId, callback } of hookCallbacks) {
      try {
        const result = await Promise.resolve(callback(...args));
        results.push({
          pluginId,
          result,
          success: true,
        });
      } catch (error) {
        console.error(
          `Error executing hook ${hookName} from plugin ${pluginId}:`,
          error,
        );
        results.push({
          pluginId,
          error,
          success: false,
        });
      }
    }

    return results;
  }

  /**
   * Clear hooks for a specific plugin
   * @param pluginId Plugin ID
   */
  clearPluginHooks(pluginId: string): void {
    this.hooks.forEach((hooks, hookName) => {
      const filteredHooks = hooks.filter((hook) => hook.pluginId !== pluginId);

      if (filteredHooks.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filteredHooks);
      }
    });
  }

  /**
   * Get all registered hook names
   * @returns Array of hook names
   */
  getHookNames(): string[] {
    return Array.from(this.hooks.keys());
  }
}
