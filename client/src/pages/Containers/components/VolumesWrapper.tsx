import React from 'react';
import { useFeatureFlag } from '@shared/lib/feature-flags';
import { useFSDInitialized } from '@app/providers/FSDProvider';
import { VolumesPage } from '@features/container-volumes';
import LegacyVolumes from './Volumes'; // The existing Volumes component

/**
 * Wrapper component that switches between legacy and FSD Volumes implementation
 * based on feature flag configuration
 */
export const VolumesWrapper: React.FC = () => {
  const fsdEnabled = useFeatureFlag('containerVolumesFSD');
  const fsdInitialized = useFSDInitialized();

  // Use FSD implementation if flag is enabled and services are initialized
  if (fsdEnabled && fsdInitialized) {
    return (
      <div>
        {/* Development indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: '#52c41a',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            zIndex: 9999,
            opacity: 0.8,
          }}>
            FSD Volumes ✓
          </div>
        )}
        <VolumesPage />
      </div>
    );
  }

  // Fallback to legacy implementation
  return (
    <div>
      {/* Development indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: '#faad14',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          zIndex: 9999,
          opacity: 0.8,
        }}>
          Legacy Volumes
        </div>
      )}
      <LegacyVolumes />
    </div>
  );
};

export default VolumesWrapper;