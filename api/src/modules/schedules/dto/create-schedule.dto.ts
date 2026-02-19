import { IsString, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

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

  @ApiProperty({ example: '2025-03-31' })
  @IsDateString()
  endDate: string
}
