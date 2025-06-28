import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface Props {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<Props> = ({ value, onChange, placeholder }) => (
    <View style={styles.container}>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder || 'Buscar...'}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        margin: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    input: {
        padding: 10,
        fontSize: 16,
    },
});

export default SearchBar;
