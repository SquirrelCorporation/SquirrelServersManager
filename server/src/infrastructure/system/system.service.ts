import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as fs from 'fs-extra';
import { RestartServerEvent } from '../../core/events/restart-server.event';
import Events from '../../core/events/events';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);
  private isRestartScheduled = false; // Prevent multiple concurrent restarts

  // Listen for the restart event
  @OnEvent(Events.SERVER_RESTART_REQUEST)
  handleRestartRequest(_payload: RestartServerEvent) {
    this.logger.log('Received server.restart.request event');
    this.scheduleRestart();
  }

  /**
   * Schedules the server process to exit gracefully after a delay,
   * attempting to trigger a development restart if applicable.
   * @param delayMs Delay in milliseconds before exiting (default: 3000)
   */
  scheduleRestart(delayMs: number = 3000): void {
    if (this.isRestartScheduled) {
      this.logger.warn('Restart already scheduled, ignoring duplicate request.');
      return;
    }
    this.isRestartScheduled = true;
    this.logger.log(`Scheduling server restart in ${delayMs}ms...`);

    setTimeout(() => {
      this.logger.log('Executing scheduled restart logic...');

      // Touch main.ts ONLY in development to trigger nodemon restart
      if (process.env.NODE_ENV === 'development') {
        this.logger.log('Development environment detected. Touching main.ts for nodemon...');
        try {
          // Adjust path calculation if necessary based on compiled output structure
          const mainPath = path.resolve(__dirname, '../../main.ts'); // Assumes dist/main.ts relative to dist/src/infrastructure/system/system.service.js
          this.logger.debug(`Attempting to touch: ${mainPath}`);
          const time = new Date();
          fs.utimesSync(mainPath, time, time);
          this.logger.log('Successfully touched main.ts');
        } catch (touchError) {
          const errorMessage =
            touchError instanceof Error ? touchError.message : String(touchError);
          this.logger.warn(`Could not touch main.ts to trigger nodemon restart: ${errorMessage}`);
          // Continue to exit anyway
        }
      } else {
        this.logger.log(
          'Non-development environment. Relying on container/process manager restart policy.',
        );
      }

      this.logger.log('Exiting process gracefully NOW to allow restart.');
      process.exit(0); // Exit with success code
    }, delayMs);
  }
}
