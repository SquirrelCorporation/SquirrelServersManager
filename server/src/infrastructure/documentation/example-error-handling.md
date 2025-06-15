# Error Handling Examples

This document provides examples for using the standardized error handling system.

## Using the New Exception Classes

### In a Controller

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { EntityNotFoundException } from '../../infrastructure/exceptions';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const device = await this.devicesService.findById(id);
    
    if (!device) {
      throw new EntityNotFoundException('Device', id);
    }
    
    return device;
  }
}
```

### In a Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '../../infrastructure/exceptions';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async updateUser(id: string, updateData: UpdateUserDto) {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestException('Update data cannot be empty');
    }
    
    const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }
}
```

## Using ExceptionFactory for Legacy Code

```typescript
import { Injectable } from '@nestjs/common';
import { ExceptionFactory } from '../../infrastructure/exceptions';
import { ApiError, ErrorType } from '../../middlewares/api/ApiError';

@Injectable()
export class LegacyService {
  async performOperation() {
    try {
      // Legacy code that might throw ApiError
      const result = await this.legacyOperation();
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        // Convert ApiError to standardized exception
        throw ExceptionFactory.fromApiError(error);
      }
      
      // Rethrow other errors
      throw error;
    }
  }
  
  private async legacyOperation() {
    // This might throw an ApiError
    throw new ApiError(ErrorType.NOT_FOUND, 'Resource not found');
  }
}
```

## Handling Validation Errors

```typescript
import { Injectable } from '@nestjs/common';
import { ValidationException } from '../../infrastructure/exceptions';

@Injectable()
export class ValidationService {
  validate(data: any): void {
    const errors: Record<string, string[]> = {};
    
    // Example validation logic
    if (!data.name) {
      errors.name = ['Name is required'];
    }
    
    if (!data.email) {
      errors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = ['Invalid email format'];
    }
    
    // If there are validation errors, throw a ValidationException
    if (Object.keys(errors).length > 0) {
      throw new ValidationException('Validation failed', errors);
    }
  }
}
```

## Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "123",
    "name": "Device 1",
    "status": "online"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Device with ID 123 not found",
  "error": "EntityNotFoundException",
  "statusCode": 404,
  "timestamp": "2023-06-15T12:34:56.789Z",
  "path": "/api/devices/123",
  "data": {
    "entityName": "Device",
    "identifier": "123"
  }
}
```