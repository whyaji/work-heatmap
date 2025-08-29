import { Box, Flex, HStack } from '@chakra-ui/react';
import { FC } from 'react';

import { ExportDataButton } from '../export-data-button/ExportDataButton';
import { ExportImageButton } from '../export-image-button/ExportImageButton';
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
  handleOpenExportImage: () => void;
  handleOpenExportData: () => void;
}> = ({
  isMobile,
  refreshingCoordData,
  handleRefresh,
  controlsBg,
  borderColor,
  isFullScreen,
  handleFullScreen,
  handleOpenExportImage,
  handleOpenExportData,
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
          {/* Export Image Button */}
          <ExportImageButton
            onClick={handleOpenExportImage}
            controlsBg={controlsBg}
            borderColor={borderColor}
          />

          {/* Export Data Button */}
          <ExportDataButton
            onClick={handleOpenExportData}
            controlsBg={controlsBg}
            borderColor={borderColor}
          />

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
