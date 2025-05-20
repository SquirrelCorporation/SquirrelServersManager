import { Alert, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assuming react-router v6+
import { usePlugins } from '../contexts/plugin-context';

const PluginPageRenderer: React.FC = () => {
  const { pluginId } = useParams<{ pluginId: string }>(); // Get pluginId from URL
  const {
    pluginMetadata,
    loadRemoteComponentFromPlugin,
    loading: contextLoading,
  } = usePlugins();
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadComponent = async () => {
      if (contextLoading || !pluginId) {
        // Wait for plugin context to finish loading or if pluginId is missing
        return;
      }

      setIsLoading(true);
      setError(null);
      setComponent(null);

      const metadata = pluginMetadata.find((m) => m.id === pluginId);

      if (!metadata) {
        setError(`Plugin with ID "${pluginId}" not found.`);
        setIsLoading(false);
        return;
      }

      if (
        !metadata.client?.hasDedicatedPage ||
        !metadata.client?.exposedModule
      ) {
        setError(
          `Plugin "${pluginId}" is not configured to have a dedicated page.`,
        );
        setIsLoading(false);
        return;
      }

      try {
        console.log(
          `Loading component for dedicated page: ${pluginId} -> ${metadata.client.exposedModule}`,
        );
        const LoadedComponent = await loadRemoteComponentFromPlugin(
          pluginId,
          metadata.client.exposedModule,
        );
        setComponent(() => LoadedComponent); // Use function update for state based on async result
      } catch (err: any) {
        console.error(`Error loading component for plugin ${pluginId}:`, err);
        setError(
          `Failed to load component for plugin "${pluginId}": ${err.message || 'Unknown error'}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [pluginId, pluginMetadata, loadRemoteComponentFromPlugin, contextLoading]); // Rerun if these change

  if (isLoading || contextLoading) {
    return (
      <Spin
        size="large"
        tip="Loading Plugin..."
        style={{ display: 'block', marginTop: '50px' }}
      />
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Plugin Page"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (Component) {
    // Render the loaded component
    return <Component />;
  }

  // Should not happen if logic is correct, but provides a fallback
  return (
    <Alert
      message="Plugin component not available."
      type="warning"
      showIcon
      style={{ margin: '20px' }}
    />
  );
};

export default PluginPageRenderer;
