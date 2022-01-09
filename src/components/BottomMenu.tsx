import { FaDiscord, FaGithub, FaTelegram, FaTwitter } from "react-icons/fa"
import React, { ReactElement } from "react"
import { BsMedium } from "react-icons/bs"
import styles from "./BottomMenu.module.scss"

function BottomMenu(): ReactElement | null {
  return (
    <div className={styles.bottommenu}>
      <div className={styles.socials}>
        <a
          href="https://twitter.com/roseonaurora"
          target="_blank"
          rel="noreferrer"
        >
          <FaTwitter />
        </a>
        <a
          href="https://medium.com/@roseonaurora"
          target="_blank"
          rel="noreferrer"
        >
          <BsMedium />
        </a>
        <a href="https://t.me/RoseOnAurora" target="_blank" rel="noreferrer">
          <FaTelegram />
        </a>
        <a
          href="https://discord.gg/dG6mWH4rHj"
          target="_blank"
          rel="noreferrer"
        >
          <FaDiscord />
        </a>
        <a
          href="https://github.com/RoseOnAurora"
          target="_blank"
          rel="noreferrer"
        >
          <FaGithub />
        </a>
      </div>
    </div>
  )
}

export default BottomMenu