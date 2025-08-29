import { IconButton, Tooltip } from '@chakra-ui/react';
import { FC } from 'react';
import { FiMaximize, FiMinimize } from 'react-icons/fi';

export const FullScreenButton: FC<{
  isFullScreen: boolean;
  handleFullScreen: () => void;
}> = ({ isFullScreen, handleFullScreen }) => {
  return (
    <Tooltip label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
      <IconButton
        aria-label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        icon={isFullScreen ? <FiMinimize /> : <FiMaximize />}
        onClick={handleFullScreen}
        size="md"
        bgGradient="linear(to-r, purple.500, blue.500)"
        color="white"
        _hover={{
          bgGradient: 'linear(to-r, purple.600, blue.600)',
          transform: 'scale(1.05)',
        }}
        borderRadius="lg"
        shadow="lg"
        // animation={`${float} 3s ease-in-out infinite`}
      />
    </Tooltip>
  );
};
