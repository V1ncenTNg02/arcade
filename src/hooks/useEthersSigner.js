import { providers } from 'ethers'
import * as React from 'react'

export function walletClientToSigner(chainId, chainName, address, walletClient) {
  if (!walletClient.transport || !walletClient.account) {
    return
  }
  const { transport, account } = walletClient
  const network = {
    chainId: chainId,
    name: chainName,
    ensAddress: address
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner(chainId, chainName, address, walletClientData) {
  return React.useMemo(
    () => (chainId && chainName && address && walletClientData ? walletClientToSigner(chainId, chainName, address, walletClientData) : undefined),
    [chainId, chainName, address, walletClientData]
  )
}
