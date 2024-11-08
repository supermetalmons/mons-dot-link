const PROXY_ADDRESS = "0x6D132b7cDC2b5A5F7C4DFd6C84C0A776062C58Ae";
const SCHEMA = "0x5c6e798cbb817442fa075e01b65d5d65d3ac35c2b05c1306e8771a1c8a3adb32";

export type RatingData = {
  numberOfGames: number;
  rating: number;
};

export async function fetchRatingsFromEAS(recipients: string[]): Promise<{ [key: string]: RatingData }> {
  const ratingsDict: { [key: string]: RatingData } = {};

  const easQuery = `
    query Attestation {
      attestations(
        take: ${recipients.length},
        skip: 0,
        orderBy: { data: desc },
        where: { 
          schemaId: { equals: "${SCHEMA}" }, 
          attester: { equals: "${PROXY_ADDRESS}" },
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
        rating: ratingItem.value.value,
      };
    }
  });

  recipients.forEach((recipient) => {
    if (!ratingsDict[recipient]) {
      ratingsDict[recipient] = {
        numberOfGames: 0,
        rating: 1500,
      };
    }
  });

  return ratingsDict;
}
