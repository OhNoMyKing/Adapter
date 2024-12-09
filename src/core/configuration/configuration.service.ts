import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
export interface IEnvironments {
    port: number;
    nodeEnv: string;
    postgres: any;
    rabbitmq: any;
    redis: any;
    websocket: {
        port: number;
    };
}
export default () : IEnvironments => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV,
    postgres: {
        type: 'postgres',
        name: 'default',
        host: process.env['PG_HOST'] || 'localhost',
        port: Number(process.env['PG_PORT']),
        username: process.env['PG_USER'],
        password: process.env['PG_PASSWORD'],
        database: process.env['PG_DB'],
    },
    rabbitmq: {
        host: process.env['RABBITMQ_HOST'] || 'localhost',
        port: Number(process.env['RABBITMQ_PORT']) || 5672,
        user: process.env['RABBITMQ_USER'] || 'guest',
        password: process.env['RABBITMQ_PASSWORD'] || 'guest',
      },
    redis:{
        host: process.env['REDIS_HOST'],
        port: process.env['REDIS_PORT'],
    },
    websocket: {
        port: Number(process.env['WEBSOCKET_PORT']) || 3001,
      },
});
export type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never
        ? ''
        : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

export type LeafTypes<T, S extends string> = S extends `${infer T1}.${infer T2}`
  ? T1 extends keyof T
    ? LeafTypes<T[T1], T2>
    : never
  : S extends keyof T
    ? T[S]
    : never;
@Injectable()
export class ConfigurationService{
    constructor(private configService: ConfigService){}
    get<T extends Leaves<IEnvironments>>(
        propertyPath: T,
      ): LeafTypes<IEnvironments, T> {
        return this.configService.get(propertyPath);
      }
}