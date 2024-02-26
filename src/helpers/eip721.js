import { getContractAddress } from './network'

export const createTrustedForwarderTypedData = (netId, user, nonce, data, transformedGameId) => {
  const verifyingContract = getContractAddress('FORWARDER', netId)
  const to = getContractAddress('GAME', netId, transformedGameId)

  const domain = {
    name: 'MinimalForwarder',
    version: '0.0.1',
    chainId: netId,
    verifyingContract
  }

  const forwarderTypes = {
    ForwardRequest: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'gas', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'data', type: 'bytes' }
    ]
  }

  const forwarderMessage = {
    from: user,
    to,
    value: 0,
    gas: 1000000,
    nonce: Number(nonce),
    data
  }

  const typedData = {
    domain,
    types: forwarderTypes,
    primaryType: 'ForwardRequest',
    message: forwarderMessage
  }

  return typedData
}

export async function handleSignTrustedForwarderMessage(netId, signer, nonce, data, transformedGameId) {
  if (!signer) return

  const user = await signer.getAddress()
  const typedData = createTrustedForwarderTypedData(netId, user, nonce, data, transformedGameId)
  const signature = await signer._signTypedData(typedData.domain, typedData.types, typedData.message)
  return {
    signature,
    ...typedData
  }
}
