import { IconButton, Tooltip } from '@chakra-ui/react';
import { FC } from 'react';
import { FiImage } from 'react-icons/fi';

export const ExportImageButton: FC<{
  onClick: () => void;
  controlsBg?: string;
  borderColor?: string;
}> = ({ onClick, controlsBg = 'gray.200', borderColor = 'gray.200' }) => {
  return (
    <Tooltip label="Export Image">
      <IconButton
        aria-label="Export Image"
        icon={<FiImage />}
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
