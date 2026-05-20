import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useHealthCheck } from '../../src/api/health';
import { Card } from '../../src/components/card';

export default function HomeScreen() {
  const { data, isLoading, error } = useHealthCheck();
  if (isLoading) {
    return <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>;
  }
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    )
  }

  return ( 
    <View style={styles.container}>
      <Card style={styles.cardWidth}>
        <Text style={styles.title}> 
          Paper Bauble Status
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: data?.status === 'ok' ? '#22c55e' : '#eab308' }]} />
          <Text style={styles.statusText}>
            API Status: {data?.status}
          </Text>
          </View>
        <Text style={styles.dbText}>
          DB Status: {data?.db}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    cardWidth: { width: '80%' },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusDot: { height: 12, width: 12, borderRadius: 6, marginRight: 8 },
    statusText: { color: '#475569', fontWeight: '500' },
    dbText: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 16,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontWeight: 'bold',
        textAlign: 'center',
    }
});