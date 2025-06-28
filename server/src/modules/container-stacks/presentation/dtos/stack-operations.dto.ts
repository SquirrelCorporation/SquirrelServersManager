import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class DeployStackDto {
  @ApiProperty({ description: 'Target device for deployment' })
  @IsString()
  @IsNotEmpty()
  target!: string;
}

export class TransformStackDto {
  @ApiProperty({ description: 'Stack content to transform' })
  @IsObject()
  @IsNotEmpty()
  content!: any;
}

export class DryRunStackDto {
  @ApiProperty({ description: 'JSON representation of the stack' })
  @IsObject()
  @IsNotEmpty()
  json!: any;

  @ApiProperty({ description: 'YAML representation of the stack' })
  @IsString()
  @IsNotEmpty()
  yaml!: string;
}

export class CreateStackDto {
  @ApiProperty({ description: 'Stack name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Stack content' })
  @IsObject()
  @IsNotEmpty()
  content!: any;

  @ApiProperty({ description: 'Stack description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateStackDto {
  @ApiProperty({ description: 'Stack name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Stack content', required: false })
  @IsOptional()
  @IsObject()
  content?: any;

  @ApiProperty({ description: 'Stack description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class DeployStackResponseDto {
  @ApiProperty({ description: 'Execution ID for the deployment' })
  execId!: string;
}

export class TransformStackResponseDto {
  @ApiProperty({ description: 'Transformed YAML content' })
  yaml!: string;
}

export class DryRunStackResponseDto {
  @ApiProperty({ description: 'Whether the stack is valid' })
  validating!: boolean;

  @ApiProperty({ description: 'Validation message if there are issues', required: false })
  message?: string;
}
