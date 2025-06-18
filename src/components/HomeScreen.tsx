import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { getProfile } from '../services/profile_service';
import { getDishes } from '../services/dish_service';
import dishPlaceholder from '../assets/dish.png';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { IDish } from '../services/intefaces/dish';

type Props = { navigation: NavigationProp<any> };

export default function HomeScreen({ navigation }: Props) {
  const [name, setName] = useState('👋');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [stats, setStats] = useState({ recipes: 0, favorites: 0 });
  const [trending, setTrending] = useState<IDish[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      /* profile */
      const { request: pReq } = getProfile();
      const profile = (await pReq).data;
      setName(profile.name || 'Chef');
      setAvatar(profile.profileImage ? `http://10.0.2.2:3000${profile.profileImage}` : null);
      setStats({ recipes: profile.dishes.length, favorites: profile.favoriteDishes.length });

      /* trending dishes —— first 8 */
      const { request: dReq } = getDishes({ limit: 8 });
      const dishes = (await dReq).data;
      setTrending(dishes.slice(0, 8));
    } catch (err) {
      console.error('Home fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  /* ────────── RENDER ────────── */
  return (
  <ScrollView contentContainerStyle={styles.container}>
    {/* ───────── Hero ───────── */}
    <View style={styles.hero}>
      <View style={styles.heroLeft}>
        <Text style={styles.hello}>Hi {name}!</Text>
        <Text style={styles.subtitle}>Ready to whip up something tasty?</Text>

        <View style={styles.statRow}>
          <StatBubble icon="chef-hat" label="Recipes"   value={stats.recipes}   />
          <StatBubble icon="heart"    label="Favorites" value={stats.favorites} />
        </View>
      </View>

      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Icon name="account" size={40} color="#fff" />
        </View>
      )}
    </View>

  {/* ───────── Trending ───────── */}
  <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
  {loading ? (
    <ActivityIndicator size="large" color="#1E3A8A" />
  ) : (
    <FlatList
      horizontal
      data={trending}
      keyExtractor={(item) => item._id}
      showsHorizontalScrollIndicator={false}
      style={styles.trendList}              /*  ← gives the row a height  */
      contentContainerStyle={{ paddingRight: 20 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.trendCard}
          onPress={() => navigation.navigate('DishDetail', { dishId: item._id })}
        >
          <Image
            source={item.imageUrl ? { uri: item.imageUrl } : dishPlaceholder}
            style={styles.trendImg}
          />
          <Text numberOfLines={1} style={styles.trendName}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  )}



    {/* ───────── Favourites ───────── */}
    {stats.favorites > 0 && (
      <>
        <Text style={styles.sectionTitle}>❤️ Your Favourites</Text>
        <FlatList
          horizontal
          data={profile.favoriteDishes.slice(0, 6)}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.trendCard}
              onPress={() => navigation.navigate('DishDetail', { dishId: item._id })}
            >
              <Image
                source={item.imageUrl ? { uri: item.imageUrl } : dishPlaceholder}
                style={styles.trendImg}
              />
              <Text numberOfLines={1} style={styles.trendName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </>
    )}

    {/* ───────── Categories Grid ───────── */}
    <Text style={styles.sectionTitle}>🍲 Explore Categories</Text>
    <View style={styles.catGrid}>
      {[
        { label: 'ITALIAN',      cuisine: 'ITALIAN' },
        { label: 'CHINESE',      cuisine: 'CHINESE' },
        { label: 'INDIAN',       cuisine: 'INDIAN' },
        { label: 'MEXICAN',      cuisine: 'MEXICAN' },
        { label: 'VEGAN',        limitation: 'VEGAN' },
        { label: 'DESSERTS',     cuisine: 'FRENCH' },
      ].map((c) => (
        <TouchableOpacity
          key={c.label}
          style={styles.catTile}
          onPress={() =>
            navigation.navigate('Search', {
              preset: { cuisine: c.cuisine || '', limitation: c.limitation || '' },
            })
          }
        >
          <Text style={styles.catText}>{c.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);
}

/* small round stat bubble */
const StatBubble = ({ icon, label, value }: { icon: string; label: string; value: number }) => (
  <View style={styles.bubble}>
    <Icon name={icon} size={18} color="#1E3A8A" />
    <Text style={styles.bubbleText}>{value}</Text>
  </View>
);

/* ────────── STYLES ────────── */
const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  /* hero */
  hero: {
    flexDirection: 'row',
    backgroundColor: '#BFD8FF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  heroLeft: { flex: 1, paddingRight: 10 },
  hello: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A' },
  subtitle: { fontSize: 14, color: '#1E3A8A', marginTop: 4 },
  statRow: { flexDirection: 'row', marginTop: 14 },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  bubbleText: { marginLeft: 6, fontWeight: '600', color: '#1E3A8A' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ddd' },
  avatarPlaceholder: { backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center' },

  /* trending */
  trendList: { height: 150 },          // card-height (120) + text & margin
  trendCard: {
    width: 120,
    marginRight: 16,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F1F1F', marginBottom: 15 },
  trendImg: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 6,
  },
  trendName: { fontSize: 13, color: '#333', textAlign: 'center' },
    catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  catTile: {
    width: '48%',
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    paddingVertical: 24,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  catText: { fontSize: 16, fontWeight: '600', color: '#1E3A8A' },
});
