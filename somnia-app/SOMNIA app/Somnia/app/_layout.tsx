// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0e27' },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            title: 'SOMNIA'
          }} 
        />
      </Stack>
    </>
  );
}