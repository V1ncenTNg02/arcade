import styles from './Leaderboard.module.scss'
import React, { useEffect, useState } from 'react'
import { checkScore } from '../../helpers/contracts'
import { formatHash, formatTimeToMilliseconds } from '../../helpers/utils'
import { useGameSelector } from 'blast-game-sdk'
import Countdown from 'react-countdown'
import { writeContract } from '@wagmi/core'
import { useAccount, useBalance, useWaitForTransaction } from 'wagmi'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { RotatingLines } from 'react-loader-spinner'
import 'react-loading-skeleton/dist/skeleton.css'

function Individual({ rank, points, addressLink, address }) {
  return (
    <div className={styles.individualContainer}>
      <div className={styles.individualInner} style={{ flex: 1 }}>
        #{rank}
      </div>
      <div className={styles.individualInner} style={{ flex: 2 }}>
        {points} pt
      </div>
      <div className={styles.individualInner} style={{ flex: 3 }}>
        <a href={addressLink} target='_blank' rel='noopener noreferrer'>
          {formatHash(address, 4)}
        </a>
      </div>
    </div>
  )
}

function Leaderboard({ gameContract, transformedGameId, individuals, setIndividuals }) {
  const { address } = useAccount()
  const allowSync = useGameSelector(state => state.gameLeaderboard[transformedGameId]?.allowSync) || false
  const round = useGameSelector(state => state.gameLeaderboard[transformedGameId]?.round) || null
  const gameStatus = useGameSelector(state => state.gameLeaderboard[transformedGameId]?.gameStatus) || null
  const [isClaimingReward, setIsClaimingReward] = useState(false)
  const [isFetchingInfo, setIsFetchingInfo] = useState(true)
  const [pendingHash, setPendingHash] = useState('')
  const { data: poolPrize } = useBalance({ address: gameContract.address, watch: true })

  useEffect(() => {
    if (!gameContract) return
    const leaderboardHandler = async () => {
      try {
        setIsFetchingInfo(true)
        const data = await checkScore(gameContract, transformedGameId)
        setIndividuals(data)
      } catch (error) {
        console.error('leaderboardHandler error', error.message)
      } finally {
        setIsFetchingInfo(false)
      }
    }
    leaderboardHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameContract, allowSync, transformedGameId])

  useWaitForTransaction({
    hash: pendingHash,
    enabled: !!pendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setPendingHash('')
        console.log('>>>>>>>>>Redeeming success')
      }
      setIsClaimingReward(false)
    },
    onError() {
      setPendingHash('')
      setIsClaimingReward(false)
    }
  })

  const handleClaimReward = async () => {
    if (!address) return
    try {
      setIsClaimingReward(true)
      const txReceiptForClaiming = await writeContract({
        ...gameContract,
        account: address,
        functionName: 'claimReward'
      })
      console.log(txReceiptForClaiming)
      setPendingHash(txReceiptForClaiming.hash)
    } catch (error) {
      console.error('handleClaimReward error', error.message)
      setIsClaimingReward(false)
    }
  }

  const countdownRender = ({ days, hours, minutes, seconds }) => {
    return (
      <p className={styles.infoText}>
        {days} D : {hours} H : {minutes} M : {seconds} S
      </p>
    )
  }

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.stickyHeader}>
        <h2>Leaderboard {round && `#${round.gameRound}`}</h2>
        <div className={styles.prizeInfoContainer}>
          <div style={{ minWidth: '250px' }}>
            <p className={styles.infoText}>Prize Pool: {poolPrize?.formatted} ETH</p>
            {round && gameStatus && (
              <span className={styles.countdownSection}>
                <p className={styles.infoText}>{gameStatus.isGameRunning ? 'Game' : 'Claim'} Remaining:</p>
                <Countdown date={formatTimeToMilliseconds(gameStatus.isGameRunning ? round.gameEndTime : round.claimEndTime)} renderer={countdownRender} />
              </span>
            )}
          </div>
          {gameStatus && gameStatus.isClaiming && address && (
            <button className={styles.claimBtn} onClick={handleClaimReward} disabled={isClaimingReward}>
              {isClaimingReward ? <RotatingLines strokeColor='#eff0f2' height='20' width='20' /> : "Claim"}
            </button>
          )}
        </div>
      </div>
      {isFetchingInfo ? (
        <div style={{ padding: '5px' }}>
          <SkeletonTheme baseColor={'#000000'} highlightColor={'#7d7a92'}>
            <Skeleton count={10} className={styles.skeletonLoading} />
          </SkeletonTheme>
        </div>
      ) : (
        <div>
          {individuals.map((individual, index) => (
            <Individual key={index} {...individual} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Leaderboard
