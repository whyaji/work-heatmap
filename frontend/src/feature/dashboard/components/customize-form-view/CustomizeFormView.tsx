import { Input, Text, VStack } from '@chakra-ui/react';
import { FC } from 'react';

export const CustomizeFormView: FC<{
  tempRadius: number;
  setTempRadius: (tempRadius: number) => void;
}> = ({ tempRadius, setTempRadius }) => {
  return (
    <VStack spacing={3} align="stretch">
      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
        Customize Heatmap
      </Text>

      {/* input number for radius heatmap point */}
      <Text fontSize="xs" color="gray.500">
        Radius Heatmap Point (meter)
      </Text>
      <Input
        type="number"
        min={1}
        value={String(tempRadius)}
        onChange={(e) => setTempRadius(Number(e.target.value))}
        size="sm"
        borderRadius="lg"
      />
    </VStack>
  );
};
