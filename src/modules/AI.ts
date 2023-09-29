import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from "openai";
import * as Sentry from '@sentry/node';

dotenv.config();
let openai: OpenAIApi;

export const getAI = async () => {
    if (openai) {
        return openai;
    }
    try {
        const APIKEY = process.env.APIKEY;
        const configuration = new Configuration({
            apiKey: APIKEY,
        });
        openai = new OpenAIApi(configuration);
    } catch (err) {
        Sentry.captureException(err);
    }
    return openai;
};
