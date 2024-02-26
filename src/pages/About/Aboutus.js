import React, { useEffect, useState } from 'react'
import styles from './Aboutus.module.scss'
import { getAdjacentElements } from '../../helpers/utils'
import Layout from '../../components/Layout/Layout'

const questionList = [
  {
    question: 'Gamer Reward',
    content:
      'Discover the ultimate rewards for gamers! From exclusive in-game items to merchandise discounts, our Gamer Reward program is designed to enhance your gaming experience. Earn points as you play and redeem them for unique prizes, early access to games, and more. Join our community of passionate gamers and start earning rewards tailored just for you.'
  },
  {
    question: 'What is Blasteens',
    content:
      'Blasteens is a revolutionary platform designed for teenagers, offering a safe and engaging environment to connect, learn, and play. With a focus on creativity, education, and entertainment, Blasteens provides a variety of content including educational resources, fun games, and forums for discussion. Our mission is to empower teens to explore their interests, develop new skills, and build a supportive community.'
  },
  {
    question: 'Why Blasteens',
    content:
      'Choose Blasteens for a unique blend of education and entertainment specifically tailored for teenagers. Our platform stands out by offering moderated, age-appropriate content that encourages learning and personal growth. With features designed to foster creativity, collaboration, and critical thinking, Blasteens is the go-to destination for teens seeking to expand their horizons in a fun and safe online environment.'
  },
  {
    question: 'How to Redeem',
    content:
      'Redeeming your rewards is easy and straightforward. Simply log into your account, visit the "Rewards" section, and browse the available items or experiences you can claim with your points. Select your desired reward, confirm your choice, and enjoy! We regularly update our rewards catalog to ensure you have exciting options to choose from. Start earning and redeeming today!'
  },
  {
    question: 'Whats out Motivation',
    content:
      'Our motivation stems from a desire to create meaningful, positive impacts within our community. By providing a platform that combines education, creativity, and entertainment, we aim to empower individuals to learn, grow, and connect in new and exciting ways. We believe in the power of community and the potential of every individual to make a difference. Join us in our mission to inspire, educate, and entertain.'
  }
]

const Aboutus = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(0)

  useEffect(() => {
    const { newPrev, newNext } = getAdjacentElements(questionList, selectedIndex)
    setPrevIndex(newPrev)
    setNextIndex(newNext)
  }, [selectedIndex, prevIndex, nextIndex])

  return (
    <Layout>
      <div className={styles.outerSection}>
        <div className={styles.container}>
          <div className={styles.jackpotSection} style={{ backgroundImage: `url('/images/jackpot-frame.png')` }}>
            <div className={styles.carousel}>
              <div
                onClick={() => {
                  setSelectedIndex(prevIndex)
                }}
                className={styles.carouselSelect}
              >
                {questionList[prevIndex].question}
              </div>
              <div className={styles.selectedText}>{questionList[selectedIndex].question}</div>
              <div
                onClickCapture={() => {
                  setSelectedIndex(nextIndex)
                }}
                className={styles.carouselSelect}
              >
                {questionList[nextIndex].question}
              </div>
            </div>
          </div>

          <div className={styles.textSection}>
            <div className={styles.highlightedText}>{`Blasteens' says...`}</div>
            {questionList[selectedIndex].content}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Aboutus
