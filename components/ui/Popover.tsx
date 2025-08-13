import React from 'react';
import { Modal, View, TouchableWithoutFeedback, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LogOut } from 'lucide-react-native';

type PopoverItemProps = {
    onPress: () => void;
    text: string;
};

export function PopoverItem({ onPress, text }: PopoverItemProps) {
    return (
        <TouchableOpacity onPress={onPress} className="flex-row items-center p-2">
            <LogOut size={16} color="#374151" />
            <Text className="text-gray-800 text-base ml-2">{text}</Text>
        </TouchableOpacity>
    );
}
type PopoverProps = {
	visible: boolean;
	onClose: () => void;
	children: React.ReactNode;
};

export default function Popover({ visible, onClose, children }: PopoverProps) {
	return (
		<Modal
			transparent={true}
			visible={visible}
			animationType="fade"
			onRequestClose={onClose}
		>
			<TouchableWithoutFeedback onPress={onClose}>
				<View style={StyleSheet.absoluteFill} className="bg-black/25">
					<View className="absolute top-20 right-6 bg-white rounded-lg shadow-lg p-2 z-10">
						{children}
					</View>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
}
