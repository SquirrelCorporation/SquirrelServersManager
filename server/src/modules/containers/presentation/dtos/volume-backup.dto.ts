import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SsmContainer } from 'ssm-shared-lib';

export class BackupVolumeDto {
  @ApiProperty({
    description: 'Backup mode',
    enum: SsmContainer.VolumeBackupMode,
  })
  @IsEnum(SsmContainer.VolumeBackupMode)
  mode!: SsmContainer.VolumeBackupMode;
}

export class BackupVolumeResponseDto {
  @ApiProperty({ description: 'Full path to the backup file' })
  filePath!: string;

  @ApiProperty({ description: 'Name of the backup file' })
  fileName!: string;

  @ApiProperty({ description: 'Backup mode used' })
  mode!: string;
}
