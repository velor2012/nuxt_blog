import { Module } from "@nestjs/common";
import { TypegooseModule } from "nestjs-typegoose";
let my_module = TypegooseModule.forRootAsync(
    {
        useFactory() { 
            return {
                uri: process.env.DB,
                useNewUrlParser: true,
                useFindAndModify: false,
                useCreateIndex: true,
                useUnifiedTopology: true,
            }
        
    }}

);

@Module({
    imports: [my_module],
    exports: [my_module],
})
export class DbModule {}
