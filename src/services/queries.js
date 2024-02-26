export const GET_SCORE_UPDATEDS = `
  query getLatestScoreUpdatedByGameName($fromBlock: Int) {
    scoreUpdateds(orderBy: blockNumber, orderDirection: desc) {
      id
      gameName
      gameId
      user
      score
      round_gameRound
      round_end
      round_claimPeriod
      gameLeaderboardInfo
      blockNumber
    }
  }
`

export const GET_USER_PROFILE_INFO = `
  query getUserProfileInfo($fromBlock: Int, $player: String) {
    redeemTickets(orderBy: blockNumber, orderDirection: desc, where: { player:  $player}) {
      id
      player
      gameId
      gameName
      ticketType
      ticketPrice
      round_gameRound
      round_end
      blockNumber
    },
    winners(orderBy: blockNumber, orderDirection: desc, where: { winner:  $player}){
      id
      winner
      amount
    },
    scoreUpdateds(orderBy: score, orderDirection: desc, where: { user:  $player}) {
      id
      gameName
      gameId
      user
      score
      blockNumber
    }
  }
`

export const GET_LOTTO = `
  query getLotto($fromBlock: Int) {
    winners(orderBy: blockNumber, orderDirection: desc) {
      id
      winner
      amount
    },
    enterLottoGames(orderBy: blockNumber, orderDirection: desc) {
      id
      participant
      number
    }
  }
`
