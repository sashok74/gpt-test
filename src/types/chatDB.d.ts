import { ObjectId } from "mongodb";

export type Tthemes = {
  _id: ObjectId;
  p_id: ObjectId | null;
  theme_title?: string;
  system_msg?: string;
  solution?: string;
  created_at?: Date;
  updated_at?: Date | undefined;
};

export type Tposts = {
  _id: ObjectId;
  theme_id: ObjectId;
  user_msg: string;
  assistant_msg?: string;
  assistant_short_msg?: string;
  created_at?: Date;
  updated_at?: Date;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

