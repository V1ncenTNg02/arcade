import React from 'react'
import { Link } from 'react-router-dom'
import styles from './NotFound.module.scss'

function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundSection}>
        <img src='/images/blasteens-transparent.png' alt='Blasteens' className={styles.errorImage} />
      </div>
      <div className={styles.notFoundSection}>
        <h1>oops...404 <br /> can't find the game for you :(</h1>
      </div>
      <div className={styles.notFoundSection}>
        <Link to='/'>
          <div className={styles.box}>Back Home</div>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
