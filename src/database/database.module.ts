import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import config from '../config';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [config.KEY],
            useFactory: (configType: ConfigType<typeof config>) => {
                const { user, host, name, password, port } = configType.dataBase;
                return {
                    type: 'postgres',
                    host,
                    port,
                    username: user,
                    password,
                    database: name,
                    synchronize: false,
                    autoLoadEntities: true,
                };
            },
        }),
    ],
    providers: [],
    exports: [TypeOrmModule]
})
export class DatabaseModule { }
