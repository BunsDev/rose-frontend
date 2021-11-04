import { FaGithub, FaMedium, FaTelegram, FaTwitter } from "react-icons/fa"
import React, { ReactElement } from "react"
import styles from "./BottomMenu.module.scss"

function BottomMenu(): ReactElement | null {
  return (
    <div className={styles.bottommenu}>
      <div className={styles.socials}>
        <a href="https://twitter.com/roseonaurora">
          <FaTwitter />
        </a>
        <a href="https://medium.com/@roseonaurora">
          <FaMedium />
        </a>
        <a href="https://t.me/RoseOnAurora">
          <FaTelegram />
        </a>
        <a href="https://github.com/RoseOnAurora">
          <FaGithub />
        </a>
      </div>
      <div className={styles.right}>
        <small>
          <a href="https://rainbowbridge.app/transfer">
            Bridge from Ethereum<sup>↗</sup>
          </a>
        </small>
        <br />
        <small>
          <a href="https://aurora.bridgetonear.org/">
            Bridge from NEAR<sup>↗</sup>
          </a>
        </small>
      </div>
    </div>
  )
}

export default BottomMenu
