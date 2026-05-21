import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Modules } from '../../auth/decorators/modules.decorator';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { CreateForumDto, UpdateForumDto } from '../dtos/forum.dto';
import { ForumService } from '../services/forum.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';

@ApiBearerAuth()
@Modules('foros')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('foros')
export class ForumController {

    constructor(private forumService: ForumService){}

    @Get()
    getForums() {
        return this.forumService.findAll();
    }

    @Get(':forumId')
    getOne(@Param('forumId', ParseIntPipe) forumId: number){
        return this.forumService.findOne(forumId);
    }

    @Post()
    createForum(@Body() payload: CreateForumDto){
        return this.forumService.create(payload);
    }

    @Put(':forumId')
    updateForum(@Param('forumId', ParseIntPipe) forumId: number, @Body() payloadUpdated: UpdateForumDto){
        return this.forumService.update(forumId, payloadUpdated);
    }

    @Delete(':forumId')
    deleteForum(@Param('forumId', ParseIntPipe) forumId: number){
        return this.forumService.delete(forumId);
    }

}
