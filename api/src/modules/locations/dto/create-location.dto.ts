import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateLocationDto {
  @ApiProperty({ example: 'UTI Adulto - Bloco B' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string

  @ApiPropertyOptional({ example: 'Rua das Flores, 100' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string

  @ApiPropertyOptional({ example: '01310-100' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido' })
  zipCode?: string
}
