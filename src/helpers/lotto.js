import BN from 'bignumber.js'

export const getLottoParticipantsAmount = (lottoInfo) => {
  if (!lottoInfo) return 0
  const enterLottoGames = lottoInfo.enterLottoGames
  const lottoWinners = lottoInfo.winners
  if (enterLottoGames.length === 0) return 0
  const totalBNAmount = enterLottoGames.reduce((accumulator, currentValue) => accumulator.plus(new BN(currentValue.number)), new BN(0))
  const participantsCount = totalBNAmount - new BN(lottoWinners.length)
  return Number(participantsCount.toFixed())
}
