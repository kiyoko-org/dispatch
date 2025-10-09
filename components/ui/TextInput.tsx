import React, { ReactNode, useState } from 'react';
import {
  KeyboardTypeOptions,
  TextInput as RNTextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

type TextInputProps = {
  className?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  label?: string;
  icon?: ReactNode;
  onChangeText?: (text: string) => void;
  value?: string;
};

export function TextInput({
  className,
  placeholder,
  keyboardType,
  secureTextEntry,
  label,
  icon,
  value,
  onChangeText,
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  const modifiedIcon =
    icon && React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<any>, {
          color: '#6B7280',
          size: 18,
        })
      : null;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View className={`${className || ''}`}>
      {label && <Text className="mb-2 text-sm font-medium text-gray-700">{label}</Text>}
      <View className="flex flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
        {modifiedIcon && <View className="mr-3">{modifiedIcon}</View>}
        <RNTextInput
          {...{ value, onChangeText }}
          className="flex-1 text-base text-gray-900 placeholder:text-gray-400"
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          style={{ color: '#1F2937' }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="ml-3 p-1"
            activeOpacity={0.7}>
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
