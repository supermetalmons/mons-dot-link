export type PlayerMetadata = {
  uid: string;
  displayName: string | undefined;
  ethAddress: string | undefined;
  ens: string | undefined;
  emojiId: string;
  voiceReactionText: string;
  voiceReactionDate: number | undefined;
};

export const newEmptyPlayerMetadata = (): PlayerMetadata => ({
  uid: "",
  displayName: undefined,
  ethAddress: undefined,
  ens: undefined,
  emojiId: "",
  voiceReactionText: "",
  voiceReactionDate: undefined,
});

export function openEthAddress(address: string) {
  const etherscanBaseUrl = "https://etherscan.io/address/";
  const etherscanUrl = etherscanBaseUrl + address;
  window.open(etherscanUrl, "_blank", "noopener,noreferrer");
}

export function getStashedPlayerAddress(uid: string) {
  return ethAddresses[uid];
}

export function resolveEthAddress(address: string, uid: string, onSuccess: () => void) {
  ethAddresses[uid] = address;
  if (!ensDict[address]) {
    fetch(`https://api.ensideas.com/ens/resolve/${address}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return null;
      })
      .then((data) => {
        if (data && data.name && data.name.trim() !== "") {
          ensDict[address] = {
            name: data.name,
            avatar: data.avatar,
          };
          onSuccess();
        }
      })
      .catch(() => {});
  }
}

export function getEnsName(address: string): string | undefined {
  return ensDict[address]?.name;
}

const ethAddresses: { [key: string]: string } = {};
const ensDict: { [key: string]: { name: string; avatar: string } } = {};

export const getRatings = async (recipients: string[]) => {
  const ratingsDict: { [key: string]: { numberOfGames: number; rating: number; } } = {};

  const proxyAddress = "0x6D132b7cDC2b5A5F7C4DFd6C84C0A776062C58Ae";
  const schema = "0x5c6e798cbb817442fa075e01b65d5d65d3ac35c2b05c1306e8771a1c8a3adb32";

  const easQuery = `
    query Attestation {
      attestations(
        take: ${recipients.length},
        skip: 0,
        orderBy: { data: desc },
        where: { 
          schemaId: { equals: "${schema}" }, 
          attester: { equals: "${proxyAddress}" },
          recipient: { in: ${JSON.stringify(recipients)} },
          revoked: { equals: false },
        },
        distinct: [recipient]
      ) {
        recipient
        decodedDataJson
        id
      }
    }
  `;

  const easResponse = await fetch("https://base.easscan.org/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: easQuery,
      variables: {},
    }),
  });

  if (!easResponse.ok) {
    throw new Error("Failed to fetch attestations");
  }

  const easResponseJson = await easResponse.json();
  const attestations = easResponseJson.data.attestations;
  attestations.forEach((attestation: any) => {
    const decodedData = JSON.parse(attestation.decodedDataJson);
    
    const nonceItem = decodedData.find((item: any) => item.name === "nonce");
    const ratingItem = decodedData.find((item: any) => item.name === "newRating");
    
    if (nonceItem && ratingItem && typeof nonceItem.value.value === "number" && typeof ratingItem.value.value === "number") {
      ratingsDict[attestation.recipient] = {
        numberOfGames: nonceItem.value.value + 1,
        rating: ratingItem.value.value
      };
    }
  });
  return ratingsDict;  
};