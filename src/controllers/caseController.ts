import { loadDB } from '../modules/db.js'; 
import { Request, Response } from 'express';
import { splitString } from '../helpers/spliProc.js';
import { allThemes, insertThemes, deleteThemes } from './themes.route.js';

export function getDBRoute() {return async (req: Request, res:Response) => {
    const prm = req.body.prm;
    const [qcolection, qaction] = splitString(req.body.procedureName);
        let db = await loadDB();
        if (qcolection === 'themes') {
            if (qaction === 's') {
                await allThemes (req, res);
             } 
            else if (qaction === 'iu') {
                await insertThemes (req, res);
            }
            else if (qaction === 'd') {
                await deleteThemes (req, res);
            }
        }
}}
