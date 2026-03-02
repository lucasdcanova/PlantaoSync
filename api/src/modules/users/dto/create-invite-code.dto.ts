import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'

export class CreateInviteCodeDto {
  @ApiProperty({ example: 'UTI Adulto' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  sectorName: string

  @ApiPropertyOptional({ example: 14, default: 14, minimum: 1, maximum: 90 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  expirationDays?: number
}
