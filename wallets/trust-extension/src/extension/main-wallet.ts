import { Wallet } from '@cosmos-kit/core';
import { MainWalletBase } from '@cosmos-kit/core';

import { ChainTrustExtension } from './chain-wallet';
import { TrustClient } from './client';
import { getTrustFromExtension } from './utils';

export class TrustExtensionWallet extends MainWalletBase {
  constructor(walletInfo: Wallet) {
    super(walletInfo, ChainTrustExtension);
  }

  async fetchClient() {
    try {
      const trust = await getTrustFromExtension();
      return trust ? new TrustClient(trust) : undefined;
    } catch (error) {
      this.setClientNotExist();
      return void 0;
    }
  }
}
