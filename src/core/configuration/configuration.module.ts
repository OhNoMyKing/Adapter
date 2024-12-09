import { Global, Module } from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import configuration ,{ConfigurationService} from "./configuration.service";
@Global()
@Module({
    imports:[
        ConfigModule.forRoot({
            load: [configuration],
        })
    ],
    providers:[ConfigurationService],
    exports:[ConfigurationService]
})
export class ConfigurationModule{}