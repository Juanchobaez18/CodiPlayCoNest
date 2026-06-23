import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Modules } from '../../../auth/decorators/modules.decorator';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos/user.dto';
import { UsersService } from '../../../users/services/users/users.service';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';

const avatarStorage = diskStorage({
    destination: './uploads/avatars',
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
});

const avatarFilter = (_req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExts = /\.(jpg|jpeg|png|webp)$/i;
    if (!allowedMimes.includes(file.mimetype) || !allowedExts.test(extname(file.originalname))) {
        return cb(new BadRequestException('Only jpg, jpeg, png, webp files are allowed'), false);
    }
    cb(null, true);
};

@ApiBearerAuth()
//@Modules('users')
//@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService){}

    @Get()
    getUsers() {
        return this.usersService.findAll();
    }

    @Get(':userId')
    getOne(@Param('userId', ParseIntPipe) userId: number){
        return this.usersService.findOne(userId);
    }

    @Post()
    createUser(@Body() payload: CreateUserDto){
        return this.usersService.create(payload);
    }

    @Put(':userId')
    updateUser(@Param('userId', ParseIntPipe) userId: number, @Body() payloadUpdated: UpdateUserDto){
        return this.usersService.updateUser(userId, payloadUpdated);
    }

    @Delete(':userId')
    deleteUser(@Param('userId', ParseIntPipe) userId: number){
        this.usersService.deleteUser(userId);
    }

    @Patch(':userId/avatar')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(FileInterceptor('avatar', { storage: avatarStorage, fileFilter: avatarFilter, limits: { fileSize: 2 * 1024 * 1024 } }))
    uploadAvatar(
        @Param('userId', ParseIntPipe) userId: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('No file uploaded');
        return this.usersService.updateAvatar(userId, `uploads/avatars/${file.filename}`);
    }

}
