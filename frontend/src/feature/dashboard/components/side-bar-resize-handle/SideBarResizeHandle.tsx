import { Box } from '@chakra-ui/react';
import { FC } from 'react';

export const SideBarResizeHandle: FC<{
  resizeHandleRef: React.RefObject<HTMLDivElement | null>;
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
}> = ({ resizeHandleRef, isResizing, setIsResizing }) => {
  return (
    <Box
      ref={resizeHandleRef}
      position="absolute"
      right={0}
      top={0}
      bottom={0}
      w="2px"
      bg={isResizing ? 'blue.500' : 'gray.300'}
      cursor="col-resize"
      _hover={{
        bg: 'blue.400',
        w: '8px',
        right: '-2px',
      }}
      _active={{ bg: 'blue.500' }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
      }}
      zIndex={31}
      userSelect="none"
      style={{ userSelect: 'none' }}
      transition="all 0.2s ease"
    />
  );
};
