import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserModel } from '../../users/interfaces/user';
import { sanitizeUserForJsonResponse } from '../utils/sanitize-user-for-json';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        // @InjectRepository(User) private userRepo: Repository<User>
    ) { }

    async validateUser(email: string, password: string) {
        const user: User = await this.usersService.findByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: _, ...result } = user;
        return sanitizeUserForJsonResponse(
            result as Record<string, unknown>,
        ) as unknown as User;
    }

    async login(user: UserModel) {
        const payload = {
            sub: user.id,
            email: user.email,
            // roles: user.roles.map(r => r.name),
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: sanitizeUserForJsonResponse(user as unknown as Record<string, unknown>),
        };
    }

    async checkStatus(user: UserModel){
        const id = user.id;

        const dbUser = await this.usersService.findOne(id);
        if (!dbUser) throw new UnauthorizedException();

        const payload = {sub: dbUser.id, email: dbUser.email}

        return {
            user: sanitizeUserForJsonResponse(dbUser as unknown as Record<string, unknown>),
            access_token: this.jwtService.sign(payload),
        }
    }

    // async login(user: UserModel) {
    //     const payload = { sub: user.id, email: user.email };
    //     return {
    //         access_token: this.jwtService.sign(payload),
    //     };
    // }

}
