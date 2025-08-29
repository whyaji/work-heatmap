import { IconButton, Tooltip } from '@chakra-ui/react';
import { FC } from 'react';
import { FiFileText } from 'react-icons/fi';

export const ExportDataButton: FC<{
  onClick: () => void;
  controlsBg?: string;
  borderColor?: string;
}> = ({ onClick, controlsBg = 'gray.200', borderColor = 'gray.200' }) => {
  return (
    <Tooltip label="Export Data">
      <IconButton
        aria-label="Export Data"
        icon={<FiFileText />}
        variant="ghost"
        size="md"
        isLoading={false}
        onClick={onClick}
        bg={controlsBg}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        shadow="lg"
      />
    </Tooltip>
  );
};
