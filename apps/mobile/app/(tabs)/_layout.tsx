import {
	NativeTabs,
	Icon,
	Label,
	VectorIcon,
} from "expo-router/unstable-native-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function TabLayout() {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name="index">
				<Label>Home</Label>
				<Icon
					sf="house.fill"
					androidSrc={
						<VectorIcon family={MaterialCommunityIcons} name="home" />
					}
				/>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="search">
				<Label>Search</Label>
				<Icon
					sf="magnifyingglass"
					androidSrc={
						<VectorIcon family={MaterialCommunityIcons} name="magnify" />
					}
				/>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="progress">
				<Label>Progress</Label>
				<Icon
					sf="chart.bar.fill"
					androidSrc={
						<VectorIcon family={MaterialCommunityIcons} name="chart-bar" />
					}
				/>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="profile">
				<Label>Profile</Label>
				<Icon
					sf="person.fill"
					androidSrc={
						<VectorIcon family={MaterialCommunityIcons} name="account" />
					}
				/>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
