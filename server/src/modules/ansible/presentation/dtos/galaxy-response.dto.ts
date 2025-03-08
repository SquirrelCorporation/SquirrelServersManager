export class CollectionResponseDto {
  id!: string;
  namespace!: string;
  name!: string;
  description?: string;
  downloadCount?: number;
  latestVersion?: string;
  created?: Date;
  updated?: Date;
}

export class InstalledCollectionResponseDto {
  namespace!: string;
  name!: string;
  version?: string;
  path?: string;
}

export class CollectionInstallResponseDto {
  success!: boolean;
  message!: string;
  collection?: {
    namespace: string;
    name: string;
    version?: string;
  };
}