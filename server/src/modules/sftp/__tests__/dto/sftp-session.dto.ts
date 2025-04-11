export class SftpSessionDto {
  deviceUuid!: string;
}

export class SftpListDirectoryDto {
  path!: string;
}

export class SftpMkdirDto {
  path!: string;
}

export class SftpRenameDto {
  oldPath!: string;
  newPath!: string;
}

export class SftpChmodDto {
  path!: string;
  mode!: number;
}

export class SftpDeleteDto {
  path!: string;
  isDir!: boolean;
}

export class SftpDownloadDto {
  path!: string;
}
