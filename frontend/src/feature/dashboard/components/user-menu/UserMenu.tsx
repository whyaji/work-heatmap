import {
  Avatar,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Toast,
  VStack,
} from '@chakra-ui/react';
import { FC } from 'react';
import { FiShield } from 'react-icons/fi';

import { useAuth } from '@/lib/auth';

export const UserMenu: FC<{
  bgColor?: string;
}> = ({ bgColor = 'gray.50' }) => {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    Toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  return (
    <Menu>
      <MenuButton as={Button} bg={bgColor} variant="ghost" size="md">
        <HStack spacing={2}>
          <Avatar size="sm" name={user?.username} bg="purple.500" />
          <VStack spacing={0} align="start" display={{ base: 'none', sm: 'flex' }}>
            <Text fontSize="xs" fontWeight="semibold">
              {user?.username}
            </Text>
            <Text fontSize="2xs" color="gray.500">
              {user?.nama}
            </Text>
          </VStack>
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuItem icon={<FiShield />} onClick={handleLogout} color="red.500">
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
