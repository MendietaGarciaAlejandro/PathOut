import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { POI } from '../types/poi';
import { getCategoryById } from '../types/categories';

interface Props {
    poi: POI;
    isFavorite?: boolean;
    searchQuery?: string;
}

const POICard: React.FC<Props> = ({ poi, isFavorite = false, searchQuery = '' }) => {
    const category = poi.categoryId ? getCategoryById(poi.categoryId) : null;
    
    // Función para resaltar texto de búsqueda
    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <Text key={index} style={styles.highlightedText}>{part}</Text>
            ) : part
        );
    };
    
    return (
        <View style={[styles.card, isFavorite && styles.favoriteCard]}>
            <View style={styles.cardContent}>
                {poi.image && (
                    <Image source={{ uri: poi.image }} style={styles.image} />
                )}
                <View style={[styles.info, !poi.image && styles.infoFull]}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>
                            {searchQuery ? highlightText(poi.name, searchQuery) : poi.name}
                        </Text>
                        {isFavorite && <Text style={styles.favoriteIcon}>❤️</Text>}
                    </View>
                    <Text style={styles.desc}>
                        {searchQuery ? highlightText(poi.description, searchQuery) : poi.description}
                    </Text>
                    {category && (
                        <View style={styles.categoryContainer}>
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text style={styles.category}>{category.name}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        margin: 8,
    },
    info: {
        flex: 1,
        padding: 8,
        justifyContent: 'center',
    },
    infoFull: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
    },
    desc: {
        color: '#555',
        marginTop: 4,
    },
    favoriteCard: {
        backgroundColor: '#ffdab9',
    },
    favoriteIcon: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red',
        marginLeft: 8,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 4,
    },
    category: {
        color: '#555',
    },
    highlightedText: {
        fontWeight: 'bold',
        color: 'blue',
    },
});

export default POICard;
