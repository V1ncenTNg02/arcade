import { useEffect, useState } from 'react'

import { useRefresh } from '../context/Refresh/hooks'
import { getScoreUpdated } from '../services/graph'

export const useLeaderboard = transformedGameId => {
  const [highestScore, setHighestScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchEventsData = async () => {
      if (!transformedGameId) return

      try {
        setIsLoading(true)
        const data = await getScoreUpdated()

        const latestEventsByGameName = {}
        data.forEach(event => {
          if (!latestEventsByGameName[event.gameName]) {
            latestEventsByGameName[event.gameName] = event
          } else {
            if (latestEventsByGameName[event.gameName].blockNumber < event.blockNumber) {
              latestEventsByGameName[event.gameName] = event
            }
          }
        })

        const { gameLeaderboardInfo } = latestEventsByGameName[transformedGameId]

        if (!gameLeaderboardInfo) return
        setLeaderboard(gameLeaderboardInfo)
        const splitData = gameLeaderboardInfo[0].split(',')
        const score = splitData[1]
        setHighestScore(score)
      } catch (error) {
        setError(error)
        console.error('getScoreUpdated error', error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEventsData()
  }, [transformedGameId, fastRefresh])

  return { highestScore, leaderboard, error, isLoading, loaded, setLoaded }
}
