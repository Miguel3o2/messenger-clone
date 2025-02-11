import { Conversation, Message, User as PrismaUser } from "@prisma/client";

export type FullMessageType = Message & {
  sender: PrismaUser;
  seen: PrismaUser[];
};
export type User = PrismaUser;
export type FullConversationType = Conversation & {
  users: PrismaUser[];
  messages: FullMessageType[];
};
