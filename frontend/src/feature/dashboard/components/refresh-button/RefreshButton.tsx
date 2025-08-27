import { IconButton, Tooltip } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FC } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

// Definisikan keyframes untuk animasi spin
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const RefreshButton: FC<{
  refreshingCoordData: boolean;
  handleRefresh: () => void;
  controlsBg: string;
  borderColor: string;
}> = ({ refreshingCoordData, handleRefresh, controlsBg, borderColor }) => {
  return (
    <Tooltip label="Refresh Data">
      <IconButton
        aria-label="Refresh data"
        icon={<FiRefreshCw />}
        variant="ghost"
        size="md"
        isLoading={false}
        onClick={handleRefresh}
        disabled={refreshingCoordData}
        bg={controlsBg}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        shadow="lg"
        _hover={{
          bg: refreshingCoordData ? controlsBg : 'rgba(255, 255, 255, 0.98)',
        }}
        sx={{
          '& svg': {
            animation: refreshingCoordData ? `${spin} 1s linear infinite` : 'none',
          },
        }}
      />
    </Tooltip>
  );
};
