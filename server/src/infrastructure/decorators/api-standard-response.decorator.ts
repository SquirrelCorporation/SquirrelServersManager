import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class StandardResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean = true;

  @ApiProperty({ example: 'Operation successful' })
  message: string = 'Operation successful';

  @ApiProperty()
  data: T;

  constructor(data: T, success: boolean = true) {
    this.data = data;
    this.success = success;
    // For successful operations, we always use "Operation successful"
    this.message = success ? 'Operation successful' : 'Operation failed';
  }
}

export const ApiStandardResponse = <TModel extends Type<any>>(
  model?: TModel,
  description = 'Successful operation',
) => {
  if (!model) {
    return applyDecorators(
      ApiOkResponse({
        description,
        schema: {
          $ref: getSchemaPath(StandardResponseDto),
        },
      }),
      ApiExtraModels(StandardResponseDto),
    );
  }

  return applyDecorators(
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponseDto) },
          {
            properties: {
              data: model
                ? {
                    $ref: getSchemaPath(model),
                  }
                : {
                    type: 'object',
                  },
            },
          },
        ],
      },
    }),
    ApiExtraModels(StandardResponseDto, model),
  );
};
