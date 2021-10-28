import { BLOCK_TIME, ChainId, TOKENS_MAP } from "../../constants"
import { Contract, Provider } from "ethcall"
import { MulticallContract, MulticallProvider } from "../../types/ethcall"

import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../../constants/abis/erc20.json"
import { Erc20 } from "../../../types/ethers-contracts/Erc20"
import { useActiveWeb3React } from "../../hooks"
import usePoller from "../../hooks/usePoller"
import { useState } from "react"

export function usePoolTokenBalances(): { [token: string]: BigNumber } | null {
  const { account, chainId, library } = useActiveWeb3React()
  const [balances, setBalances] = useState<{ [token: string]: BigNumber }>({})

  const ethcallProvider = new Provider() as MulticallProvider

  usePoller((): void => {
    async function pollBalances(): Promise<void> {
      if (!library || !chainId || !account) return

      await ethcallProvider.init(library)
      // override the contract address when using aurora
      if (chainId == ChainId.AURORA_TESTNET) {
        ethcallProvider.multicallAddress =
          "0x508B1508AAd923fB24F6d13cD74Ac640fD8B66E8"
      } else if (chainId == ChainId.AURORA_MAINNET) {
        ethcallProvider.multicallAddress =
          "0x49eb1F160e167aa7bA96BdD88B6C1f2ffda5212A"
      }

      const tokens = Object.values(TOKENS_MAP)
      const balanceCalls = tokens
        .map((t) => {
          return new Contract(
            t.addresses[chainId],
            ERC20_ABI,
          ) as MulticallContract<Erc20>
        })
        .map((c) => c.balanceOf(account))
      const balances = await ethcallProvider.all(balanceCalls, "latest")
      const ethBalance = await library.getBalance(account)
      setBalances(
        tokens.reduce(
          (acc, t, i) => ({
            ...acc,
            [t.symbol]: balances[i],
          }),
          { ETH: ethBalance },
        ),
      )
    }
    if (account) {
      void pollBalances()
    }
  }, BLOCK_TIME)

  return balances
}
