import React, { useState, useEffect, useMemo } from 'react'
import styles from './Prize.module.scss'
import { gameListConfigs } from '../../configs/gameListConfig'
import { getABI, getContractAddress } from '../../helpers/network'
import { checkScore, getCurrentGameInfo } from '../../helpers/contracts'
import { useBalance } from 'wagmi'
import { gameConfigs } from '../../configs/gameConfig'
import { gameLeaderboardActions, gameTicketActions, useGameDispatch, useGameSelector } from 'blast-game-sdk'
import Countdown from 'react-countdown'
import { formatTimeToMilliseconds, formatHash, numberFormat } from '../../helpers/utils'
import { RotatingLines } from 'react-loader-spinner'

export default function Price() {
  const gameList = gameListConfigs.arcade

  const [individuals, setIndividuals] = useState([])
  const [isFetchingInfo, setIsFetchingInfo] = useState(false)
  const [selected, setSelected] = useState(gameListConfigs.arcade[0])
  const [isGamer, setIsGamer] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const dispatch = useGameDispatch()

  const games = useGameSelector(state => state.gameTicket.games)
  const round = useGameSelector(state => state.gameLeaderboard[selected]?.round) || null
  const gameStatus = useGameSelector(state => state.gameLeaderboard[selected]?.gameStatus) || null

  const gameContract = useMemo(() => {
    const address = getContractAddress('GAME', 168587773, selected)
    const abi = getABI('GAME')
    if (!address || !abi) {
      return null
    }
    return {
      address,
      abi
    }
  }, [selected])

  const { data: poolPrize } = useBalance({ address: gameContract?.address, watch: true })

  useEffect(() => {
    if (!gameContract || !selected) return
    const leaderboardHandler = async () => {
      try {
        setIsFetchingInfo(true)
        const data = await checkScore(gameContract, selected)
        setIndividuals(data)
      } catch (error) {
        console.error('leaderboardHandler error', error.message)
      } finally {
        setIsFetchingInfo(false)
      }
    }
    leaderboardHandler()
  }, [gameContract, selected])

  useEffect(() => {
    if (!gameContract) return

    const fetchGameInfo = async () => {
      const { round, gameStatus } = await getCurrentGameInfo(gameContract)

      if (!games[selected] && gameConfigs[selected]) {
        dispatch(gameTicketActions.initGame(selected))
        dispatch(gameLeaderboardActions.initGame({ gameName: selected, round, gameStatus }))
      }
    }

    fetchGameInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameContract])

  useEffect(() => {
    const handleOutsideClick = event => {
      if (isOpen && !event.target.closest(`.${styles.selectSection}`)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpen])

  const countdownRender = ({ days, hours, minutes, seconds }) => {
    return (
      <p className={styles.infoText}>
        {days} D : {hours} H : {minutes} M : {seconds} S
      </p>
    )
  }

  return (
    <div>
      <div className={styles.page}>
        <div className={styles.pricePage}>
          <div className={styles.contentWrapper}>
            <div className={styles.rankSection}>
              <div className={styles.title}> {gameConfigs[selected].name}</div>
              {isFetchingInfo
                ? <div className={styles.poolInfoWrapper}>
                  <RotatingLines strokeColor='#eff0f2' />
                </div>
                : <div className={styles.poolInfoWrapper}>
                  <div className={styles.poolInfo}>
                    <div>Prize Pool: {numberFormat(poolPrize?.formatted, '0,0.000')} ETH</div>
                    {round && gameStatus && (
                      <div className={styles.timeSection}>
                        <p>{gameStatus.isGameRunning ? 'Game' : 'Claim'} Remaining:</p>
                        <Countdown date={formatTimeToMilliseconds(gameStatus.isGameRunning ? round.gameEndTime : round.claimEndTime)} renderer={countdownRender} />
                      </div>
                    )}
                  </div>
                  <ul className={styles.rankTable}>
                    {individuals.map(item => (
                      <li className={styles.dataRow} key={item.rank}>
                        <div className={styles.data}>#{item.rank}</div>
                        <div className={styles.data}>{item.points}pt</div>
                        <div className={styles.data}>{formatHash(item.address, 5)}</div>
                      </li>
                    ))}
                  </ul>
                </div>}
            </div>
            <div className={styles.controlSection}>
              <div className={styles.controlButtons}>
                <div className={styles.switch}>
                  <div className={isGamer ? styles.selected : styles.notSelected} onClick={() => setIsGamer(true)}>
                    Gamer
                  </div>
                  <div className={isGamer ? styles.notSelected : styles.selected} onClick={() => setIsGamer(false)}>
                    Developer
                  </div>
                </div>
                <div className={styles.selectSection}>
                  <div className={isOpen ? styles.selectedNameOpen : styles.selectedName} onClick={() => setIsOpen(!isOpen)}>
                    {gameConfigs[selected].name}
                  </div>
                  {isOpen && (
                    <div className={styles.dropdown}>
                      {gameList.map(item => (
                        <div
                          className={styles.selectItem}
                          onClick={() => {
                            setSelected(item)
                            setIsOpen(false)
                          }}
                        >
                          {gameConfigs[item].name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.claimSection}>
                <div className={styles.yieldText}>
                  Your Yield:<div className={styles.textGreen}>1111 blast</div>
                </div>
                <button className={styles.claimButton}>Claim</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
