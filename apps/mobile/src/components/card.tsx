import { View, ViewProps, StyleSheet } from 'react-native';

export const Card =({ children, style, ...props}: ViewProps) => (
    <View style={[styles.card, style]} {...props}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        // Shadow properties for iOS/Android
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
    }
});