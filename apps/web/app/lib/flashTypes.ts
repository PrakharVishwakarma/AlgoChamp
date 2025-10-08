// apps/web/app/lib/flashTypes.ts

export type FlashMessageType = "success" | "error" | "info" | "warn";

export interface FlashMessage {
  id: string;
  type: FlashMessageType;
  message: string;
}