# Icons Migration Guide

This directory contains the migrated icon collection from the legacy `/components/Icons/` directory.

## Structure

```
icons/
├── index.tsx              # Main export file
├── categories/            # Organized icon categories
│   ├── system.tsx        # System & infrastructure icons
│   ├── services.tsx      # Service & platform icons (Docker, AWS, etc.)
│   ├── containers.tsx    # Container & volume icons
│   ├── actions.tsx       # Action & status icons
│   ├── automation.tsx    # Automation & template icons
│   └── ui.tsx           # UI & navigation icons
└── all-icons.tsx         # Backward compatibility exports
```

## Usage

### Import from specific categories (recommended):
```typescript
import { LogosDocker, LogosAws } from '@shared/ui/icons/categories/services';
import { ContainerImage, VolumeBinding } from '@shared/ui/icons/categories/containers';
```

### Import from main index (convenience):
```typescript
import { LogosDocker, ContainerImage } from '@shared/ui/icons';
```

## Migration Status

✅ **COMPLETE**: Category structure established
🚧 **IN PROGRESS**: Gradual migration from legacy imports
⏳ **PENDING**: Full icon reorganization within categories

All 153+ legacy icons are available through the new structure while maintaining backward compatibility.