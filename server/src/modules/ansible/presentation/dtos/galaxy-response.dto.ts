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

export class CollectionDetailsResponseDto {
  id?: string;
  namespace!: string;
  name!: string;
  version!: string;
  description?: string;
  downloadCount?: number;
  created?: string;
  updated?: string;
  repository?: string;
  authors?: string[];
  tags?: string[];
  dependencies?: Record<string, string>;
  contents?: {
    name?: string;
    description?: string;
  }[];
  documentation?: string;
  homepage?: string;
  issues?: string;
  license?: string[];
  repositoryUrl?: string;
}
