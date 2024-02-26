import React from "react";
import { Link } from 'react-router-dom'
import styles from './Navbar.module.scss'
import { FaWallet } from 'react-icons/fa'
import { useAccount } from 'wagmi'
import { useMediaQuery } from 'react-responsive'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { GITHUB_URL } from "../../configs";

const NavItems = ({ className }) => {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1280px)' })

  return (
    <ul className={`${styles.linkDetailsWapper} ${className}`}>
      <li className={styles.linkInfoWrapper}>
        <Link to='/arcade/escape-from-germs'>Games</Link>
      </li>
      <li className={styles.linkInfoWrapper}>
        <Link to='/lotto'>Lotto</Link>
      </li>
      <li className={styles.linkInfoWrapper}>
        <Link to='/market'>Market</Link>
      </li>
      <li className={styles.linkInfoWrapper}>
        <Link to='/about'>About Us</Link>
      </li>
      <li className={styles.linkInfoWrapper}>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">Docs</a>
      </li>
      {!isTabletOrMobile && <li>
        {isConnected ? (
          <Link className={styles.avatarContainer} to="/profile">
            <img className={styles.avatar} src='/images/nft6.jpeg' alt="avatar" />
          </Link>
        ) : (
          <div>
            {openConnectModal && <div
              onClick={() => {
                openConnectModal()
              }}
            >
              <FaWallet className={styles.walletIconContainer} />
            </div>}
          </div>
        )}
      </li>}
    </ul>
  )
}

export default NavItems
