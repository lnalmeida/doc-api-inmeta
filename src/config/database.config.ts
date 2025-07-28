import { registerAs } from "@nestjs/config"
import {config} from 'dotenv';

config({path:'../../.env'});

export const databaseConfig = registerAs('database', () => {
    const env = process.env.NODE_ENV || 'dev';
    let url: string;

    switch(env) {
        case "test":
            url = process.env.TEST_DATABASE_URL!;
            break;

        case "dev":
        default:
            url = process.env.DATABASE_URL!;
            break;
    };

    if(!url) {
        throw new Error(`DATABASE_URL para o ambiente ${env} não definida.`);
    };

    return {
        url,
    };
});