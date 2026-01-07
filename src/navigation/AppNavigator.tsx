// みえるん簿 - ナビゲーション設定

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import {
  HomeScreen,
  SubscriptionsScreen,
  AddSubscriptionScreen,
  AddExpenseScreen,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// タブアイコンコンポーネント
const TabIcon: React.FC<{ icon: string; focused: boolean; label: string }> = ({
  icon,
  focused,
  label,
}) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {icon}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </View>
);

// ホームスタック
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddExpense"
      component={AddExpenseScreen}
      options={{
        title: '支出を追加',
        presentation: 'modal',
      }}
    />
  </Stack.Navigator>
);

// サブスクスタック
const SubscriptionStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="SubscriptionsMain"
      component={SubscriptionsScreen}
      options={{ title: 'サブスク' }}
    />
    <Stack.Screen
      name="AddSubscription"
      component={AddSubscriptionScreen}
      options={({ route }) => ({
        title: (route.params as any)?.subscription ? 'サブスクを編集' : 'サブスクを追加',
        presentation: 'modal',
      })}
    />
  </Stack.Navigator>
);

// プレースホルダー画面
const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

const CalendarScreen = () => <PlaceholderScreen title="📅 カレンダー" />;
const ReportScreen = () => <PlaceholderScreen title="📊 レポート" />;
const SettingsScreen = () => <PlaceholderScreen title="⚙️ 設定" />;

// メインタブナビゲーター
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        height: 85,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textLight,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="🏠" focused={focused} label="ホーム" />
        ),
      }}
    />
    <Tab.Screen
      name="Calendar"
      component={CalendarScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="📅" focused={focused} label="カレンダー" />
        ),
      }}
    />
    <Tab.Screen
      name="Subscriptions"
      component={SubscriptionStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="📱" focused={focused} label="サブスク" />
        ),
      }}
    />
    <Tab.Screen
      name="Report"
      component={ReportScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="📊" focused={focused} label="レポート" />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="⚙️" focused={focused} label="設定" />
        ),
      }}
    />
  </Tab.Navigator>
);

// アプリナビゲーター
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    color: colors.textLight,
  },
  tabLabelFocused: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
