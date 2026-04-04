import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import SearchCategoriesCard from "@/src/components/search/SearchCategoriesCard";
import { colors, tagColors } from "@repo/ui/colors";
import {
	AtIcon,
	GameControllerIcon,
	MagnifyingGlassIcon,
	QrCodeIcon,
	UserIcon,
	UsersIcon,
} from "phosphor-react-native";
import { useState } from "react";
import {
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function SearchTab() {
	const [search, setSearch] = useState("");

	const handleSearch = (text: string) => {
		setSearch(text.trim());
	};

	const handleClearSearchHistory = () => {
		setSearch("");
	};

	const categories = [
		{
			name: "Tags",
			icon: <AtIcon />,
			color: colors.primary,
		},
		{
			name: "Players",
			icon: <UserIcon />,
			color: tagColors.player,
		},
		{
			name: "Teams",
			icon: <UsersIcon />,
			color: tagColors.team,
		},
		{
			name: "Games",
			icon: <GameControllerIcon />,
			color: tagColors.game,
		},
	];

	const recentSearches = ["John Doe", "Jane Smith", "Mike Johnson"];

	return (
		<Screen>
			<ScreenTitle title="Search" />
			<View className="flex flex-1 flex-col gap-4">
				<View className="flex flex-col gap-6">
					<View className="flex flex-row w-full items-center gap-2 justify-between">
						<View className="flex-1 w-full h-12 flex-row items-center gap-2 border border-border px-3">
							<MagnifyingGlassIcon size={20} color={colors.gray} />
							<TextInput
								placeholder="Search"
								placeholderTextColor={colors.gray}
								className="h-12 w-full flex-1 text-text"
								autoFocus
								autoCorrect={false}
								autoCapitalize="none"
								value={search}
								onChangeText={handleSearch}
							/>
						</View>
						<TouchableOpacity
							activeOpacity={0.7}
							className="flex justify-center items-center size-12 border border-border"
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
						{categories.length > 0 && (
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={{ gap: 10 }}
							>
								{categories.map((category) => (
									<View key={category.name}>
										<SearchCategoriesCard
											name={category.name}
											icon={category.icon}
											color={category.color}
											onPress={() => {}}
										/>
									</View>
								))}
							</ScrollView>
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
