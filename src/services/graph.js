import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import { GET_SCORE_UPDATEDS, GET_LOTTO, GET_USER_PROFILE_INFO } from './queries'
import { networkConfig } from '../configs'

const first = 1000
const fromBlock = networkConfig.netId168587773.fromBlock

const client = () => {
  return new ApolloClient({
    uri: 'https://api.studio.thegraph.com/query/65347/blasteens/v0.0.4',
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      }
    }
  })
}

export async function getScoreUpdated() {
  const { data } = await client().query({
    query: gql(GET_SCORE_UPDATEDS),
    variables: { fromBlock, first }
  })
  if (!data) {
    return []
  }
  return data.scoreUpdateds
}

export async function getLotto() {
  const { data } = await client().query({
    query: gql(GET_LOTTO),
    variables: { fromBlock, first }
  })
  if (!data) {
    return []
  }
  return data
}

export async function getUserProfileInfo(player) {
  const { data } = await client().query({
    query: gql(GET_USER_PROFILE_INFO),
    variables: { fromBlock, player }
  })
  if (!data) {
    return []
  }
  return data
}

export async function getEnterGame(player) {
  const { data } = await client().query({
    query: gql(GET_USER_PROFILE_INFO),
    variables: { fromBlock, player }
  })
  if (!data) {
    return []
  }
  return data
}
