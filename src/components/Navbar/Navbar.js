import { Link } from 'react-router-dom'
import styles from './Navbar.module.scss'
import { BiMenu } from 'react-icons/bi'
import { FaTimes } from 'react-icons/fa'
import NavItems from './NavItems'
import { useState } from 'react'

function Navbar() {
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <div className={styles.navBarContainer}>
      <div className={styles.infoWrapper}>
        <Link to='/'>
          <img src='/images/blasteens-transparent.png' alt='blasteen logo' className={styles.logoImg} />
        </Link>
        <NavItems className={styles.navItemsWapper} />
        <div className={styles.menuWrapper} onClick={() => setOpenMenu(!openMenu)}>
          {openMenu ? <FaTimes className={styles.walletIconContainer} /> : <BiMenu className={styles.walletIconContainer} />}
        </div>
      </div>
      {openMenu && <NavItems className={styles.menuWrapper} />}
    </div>
  )
}

export default Navbar
