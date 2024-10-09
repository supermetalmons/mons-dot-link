import { EAS, SchemaEncoder, EIP712Proxy } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

async function getSigner(): Promise<any> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return signer;
}

export async function sendEasTx(txData) {
  // sendEasTxWip(txData);
  alert("soon");
}

export async function sendEasTxWip(txData) {
  const signer = await getSigner();

  const easAddress = txData.easAddress;
  const proxyAddress = txData.proxyAddress;
  const schema = txData.schema;

  const baseChainId = 8453;
  const network = await signer.provider.getNetwork();

  // TODO: switch to base explicitly if needed
  if (network.chainId !== BigInt(baseChainId)) {
    throw new Error("Please switch to the Base network");
  }

  const signatures = txData.signatures;
  const attester = txData.attester;

  const newProxy = new EIP712Proxy(proxyAddress, { signer: signer });
  const eas = new EAS(easAddress, {
    proxy: newProxy,
    signer: signer,
  });

  const schemaEncoder = new SchemaEncoder("uint64 gameId, uint64 points, bool isWin");

  const encodedData1 = schemaEncoder.encodeData([
    { name: "gameId", value: 0, type: "uint64" },
    { name: "points", value: 1000, type: "uint64" },
    { name: "isWin", value: true, type: "bool" },
  ]);

  const encodedData2 = schemaEncoder.encodeData([
    { name: "gameId", value: 0, type: "uint64" },
    { name: "points", value: 1000, type: "uint64" },
    { name: "isWin", value: false, type: "bool" },
  ]);

  const multiTxAll = await eas.multiAttestByDelegationProxy([
    {
      schema: schema,
      data: [
        {
          recipient: "0xE4790DD79c334e3f848904975272ec17f9F70366",
          expirationTime: 0n,
          revocable: false,
          refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
          data: encodedData1,
          value: 0n,
        },
        {
          recipient: "0x2bB97367fF26b701a60aedc213640C34F469cf38",
          expirationTime: 0n,
          revocable: false,
          refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
          data: encodedData2,
          value: 0n,
        },
      ],
      signatures: signatures,
      attester: attester,
      deadline: 0n,
    },
  ]);

  const newAttestationUID = await multiTxAll.wait();
  console.log(newAttestationUID);
  // TODO: communicate to a player
}
