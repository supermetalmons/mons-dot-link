type ENSCache = {
  [address: string]: string | null;
};

export let ensCache: ENSCache = {};

export async function resolveENS(address: string): Promise<string | null> {
  if (address in ensCache) {
    return ensCache[address];
  }

  try {
    const response = await fetch(`https://api.ensideas.com/ens/resolve/${address}`);
    if (!response.ok) {
      ensCache[address] = null;
      return null;
    }

    const data = await response.json();
    const name = data.name || null;
    ensCache[address] = name;
    return name;
  } catch (error) {
    console.error("Failed to resolve ENS:", error);
    ensCache[address] = null;
    return null;
  }
}
