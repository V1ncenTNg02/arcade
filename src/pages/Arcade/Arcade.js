import { useParams } from 'react-router-dom'
import styles from './Arcade.module.scss'
import React, { useEffect, useMemo, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'

import { gameConfigs } from '../../configs/gameConfig'
import Phaser from 'phaser'
import { getABI, getContractAddress } from '../../helpers/network'
import { checkTicket, getCurrentGameInfo } from '../../helpers/contracts'
import { useGameSelector, useGameDispatch, gameTicketActions, gameLeaderboardActions } from 'blast-game-sdk'
import TicketFilter from '../../components/TicketFilter/TicketFilter'
import Leaderboard from '../../components/Leaderboard/Leaderboard'
import Inventory from '../../components/Inventory/Inventory'
import { transformId } from '../../helpers/utils'
import { useMediaQuery } from 'react-responsive'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import Layout from '../../components/Layout/Layout'

let game = null

function Arcade() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const netId = chain ? chain.id : 168587773
  const { openConnectModal } = useConnectModal()
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1280px)' })

  const [individuals, setIndividuals] = useState([])
  const [redeemTimes, setRedeemTimes] = useState(0)

  const { gameId } = useParams()

  const transformedGameId = transformId(gameId)

  const dispatch = useGameDispatch()

  const games = useGameSelector(state => state.gameTicket.games)
  const gameLeaderBoardInfo = useGameSelector(state => state.gameLeaderboard[transformedGameId] || null)

  const numberOfLives = useGameSelector(state => state.gameTicket.games[transformedGameId]?.numberOfLives || 0)
  const showTicketWindow = useGameSelector(state => state.gameTicket.showTicketWindow)

  const targetGame = gameConfigs[transformedGameId]

  const gameTicketContract = useMemo(() => {
    const address = getContractAddress('TICKET', netId)
    const abi = getABI('TICKET')
    if (!address || !abi) {
      return null
    }
    return {
      address,
      abi
    }
  }, [netId])

  const forwarderContract = useMemo(() => {
    const address = getContractAddress('FORWARDER', netId)
    const abi = getABI('FORWARDER')
    if (!address || !abi) {
      return null
    }
    return {
      address,
      abi
    }
  }, [netId])

  const gameContract = useMemo(() => {
    const address = getContractAddress('GAME', netId, transformedGameId)
    const abi = getABI('GAME')
    if (!address || !abi) {
      return null
    }
    return {
      address,
      abi
    }
  }, [netId, transformedGameId])

  useEffect(() => {
    if (!isConnected || !targetGame || isTabletOrMobile) {
      if (game) {
        game.destroy(true)
        game = null
      }
      return
    }
    if (!address) return
    if (game) return

    game = new Phaser.Game(targetGame.config)

    return () => {
      game.destroy(true)
      game = null
    }
  }, [isConnected, address, targetGame, isTabletOrMobile])

  useEffect(() => {
    const checkTicketHandler = async () => {
      if (!address || !gameTicketContract) return
      const data = await checkTicket(gameTicketContract, address)
      dispatch(gameTicketActions.setTickets(data))
      if (numberOfLives <= 0) {
        dispatch(gameTicketActions.setShowTicketWindow(true))
      }
    }
    checkTicketHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, gameTicketContract, numberOfLives])

  useEffect(() => {
    if (!gameContract) return

    const fetchGameInfo = async () => {
      const { round, gameStatus } = await getCurrentGameInfo(gameContract)

      if (!games[transformedGameId] && gameConfigs[transformedGameId]) {
        dispatch(gameTicketActions.initGame(transformedGameId))
        dispatch(gameLeaderboardActions.initGame({ gameName: transformedGameId, round, gameStatus }))
      }

      if (gameLeaderBoardInfo && round && gameStatus) {
        if (gameLeaderBoardInfo.round.gameRound !== round.gameRound) {
          dispatch(gameLeaderboardActions.initGame({ gameName: transformedGameId, round, gameStatus }))
        }
      }
    }

    fetchGameInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameContract, gameLeaderBoardInfo, redeemTimes])

  if (!targetGame) {
    return <div>The game url in invalid</div>
  }

  return (
    <Layout>
      <div className={styles.arcadeContainer}>
        <header className={styles.arcadeHeader}>
          <h1>{targetGame.name}</h1>
          <p>Remaining chance {numberOfLives}</p>
          <hr />
        </header>
        {!isTabletOrMobile ? (
          <div className={styles.arcadeContent}>
            <div className={styles.arcadeSideBlock}>
              <Leaderboard gameContract={gameContract} transformedGameId={transformedGameId} individuals={individuals} setIndividuals={setIndividuals} />
            </div>
            <div className={styles.arcadeFrameContainer} style={{ backgroundImage: `url('/images/arcade-frame.png')` }}>
              <div className={styles.arcadeGameContainer}>
                {isConnected ? (
                  <div id='gameDisplay' />
                ) : (
                  <div
                    className={styles.arcadeFilter}
                    style={{
                      backgroundImage: `url('/assets/games/${targetGame.key}/background.png')`
                    }}
                  >
                    <div className={styles.arcadeMenuContainer}>
                      {openConnectModal && <button className={(styles.arcadeWeb3Button, styles.btn, styles.drawBorder)} onClick={openConnectModal}>
                        Connect Your Wallet
                      </button>}
                    </div>
                  </div>
                )}
                {showTicketWindow && isConnected && (
                  <div className={`${styles.arcadeFilter} ${styles.ticketInfoContainer}`}>
                    <div className={`${styles.arcadeMenuContainer} ${styles.arcadeMenuContainerForTicket}`}>
                      <TicketFilter
                        transformedGameId={transformedGameId}
                        address={address}
                        gameTicketContract={gameTicketContract}
                        gameContract={gameContract}
                        forwarderContract={forwarderContract}
                        setIndividuals={setIndividuals}
                        setRedeemTimes={setRedeemTimes}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.arcadeSideBlock}>
              <Inventory />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div className={styles.arcadeFrameContainer} style={{ backgroundImage: `url('/images/arcade-frame.png')` }}>
              <div className={styles.arcadeGameContainer}>
                <div
                  className={styles.arcadeFilter}
                  style={{
                    backgroundImage: `url('/assets/games/${targetGame.key}/background.png')`
                  }}
                >
                  <div className={styles.arcadeMenuContainer}>
                    <div className={`${styles.btn} ${styles.drawBorder}`}>Desktop Only</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.mobileInfoContainer}>
              <div className={styles.arcadeSideBlock}>
                <Leaderboard gameContract={gameContract} transformedGameId={transformedGameId} individuals={individuals} setIndividuals={setIndividuals} />
              </div>
              <div className={styles.arcadeSideBlock}>
                <Inventory />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
export default Arcade
