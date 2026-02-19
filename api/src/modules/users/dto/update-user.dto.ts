import { PartialType } from '@nestjs/mapped-types'
import { InviteUserDto } from './invite-user.dto'

export class UpdateUserDto extends PartialType(InviteUserDto) {}
