import { readContracts } from 'wagmi'
import { readContract } from '@wagmi/core'
export const checkTicket = async (gameTicketContract, address) => {
  const data = await readContracts({
    contracts: [
      {
        ...gameTicketContract,
        functionName: 'balanceOf',
        args: [address, 1]
      },
      {
        ...gameTicketContract,
        functionName: 'balanceOf',
        args: [address, 2]
      },
      {
        ...gameTicketContract,
        functionName: 'balanceOf',
        args: [address, 3]
      },
      {
        ...gameTicketContract,
        functionName: 'getNumberOfLives',
        args: [1]
      },
      {
        ...gameTicketContract,
        functionName: 'getNumberOfLives',
        args: [2]
      },
      {
        ...gameTicketContract,
        functionName: 'getNumberOfLives',
        args: [3]
      }
    ]
  })

  return mapTicket(data)
}

export const mapTicket = data => {
  return [
    {
      name: 'BRONZE',
      amount: data[0].status === 'success' ? data[0].result.toString() : '0',
      numberOfLives: data[3].status === 'success' ? data[3].result.toString() : '2',
      type: 1
    },
    {
      name: 'SILVER',
      amount: data[1].status === 'success' ? data[1].result.toString() : '0',
      numberOfLives: data[4].status === 'success' ? data[4].result.toString() : '5',
      type: 2
    },
    {
      name: 'GOLD',
      amount: data[2].status === 'success' ? data[2].result.toString() : '0',
      numberOfLives: data[5].status === 'success' ? data[5].result.toString() : '10',
      type: 3
    }
  ]
}

export const checkScore = async (gameContract, gameName) => {
  const data = await readContract({
    ...gameContract,
    functionName: 'getLeaderBoardInfo',
    args: []
  })

  return mapScore(data, gameName)
}

export const mapScore = data => {
  let rank = 0
  return data
    .map(item => {
      rank += 1
      return {
        rank,
        address: item.user,
        points: `${item.score.toString()}`
      }
    })
    .filter(item => item !== null)
}

export const getCurrentGameInfo = async gameContract => {
  const data = await readContracts({
    contracts: [
      {
        ...gameContract,
        functionName: 'getCurrentGameRound',
        args: []
      },
      {
        ...gameContract,
        functionName: 'isGameRunning',
        args: []
      },
      {
        ...gameContract,
        functionName: 'isClaiming',
        args: []
      }
    ]
  })

  const [roundInfoData, isGameRunningData, isClaimingData] = data

  const gameInfo = { round: mapRoundInfo(roundInfoData), gameStatus: mapGameStatus(isGameRunningData, isClaimingData) }
  return gameInfo
}

export const mapRoundInfo = data => {
  return {
    claimEndTime: Number(data.result.end) + Number(data.result.claimPeriod),
    gameEndTime: Number(data.result.end),
    gameRound: Number(data.result.gameRound)
  }
}

export const mapGameStatus = (isGameRunningData, isClaimingData) => {
  const gameStatus = {
    isGameRunning: false,
    isClaiming: false
  }
  if (isGameRunningData.status === 'success' && isClaimingData.status === 'success') {
    gameStatus.isGameRunning = isGameRunningData.result
    gameStatus.isClaiming = isClaimingData.result
  }
  return gameStatus
}

export const getSequenceNumberByUser = async (lottoContract, address) => {
  const data = await readContract({
    ...lottoContract,
    functionName: 'getSequenceNumbersByUser',
    args: [address]
  })

  return Number(data.toString())
}
