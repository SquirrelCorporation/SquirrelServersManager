import { IsISO8601, IsNumber } from 'class-validator';

export class TimeseriesDataPointDto {
  @IsISO8601()
  timestamp!: string;

  @IsNumber()
  value!: number;
}
