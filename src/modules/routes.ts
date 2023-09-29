
import { Router } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { Configuration, OpenAIApi } from "openai";
import { getDBRoute } from '../controllers/caseController.js'
import { getGPTlistModel, getGPTChat } from '../controllers/gpt.route.js'

const routes = Router();
dotenv.config();

routes.get('/', (req, res) => {
    return res.json({ message: 'Hello World!!!' });
});

routes.get('/api/list_model', getGPTlistModel);

routes.post('/api/gpt', getGPTChat);

routes.post('/db/query', getDBRoute());

export default routes;