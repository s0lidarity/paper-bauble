import { Text, View, ActivityIndicator } from 'react-native';
import { useHealthCheck } from '../../src/api/health';
import { Card } from '../../src/components/card';

export default function HomeScreen() {
  const { data, isLoading, error } = useHealthCheck();
  if (isLoading) {
    return <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>;
  }
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Text className="text-red-500 font-bold text-center">Error: {error.message}</Text>
      </View>
    )
  }

  return ( 
    <View className="flex-1 justify-center items-center bg-slate-50">
      <Card className="w-4/5">
        <Text className="text-2xl font-black text-slate-900 mb-2"> 
          Paper Bauble Status
        </Text>
        <View className="flex-row items-center">
          <View className={`h-3 w-3 rounded-full ${data?.status === 'ok' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <Text className="text-slate-600 font-medium">
            API Status: {data?.status}
          </Text>
          </View>
        <Text className="text-slate-400 text-sm mt-4 italic text-center">
          DB Status: {data?.db}
        </Text>
      </Card>
    </View>
  );
}