import { loadDB } from '../modules/db.js'; 
import { Request, Response } from 'express';
import { splitString } from '../helpers/spliProc.js';
import { allThemes, insertThemes, deleteThemes } from './themes.route.js';
import { allPosts, insertPosts, deletePosts } from './posts.route.js';

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
        } else if (qcolection === 'posts') {
            if (qaction === 's') {
                await allPosts (req, res);
             } 
            else if (qaction === 'iu') {
                await insertPosts (req, res);
            }
            else if (qaction === 'd') {
                await deletePosts (req, res);
            }
        }
}}
