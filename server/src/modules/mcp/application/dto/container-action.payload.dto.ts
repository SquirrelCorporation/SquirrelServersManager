import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ContainerAction {
  START = 'start',
  STOP = 'stop',
  RESTART = 'restart',
  PAUSE = 'pause',
  KILL = 'kill',
}

export class ContainerActionPayloadDto {
  @ApiProperty({
    description: 'The ID or name of the container to perform action on',
    example: 'nginx-proxy',
  })
  @IsString()
  @IsNotEmpty()
  containerId!: string;

  @ApiProperty({
    description: 'The action to perform on the container',
    enum: ContainerAction,
    example: ContainerAction.RESTART,
  })
  @IsEnum(ContainerAction)
  @IsNotEmpty()
  action!: ContainerAction;
}
