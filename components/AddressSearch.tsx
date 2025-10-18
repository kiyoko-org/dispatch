import { useEffect, useState, useRef } from 'react';
import {
  TextInput,
  FlatList,
  View,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { SearchResponse, SearchResult } from '../lib/types/search';

interface AddressSearchProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: SearchResult) => void;
}

export default function AddressSearch({ visible, onClose, onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResponse>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    async function fetchSuggestions() {
      setLoading(true);
      // Create new controller
      abortControllerRef.current = new AbortController();
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
          {
            headers: { 'User-Agent': 'maptest/1.0' },
            signal: abortControllerRef.current.signal,
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: SearchResponse = await response.json();
        // Filter suggestions to only include results within Tuguegarao City
        const filtered = data.filter((item) =>
          /tuguegarao/i.test(item.display_name || item.name || '')
        );
        setSuggestions(filtered);
        setLoading(false);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Request was aborted, ignore
          return;
        }
        console.error('Error fetching suggestions:', error);
        setLoading(false);
        setSuggestions([]);
      }
    }

    if (query.length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const [selectionError, setSelectionError] = useState<string | null>(null);

  const handleSelect = (address: SearchResult) => {
    // Check if the selected address is within Tuguegarao City
    const isTuguegarao = /tuguegarao/i.test(address.display_name || address.name || '');
    if (!isTuguegarao) {
      setSelectionError(
        'This app currently only supports Tuguegarao City. Please choose a location within Tuguegarao City.'
      );
      return;
    }

    onSelect(address);
    setQuery('');
    setSuggestions([]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>Search Address</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search for an address..."
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {loading && <ActivityIndicator style={styles.loader} />}
          </View>
          {!loading && query.length > 2 && suggestions.length === 0 ? (
            <View style={{ padding: 12 }}>
              <Text style={{ textAlign: 'center', color: '#666' }}>
                No results in Tuguegarao — try a different query
              </Text>
            </View>
          ) : (
            suggestions.length > 0 && (
              <FlatList
                data={suggestions}
                style={styles.suggestionsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={styles.suggestionItem}>
                    <Text style={styles.suggestionText}>{item.display_name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.place_id.toString()}
              />
            )
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.7,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  loader: {
    marginLeft: 8,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 14,
  },
});
