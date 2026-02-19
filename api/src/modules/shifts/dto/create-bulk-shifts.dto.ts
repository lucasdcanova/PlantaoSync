import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { CreateShiftDto } from './create-shift.dto'

export class CreateBulkShiftsDto {
  @ApiProperty({ type: [CreateShiftDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Informe ao menos um plantão' })
  @ValidateNested({ each: true })
  @Type(() => CreateShiftDto)
  shifts: CreateShiftDto[]
}
