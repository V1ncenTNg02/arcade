import { abiConfig, networkConfig } from '../configs'
import { ethers } from 'ethers'

export const getABI = contractType => {
  const config = abiConfig
  if (!config) return null
  if (contractType === 'TICKET') return config.gameTicketABI
  if (contractType === 'BOARD') return config.gameLeaderBoardABI
  if (contractType === 'FORWARDER') return config.forwarderABI
  if (contractType === 'GAME') return config.gameABI
  if (contractType === 'LOTTO') return config.lottoABI
  return null
}

export const getContractAddress = (contractType, netId, transformedGameId) => {
  if (!netId) return null
  const config = networkConfig[`netId${netId}`]
  if (!config) return null
  if (contractType === 'TICKET') return config.gameTicketContract
  if (contractType === 'BOARD') return config.gameLeaderBoardContract
  if (contractType === 'FORWARDER') return config.forwarderContract
  if (contractType === 'GAME' && transformedGameId) return config.gameContract[transformedGameId]
  if (contractType === 'LOTTO') return config.lottoContract
  return null
}

export const getTrustedForwarder = (netId, provider) => {
  return new ethers.Contract(getContractAddress('FORWARDER', netId), getABI('FORWARDER'), provider)
}

export const getNonceForForwarder = async (netId, provider, address) => {
  if (!provider || !address) return

  try {
    const trustedForwarder = getTrustedForwarder(netId, provider)
    const nonce = await trustedForwarder.getNonce(address)
    return nonce.toString()
  } catch (error) {
    return undefined
  }
}
