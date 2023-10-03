import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { loadDB } from '../modules/db.js';
import { Tthemes } from '../types/chatDB.js';

export async function allThemes(req: Request, res: Response) {
    try {
        let db = await loadDB();
        const items: Tthemes[] = await db.collection<Tthemes>('themes').find().toArray();
        res.send(items);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
};

export async function insertThemes(req: Request, res: Response) {
    const prm: Tthemes = req.body.prm;
    try {
        let db = await loadDB();
        if (!prm._id) {
            prm._id = new ObjectId();
            prm.created_at = new Date();
            prm.updated_at = undefined;
        } else {
            prm._id = new ObjectId(prm._id);
            prm.updated_at = new Date();
        }
        prm.p_id = prm.p_id ? new ObjectId(prm.p_id) : null;


        let updateObj = {
            $setOnInsert: {
                "_id": prm._id,
                "created_at": prm.created_at
            },
            $set: {
                "p_id": prm.p_id,
                "updated_at": prm.updated_at,
                "theme_title": prm.theme_title,
                "system_msg": prm.system_msg
            },
        }

        if (prm.theme_title === undefined || prm.system_msg === '0' || prm.system_msg?.trim() === "")
            delete updateObj.$set.theme_title;
        if (prm.system_msg === undefined || prm.system_msg === '0') 
            delete updateObj.$set.system_msg;
 
        if (prm.system_msg === '0'){
            prm.system_msg = '';
        }

        const uitems: Tthemes | null = await db.collection<Tthemes>('themes').findOneAndUpdate(
            { "_id": prm._id },
            updateObj,
            {
                upsert: true,
                returnDocument: 'after'
            }
        );
        res.send(uitems);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
};

export async function deleteThemes(req: Request, res: Response) {
    const prm: Tthemes = req.body.prm;
    try {
        let db = await loadDB();
        prm._id = new ObjectId(prm._id);
        const rec: Tthemes | null = await db.collection<Tthemes>('themes').findOneAndDelete(
            { "_id": { $eq: prm._id } }
        );
        //если убрали из середины ветки.
        if (rec) {
            prm.updated_at = new Date();
            await db.collection('themes').updateMany(
                { "p_id": new ObjectId(prm._id) },
                {
                    $set: {
                        "p_id": rec.p_id ? new ObjectId(rec.p_id) : null,
                        "updated_at": prm.updated_at
                    }
                });
            await db.collection('posts').deleteMany(
                { "theme_id": new ObjectId(prm._id) }
            );
        }

        res.send(rec);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
};

export async function getSystemMessage(theme_id: string) {
    try {
        let db = await loadDB();
        let item: Tthemes | null;

        async function findSystemMsg(id: string): Promise<string | null> {
            item = await db.collection<Tthemes>('themes').findOne({
                "_id": new ObjectId(id)
            });

            // Если у айтема есть системное сообщение и оно не пустое, то возвращаем его
            if (item?.system_msg && item.system_msg.trim() !== "") {
                return item.system_msg;
            }

            // Иначе, если у айтема есть родительский айтем, то делаем рекурсию
            else if (item?.p_id) {
                return findSystemMsg(item.p_id.toString());
            }

            // Если же и родительского айтема нет, то возвращаем дефолтное сообщение
            else {
                return "ты опытный программист";
            }
        }
        const message = await findSystemMsg(theme_id);

        return {
            role: 'system',
            content: message
        };
    } catch (error) {
        console.log('error:', error);
    }
}
