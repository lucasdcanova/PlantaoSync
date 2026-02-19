import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

export class InviteUserDto {
  @ApiProperty({ example: 'Dr. Ana Costa' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @ApiProperty({ example: 'ana@hospital.com.br' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string

  @ApiProperty({ enum: UserRole, example: UserRole.PROFESSIONAL })
  @IsEnum(UserRole)
  role: UserRole

  @ApiPropertyOptional({ example: 'Cardiologia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string

  @ApiPropertyOptional({ example: 'CRM/SP 123456' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  crm?: string

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  phone?: string
}
