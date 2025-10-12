import { View } from 'react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';

export default function HelpPage() {
  return (
    <View className="flex-1 bg-white">
      <HeaderWithSidebar title="Help Center" showBackButton={false} />
    </View>
  );
}

