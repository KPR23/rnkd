import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";

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
      <NativeTabs.Trigger name="groups">
        <Label>Groups</Label>
        <Icon
          sf="person.2.fill"
          androidSrc={
            <VectorIcon family={MaterialCommunityIcons} name="account-group" />
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
