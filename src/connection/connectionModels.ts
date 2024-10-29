export interface Match {
  version: number;
  color: string;
  emojiId: number;
  fen: string;
  status: string;
  flatMovesString: string;
  timer: string;
  reaction?: Reaction;
}

export interface Invite {
  version: number;
  hostId: string;
  hostColor: string;
  guestId?: string | null;
}

export interface Reaction {
  uuid: string;
  variation: number;
  kind: string;
}