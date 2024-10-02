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

  const baseChainId = 8453;
  const network = await signer.provider.getNetwork();

  // TODO: switch to base explicitly if needed
  if (network.chainId !== BigInt(baseChainId)) {
    throw new Error("Please switch to the Base network");
  }

  const signatures = txData.signatures;
  const attester = txData.attester;

  const newProxy = new EIP712Proxy("0xF095fE4b23958b08D38e52d5d5674bBF0C03cbF6", { signer: signer });
  const eas = new EAS("0x4200000000000000000000000000000000000021", {
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

  const newAttestationUID = await multiTxAll.wait();
  console.log(newAttestationUID);
  // TODO: communicate to a player
}
