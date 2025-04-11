import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SftpSessionDto {
  @IsString()
  @IsNotEmpty()
  deviceUuid!: string;
}

export class SftpListDirectoryDto {
  @IsString()
  @IsNotEmpty()
  path!: string;
}

export class SftpDeleteDto {
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsBoolean()
  @IsNotEmpty()
  isDir!: boolean;
}

export class SftpRenameDto {
  @IsString()
  @IsNotEmpty()
  oldPath!: string;

  @IsString()
  @IsNotEmpty()
  newPath!: string;
}

export class SftpChmodDto {
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsNumber()
  @IsNotEmpty()
  mode!: number;
}

export class SftpMkdirDto {
  @IsString()
  @IsNotEmpty()
  path!: string;
}

export class SftpDownloadDto {
  @IsString()
  @IsNotEmpty()
  path!: string;
}
