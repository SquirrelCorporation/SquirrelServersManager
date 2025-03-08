import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InstallCollectionDto {
  @IsNotEmpty()
  @IsString()
  namespace!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  version?: string;
}

export class CollectionQueryDto {
  @IsNotEmpty()
  @IsString()
  query!: string;
}