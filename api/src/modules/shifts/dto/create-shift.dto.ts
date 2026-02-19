import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  IsNumberString,
  MaxLength,
  Matches,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateShiftDto {
  @ApiProperty({ example: 'clx1abc123def456' })
  @IsString()
  scheduleId: string

  @ApiProperty({ example: 'clx1abc123def456' })
  @IsString()
  locationId: string

  @ApiProperty({ example: '2025-03-15' })
  @IsDateString()
  date: string

  @ApiProperty({ example: '07:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime deve estar no formato HH:mm' })
  startTime: string

  @ApiProperty({ example: '19:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime deve estar no formato HH:mm' })
  endTime: string

  @ApiPropertyOptional({ example: 'Cardiologia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string

  @ApiPropertyOptional({ example: 2, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requiredCount?: number = 1

  @ApiProperty({ example: '850.00' })
  @IsNumberString({}, { message: 'valuePerShift deve ser um valor numérico' })
  valuePerShift: string

  @ApiPropertyOptional({ example: 'Plantão de 12h, incluindo período noturno' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}
