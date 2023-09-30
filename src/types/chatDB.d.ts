import { ObjectId } from 'mongodb';

export type Tthemes = {
    _id: ObjectId,
    p_id: ObjectId | null,
    theme_title?: string,
    system_msg?: string,
    created_at?: Date,
    updated_at?: Date | undefined,
}

export type Tposts = {
    _id: ObjectId,
    theme_id: ObjectId,
    user_msg: string,
    asystens_msg?: string,
    asystens_short_msg?: string,
    created_at?: Date,
    updated_at?: Date,
}