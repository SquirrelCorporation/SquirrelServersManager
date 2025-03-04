import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SsmGit } from 'ssm-shared-lib';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { ContainerStacksService } from '../services/container-stacks.service';
import { ContainerCustomStacksRepositoryRepository } from '../repositories/container-custom-stacks-repository.repository';

@Controller('container-stacks-repository')
@UseGuards(JwtAuthGuard)
export class ContainerStacksController {
  constructor(
    private readonly containerStacksService: ContainerStacksService,
    private readonly containerCustomStacksRepositoryRepository: ContainerCustomStacksRepositoryRepository,
  ) {}

  @Get()
  async getAllRepositories() {
    try {
      return await this.containerCustomStacksRepositoryRepository.findAllActive();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to get repositories: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':uuid')
  async getRepositoryByUuid(@Param('uuid') uuid: string) {
    try {
      const repository = await this.containerCustomStacksRepositoryRepository.findOneByUuid(uuid);
      if (!repository) {
        throw new HttpException(`Repository with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }
      return repository;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to get repository: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async addRepository(
    @Body()
    body: {
      name: string;
      accessToken: string;
      branch: string;
      email: string;
      userName: string;
      remoteUrl: string;
      gitService: SsmGit.Services;
      matchesList?: string[];
      ignoreSSLErrors?: boolean;
    },
  ) {
    try {
      await this.containerStacksService.addGitRepository(
        body.name,
        body.accessToken,
        body.branch,
        body.email,
        body.userName,
        body.remoteUrl,
        body.gitService,
        body.matchesList,
        body.ignoreSSLErrors,
      );
      return { success: true, message: 'Repository added successfully' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to add repository: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':uuid')
  async updateRepository(
    @Param('uuid') uuid: string,
    @Body()
    body: {
      name: string;
      accessToken: string;
      branch: string;
      email: string;
      userName: string;
      remoteUrl: string;
      gitService: SsmGit.Services;
      matchesList?: string[];
      ignoreSSLErrors?: boolean;
    },
  ) {
    try {
      await this.containerStacksService.updateGitRepository(
        uuid,
        body.name,
        body.accessToken,
        body.branch,
        body.email,
        body.userName,
        body.remoteUrl,
        body.gitService,
        body.matchesList,
        body.ignoreSSLErrors,
      );
      return { success: true, message: 'Repository updated successfully' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to update repository: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':uuid')
  async deleteRepository(@Param('uuid') uuid: string) {
    try {
      const repository = await this.containerCustomStacksRepositoryRepository.findOneByUuid(uuid);
      if (!repository) {
        throw new HttpException(`Repository with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }
      await this.containerStacksService.deleteRepository(repository);
      return { success: true, message: 'Repository deleted successfully' };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to delete repository: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':uuid/reset-error')
  async resetRepositoryError(@Param('uuid') uuid: string) {
    try {
      await this.containerStacksService.resetRepositoryError(uuid);
      return { success: true, message: 'Repository error reset successfully' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to reset repository error: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}