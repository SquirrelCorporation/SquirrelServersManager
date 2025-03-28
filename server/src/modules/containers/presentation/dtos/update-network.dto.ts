import { PartialType } from '@nestjs/mapped-types';
import { CreateNetworkDto } from './create-network.dto';

/**
 * DTO for updating a container network
 * Extends CreateNetworkDto but makes all fields optional
 */
export class UpdateNetworkDto extends PartialType(CreateNetworkDto) {}
