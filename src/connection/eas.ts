import { EAS, EIP712Proxy } from "@ethereum-attestation-service/eas-sdk";
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

  if (network.chainId !== BigInt(baseChainId)) {
    try {
      await signer.provider.send('wallet_switchEthereumChain', [{ chainId: `0x${baseChainId.toString(16)}` }]);
    } catch (switchError) {
      throw new Error("Failed to switch to the Base network");
    }
  }

  const newProxy = new EIP712Proxy(txData.proxyAddress, { signer: signer });
  const eas = new EAS(txData.easAddress, {
    proxy: newProxy,
    signer: signer,
  });

  const multiTxAll = await eas.multiAttestByDelegationProxy([
    {
      schema: txData.schema,
      data: [
        {
          recipient: txData.recipient1,
          expirationTime: 0n,
          revocable: false,
          refUID: txData.refUID1,
          data: txData.encodedData1,
          value: 0n,
        },
        {
          recipient: txData.recipient2,
          expirationTime: 0n,
          revocable: false,
          refUID: txData.refUID2,
          data: txData.encodedData2,
          value: 0n,
        },
      ],
      signatures: txData.signatures,
      attester: txData.attester,
      deadline: 0n,
    },
  ]);

  const newAttestationUID = await multiTxAll.wait();
  console.log(newAttestationUID);
  return newAttestationUID;
}
