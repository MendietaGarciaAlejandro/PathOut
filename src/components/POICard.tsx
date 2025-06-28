import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { POI } from '../types/poi';

interface Props {
    poi: POI;
}

const POICard: React.FC<Props> = ({ poi }) => (
    <View style={styles.card}>
        {poi.image && <Image source={{ uri: poi.image }} style={styles.image} />}
        <View style={styles.info}>
            <Text style={styles.title}>{poi.name}</Text>
            <Text style={styles.desc}>{poi.description}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    image: {
        width: 80,
        height: 80,
    },
    info: {
        flex: 1,
        padding: 8,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    desc: {
        color: '#555',
    },
});

export default POICard;
