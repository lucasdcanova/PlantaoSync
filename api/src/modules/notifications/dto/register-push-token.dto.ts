import { IsString, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Platform } from '@prisma/client'

export class RegisterPushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
  @IsString()
  token: string

  @ApiProperty({ enum: Platform, example: Platform.IOS })
  @IsEnum(Platform)
  platform: Platform
}
