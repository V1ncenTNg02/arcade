import React from 'react'
import NavBar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import { useNetwork } from 'wagmi'
import styles from './Layout.module.scss'
import { useSwitchNetwork } from 'wagmi'
import { useAccount } from 'wagmi'

function Layout({ children }) {
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { isConnected } = useAccount()

  return (
    <div className={styles.layoutContainer}>
      <NavBar />
      {isConnected && chain?.id !== 168_587_773 ? <div className={styles.noSupportedNetworkContainer}>
        <button className={styles.switchBtn} onClick={() => switchNetwork?.(168_587_773)}>Switch Network</button>
      </div> : children}
      <Footer />
    </div>
  )
}

export default Layout
