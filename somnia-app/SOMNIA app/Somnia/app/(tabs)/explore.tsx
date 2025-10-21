import { Image, Platform, StyleSheet, Dimensions } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function ExploreScreen() {
  const screenWidth = Dimensions.get('window').width;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={[styles.headerImage, { left: screenWidth * 0.05 }]}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Explore
        </ThemedText>
      </ThemedView>

      <ThemedText style={styles.text}>
        This app includes example code to help you get started.
      </ThemedText>

      {/* Collapsible Sections */}
      <Collapsible title="File-based routing">
        <ThemedText>
          Screens: <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          Layout: <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          Open this project on Android, iOS, and web. Press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> for web.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Images">
        <ThemedText>
          Use <ThemedText type="defaultSemiBold">@2x/@3x</ThemedText> suffixes for different densities.
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Light and dark mode components">
        <ThemedText>
          The <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook allows dynamic theming.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Animations">
        <ThemedText>
          Animated components like <ThemedText type="defaultSemiBold">HelloWave.tsx</ThemedText> use{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>.
        </ThemedText>
        {Platform.OS === 'ios' && (
          <ThemedText>
            The <ThemedText type="defaultSemiBold">ParallaxScrollView</ThemedText> provides parallax effect.
          </ThemedText>
        )}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  text: {
    marginBottom: 15,
  },
});
