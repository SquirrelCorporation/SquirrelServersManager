export interface ContainerCustomStack {
  uuid: string;
  name: string;
  description?: string;
  path?: string;
  yaml?: string;
  icon?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  lockJson?: boolean;
  type?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContainerCustomStackRepositoryEntity {
  _id?: string;
  uuid: string;
  name: string;
  url?: string;
  description?: string;
  matchesList?: string[];
  accessToken?: string;
  branch?: string;
  email?: string;
  userName?: string;
  remoteUrl?: string;
  gitService?: any;
  ignoreSSLErrors?: boolean;
  onError?: boolean;
  onErrorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
