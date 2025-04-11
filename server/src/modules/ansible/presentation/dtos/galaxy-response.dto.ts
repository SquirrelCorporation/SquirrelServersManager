export class CollectionsResponseDto {
  id!: string;
  namespace!: string;
  name!: string;
  description?: string;
  downloadCount?: number;
  latestVersion?: string;
  created?: Date;
  updated?: Date;
}

export class CollectionsPaginatedResponseDto {
  data: CollectionsResponseDto[] = [];
  success: boolean = true;
  total: number = 0;
  pageSize: number = 0;
  current: number = 0;
}

export class InstalledCollectionResponseDto {
  namespace!: string;
  name!: string;
  version?: string;
  path?: string;
}
