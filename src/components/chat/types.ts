import type { ImageSourceProp } from "@/components/image";

/** Where a message is on its way to the other side. */
export type ChatReceiptStatus =
  "sending" | "sent" | "delivered" | "read" | "failed";

type AttachmentBase = {
  id: string;
  /** Shown under a file, read out for every kind. Defaults per kind. */
  name?: string;
  /** Bytes, for the file row. */
  size?: number;
  mimeType?: string;
};

/**
 * Something sent with a message, discriminated on `kind`. `uri` is anything
 * the matching player takes — a remote URL, or a local file URI straight
 * from a picker while the message is still `sending`.
 */
export type ChatAttachment = AttachmentBase &
  (
    | {
        kind: "image";
        uri: string;
        /** What the picture shows, for screen readers and the viewer. */
        alt?: string;
        width?: number;
        height?: number;
      }
    | {
        kind: "video";
        uri: string;
        /** A still to show in the bubble; without one the tile is a plain play button. */
        thumbnail?: string;
        /** Seconds. */
        duration?: number;
      }
    | { kind: "audio"; uri: string; duration?: number }
    | { kind: "file"; uri: string }
  );

export type ChatAttachmentKind = ChatAttachment["kind"];

export type ChatReaction = {
  emoji: string;
  /** Who reacted — used for the count and to highlight the current user's own. */
  userIds: readonly string[];
};

export type ChatMessage = {
  id: string;
  senderId: string;
  /** When it was sent. A `Date` or epoch milliseconds. */
  createdAt: Date | number;
  text?: string;
  attachments?: readonly ChatAttachment[];
  /** Only meaningful on the current user's own messages. */
  status?: ChatReceiptStatus;
  /** The id of the message this one answers. */
  replyTo?: string;
  reactions?: readonly ChatReaction[];
  /** Set once the text has been changed after sending. */
  editedAt?: Date | number;
  /** Shown as a tombstone rather than dropped, so the thread keeps its shape. */
  deleted?: boolean;
};

export type ChatParticipant = {
  id: string;
  name: string;
  avatar?: ImageSourceProp;
  online?: boolean;
};

/** What a participant is doing right now, shown under the last message. */
export type ChatActivityKind = "typing" | "recording" | "uploading";

export type ChatActivity = {
  userId: string;
  kind: ChatActivityKind;
};

/** Everything `onAction` can be asked to do with a message. */
export type ChatAction =
  | { type: "reply" }
  | { type: "copy" }
  | { type: "edit" }
  | { type: "delete" }
  | { type: "react"; emoji: string }
  /** The sender's avatar or name was pressed — open their profile. */
  | { type: "profile"; participant: ChatParticipant };

export type ChatSendPayload = {
  text: string;
  attachments: ChatAttachment[];
  /** The message being answered, when the composer had a reply banner. */
  replyTo?: string;
  /**
   * The message being edited, when the composer was in edit mode — update
   * that one rather than appending a new one.
   */
  editOf?: string;
};
