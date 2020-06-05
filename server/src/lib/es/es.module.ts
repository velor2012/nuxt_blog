import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ESService } from './es.service';

@Module({
    imports: [
        ElasticsearchModule.registerAsync({
            useFactory: () => ({
                node:process.env.ES_NODE
            })
        })
    ],
    providers: [
        ESService
    ],
    exports: [
        ESService
    ]
})
export class ESModule { }