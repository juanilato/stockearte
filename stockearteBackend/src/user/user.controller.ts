import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Create user
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    
    // Generar token JWT
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  // Get all users
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Get one user by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // Change password from user by user id
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  // Delete user by user id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
