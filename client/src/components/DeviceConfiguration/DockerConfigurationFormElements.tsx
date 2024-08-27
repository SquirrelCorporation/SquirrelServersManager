import AdvancedSwitch from '@/components/DeviceConfiguration/AdvancedSwitch';
import DockerAdvancedConnectionCard from '@/components/DeviceConfiguration/docker/DockerAdvancedConnectionCard';
import DockerEngineHostCard from '@/components/DeviceConfiguration/docker/DockerEngineHostCard';
import DockerWatchCard from '@/components/DeviceConfiguration/docker/DockerWatchCard';
import DockerWatcherCronsCard from '@/components/DeviceConfiguration/docker/DockerWatcherCronsCard';
import { ProFormInstance } from '@ant-design/pro-components';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import 'react-js-cron/dist/styles.css';
import { API } from 'ssm-shared-lib';

export type DockerConfigurationFormElementsProps = {
  device: Partial<API.DeviceItem>;
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
};

export const DockerConfigurationFormElements: React.FC<
  DockerConfigurationFormElementsProps
> = ({ device, formRef }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const toggleShowAdvanced = () => setShowAdvanced(!showAdvanced);

  return (
    <>
      <DockerWatchCard device={device} />
      <DockerEngineHostCard
        device={device}
        showAdvanced={showAdvanced}
        formRef={formRef}
      />
      <DockerWatcherCronsCard device={device} />
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: showAdvanced ? 1 : 0,
              height: showAdvanced ? 'auto' : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <DockerAdvancedConnectionCard />{' '}
          </motion.div>
        )}
      </AnimatePresence>
      <AdvancedSwitch
        showAdvanced={showAdvanced}
        toggleShowAdvanced={toggleShowAdvanced}
      />
    </>
  );
};
