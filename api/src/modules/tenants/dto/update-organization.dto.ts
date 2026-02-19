import { IsString, IsOptional, MaxLength, Matches } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Hospital São Lucas' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string

  @ApiPropertyOptional({ example: '12.345.678/0001-99' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ inválido' })
  cnpj?: string
}
