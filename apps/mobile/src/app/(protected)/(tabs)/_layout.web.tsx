import { StyleSheet } from "react-native";

import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";

export default function WebTabLayout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList style={styles.tabList}>
        <TabTrigger name="index" href="/" style={styles.tab}>
          Feed
        </TabTrigger>
        <TabTrigger name="groups" href="/groups" style={styles.tab}>
          Groups
        </TabTrigger>
        <TabTrigger name="search" href="/(search)/search" style={styles.tab}>
          Search
        </TabTrigger>
        <TabTrigger name="progress" href="/progress" style={styles.tab}>
          Progress
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" style={styles.tab}>
          Profile
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    padding: 16,
  },
  tab: {
    padding: 8,
  },
});
