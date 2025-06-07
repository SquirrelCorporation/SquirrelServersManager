import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { API, Repositories, SsmGit } from 'ssm-shared-lib';

export class GitRepositoryDto implements API.GitPlaybooksRepository {
  @ApiProperty({ description: 'Name of the Git repository' })
  name!: string;

  @ApiProperty({ description: 'Access token for Git authentication' })
  accessToken!: string;

  @ApiProperty({ description: 'Branch to clone/pull from' })
  branch!: string;

  @ApiProperty({ description: 'Email associated with Git commits' })
  email!: string;

  @ApiProperty({ description: 'Username for Git operations' })
  userName!: string;

  @ApiProperty({ description: 'Remote URL of the Git repository' })
  remoteUrl!: string;

  @ApiPropertyOptional({
    description: 'List of directories to exclude from operations',
    type: [String],
    isArray: true,
  })
  directoryExclusionList?: string[];

  @ApiProperty({
    description: 'Git service provider',
    enum: SsmGit.Services,
  })
  gitService!: SsmGit.Services;

  @ApiPropertyOptional({
    description: 'List of vault IDs associated with this repository',
    type: [String],
    isArray: true,
  })
  vaults?: string[];

  @ApiProperty({
    description: 'Whether to ignore SSL certificate errors',
    default: false,
  })
  ignoreSSLErrors!: boolean;

  @ApiPropertyOptional({
    description: 'Directory where the repository is cloned',
  })
  directory?: string;

  @ApiPropertyOptional({
    description: 'Whether the repository is enabled',
    default: true,
  })
  enabled?: boolean;

  @ApiProperty({
    description: 'Unique identifier for the repository',
  })
  uuid!: string;

  @ApiProperty({
    description: 'Type of the repository',
    enum: Repositories.RepositoryType,
    default: Repositories.RepositoryType.GIT,
  })
  type!: Repositories.RepositoryType;

  @ApiProperty({
    description: 'Path to the repository on disk',
  })
  path!: string;

  @ApiProperty({
    description: 'Whether this is the default repository',
    default: false,
  })
  default!: boolean;

  @ApiPropertyOptional({
    description: 'Error flag for repository operations',
  })
  onError?: boolean;

  @ApiPropertyOptional({
    description: 'Error message for repository operations',
  })
  onErrorMessage?: string;
}

export class GitRepositoryResponseDto extends GitRepositoryDto {
  @ApiProperty({
    description: 'Access token (always redacted in responses)',
    default: 'REDACTED',
  })
  override accessToken: string = 'REDACTED';
}
