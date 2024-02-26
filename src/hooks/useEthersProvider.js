import { providers } from 'ethers'
import { useMemo } from 'react'
import { useNetwork, usePublicClient } from 'wagmi'

export function publicClientToProvider(publicClient) {
  const { chain, transport } = publicClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    )
  return new providers.JsonRpcProvider(transport.url, network)
}

/** Hook to convert a viem Public Client to an ethers.js Provider. */
export function useEthersProvider() {
  const { chain } = useNetwork();

  const publicClient = usePublicClient({ chainId: 5 ?? chain?.id })
  return useMemo(() => publicClientToProvider(publicClient), [publicClient])
}
