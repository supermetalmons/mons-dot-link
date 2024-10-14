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

export const getLatestAttestations = async (recipient1: string, recipient2: string) => {
  const proxyAddress = "0x6D132b7cDC2b5A5F7C4DFd6C84C0A776062C58Ae";
  const schema = "0x5c6e798cbb817442fa075e01b65d5d65d3ac35c2b05c1306e8771a1c8a3adb32";

  const easQuery = `
    query Attestation {
      firstRecipientAttestations: attestations(
        take: 10,
        skip: 0,
        orderBy: { data: desc },
        where: { 
          schemaId: { equals: "${schema}" }, 
          attester: { equals: "${proxyAddress}" },
          recipient: { equals: "${recipient1}" },
          revoked: { equals: false },
        },
      ) {
        decodedDataJson
        id
        time
      }

      secondRecipientAttestations: attestations(
        take: 10,
        skip: 0,
        orderBy: { data: desc },
        where: { 
          schemaId: { equals: "${schema}" }, 
          attester: { equals: "${proxyAddress}" },
          recipient: { equals: "${recipient2}" },
          revoked: { equals: false },
        },
      ) {
        decodedDataJson
        id
        time
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
  const targetAttestation1 = processAllRawAttestations(easResponseJson.data.firstRecipientAttestations);
  const targetAttestation2 = processAllRawAttestations(easResponseJson.data.secondRecipientAttestations);
  return [targetAttestation1, targetAttestation2];
};

const processAllRawAttestations = (rawAttestations: any) => {
  let targetAttestation = processAttestation(rawAttestations.length > 0 ? rawAttestations[0] : null);
  const maxNonce = targetAttestation.nonce;
  let requireAtLeastOneWithLowerNonce = false;

  for (let i = 1; i < rawAttestations.length; i++) {
    const attestation = processAttestation(rawAttestations[i]);
    if (attestation.nonce > maxNonce) {
      throw new Error("Unexpected order of attestations");
    } else if (attestation.nonce === maxNonce) {
      if (attestation.time < targetAttestation.time) {
        targetAttestation = attestation;
      }
      requireAtLeastOneWithLowerNonce = true;
    } else if (attestation.nonce < maxNonce) {
      return targetAttestation;
    }
  }

  if (requireAtLeastOneWithLowerNonce && maxNonce > 0) {
    throw new Error("Could not find the earliest attestation with max nonce");
  }
  return targetAttestation;
};

const processAttestation = (targetAttestation: any) => {
  const result = {
    id: "0x0000000000000000000000000000000000000000000000000000000000000000",
    nonce: 0,
    rating: 1500,
    time: 0,
  };

  if (targetAttestation) {
    result.id = targetAttestation.id;
    result.time = targetAttestation.time;

    const decodedData = JSON.parse(targetAttestation.decodedDataJson);

    const nonceItem = decodedData.find((item: any) => item.name === "nonce");
    if (nonceItem && typeof nonceItem.value.value === "number") {
      result.nonce = nonceItem.value.value + 1;
    } else {
      throw new Error("Invalid nonce value in previous attestation");
    }

    const ratingItem = decodedData.find((item: any) => item.name === "newRating");
    if (ratingItem && typeof ratingItem.value.value === "number") {
      result.rating = ratingItem.value.value;
    } else {
      throw new Error("Invalid rating value in previous attestation");
    }
  }

  return result;
};
