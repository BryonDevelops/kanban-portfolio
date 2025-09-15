import { User } from "./user";

export type Task = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  createdBy?: User;
  createdAt?: Date;
  updatedAt?: Date;
  archived?: boolean;
  updatedBy?: User;
  projectId?: string;
};
