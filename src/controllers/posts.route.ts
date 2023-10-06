import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { loadDB } from "../modules/db.js";
import { Tposts } from "../types/chatDB.js";
import { getSystemMessage } from "./themes.route.js";

export async function allPosts(req: Request, res: Response) {
  const prm: Tposts = req.body.prm;
  try {
    let db = await loadDB();
    const items: Tposts[] = await db
      .collection<Tposts>("posts")
      .find(
        {
          theme_id: new ObjectId(prm.theme_id),
        },
        {
          projection: {
            created_at: 1,
            user_msg: 1,
            assistant_msg: 1,
            model: 1,
            tokens: "$usage.completion_tokens",
          },
        }
      )
      .sort({ created_at: 1 })
      .toArray();
    res.send(items);
  } catch (error) {
    console.log("error:", error);
    res.status(500).send(error);
  }
}

export async function createContecstMessage(theme_id: string): Promise<any> {
  try {
    let db = await loadDB();
    let sysMes = await getSystemMessage(theme_id);
    const items: Tposts[] = await db
      .collection<Tposts>("posts")
      .find({
        theme_id: new ObjectId(theme_id),
      })
      .sort({ created_at: -1 })
      .toArray();
    const messages = items
      .map((item): any[] => {
        const mes = [];
        if (item.user_msg && item.assistant_msg) {
          //.replace(/\\"/g, '+'))
          mes.push({ role: "user", content: item.user_msg });
          mes.push({
            role: "assistant",
            content: JSON.parse(item.assistant_msg),
          });
        }
        return mes;
      })
      .reduce((acc, val) => acc.concat(val), []);
    if (sysMes !== undefined) messages.unshift(sysMes);
    return messages;
  } catch (error) {
    console.log("error:", error);
  }
}

export async function insertPosts(req: Request, res: Response) {
  const prm: Tposts = req.body.prm;
  try {
    const uitems = await Post_IU(prm);
    res.send(uitems);
  } catch (error) {
    console.log("error:", error);
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
        _id: prm._id,
        theme_id: prm.theme_id,
        created_at: prm.created_at,
        user_msg: prm.user_msg,
        assistant_msg: prm.assistant_msg,
        model: prm.model,
        usage: prm.usage,
      },
      $set: {
        updated_at: prm.updated_at,
        assistant_short_msg: prm.assistant_short_msg,
      },
    };

    //                "assistant_msg": prm.assistant_msg,
    //  if (prm.assistant_msg === undefined)
    //      delete updateObj.$set.assistant_msg;
    //  if (prm.assistant_short_msg === undefined)
    //delete updateObj.$set.assistant_short_msg;

    //console.log(`updateObj = ${updateObj}`);

    const uitems: Tposts | null = await db
      .collection<Tposts>("posts")
      .findOneAndUpdate({ _id: prm._id }, updateObj, {
        upsert: true,
        returnDocument: "after",
      });
    return uitems;
  } catch (error) {
    console.log("error:", error);
    throw error;
  }
}

export async function deletePosts(req: Request, res: Response) {
  const prm = req.body.prm;
  try {
    let db = await loadDB();
    prm._id = new ObjectId(prm._id);
    const rec: Tposts | null = await db
      .collection<Tposts>("posts")
      .findOneAndDelete({ _id: { eq: prm._id } });
      console.log(rec);
    res.send(rec);
  } catch (error) {
    console.log("error:", error);
    res.status(500).send(error);
  }
}
