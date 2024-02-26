import BN from 'bignumber.js'
import { formatTokenAmount } from './utils'

export const getTotalRedemptionAmountForGame = (gameId, userProfile) => {
  if (!userProfile) return 0
  const userProfileForGame = userProfile.redeemTickets.filter(item => item.gameName === gameId)
  if (userProfileForGame.length === 0) return 0
  const totalBNAmount = userProfileForGame.reduce((accumulator, currentValue) => accumulator.plus(new BN(currentValue.ticketPrice)), new BN(0))
  return formatTokenAmount(totalBNAmount.toFixed())
}

export const getRedemptionTotalCount = (gameId, userProfile) => {
  if (!userProfile) return 0
  const userProfileForGame = userProfile.redeemTickets.filter(item => item.gameName === gameId)
  return userProfileForGame.length
}

export const getHighestScoreForGame = (gameId, userProfile) => {
  if (!userProfile) return 0
  const userProfileForGame = userProfile.scoreUpdateds.filter(item => item.gameName === gameId)
  if (userProfileForGame.length === 0) return 0
  return userProfileForGame[0].score
}

export const getTotalLottoWinnerAmount = (userProfile) => {
  if (!userProfile) return 0
  const userProfileForWinners = userProfile.winners
  if (userProfileForWinners.length === 0) return 0
  const totalBNAmount = userProfileForWinners.reduce((accumulator, currentValue) => accumulator.plus(new BN(currentValue.amount)), new BN(0))
  return formatTokenAmount(totalBNAmount.toFixed())
}
