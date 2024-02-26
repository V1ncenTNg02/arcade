import { Route, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage/Homepage'
import Arcade from './pages/Arcade/Arcade'
import Prize from './pages/Prize/Prize'
import { createConfig, WagmiConfig, configureChains } from 'wagmi'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { GameProvider } from 'blast-game-sdk'
import Market from './pages/Market/Market'
import NotFound from './pages/NotFound/NotFound'
import Aboutus from './pages/About/Aboutus'
import { defineChain } from 'viem'
import 'react-loading-skeleton/dist/skeleton.css'
import { RefreshContextProvider } from './context/Refresh/context'
import Lotto from './pages/Lotto/Lotto'
import Profile from './pages/Profile/Profile'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'

const blastSepolia = defineChain({
  id: 168_587_773,
  name: 'Blast Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.blast.io']
    },
    public: {
      http: ['https://sepolia.blast.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Blastscan',
      url: 'https://testnet.blastscan.io'
    }
  },
  testnet: true
})


const { chains, publicClient } = configureChains(
  [blastSepolia],
  [
    jsonRpcProvider({
      rpc: () => ({
        //TODO
        http: `https://sepolia.blast.io`
      })
    })
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'blasteens',
  projectId: process.env.REACT_APP_WALLET_CONNECT_ID ?? '',
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} modalSize="compact">
        <GameProvider>
          <RefreshContextProvider>
            <Routes>
              <Route path='/' index element={<Homepage />} />
              <Route path='arcade'>
                <Route path=':gameId' element={<Arcade />} />
              </Route>
              <Route path='prize' element={<Prize />} />
              <Route path='about' element={<Aboutus />} />
              <Route path='market' element={<Market />} />
              <Route path='lotto' element={<Lotto />} />
              <Route path='profile' element={<Profile />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </RefreshContextProvider>
        </GameProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default App
