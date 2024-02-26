import styles from './TicketFilter.module.scss'
import gameViewStyles from '../../pages/Arcade/Arcade.module.scss'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { writeContract } from '@wagmi/core'
import { useWaitForTransaction, useWalletClient, useAccount, useNetwork, useContractRead } from 'wagmi'
import BN from 'bignumber.js'
import { gameTicketActions, gameLeaderboardActions, useGameDispatch, useGameSelector } from 'blast-game-sdk'
import { checkScore, checkTicket } from '../../helpers/contracts'
import { RotatingLines } from 'react-loader-spinner'
import { getNonceForForwarder, getABI } from '../../helpers/network'
import { handleSignTrustedForwarderMessage } from '../../helpers/eip721'
import { useEthersSigner, useEthersProvider } from '../../hooks'
import { ethers } from 'ethers'
import { isNowBeforeGameEndTime } from '../../helpers/utils'

function TicketFilter({ transformedGameId, address, gameTicketContract, forwarderContract, gameContract, setIndividuals, setRedeemTimes }) {
  const [isBuying, setIsBuying] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [livesRedeemed, setLivesRedeemed] = useState(0)
  const [syncPendingHash, setSyncPendingHash] = useState('')
  const [buyingPendingHash, setBuyingPendingHash] = useState('')
  const [redeemingPendingHash, setRedeemingPendingHash] = useState('')
  const [approvingPendingHash, setApprovingPendingHash] = useState('')

  const { data: walletClientData } = useWalletClient()
  const { address: walletAddress } = useAccount()
  const { chain } = useNetwork()
  const netId = chain?.id ?? 168587773
  const signer = useEthersSigner(netId, chain?.name, walletAddress, walletClientData)
  const provider = useEthersProvider()
  const gameInterface = new ethers.utils.Interface(getABI('GAME'))

  const dispatch = useGameDispatch()
  const tickets = useGameSelector(state => state.gameTicket.tickets)
  const score = useGameSelector(state => state.gameLeaderboard[transformedGameId]?.score) || 0
  const allowSync = useGameSelector(state => state.gameLeaderboard[transformedGameId]?.allowSync) || false
  const gameRound = useGameSelector(state => state.gameLeaderboard[transformedGameId]?.round) || null
  const numberOfLives = useGameSelector(state => state.gameTicket.games[transformedGameId]?.numberOfLives ?? 0)

  const { register, handleSubmit } = useForm({
    defaultValues: {
      buyTicketType: 1,
      ticketAmount: 0,
      redeemTicketType: 1
    }
  })

  const gameStatus = useGameSelector(state => state.gameLeaderboard[transformedGameId]?.gameStatus) || null

  const handleSignMessage = async () => {
    if (!netId || !provider || !walletAddress) return

    const encodeFunctionData = gameInterface.encodeFunctionData('addScore', [address, score])

    try {
      const nonce = await getNonceForForwarder(netId, provider, walletAddress)
      if (!nonce) return undefined
      const signature = await handleSignTrustedForwarderMessage(netId, signer, nonce, encodeFunctionData, transformedGameId)
      if (!signature) return undefined
      const signatureData = {
        forwarderData: signature.message,
        signature: signature.signature
      }
      return signatureData
    } catch (error) {
      console.error(`Sign Forwarder Message error: ${error.message}`)
      return undefined
    }
  }

  const { data: isTicketApprovedForGame } = useContractRead({
    ...gameTicketContract,
    enabled: !!walletAddress,
    functionName: 'isApprovedForAll',
    args: [walletAddress, gameContract.address],
    watch: true
  })

  useWaitForTransaction({
    hash: buyingPendingHash,
    enabled: !!buyingPendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setBuyingPendingHash('')
        console.log('>>>>>>>>>Buying success')
        const updatedTickets = await checkTicket(gameTicketContract, address)
        dispatch(gameTicketActions.setTickets(updatedTickets))
      }
      setIsBuying(false)
    },
    onError() {
      setBuyingPendingHash('')
      setIsBuying(false)
    }
  })

  const handleBuyTicket = async data => {
    setIsBuying(true)
    const args = [Number(data.buyTicketType), Number(data.ticketAmount)]
    const totalPrice = (Number(data.buyTicketType) * Number(data.ticketAmount)) / 10

    try {
      const txReceiptForBuying = await writeContract({
        ...gameTicketContract,
        account: walletClientData.account.address,
        args,
        functionName: 'buyTicket',
        value: new BN(totalPrice.toString()).multipliedBy(new BN(10).pow(new BN(18)))
      })
      console.log(txReceiptForBuying)
      setBuyingPendingHash(txReceiptForBuying.hash)
    } catch (error) {
      console.log(error)
      setIsBuying(false)
    }
  }

  useWaitForTransaction({
    hash: redeemingPendingHash,
    enabled: !!redeemingPendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setRedeemingPendingHash('')
        const updatedTickets = await checkTicket(gameTicketContract, address)
        dispatch(gameTicketActions.setTickets(updatedTickets))
        dispatch(
          gameTicketActions.setNumberOfLives({
            gameName: transformedGameId,
            numberOfLives: livesRedeemed
          })
        )
        dispatch(gameTicketActions.setShowTicketWindow(false))

        const data = await checkScore(gameContract, transformedGameId)
        setIndividuals(data)
        setRedeemTimes(prev => (prev += 1))
        console.log('>>>>>>>>>Redeeming success')
      }
      setIsRedeeming(false)
      setLivesRedeemed(0)
    },
    onError() {
      setRedeemingPendingHash('')
      setIsRedeeming(false)
      setLivesRedeemed(0)
    }
  })

  const handleRedeemTicket = async data => {
    setIsRedeeming(true)
    const args = [Number(data.redeemTicketType)]
    const targetTicket = tickets.find(ticket => ticket.type.toString() === data.redeemTicketType.toString())
    setLivesRedeemed(Number(targetTicket.numberOfLives))
    dispatch(gameLeaderboardActions.resetGameScore(transformedGameId))

    try {
      const txReceiptForRedeeming = await writeContract({
        ...gameContract,
        account: walletClientData.account.address,
        args,
        functionName: 'redeemTicket'
      })
      console.log(txReceiptForRedeeming)
      setRedeemingPendingHash(txReceiptForRedeeming.hash)
    } catch (error) {
      console.log(error)
      setIsRedeeming(false)
      setLivesRedeemed(0)
    }
  }

  const handleApproveTicket = async () => {
    setIsApproving(true)
    const args = [gameContract.address, true]

    try {
      const txReceiptForApproving = await writeContract({
        ...gameTicketContract,
        account: walletClientData.account.address,
        args,
        functionName: 'setApprovalForAll'
      })
      console.log(txReceiptForApproving)
      setRedeemingPendingHash(setApprovingPendingHash.hash)
    } catch (error) {
      console.log(error)
      setIsApproving(false)
    }
  }

  useWaitForTransaction({
    hash: approvingPendingHash,
    enabled: !!approvingPendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setApprovingPendingHash('')
        console.log('>>>>>>>>>Approve Success')
      }
      setIsApproving(false)
    },
    onError() {
      setSyncPendingHash('')
      setIsApproving(false)
      console.log('>>>>>>>>>Approve finish')
    }
  })

  useWaitForTransaction({
    hash: syncPendingHash,
    enabled: !!syncPendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setSyncPendingHash('')
        console.log('>>>>>>>>>Sync success')
      }
      setIsSyncing(false)
      if (numberOfLives > 0) {
        dispatch(gameTicketActions.setShowTicketWindow(false))
      }
      dispatch(
        gameLeaderboardActions.toggleSyncPermission({
          gameName: transformedGameId,
          allowSync: false
        })
      )
    },
    onError() {
      setSyncPendingHash('')
      setIsSyncing(false)
      console.log('>>>>>>>>>Sync finish,but your score is too low')
    }
  })

  const handleSyncScore = async () => {
    if (!gameRound) return

    setIsSyncing(true)

    try {
      const currentLeaderboard = await checkScore(gameContract, transformedGameId)
      if (!currentLeaderboard || !isNowBeforeGameEndTime(gameRound.gameEndTime)) {
        dispatch(gameLeaderboardActions.resetGameScore(transformedGameId))
        setIsSyncing(false)
        return
      }
      if (currentLeaderboard.length >= 10) {
        if (Number(score) <= Number(currentLeaderboard[9].points)) {
          setIsSyncing(false)
          return
        }
      }
      const forwarderSignatureData = await handleSignMessage()
      if (!forwarderSignatureData) return
      const txReceiptForSyncing = await writeContract({
        ...forwarderContract,
        account: walletClientData.account.address,
        args: [forwarderSignatureData.forwarderData, forwarderSignatureData.signature],
        functionName: 'execute'
      })
      console.log(txReceiptForSyncing)
      setSyncPendingHash(txReceiptForSyncing.hash)
    } catch (error) {
      console.error('handleSyncScore', error.message)
      setIsSyncing(false)
    }
  }

  return (
    <div>
      {allowSync ? (
        <div className={styles.buttonContainer}>
          <h3 className={styles.score}>Score: {score}</h3>
          <button
            className={(gameViewStyles.arcadeWeb3Button, gameViewStyles.btn, gameViewStyles.drawBorder)}
            onClick={handleSubmit(handleSyncScore)}
            disabled={isSyncing}
          >
            {isSyncing ? <RotatingLines strokeColor='#eff0f2' height='20' width='20' /> : 'Sync'}
          </button>
          <button
            className={(gameViewStyles.arcadeWeb3Button, gameViewStyles.btn, gameViewStyles.drawBorder)}
            onClick={() => {
              if (numberOfLives > 0) {
                dispatch(gameTicketActions.setShowTicketWindow(false))
              } else {
                dispatch(
                  gameLeaderboardActions.toggleSyncPermission({
                    gameName: transformedGameId,
                    allowSync: false
                  })
                )
              }
              dispatch(gameLeaderboardActions.resetGameScore(transformedGameId))
            }}
          >
            Restart
          </button>
        </div>
      ) : (
        <div>
          <div className={styles.formOuterContainer}>
            <div className={styles.formContainer}>
              <select className={styles.selection} {...register('buyTicketType')}>
                <option value={1}>Bronze</option>
                <option value={2}>Sliver</option>
                <option value={3}>Gold</option>
              </select>
              <input className={styles.numberInput} placeholder='fill in number of tickets' {...register('ticketAmount')} />
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button
              className={(gameViewStyles.arcadeWeb3Button, gameViewStyles.btn, gameViewStyles.drawBorder)}
              onClick={handleSubmit(handleBuyTicket)}
              disabled={isBuying}
            >
              {isBuying ? <RotatingLines strokeColor='#eff0f2' height='20' width='20' /> : 'Buy Ticket'}
            </button>
          </div>
          {!gameStatus?.isClaiming && (
            <>
              <div className={styles.formOuterContainer}>
                <div className={styles.formContainer}>
                  <select className={styles.redeemSelection} {...register('redeemTicketType')}>
                    <option value={1}>Bronze</option>
                    <option value={2}>Sliver</option>
                    <option value={3}>Gold</option>
                  </select>
                </div>
              </div>
              <div className={styles.buttonContainer}>
                {
                  isTicketApprovedForGame ? <button
                    className={(gameViewStyles.arcadeWeb3Button, gameViewStyles.btn, gameViewStyles.drawBorder)}
                    onClick={handleSubmit(handleRedeemTicket)}
                    disabled={isRedeeming}
                  >
                    {isRedeeming ? <RotatingLines strokeColor='#eff0f2' height='20' width='20' /> : 'Redeem Ticket'}
                  </button> : <button
                    onClick={handleSubmit(handleApproveTicket)}
                    disabled={isApproving}
                    className={(gameViewStyles.arcadeWeb3Button, gameViewStyles.btn, gameViewStyles.drawBorder)}
                  >
                    {isApproving ? <RotatingLines strokeColor='#eff0f2' height='20' width='20' /> : 'Approve Ticket'}
                  </button>
                }
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default TicketFilter
