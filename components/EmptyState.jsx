import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState({ 
  icon = 'cube-outline', 
  title, 
  subtitle, 
  iconLibrary = 'Ionicons',
  iconColor = '#999' 
}) {
  const IconComponent = iconLibrary === 'MaterialCommunity' ? MaterialCommunityIcons : Ionicons;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconComponent name={icon} size={64} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: 20,
    opacity: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
