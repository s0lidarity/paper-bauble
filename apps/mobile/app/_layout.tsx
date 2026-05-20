import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { View } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
    return (
        <View style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
                </Stack>
            </QueryClientProvider>
        </View>
    );
}