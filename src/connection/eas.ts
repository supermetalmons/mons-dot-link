import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

async function getSigner(): Promise<any> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return signer;
}

export async function sendEasTx(txData) {
  const signer = await getSigner();

  const baseChainId = 8453;
  const network = await signer.provider.getNetwork();

  // TODO: switch to base explicitly if needed
  if (network.chainId !== BigInt(baseChainId)) {
    throw new Error("Please switch to the Base network");
  }

  const signatures = txData.signatures;
  const attester = txData.attester;
  const eas = new EAS("0x4200000000000000000000000000000000000021");
  eas.connect(signer);
  const schemaEncoder = new SchemaEncoder("uint64 gameId, uint64 points, bool isWin");
  const encodedData = schemaEncoder.encodeData([
    // TODO: get encoded data with signatures instead of preparing it here
    { name: "gameId", value: 0, type: "uint64" },
    { name: "points", value: 1000, type: "uint64" },
    { name: "isWin", value: true, type: "bool" },
  ]);

  // TODO: use multi attest
  const transaction = await eas.attestByDelegation({
    schema: "0xb6cdeca57cf4618b9e6f619771b9ca43febd99de294a8de229aa4938405f2efa",
    data: {
      recipient: "0xE26067c76fdbe877F48b0a8400cf5Db8B47aF0fE",
      expirationTime: 0n,
      revocable: false,
      refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
      data: encodedData,
    },
    signature: signatures[0], // TODO: init it properly
    attester: attester,
    deadline: 0n,
  });

  const newAttestationUID = await transaction.wait();
  console.log(newAttestationUID);
}
