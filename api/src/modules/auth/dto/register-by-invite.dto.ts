import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class RegisterByInviteDto {
  @ApiProperty({ example: 'SG-UTI-2026-ALFA' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  inviteCode: string

  @ApiProperty({ example: 'Dra. Ana Costa' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string

  @ApiProperty({ example: 'ana.costa@hospital.com.br' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string

  @ApiProperty({ example: '(11) 99999-9999' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  @Matches(/^[\d()\-\s+]+$/, { message: 'Formato de celular inválido' })
  phone: string

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({ example: 'CRM-SP 123456' })
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  crm: string

  @ApiProperty({ example: 'Medicina Intensiva' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  specialty: string
}
