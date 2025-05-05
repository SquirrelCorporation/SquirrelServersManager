import { SetMetadata } from '@nestjs/common';

// Decorator to skip rate limiting for specific routes
export const SkipThrottle = () => SetMetadata('skipThrottle', true);