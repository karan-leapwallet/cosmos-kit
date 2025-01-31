/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AssetList, Chain } from '@chain-registry/types';
import {
  ChainWalletData,
  EndpointOptions,
  MainWalletBase,
  ModalVersion,
  NameServiceName,
  SessionOptions,
  SignerOptions,
  State,
  WalletManager,
  WalletModalProps,
  WalletRepo,
} from '@cosmos-kit/core';
import { SignClientTypes } from '@walletconnect/types';
import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { DefaultModal } from '.';
import { getModal } from './modal';

export const walletContext = createContext<{
  walletManager: WalletManager;
} | null>(null);

export const ChainProvider = ({
  chains,
  assetLists,
  wallets,
  walletModal,
  modalTheme,
  defaultNameService = 'icns',
  wcSignClientOptions,
  signerOptions,
  endpointOptions,
  sessionOptions,
  children,
}: {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: MainWalletBase[];
  walletModal?: ModalVersion | ((props: WalletModalProps) => JSX.Element);
  modalTheme?: Record<string, any>;
  defaultNameService?: NameServiceName;
  wcSignClientOptions?: SignClientTypes.Options; // SignClientOptions is required if using wallet connect v2
  signerOptions?: SignerOptions;
  endpointOptions?: EndpointOptions;
  sessionOptions?: SessionOptions;
  children: ReactNode;
}) => {
  const walletManager = useMemo(
    () =>
      new WalletManager(
        chains,
        assetLists,
        wallets,
        defaultNameService,
        wcSignClientOptions,
        signerOptions,
        endpointOptions,
        sessionOptions
      ),
    []
  );

  const [isViewOpen, setViewOpen] = useState<boolean>(false);
  const [viewWalletRepo, setViewWalletRepo] = useState<
    WalletRepo | undefined
  >();

  const [, setData] = useState<ChainWalletData>();
  const [, setState] = useState<State>();
  const [, setMsg] = useState<string | undefined>();

  walletManager.setActions({
    viewOpen: setViewOpen,
    viewWalletRepo: setViewWalletRepo,
    data: setData,
    state: setState,
    message: setMsg,
  });

  walletManager.walletRepos.forEach((wr) => {
    wr.setActions({
      viewOpen: setViewOpen,
      viewWalletRepo: setViewWalletRepo,
    });
    wr.wallets.forEach((w) => {
      w.setActions({
        data: setData,
        state: setState,
        message: setMsg,
      });
    });
  });

  const Modal = useMemo(() => {
    if (!walletModal) {
      return DefaultModal;
    } else if (typeof walletModal === 'string') {
      return getModal(walletModal as ModalVersion);
    } else {
      return walletModal;
    }
  }, [walletModal]);

  useEffect(() => {
    walletManager.onMounted();
    return () => {
      walletManager.onUnmounted();
    };
  }, []);

  return (
    <walletContext.Provider
      value={{
        walletManager,
      }}
    >
      {children}
      <Modal
        isOpen={isViewOpen}
        setOpen={setViewOpen}
        walletRepo={viewWalletRepo}
        theme={modalTheme}
      />
    </walletContext.Provider>
  );
};
