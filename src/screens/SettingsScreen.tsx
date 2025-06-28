import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';

const SettingsScreen = () => {
  const [offline, setOffline] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>
      <View style={styles.row}>
        <Text>Modo offline</Text>
        <Switch value={offline} onValueChange={setOffline} />
      </View>
      <View style={styles.row}>
        <Text>Notificaciones</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
});

export default SettingsScreen;
