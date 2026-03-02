import {
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  IsEnum,
  Matches,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsNumber,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ScheduleCoverageMode } from '@prisma/client'

export class CreateScheduleDto {
  @ApiProperty({ example: 'clx1abc123def456' })
  @IsString()
  locationId: string

  @ApiProperty({ example: 'Escala Março 2025 - UTI' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string

  @ApiPropertyOptional({ example: 'Escala mensal de plantões da UTI Adulto' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @ApiProperty({ example: '2025-03-01' })
  @IsDateString()
  startDate: string

  @ApiPropertyOptional({ example: '2025-03-31', description: 'Opcional para escala aberta' })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({ enum: ScheduleCoverageMode, default: ScheduleCoverageMode.FULL_DAY })
  @IsOptional()
  @IsEnum(ScheduleCoverageMode)
  coverageMode?: ScheduleCoverageMode

  @ApiPropertyOptional({ example: '07:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'coverageStartTime inválido (HH:mm)' })
  coverageStartTime?: string

  @ApiPropertyOptional({ example: '19:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'coverageEndTime inválido (HH:mm)' })
  coverageEndTime?: string

  @ApiPropertyOptional({ example: 12, minimum: 1, maximum: 24 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  shiftDurationHours?: number

  @ApiPropertyOptional({ example: 2, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  professionalsPerShift?: number

  @ApiPropertyOptional({ example: 145000, description: 'Valor por plantão em centavos' })
  @IsOptional()
  @IsInt()
  @Min(1)
  shiftValue?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  requireSwapApproval?: boolean

  @ApiPropertyOptional({ example: -23.561414 })
  @IsOptional()
  @IsNumber()
  geofenceLat?: number

  @ApiPropertyOptional({ example: -46.655881 })
  @IsOptional()
  @IsNumber()
  geofenceLng?: number

  @ApiPropertyOptional({ example: 180, minimum: 30 })
  @IsOptional()
  @IsInt()
  @Min(30)
  geofenceRadiusMeters?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  geofenceAutoCheckInEnabled?: boolean

  @ApiPropertyOptional({ example: 'UTI Adulto · Bloco A' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  geofenceLabel?: string
}
