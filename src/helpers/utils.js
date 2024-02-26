import moment from 'moment'
import { utils } from 'ethers'
import BN from 'bignumber.js'
import numeral from 'numeral'

const BIG_TEN = new BN(10)

export const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const transformId = id => {
  const words = id.split('-')
  const transformedWords = words.map((word, index) => {
    return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
  })
  return transformedWords.join('')
}

export const formatHash = (txHash, chars = 6) => {
  return `${txHash.substring(0, chars + 2)}...${txHash.substring(txHash.length - chars)}`
}

export const formatTimeToMilliseconds = timeStamp => {
  return moment.unix(Number(timeStamp)).valueOf()
}

export function getAdjacentElements(arr, index) {
  const len = arr.length
  let newPrev, newNext

  if (index < 0 || len <= 0) return

  index - 1 >= 0 ? (newPrev = index - 1) : (newPrev = index + len - 1)
  index + 1 >= len ? (newNext = index + 1 - len) : (newNext = index + 1)

  return {
    newPrev,
    newNext
  }
}

export const isNowBeforeGameEndTime = gameEndTime => {
  return moment().isBefore(moment.unix(gameEndTime))
}

export function generateRandomHex32() {
  const randomBytes = utils.randomBytes(32)
  const randomHex = utils.hexlify(randomBytes)
  return randomHex
}

export function keccak256Hash(input) {
  return utils.keccak256(input)
}

export const formatTokenAmount = (amount, decimals = 18) => {
  return new BN(amount).dividedBy(BIG_TEN.pow(decimals)).toFixed()
}

export const numberFormat = (num, format = '0,0') => numeral(num).format(format)

