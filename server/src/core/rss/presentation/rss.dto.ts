import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsUrl, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class FeedConfigDto {
  @ApiProperty({ description: 'Unique identifier for the feed' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Display name for the feed' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'RSS feed URL' })
  @IsUrl()
  url!: string;

  @ApiProperty({ description: 'Whether the feed is enabled' })
  @IsBoolean()
  enabled!: boolean;
}

export class FetchFeedsDto {
  @ApiProperty({ 
    description: 'Array of feed configurations',
    type: [FeedConfigDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedConfigDto)
  feeds!: FeedConfigDto[];
}

export class RSSFeedItemDto {
  @ApiProperty({ description: 'Item title' })
  title!: string;

  @ApiProperty({ description: 'Item link' })
  link!: string;

  @ApiProperty({ description: 'Item description' })
  description!: string;

  @ApiProperty({ description: 'Publication date' })
  pubDate!: string;

  @ApiProperty({ description: 'Source feed name' })
  source!: string;

  @ApiProperty({ description: 'Unique identifier', required: false })
  @IsOptional()
  guid?: string;

  @ApiProperty({ description: 'Author name', required: false })
  @IsOptional()
  author?: string;

  @ApiProperty({ description: 'Categories', required: false })
  @IsOptional()
  category?: string[];
}