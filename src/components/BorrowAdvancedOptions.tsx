import { AppDispatch, AppState } from "../state"
import { Box, Checkbox, Stack, Text, Tooltip } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { updateInfiniteApproval, updatePriceFromOracle } from "../state/user"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

export default function BorrowAdvancedOptions(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { infiniteApproval, priceFromOracle } = useSelector(
    (state: AppState) => state.user,
  )

  return (
    <Box p="15px">
      <Stack spacing="30px">
        <Checkbox
          size="lg"
          colorScheme="green"
          isChecked={infiniteApproval}
          onChange={() => dispatch(updateInfiniteApproval(!infiniteApproval))}
        >
          <Tooltip
            bgColor="#cc3a59"
            closeOnClick={false}
            label={t("infiniteApprovalTooltip")}
          >
            <Text borderBottom="1px dotted var(--text)" cursor="help">
              {t("infiniteApproval")}
            </Text>
          </Tooltip>
        </Checkbox>
        <Checkbox
          size="lg"
          colorScheme="green"
          isChecked={priceFromOracle}
          onChange={() => dispatch(updatePriceFromOracle(!priceFromOracle))}
        >
          <Tooltip
            bgColor="#cc3a59"
            closeOnClick={false}
            label="Update collateral price from the Oracle for a small gas fee!"
          >
            <Text borderBottom="1px dotted var(--text)" cursor="help">
              Update price
            </Text>
          </Tooltip>
        </Checkbox>
      </Stack>
    </Box>
  )
}
