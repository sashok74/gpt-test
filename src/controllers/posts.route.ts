import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { loadDB } from '../modules/db.js';
import { Tposts, Tthemes } from '../types/chatDB.js';
import { getSystemMessage } from './themes.route.js'

export async function allPosts(req: Request, res: Response) {
    const prm: Tposts = req.body.prm;
    try {
        let db = await loadDB();
        const items: Tposts[] = await db.collection<Tposts>('posts').find(
            {
                "theme_id": new ObjectId(prm.theme_id)
            }
        ).sort({ created_at: -1 }).toArray();
        res.send(items);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
};

export async function createContecstMessage(theme_id: ObjectId): Promise<any> {
    try {
        let db = await loadDB();
        const items: Tposts[] = await db.collection<Tposts>('posts').find(
            {
                "theme_id": new ObjectId(theme_id)
            }
        ).sort({ created_at: -1 }).toArray();
        const messages = items.map((item): any[] => {
            const mes = [];
            let sysMes = getSystemMessage(theme_id);
            if (sysMes != undefined)
                mes.push(sysMes);
            if (item.user_msg && item.asystens_msg) {
                mes.push({ role: 'user', content: item.user_msg });
                mes.push({ role: 'asystent', content: item.asystens_msg });
            }
            return mes;
        }).reduce((acc, val) => acc.concat(val), []);
        //console.log(messages);
        const themeID = new ObjectId(theme_id);
        const sys_rec = await db.collection<Tthemes>('themes').findOne(
            {
                "_id": themeID
            }
        );
        messages.unshift({ role: 'system', content: sys_rec?.system_msg });
        return messages;
    } catch (error) {
        console.log('error:', error);
    }
};

export async function insertPosts(req: Request, res: Response) {
    const prm: Tposts = req.body.prm;
    try {
        const uitems = await Post_IU(prm);
        res.send(uitems);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
}

export async function Post_IU(newpost: any) {
    const prm: Tposts = newpost;
    try {
        let db = await loadDB();
        if (!prm._id) {
            prm._id = new ObjectId();
            prm.theme_id = new ObjectId(prm.theme_id);
            prm.created_at = new Date();
            prm.updated_at = undefined;
        } else {
            prm._id = new ObjectId(prm._id);
            prm.updated_at = new Date();
        }


        let updateObj = {
            $setOnInsert: {
                "_id": prm._id,
                "theme_id": prm.theme_id,
                "created_at": prm.created_at,
                "user_msg": prm.user_msg,
                "asystens_msg": prm.asystens_msg,
            },
            $set: {
                "updated_at": prm.updated_at,
                "asystens_msg": prm.asystens_msg,
                "asystens_short_msg": prm.asystens_short_msg
            },
        }
        if (prm.asystens_msg === undefined)
            delete updateObj.$set.asystens_msg;
        if (prm.asystens_short_msg === undefined)
            delete updateObj.$set.asystens_short_msg;

        const uitems: Tposts | null = await db.collection<Tposts>('posts').findOneAndUpdate(
            { "_id": prm._id },
            updateObj,
            {
                upsert: true,
                returnDocument: 'after'
            }
        );
        return uitems;
    } catch (error) {
        console.log('error:', error);
        throw (error);
    }
};

export async function deletePosts(req: Request, res: Response) {
    const prm = req.body.prm;
    try {
        let db = await loadDB();
        prm._id = new ObjectId(prm._id);
        const rec: Tposts | null = await db.collection<Tposts>('posts').findOneAndDelete(
            { "_id": { eq: prm._id } }
        );
        res.send(rec);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
};
