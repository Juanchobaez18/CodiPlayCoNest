import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() body: LoginDto) {
        const user = await this.authService.validateUser(
            body.email,
            body.password,
        );
        return this.authService.login(user);
    }

    @Get('check-status')
    @UseGuards(JwtAuthGuard) // Usa el guard de JWT que ya configuraste
    checkStatus(@Request() req) {
    // req.user viene del Payload del JWT
    return this.authService.checkStatus(req.user); 
    }
}