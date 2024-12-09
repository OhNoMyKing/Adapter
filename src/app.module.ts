import { Logger, Module } from '@nestjs/common';
import { ConfigurationModule } from './core/configuration/configuration.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigurationService } from './core/configuration/configuration.service';
import { EventsModule } from './resources/websocket/socket.module';
import { RabbitMQModule } from './resources/rabbitmq/rabbit.module';

@Module({
  imports: [
    ConfigurationModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService): TypeOrmModuleOptions => {
        const postgresConfig: TypeOrmModuleOptions = {
          type: 'postgres',  // Đảm bảo rằng 'postgres' là kiểu hợp lệ
          host: configService.get('postgres.host') as string,
          port: configService.get('postgres.port') as number,
          username: configService.get('postgres.username') as string,
          password: configService.get('postgres.password') as string,
          database: configService.get('postgres.database') as string,
          entities: [__dirname + '/../**/*.entity.js'],
          synchronize: configService.get('nodeEnv') === 'development',
          autoLoadEntities: true,  // Thêm `autoLoadEntities` để tự động load entities
        };

        // Log cấu hình PostgreSQL để kiểm tra
        Logger.log('Postgres Configuration:', JSON.stringify(postgresConfig));

        return postgresConfig;
      },
    }),
    EventsModule,
    RabbitMQModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
