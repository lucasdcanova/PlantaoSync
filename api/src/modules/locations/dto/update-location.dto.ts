import { PartialType } from '@nestjs/mapped-types'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { CreateLocationDto } from './create-location.dto'

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional({ example: true, description: 'Ativo/inativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
