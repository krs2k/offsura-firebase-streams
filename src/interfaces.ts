import type { Reference } from "@firebase/database-types";

export interface Event<T = any> {
  id?: string;
  createdAt: number;
  table: string;
  data: T;
  operation: "INSERT" | "UPDATE" | "DELETE";
  entityId: string;
  isLast?: boolean;
}

export interface Cursor {
  eventId: string;
  startAt: number;
  error?: any;
}

export interface ConsumerOptions {
  removeAfterApply?: boolean;
  ref: Reference;
  id: string;
  live?: boolean;
}
