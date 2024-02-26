import React, { useEffect, useState, useMemo } from "react";
import styles from './Profile.module.scss'
import { useAccount, useBalance, useWaitForTransaction, useContractReads } from "wagmi";
import { writeContract } from '@wagmi/core'
import { formatHash, numberFormat } from "../../helpers/utils";
import { gameConfigs } from "../../configs/gameConfig";
import { gameListConfigs } from "../../configs/gameListConfig";
import { Link } from "react-router-dom";
import { getUserProfileInfo } from "../../services/graph";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { getTotalRedemptionAmountForGame, getRedemptionTotalCount, getHighestScoreForGame, getTotalLottoWinnerAmount } from "../../helpers/profile";
import { getContractAddress, getABI } from "../../helpers/network";
import { RotatingLines } from "react-loader-spinner";
import { useConnectModal } from '@rainbow-me/rainbowkit'
import Layout from "../../components/Layout/Layout";

const Profile = () => {
  const { address, isConnected } = useAccount()
  const [userProfile, setUserProfile] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [pendingHash, setPendingHash] = useState('')
  const { data: ethBalance } = useBalance({ address, enabled: !!address })
  const { openConnectModal } = useConnectModal()

  const gameTicketContract = useMemo(() => {
    const address = getContractAddress('TICKET', 168587773)
    const abi = getABI('TICKET')
    if (!address || !abi) {
      return null
    }
    return {
      address,
      abi
    }
  }, [])

  const { data } = useContractReads({
    contracts: [
      {
        ...gameTicketContract,
        functionName: 'balanceOf',
        args: [address, 4]
      },
      {
        ...gameTicketContract,
        functionName: "getLottoTickets",
        args: [address],
      }
    ],
    enabled: !!address,
    watch: true,
  })

  const [lottoBalanceData, lottoTicketsAmountData] = data ?? []

  useWaitForTransaction({
    hash: pendingHash,
    enabled: !!pendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setPendingHash('')
      }
    },
    onError() {
      setPendingHash('')
      setIsClaiming(false)
    }
  })

  const handleClaimLottoTicket = async () => {
    if (!address) return
    setIsClaiming(true)
    const args = [address]

    try {
      const txReceiptForClaiming = await writeContract({
        ...gameTicketContract,
        account: address,
        args,
        functionName: 'claimLottoTicket'
      })
      console.log(txReceiptForClaiming)
      setPendingHash(txReceiptForClaiming.hash)
    } catch (error) {
      console.error("handleClaimLottoTicket error", error.message)
      setIsClaiming(false)
    }
  }

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (!address) return
        setIsLoading(true)
        const data = await getUserProfileInfo(address)
        setUserProfile(data)
      } catch (err) {
        console.error('fetchUserProfile error', err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInfo()
  }, [address])

  return (
    <Layout>
      <div className={styles.profileContainer}>
        {address && isConnected && data ?
          <div className={styles.columnContainer}>
            <div className={styles.userInfoSection}>
              <img className={styles.avatar} src='/images/nft6.jpeg' alt="avatar" />
              <div className={styles.userAddressSection}>
                Address: {formatHash(address, 4)}
              </div>
              <div className={styles.userAddressSection}>
                Balance: {numberFormat(ethBalance?.formatted, '0,0.000')} ETH
              </div>
              <div className={styles.userAddressSection}>
                Lotto Tickets: x {lottoBalanceData.status === 'success' ? String(lottoBalanceData.result) : '0'}
              </div>
              <div className={styles.userAddressSection}>
                Lotto Total WIN: {numberFormat(getTotalLottoWinnerAmount(userProfile), '0,0.000')} ETH
              </div>
              {lottoTicketsAmountData.status === 'success' && Number(lottoTicketsAmountData.result) > 0 && <div>
                <button className={styles.lottoClaimButton} onClick={handleClaimLottoTicket} disabled={isClaiming}>
                  {isClaiming ? <RotatingLines strokeColor='#eff0f2' height='20' width='20' /> : "Claim Lotto Ticket"}
                </button>
                <p style={{ color: "#ffc906", textAlign: 'center', margin: '5px 0' }}>* You can claim {Number(lottoTicketsAmountData.result)} tickets</p>
              </div>}
            </div>
            <div className={styles.gameInfoSection}>
              <div className={styles.gameHeader}>Game Statistics</div>
              {gameListConfigs.arcade.map(key => (
                <div className={styles.gameInfoContainer} key={key}>
                  <div className={styles.gameInfoColumnContainer}>
                    <h2 className={styles.gameInfoHeader}>{gameConfigs[key].name}</h2>
                    <Link to={gameConfigs[key]?.url} className={styles.gamePlayButton}>
                      PLAY
                    </Link>
                    <div className={styles.gameLogo}>
                      <img src={`/assets/games/${gameConfigs[key]['key']}/logo.png`} alt='LOGO' />
                    </div>
                    {
                      isLoading || !userProfile ? <div style={{ padding: '3px', width: '100%' }}>
                        <SkeletonTheme baseColor={'#191919'} highlightColor={'#7d7a92'}>
                          <Skeleton count={3} className={styles.skeletonLoading} />
                        </SkeletonTheme>
                      </div> : <div>
                        <div className={styles.statisticsWrapper}>
                          <p className={styles.gameInfoText}>Redemption:</p>
                          <p className={styles.gameInfoText}>{getRedemptionTotalCount(key, userProfile)}</p>
                        </div>
                        <div className={styles.statisticsWrapper}>
                          <p className={styles.gameInfoText}>Total Spent:</p>
                          <p className={styles.gameInfoText}>{numberFormat(getTotalRedemptionAmountForGame(key, userProfile), '0,0.000')} ETH</p>
                        </div>
                        <div className={styles.statisticsWrapper}>
                          <p className={styles.gameInfoText}>Highest Score:</p>
                          <p className={styles.gameInfoText}>{getHighestScoreForGame(key, userProfile)} pt</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
          : <div>
            {openConnectModal && <button className={styles.connectBtn} onClick={openConnectModal}>Connect Button</button>}
          </div>}
      </div>
    </Layout>
  )
}

export default Profile


