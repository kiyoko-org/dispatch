import React from 'react';
import { View, Text, ActivityIndicator, Modal } from 'react-native';
import { useTheme } from './ThemeContext';

interface LogoutOverlayProps {
  visible: boolean;
  message?: string;
}

export function LogoutOverlay({ visible, message = 'Signing out...' }: LogoutOverlayProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            minWidth: 200,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              textAlign: 'center',
            }}
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}