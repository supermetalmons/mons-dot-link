import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

async function getSigner(): Promise<any> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return signer;
}

export async function sendEasTx(txData) {
    alert("soon");
    // TODO: make it work
}

export async function sendEasTxWip(txData) {
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

  const multiTxOk1 = await eas.multiAttestByDelegation([
    {
      schema: "0xb6cdeca57cf4618b9e6f619771b9ca43febd99de294a8de229aa4938405f2efa",
      data: [
        {
          recipient: "0xE26067c76fdbe877F48b0a8400cf5Db8B47aF0fE",
          expirationTime: 0n,
          revocable: false,
          refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
          data: encodedData1,
          value: 0n,
        },
      ],
      signatures: [signatures[0]],
      attester: attester,
      deadline: 0n,
    },
  ]);

  const multiTxOk2 = await eas.multiAttestByDelegation([
    {
      schema: "0xb6cdeca57cf4618b9e6f619771b9ca43febd99de294a8de229aa4938405f2efa",
      data: [
        {
          recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
          expirationTime: 0n,
          revocable: false,
          refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
          data: encodedData2,
          value: 0n,
        },
      ],
      signatures: [signatures[1]],
      attester: attester,
      deadline: 0n,
    },
  ]);

  const multiTxAll = await eas.multiAttestByDelegation([
    {
      schema: "0xb6cdeca57cf4618b9e6f619771b9ca43febd99de294a8de229aa4938405f2efa",
      data: [
        {
          recipient: "0xE26067c76fdbe877F48b0a8400cf5Db8B47aF0fE",
          expirationTime: 0n,
          revocable: false,
          refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
          data: encodedData1,
          value: 0n,
        },
        {
          recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
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

  const newAttestationUID = await multiTxOk1.wait(); // OK
  // const newAttestationUID = await multiTxOk2.wait(); // OK
  // const newAttestationUID = await multiTxAll.wait(); // missing revert data (action="estimateGas"

  // TODO: make it work with all attestaions in a single tx

  console.log(newAttestationUID);
}
