import { MODERN_CONTRACT_VERSION } from './modernContract';

type GenericMeta = {
  contractVersion?: number;
  contractKey?: string;
};

export function assertModernContract(
  meta: unknown,
  expectedKeys: string | string[],
  context: string
): void {
  if (!meta || typeof meta !== 'object') {
    throw new Error(`Missing contract metadata while loading ${context}.`);
  }

  const normalizedMeta = meta as GenericMeta;
  const contractVersion = Number(normalizedMeta.contractVersion || 0);
  if (contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error(
      `Contract version mismatch while loading ${context}. Expected ${MODERN_CONTRACT_VERSION}, received ${contractVersion || 'unknown'}.`
    );
  }

  const expectedKeyList = Array.isArray(expectedKeys) ? expectedKeys : [expectedKeys];
  const contractKey = String(normalizedMeta.contractKey || '').trim();
  if (!expectedKeyList.includes(contractKey)) {
    throw new Error(
      `Unexpected contract key while loading ${context}. Expected ${expectedKeyList.join(' or ')}, received ${contractKey || 'unknown'}.`
    );
  }
}
