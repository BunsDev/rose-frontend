import { BLOCK_TIME } from "../constants"
import retry from "async-retry"
import usePoller from "./usePoller"
import { useState } from "react"

const stakeStatsApi =
  "https://raw.githubusercontent.com/RoseOnAurora/apr/master/rose.json"

interface StakeStatsApiResponse {
  price_of_rose: string
  price_of_strose: string
  strose_rose_ratio: string
  strose_tvl: string
  total_rose_staked: string
  strose_apr: string
}

export interface StakeStats {
  priceRatio: string
  tvl: string
  totalRoseStaked: string
  priceOfRose: string
  apr: string
}

const emptyState = {
  priceRatio: "",
  tvl: "",
  totalRoseStaked: "",
  priceOfRose: "",
  apr: "",
}

export default function useStakeStats(): StakeStats {
  const [stakeStats, setStakeStats] = useState(emptyState)
  usePoller(() => {
    function pollStakeStats(): void {
      void retry(() =>
        fetch(stakeStatsApi)
          .then((res) => res.json())
          .then((body: StakeStatsApiResponse[]) => {
            const res = body.map((b) => {
              return {
                priceRatio: b?.strose_rose_ratio,
                tvl: b?.strose_tvl,
                totalRoseStaked: b?.total_rose_staked,
                priceOfRose: b?.price_of_rose,
                apr: b?.strose_apr,
              }
            })
            setStakeStats(res[0])
          }),
      )
    }
    void pollStakeStats()
  }, BLOCK_TIME)
  return stakeStats
}
