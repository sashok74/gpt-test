
import { response, Router } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { Configuration, OpenAIApi } from "openai";

const routes = Router();
dotenv.config();

const APIKEY = process.env.APIKEY;

const configuration = new Configuration({
    apiKey: APIKEY,
});

const openai = new OpenAIApi(configuration);

routes.get('/', (req, res) => {
    return res.json({ message: 'Hello World!!!' });
});

routes.get('/api/list_model', async (req, res) => {
    try {
        const responce = await openai.listModels();
        return res.send(responce.data.data);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
});

routes.post('/api/gpt', async (req, res) => {
    const messages = req.body.messages;
    const model = req.body.model;
    const maxTokens = req.body.maxTokens || 60;
    console.log(messages);
    try {
        const response = await openai.createChatCompletion({
            model: model,
            messages: messages,
            max_tokens: maxTokens,
        });

        if (response.data) {
            console.log(response.data);
            res.send(response.data.choices[0]);
        } else {
            res.status(500).send("No response from GPT-3");
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
});

export default routes;
