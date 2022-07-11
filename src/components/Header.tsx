import { Box, Flex, Image } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { Link } from "react-router-dom"
import MobileNavBar from "./nav/MobileNavBar"
import NavBar from "./nav/NavBar"
import RosePriceButton from "./RosePriceButton"
import ThemeChanger from "./ThemeChanger"
import Web3Status from "./Web3Status"
import appLogo from "../assets/app-logo.svg"

interface Props {
  activeTab: string
}

function Header({ activeTab }: Props): ReactElement {
  return (
    <Box
      px={{ base: "5px", sm: "20px", md: "36px" }}
      pt="10px"
      h="100px"
      borderBottom="1px"
      borderBottomColor="gray.800"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        h="full"
        gridGap="5px"
      >
        <Link to="/">
          <Flex
            w={{ base: "120px", md: "150px", lg: "180px" }}
            alignItems="center"
            justifyContent="center"
          >
            <Image objectFit="cover" w="full" src={appLogo} />
          </Flex>
        </Link>
        <MobileNavBar />
        <Box w="40%" mx="auto" display={{ base: "none", lg: "flex" }}>
          <NavBar activeNavItem={activeTab} />
        </Box>
        <Flex
          alignItems="center"
          bottom={0}
          zIndex={3}
          justifyContent={{ base: "space-evenly", lg: "flex-end" }}
          w={{ base: "100%", lg: "43%" }}
          borderTopLeftRadius={{ base: "15px", lg: 0 }}
          borderTopRightRadius={{ base: "15px", lg: 0 }}
          pos={{ base: "fixed", lg: "static" }}
          p={{ base: "10px", lg: 0 }}
        >
          <RosePriceButton />
          <Web3Status />
          <Box display={{ base: "none", lg: "flex" }}>
            <ThemeChanger />
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Header
