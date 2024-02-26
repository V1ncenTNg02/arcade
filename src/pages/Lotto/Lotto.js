import { generateRandomHex32, keccak256Hash, formatHash, formatTokenAmount, numberFormat } from '../../helpers/utils'
import { useEffect, useMemo, useState } from 'react'
import { getABI, getContractAddress } from '../../helpers/network'
import { writeContract } from '@wagmi/core'
import { useAccount, useWaitForTransaction, useBalance, useContractEvent, useContractRead } from 'wagmi'
import BN from 'bignumber.js'
import { PYTH_BASE_URL } from '../../configs'
import { getSequenceNumberByUser } from '../../helpers/contracts'
import axios from 'axios'
import styles from './Lotto.module.scss'
import { getLotto } from '../../services/graph'
import { useRefresh } from '../../context/Refresh/hooks'
import { RotatingLines } from 'react-loader-spinner'
import { inputRegex, escapeRegExp } from '../../helpers/utils'
import { getLottoParticipantsAmount } from '../../helpers/lotto'
import Layout from '../../components/Layout/Layout'

function Lotto() {
  const [randomnessPendingHash, setRandomnessPendingHash] = useState('')
  const [revealPendingHash, setRevealPendingHash] = useState('')
  const [approvePendingHash, setApprovePendingHash] = useState('')
  const [participatePendingHash, setParticipatePendingHash] = useState('')
  const [userRandomNumber, setUserRandomNumber] = useState('0')
  const [participantsCount, setParticipantsCount] = useState(0)
  const [lastWinner, setLastWinner] = useState(null)
  const [lastestWinner, setLastestWinner] = useState(null)
  const [shouldGetSequenceNumber, setShouldGetSequenceNumber] = useState(false)
  const [shouldGetRandomNumber, setShouldGetRandomNumber] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isParticipating, setIsParticipating] = useState(false)
  const [triggerRefresh, setTriggerRefresh] = useState(0)
  const { address: walletAddress, isConnected } = useAccount()
  const { slowRefresh } = useRefresh()
  const [noOfParticipation, setNoOfParticipation] = useState("")

  const enforcer = (nextUserInput) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      setNoOfParticipation(nextUserInput)
    }
  }

  const handleInputChange = (e) => {
    const inputValue = e.target.value.replace(/,/g, '.')
    enforcer(inputValue)
  }

  const lottoContract = useMemo(() => {
    const address = getContractAddress('LOTTO', 168587773)
    const abi = getABI('LOTTO')
    if (!address || !abi) {
      return null
    }
    return {
      address,
      abi
    }
  }, [])

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

  const { data: lottoTicketNumber } = useContractRead(({
    ...gameTicketContract,
    watch: true,
    enabled: !!walletAddress,
    functionName: 'balanceOf',
    args: [walletAddress, 4]
  }))

  const { data: isTicketApprovedForLotto } = useContractRead({
    ...gameTicketContract,
    enabled: !!walletAddress,
    functionName: 'isApprovedForAll',
    args: [walletAddress, lottoContract.address],
    watch: true
  })

  const handleApproveTicket = async () => {
    setIsApproving(true)
    const args = [lottoContract.address, true]

    try {
      const txReceiptForApproving = await writeContract({
        ...gameTicketContract,
        account: walletAddress,
        args,
        functionName: 'setApprovalForAll'
      })
      console.log(txReceiptForApproving)
      setApprovePendingHash(txReceiptForApproving.hash)
    } catch (error) {
      console.error('handleApproveTicket error', error.message)
      setIsApproving(false)
    }
  }

  const handleParticipateLotto = async () => {
    setIsParticipating(true)

    try {
      const txReceiptForParticipating = await writeContract({
        ...lottoContract,
        account: walletAddress,
        args: [noOfParticipation],
        functionName: 'participate'
      })
      console.log(txReceiptForParticipating)
      setParticipatePendingHash(txReceiptForParticipating.hash)
    } catch (error) {
      console.error('handleParticipateLotto error', error.message)
      setIsParticipating(false)
      setNoOfParticipation("")
    }
  }

  const { data: lottoPrize } = useBalance({ address: lottoContract?.address, watch: true })

  useEffect(() => {
    const fetchLottoInfo = async () => {
      try {
        const data = await getLotto()
        if (data.winners.length > 0) setLastWinner({
          winner: data.winners[0].winner,
          amount: data.winners[0].amount
        })
        if (data.enterLottoGames.length > 0) {
          setParticipantsCount(getLottoParticipantsAmount(data))
        }
      } catch (error) {
        console.error("fetchLottoInfo error", error.message)
      }
    }
    fetchLottoInfo()
  }, [slowRefresh, triggerRefresh])

  useContractEvent({
    address: lottoContract.address,
    abi: lottoContract.abi,
    enabled: !!lottoContract && shouldGetRandomNumber,
    eventName: 'Winner',
    listener(log) {
      const event = log
      const args = event[0].args
      setLastestWinner(args)
      setIsDrawing(false)
      setShouldGetRandomNumber(false)
      setTriggerRefresh(x => x + 1)
    },
  })

  useEffect(() => {
    if (lastestWinner) {
      const boxTimer = setTimeout(() => {
        setLastestWinner(null);
      }, 5000);

      return () => clearTimeout(boxTimer);
    }
  }, [lastestWinner]);

  useWaitForTransaction({
    hash: revealPendingHash,
    enabled: !!revealPendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setRevealPendingHash('')
        setShouldGetRandomNumber(true)
        console.log('>>>>>>>>>generating success')
      }
    },
    onError() {
      setRevealPendingHash('')
      setIsDrawing(false)
    }
  })

  useWaitForTransaction({
    hash: approvePendingHash,
    enabled: !!approvePendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setApprovePendingHash('')
        setIsApproving(false)
      }
    },
    onError() {
      setApprovePendingHash('')
      setIsApproving(false)
    }
  })

  useWaitForTransaction({
    hash: participatePendingHash,
    enabled: !!participatePendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setParticipatePendingHash('')
      }
      setIsParticipating(false)
      setNoOfParticipation("")
      setTriggerRefresh(x => x + 1)
    },
    onError() {
      setParticipatePendingHash('')
      setIsParticipating(false)
      setNoOfParticipation("")
    }
  })

  useEffect(() => {
    if (!shouldGetSequenceNumber) return

    const fetchSequenceNumber = async () => {
      try {
        const sequenceNumber = await getSequenceNumberByUser(lottoContract, walletAddress)
        const res = await axios.get(`${PYTH_BASE_URL}/${sequenceNumber}`)
        const providerRandomNumber = `0x${res.data.value.data}`

        const getTxReceipt = await writeContract({
          ...lottoContract,
          account: walletAddress,
          functionName: 'revealResult',
          args: [sequenceNumber, userRandomNumber, providerRandomNumber]
        })

        setRevealPendingHash(getTxReceipt.hash)
      } catch (error) {
        console.error(error)
        setIsDrawing(false)
      } finally {
        setShouldGetSequenceNumber(false)
      }
    }

    fetchSequenceNumber()
  }, [walletAddress, lottoContract, shouldGetSequenceNumber, userRandomNumber])

  useWaitForTransaction({
    hash: randomnessPendingHash,
    enabled: !!randomnessPendingHash,
    onSuccess: async data => {
      if (data.status === 'success') {
        setRandomnessPendingHash('')
        setShouldGetSequenceNumber(true)
        console.log('>>>>>>>>>Requesting success')
      }
    },
    onError() {
      setRandomnessPendingHash('')
      setIsDrawing(false)
    }
  })

  const handleDrawingReward = async () => {
    setIsDrawing(true)
    const generatedRandomNumber = generateRandomHex32()
    setUserRandomNumber(generatedRandomNumber)
    const commitment = keccak256Hash(generatedRandomNumber)
    console.log('>>>>>>>generatedRandomNumber', generatedRandomNumber)
    console.log('>>>>>>>commitment', commitment)

    try {
      const requestTxReceipt = await writeContract({
        ...lottoContract,
        account: walletAddress,
        functionName: 'requestRandomness',
        args: [commitment],
        value: new BN('0.001').multipliedBy(new BN(10).pow(new BN(18)))
      })

      setRandomnessPendingHash(requestTxReceipt.hash)
      console.log('>>>>>>>generatedRandomNumber', generatedRandomNumber)
      console.log('>>>>>>>commitment', commitment)
    } catch (error) {
      console.error(error)
      setIsDrawing(false)
    }
  }

  return (
    <Layout>
      <div className={styles.drawBox}>
        <div className={styles.prizeInfoSection}>
          <h2>Participants: {participantsCount}</h2>
          <h2>Lotto Prize: {numberFormat(lottoPrize?.formatted, '0.000')} ETH</h2>
          {lastWinner && <h2>Last Winner: {formatHash(lastWinner.winner, 3)} - {numberFormat(formatTokenAmount(lastWinner.amount), '0,0.000')} ETH</h2>}
        </div>
        <div className={styles.lottoBoxContainer}>
          <div className={styles.bgLight} />
          <div className={`${lastestWinner ? styles.boxOpen : styles.closeBox} ${isDrawing ? styles.picShake : ''}`}>
            <div className={`${styles.boxMsg} ${!lastestWinner ? styles.hide : ''}`}>
              {lastestWinner && (
                <div className={styles.winning}>
                  <h3 className={styles.boxMsgTitle}>Congratulations!</h3>
                  <div className={styles.boxMsgCongent}>{formatHash(lastestWinner.winner, 3)} won {numberFormat(formatTokenAmount(lastestWinner.amount.toString()), '0,0.000')} ETH</div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.buttonWrapper}>
            {!isTicketApprovedForLotto ? <button
              className={styles.drawBtn}
              onClick={handleApproveTicket}
              disabled={isApproving}
            >
              {isApproving ? <RotatingLines strokeColor='#eff0f2' height='20' width='20' /> : 'Approve Ticket'}
            </button> :
              <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                {Number(lottoTicketNumber) !== 0 && <div className={styles.participateInputContainer}>
                  <input className={styles.participateInput} placeholder='Enter the number ...' onChange={handleInputChange} type='text' value={noOfParticipation} />
                  <button className={styles.maxBtn} onClick={() => setNoOfParticipation(String(lottoTicketNumber))}>{Number(lottoTicketNumber)}</button>
                  <button className={styles.participateBtn} onClick={handleParticipateLotto} disabled={isParticipating || Number(noOfParticipation) < 1 || Number(noOfParticipation) > Number(lottoTicketNumber)}>{isParticipating ? <RotatingLines strokeColor='#eff0f2' height='20' width='20' /> : 'Participate'}</button>
                </div>}
                {Number(noOfParticipation) > Number(lottoTicketNumber) && <p className={styles.errorText}>* Number has exceeded your balance [{Number(lottoTicketNumber)}]</p>}
                <button className={styles.drawBtn} onClick={handleDrawingReward} disabled={isDrawing || Number(lottoPrize?.formatted) < 0.1 || participantsCount < 100 || !isConnected}>{isDrawing ? <RotatingLines strokeColor='#eff0f2' height='20' width='20' /> : 'Draw Rewards'}</button>
              </div>}
          </div >
        </div>
      </div>
    </Layout>
  )
}

export default Lotto
