import { Module } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';

/**
 * Module responsible for application bootstrap logic.
 */
@Module({
  providers: [BootstrapService],
  exports: [BootstrapService], // Export if needed by other modules, otherwise optional
})
export class BootstrapModule {}
