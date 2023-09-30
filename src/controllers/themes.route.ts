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
    const prm:Tthemes = req.body.prm;
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

        if (prm.theme_title === undefined)
          delete updateObj.$set.theme_title;
        if (prm.system_msg === undefined)
          delete updateObj.$set.system_msg;

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
    const prm:Tthemes = req.body.prm;
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
                })
        }

        res.send(rec);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send(error);
    }
};

export async function getSystemMessage (theme_id:ObjectId){
    try {
        let db = await loadDB();
        const item = await db.collection<Tthemes>('themes').findOne(
            {
                "theme_id": new ObjectId(theme_id)
            }
            );
            let mes;
            if(item?.system_msg) {
                mes = {role: 'user', content: item.system_msg};
            }  
            return mes;   
    } catch (error) {
        console.log('error:', error);
    }
}