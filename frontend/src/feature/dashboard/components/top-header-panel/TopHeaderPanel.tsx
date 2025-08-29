import { Box, Flex, HStack } from '@chakra-ui/react';
import { FC } from 'react';

import { FullScreenButton } from '../full-screen-button/FullScreenButton';
import { RefreshButton } from '../refresh-button/RefreshButton';
import { UserMenu } from '../user-menu/UserMenu';

export const TopHeaderPanel: FC<{
  isMobile: boolean;
  refreshingCoordData: boolean;
  handleRefresh: () => void;
  controlsBg: string;
  borderColor: string;
  isFullScreen: boolean;
  handleFullScreen: () => void;
}> = ({
  isMobile,
  refreshingCoordData,
  handleRefresh,
  controlsBg,
  borderColor,
  isFullScreen,
  handleFullScreen,
}) => {
  return (
    <Box
      position="absolute"
      top={isMobile ? 20 : 4}
      left={4}
      right={4}
      zIndex={20}
      pointerEvents="none">
      <Flex justify="space-between" align="start">
        {/* Left side - Toggle Sidebar Button and Brand */}
        <HStack spacing={3} pointerEvents="auto" />
        {/* Right side - Controls */}
        <HStack spacing={2} pointerEvents="auto">
          {/* Refresh Button */}
          <RefreshButton
            refreshingCoordData={refreshingCoordData}
            handleRefresh={handleRefresh}
            controlsBg={controlsBg}
            borderColor={borderColor}
          />

          {/* Fullscreen Button */}
          <FullScreenButton isFullScreen={isFullScreen} handleFullScreen={handleFullScreen} />

          {/* User Menu */}
          <UserMenu bgColor={controlsBg} />
        </HStack>
      </Flex>
    </Box>
  );
};
