import { useEffect, useState } from 'react'
import { useRefresh } from '../context/Refresh/hooks'
import { getScoreUpdated } from '../services/graph'

export const useHighScore = () => {
  const [highestScoresByGame, setHighestScoresByGame] = useState({})
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        const data = await getScoreUpdated()

        const latestEventsByGameName = {}
        data.forEach(event => {
          if (!latestEventsByGameName[event.gameName] || latestEventsByGameName[event.gameName].blockNumber < event.blockNumber) {
            latestEventsByGameName[event.gameName] = event
          }
        })

        const scoresByGame = {}
        Object.values(latestEventsByGameName).forEach(event => {
          const { gameName, gameLeaderboardInfo } = event
          const highestScore = gameLeaderboardInfo.reduce((max, info) => {
            const score = parseInt(info.split(',')[1], 10)
            return score > max ? score : max
          }, 0)
          scoresByGame[gameName] = highestScore
        })

        setHighestScoresByGame(scoresByGame)
      } catch (error) {
        setError(error)
        console.error('getScoreUpdated error:', error.message)
      } finally {
        setIsLoading(false)
        setLoaded(true)
      }
    }

    fetchEventsData()
  }, [fastRefresh])

  return { highestScoresByGame, error, isLoading, loaded }
}
