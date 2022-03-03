import { AddressZero, One, Zero } from "@ethersproject/constants"
import {
  BORROW_MARKET_MAP,
  BorrowMarketName,
  TRANSACTION_TYPES,
} from "../constants"
import {
  useBorrowContract,
  useCollateralContract,
  useGardenContract,
  useOracleContract,
  useVaseContract,
} from "./useContract"
import { useEffect, useState } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { Garden } from "../../types/ethers-contracts/Garden"
import { Oracle } from "../../types/ethers-contracts/Oracle"
import { Vase } from "../../types/ethers-contracts/Vase"
import { parseUnits } from "ethers/lib/utils"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

export interface BorrowDataType {
  marketName: BorrowMarketName
  collateralTokenBalance: BigNumber
  collateralDeposited: BigNumber
  borrowed: BigNumber
  liquidationMultiplier: BigNumber
  mcr: BigNumber
  borrowFee: BigNumber
  liquidationFee: BigNumber
  rusdLeftToBorrow: BigNumber
  interest: BigNumber
  collateralDepositedUSDPrice: BigNumber
  positionHealth: BigNumber
  borrowedUSDPrice: BigNumber
  priceOfCollateral: BigNumber
  totalRUSDLeftToBorrow: BigNumber
  tvl: BigNumber
  rusdUserBalance: BigNumber
}

type BorrowDataHookReturnType = [BorrowDataType, boolean]

const emptyBorrowData = {
  collateralTokenBalance: Zero,
  collateralDeposited: Zero,
  borrowed: Zero,
  liquidationMultiplier: parseUnits("1.05"),
  mcr: parseUnits("0.9", 18),
  borrowFee: parseUnits("0.01"),
  liquidationFee: parseUnits("0.05"),
  rusdLeftToBorrow: Zero,
  interest: parseUnits("0.0249"),
  collateralDepositedUSDPrice: Zero,
  positionHealth: Zero,
  borrowedUSDPrice: Zero,
  priceOfCollateral: parseUnits("1", 18),
  totalRUSDLeftToBorrow: Zero,
  tvl: Zero,
  rusdUserBalance: Zero,
} as BorrowDataType

export default function useBorrowData(
  borrowMarket: BorrowMarketName,
): BorrowDataHookReturnType {
  const { account } = useActiveWeb3React()
  const gardenContract = useGardenContract(borrowMarket) as Garden
  const collateralTokenContract = useCollateralContract(borrowMarket) as Erc20
  const oracleContract = useOracleContract(borrowMarket) as Oracle
  const vaseContract = useVaseContract(borrowMarket) as Vase
  const rusdContract = useBorrowContract(borrowMarket) as Erc20
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastBorrowTime = lastTransactionTimes[TRANSACTION_TYPES.BORROW]

  const [borrowData, setBorrowData] = useState<BorrowDataHookReturnType>([
    {
      ...emptyBorrowData,
      marketName: borrowMarket,
    },
    true,
  ])

  useEffect(() => {
    async function getBorrowData(): Promise<void> {
      if (
        !collateralTokenContract ||
        !gardenContract ||
        !oracleContract ||
        !vaseContract ||
        !rusdContract
      ) {
        setBorrowData([
          {
            ...emptyBorrowData,
            marketName: borrowMarket,
          },
          false,
        ])
        return
      }

      const BORROW_MARKET = BORROW_MARKET_MAP[borrowMarket]

      if (account && account != AddressZero && account != null) {
        try {
          const exchangeRate = await oracleContract.latestAnswer()
          // exchange rate is e^6 precision
          const exchangeRateAdj = exchangeRate.mul(BigNumber.from(10).pow(10))
          const USD_CONVERSION_BN = (factor: BigNumber) =>
            factor.mul(exchangeRateAdj).div(BigNumber.from(10).pow(18))

          const liquidationMultiplier = await gardenContract.getLiquidationMultiplier()
          const mcr = await gardenContract.getCollateralizationRate(account)
          const borrowFee = await gardenContract.getBorrowOpeningFee(account)
          const totalRUSDLeft = await vaseContract.balanceOf(
            await gardenContract.roseUsd(),
            gardenContract.address,
          )

          const tvl = await vaseContract.balanceOf(
            collateralTokenContract.address,
            gardenContract.address,
          )

          const tvlUsd = USD_CONVERSION_BN(tvl)

          const rusdBalance = await rusdContract.balanceOf(account)

          // cast to 18 precision to facilitate BN math
          const mcrAdj = mcr.mul(BigNumber.from(10).pow(13)) // mcr is e^5 precision
          const borrowFeeAdj = borrowFee.mul(BigNumber.from(10).pow(13)) // borrowfee is e^5 precision
          const liquidationMultiplierAdj = liquidationMultiplier.mul(
            // liquidationMultiplier is e^5 precision
            BigNumber.from(10).pow(13),
          )
          const interstPerSecond = await gardenContract.getInterestPerSecond()
          const interestPerYear = interstPerSecond.mul(
            BigNumber.from("31557600"),
          )
          const collateralBalance = await collateralTokenContract.balanceOf(
            account,
          )
          const collateralDeposited = await gardenContract.userCollateralShare(
            account,
          )
          const borrowed = await gardenContract.userBorrowPart(account)

          const borrowedAdj = borrowed.mul(
            BigNumber.from(10).pow(18 - BORROW_MARKET.borrowToken.decimals),
          )
          const collateralDepositedAdj = collateralDeposited.mul(
            BigNumber.from(10).pow(18 - BORROW_MARKET.collateralToken.decimals),
          )
          const collateralBalanceAdj = collateralBalance.mul(
            BigNumber.from(10).pow(18 - BORROW_MARKET.collateralToken.decimals),
          )
          const collateralDepositedUSDPrice = USD_CONVERSION_BN(
            collateralDepositedAdj,
          )
          const positionHealth = collateralDepositedAdj.isZero()
            ? BigNumber.from(0)
            : borrowedAdj
                .mul(BigNumber.from(10).pow(18))
                .div(collateralDepositedUSDPrice)

          const borrowedUSDPrice = USD_CONVERSION_BN(borrowedAdj)
          const rusdLeftToBorrow = mcrAdj
            .sub(
              borrowed
                .mul(BigNumber.from(10).pow(18))
                .div(
                  collateralDepositedUSDPrice.isZero()
                    ? One
                    : collateralDepositedUSDPrice,
                ),
            )
            .mul(
              collateralDepositedAdj
                .mul(exchangeRateAdj)
                .div(BigNumber.from(10).pow(18)),
            )
            .div(BigNumber.from(10).pow(18))
          const rusdLeftToBorrowAdj = rusdLeftToBorrow.sub(
            rusdLeftToBorrow.mul(borrowFeeAdj).div(BigNumber.from(10).pow(18)),
          )
          setBorrowData((prevState) => [
            {
              ...prevState[0],
              marketName: borrowMarket,
              collateralTokenBalance: collateralBalanceAdj,
              collateralDeposited: collateralDepositedAdj,
              collateralDepositedUSDPrice: collateralDepositedUSDPrice,
              borrowed: borrowedAdj,
              rusdLeftToBorrow: rusdLeftToBorrowAdj,
              positionHealth: positionHealth,
              borrowedUSDPrice: borrowedUSDPrice,
              totalRUSDLeftToBorrow: totalRUSDLeft,
              liquidationMultiplier: liquidationMultiplierAdj,
              interest: interestPerYear,
              mcr: mcrAdj,
              borrowFee: borrowFeeAdj,
              liquidationFee: liquidationMultiplierAdj.sub(
                BigNumber.from("10").pow(18),
              ),
              priceOfCollateral: exchangeRateAdj,
              tvl: tvlUsd,
              rusdUserBalance: rusdBalance,
            },
            false,
          ])
        } catch (e) {
          console.log(e)
          setBorrowData((prevState) => [prevState[0], false])
        }
      } else {
        setBorrowData([
          {
            ...emptyBorrowData,
            marketName: borrowMarket,
          },
          false,
        ])
      }
    }
    void getBorrowData()
  }, [
    lastBorrowTime,
    borrowMarket,
    account,
    gardenContract,
    collateralTokenContract,
    oracleContract,
    vaseContract,
    rusdContract,
  ])

  return borrowData
}
