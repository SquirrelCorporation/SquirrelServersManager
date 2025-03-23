import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class InstallCollectionDto {
  @IsNotEmpty()
  @IsString()
  namespace!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class CollectionsQueryDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  namespace?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsNumber()
  current: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsNumber()
  pageSize: number = 9;

  @IsOptional()
  @IsString()
  sorter?: string;

  @IsOptional()
  filter?: any;
}
export class CollectionQueryDto {
  @IsString()
  namespace!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  version?: string;
}
