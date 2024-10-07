export type PlayerMetadata = {
  uid: string;
  displayName: string | undefined;
  ethAddress: string | undefined;
  emojiId: string;
};

export const newEmptyPlayerMetadata = (): PlayerMetadata => ({
  uid: "",
  displayName: undefined,
  ethAddress: undefined,
  emojiId: "",
});