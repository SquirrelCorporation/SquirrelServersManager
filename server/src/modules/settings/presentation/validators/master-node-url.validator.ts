import { ValidationPipe } from '@nestjs/common';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class MasterNodeUrlBodyDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl({ require_tld: false })
  value!: string;
}

export const MasterNodeUrlValidator = new ValidationPipe({
  transform: true,
  whitelist: true,
});
