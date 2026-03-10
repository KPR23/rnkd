import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { StyleSheet } from "react-native";

export default function WebTabLayout() {
	return (
		<Tabs>
			<TabSlot />
			<TabList style={styles.tabList}>
				<TabTrigger name="index" href="/" style={styles.tab}>
					Home
				</TabTrigger>
				<TabTrigger name="search" href="/search" style={styles.tab}>
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
