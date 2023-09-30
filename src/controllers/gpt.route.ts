import { Request, Response } from 'express';
import { getAI } from "../modules/AI.js";
import { OpenAIApi } from "openai";
import { ObjectId } from 'mongodb';
import { createContecstMessage, Post_IU } from '../controllers/posts.route.js'

export const getGPTlistModel =  async (req:Request, res:Response) => {
    try {
        const openai:OpenAIApi = await getAI();
        const responce = await openai.listModels();
        return res.send(responce.data.data);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
}

export const getGPTChat = async (req:Request, res:Response) => {
    const last_user_msg = req.body.messages;
    // if (req.body.theme_id === undefined)
    const theme_id = req.body.theme_id;
    const model = req.body.model;
    const maxTokens = req.body.maxTokens || 60;
    console.log(last_user_msg);
    try {
        const openai:OpenAIApi = await getAI();
        /*
          формируем сообщение чату. 
          сперва указываес сообщение system - "ты гениальный программист с++" напримет
          сообщение хранится в themes.systm_msg
          потом добавляем всю истроию сообщений  для этой темы учитыва токены
          Вопрос от роли user
          Ответ от роли asystent
          и добваляем вопрос который пришол в messages
            messages=[
             {"role": "system", "content": "Вы дружелюбный ассистент."},
             {"role": "user", "content": "Привет, кто ты?"}
             {"role": "asystent", "content": "Я твой клон!"}
             {"role": "user", "content": "Можешь пойти поработать за меня?"}
           ]
        */ 
        let chatMes = await createContecstMessage(theme_id);
        chatMes.push(...last_user_msg);
        const response = await openai.createChatCompletion({
            model: model,
            messages: chatMes,
            max_tokens: maxTokens,
        });

        if (response.data) {
            //console.log(response.data);
            //запишем в базу ответ интелекта
            const new_post = {
                theme_id: new ObjectId(theme_id),
                user_msg: last_user_msg,
                asystens_msg: response.data.choices[0]
            };
            const uitems = Post_IU(new_post);
            //теперь бы уменьшить размер ответа, чтобы экономить токены.
            //доверим это интелекту

            res.send(response.data.choices[0]);
        } else {
            res.status(500).send("No response from GPT-AI");
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
}