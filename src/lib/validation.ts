import { PublicKey } from '@solana/web3.js';

export function isValidSolanaWallet(id: string): boolean {
  try {
    // PublicKey ctor throws if the string isn’t a 32-byte base-58 address
    new PublicKey(id);
    return true;
  } catch {
    return false;
  }
}