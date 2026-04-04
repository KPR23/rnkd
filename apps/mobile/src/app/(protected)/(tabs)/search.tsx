import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import { colors } from "@repo/ui/colors";
import {
	GameControllerIcon,
	ListMagnifyingGlassIcon,
	MagnifyingGlassIcon,
	QrCodeIcon,
	TagIcon,
	UserIcon,
	UsersIcon,
} from "phosphor-react-native";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SearchTab() {
	const [search, setSearch] = useState("");

	const handleSearch = (text: string) => {
		setSearch(text.trim());
	};

	const categories = [
		{
			name: "Tags",
			icon: <TagIcon />,
		},
		{
			name: "Players",
			icon: <UserIcon />,
		},
		{
			name: "Teams",
			icon: <UsersIcon />,
		},
		{
			name: "Games",
			icon: <GameControllerIcon />,
		},
	];

	const recentSearches = ["John Doe", "Jane Smith", "Mike Johnson"];

	return (
		<Screen>
			<ScreenTitle title="Search" />
			<View className="flex flex-1 flex-col gap-4">
				<View className="flex flex-col gap-3">
					<View className="flex flex-row w-full items-center gap-2 justify-between">
						<View className="flex-1 w-full h-11 flex-row items-center gap-2 border border-border px-3">
							<MagnifyingGlassIcon size={20} color={colors.gray} />
							<TextInput
								placeholder="Search"
								placeholderTextColor={colors.gray}
								className="min-h-11 w-full flex-1 py-2 text-text"
								autoFocus
								autoCorrect={false}
								autoCapitalize="none"
								value={search}
								onChangeText={handleSearch}
							/>
						</View>
						<TouchableOpacity
							activeOpacity={0.7}
							className="flex justify-center items-center w-11 h-11 border border-border"
						>
							<QrCodeIcon size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>

					<View className="flex flex-col gap-2">
						<Text className="text-sm font-sans-medium text-text">
							Your history
						</Text>
						{recentSearches.length > 0 && (
							<View className="flex flex-row gap-2">
								{recentSearches.map((search) => (
									<View
										key={search}
										className="flex flex-row border border-border p-2"
									>
										<Text className="text-text-muted">{search}</Text>
									</View>
								))}
							</View>
						)}
					</View>

					<View className="flex flex-col gap-2">
						<Text className="text-sm font-sans-medium text-text">
							Search by category
						</Text>
						{recentSearches.length > 0 && (
							<View className="flex flex-row gap-2">
								{recentSearches.map((search) => (
									<View
										key={search}
										className="flex flex-row border border-border p-2"
									>
										<Text className="text-text-muted">{search}</Text>
									</View>
								))}
							</View>
						)}
					</View>
				</View>

				{search.length === 0 ? (
					<View className="flex-1 justify-center items-center gap-2 mb-24">
						<MagnifyingGlassIcon size={32} color={colors.gray} />
						<Text className="text-base font-sans-medium text-text-muted">
							Start typing to search
						</Text>
					</View>
				) : (
					<View className="">
						<Text className="text-text">{search}</Text>
					</View>
				)}
			</View>
		</Screen>
	);
}
