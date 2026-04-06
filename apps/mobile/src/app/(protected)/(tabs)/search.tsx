import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import SearchCategoriesCard from "@/src/components/search/SearchCategoriesCard";
import SearchResultCard from "@/src/components/search/SearchResultCard";
import SearchSection from "@/src/components/search/SearchSection";
import { trpc } from "@/src/utils/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@repo/types/auth";
import { GameId } from "@repo/types/game";
import { colors, tagColors } from "@repo/ui/colors";
import {
	AsteriskIcon,
	AtIcon,
	GameControllerIcon,
	MagnifyingGlassIcon,
	QrCodeIcon,
	UserIcon,
	UsersIcon,
} from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

const SEARCH_HISTORY_KEY = "search_history";
const MAX_RECENT_SEARCHES = 5;

const categories = [
	{
		name: "All",
		icon: <AsteriskIcon />,
		color: colors.gray,
	},
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

type SearchUserGame = {
	gameId: GameId;
	username: string;
};

type UserSearchResult = {
	type: "user";
	user: Pick<User, "id" | "name" | "tag" | "image">;
	games: SearchUserGame[];
};

type SearchResult = UserSearchResult;

export default function SearchTab() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const [activeCategory, setActiveCategory] = useState<string>("All");
	const [isFiltersCollapsed, setIsFiltersCollapsed] = useState<boolean>(false);

	const { data: searchResultsFromQuery, isLoading: isLoadingSearchResults } =
		trpc.search.searchUsers.useQuery(debouncedSearch, {
			enabled: debouncedSearch.length >= 2,
		});

	const {
		data: searchResultsFromTags,
		isLoading: isLoadingSearchResultsFromTags,
	} = trpc.search.searchUsersByTag.useQuery(debouncedSearch, {
		enabled: debouncedSearch.length >= 2,
	});

	const {
		data: searchResultsFromPlayers,
		isLoading: isLoadingSearchResultsFromPlayers,
	} = trpc.search.searchUsersByName.useQuery(debouncedSearch, {
		enabled: debouncedSearch.length >= 2,
	});

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedSearch(search.trim());
		}, 300);

		return () => clearTimeout(timeout);
	}, [search]);

	useEffect(() => {
		if (debouncedSearch.length < 2) {
			setSearchResults([]);
			return;
		}

		if (activeCategory === "Tags") {
			if (searchResultsFromTags) {
				setSearchResults(
					searchResultsFromTags.map((result) => ({
						type: "user",
						user: {
							id: result.id,
							name: result.name,
							tag: result.tag ?? "",
							image: result.image,
						},
						games: [],
					})),
				);
				return;
			}
		}

		if (activeCategory === "Players") {
			if (searchResultsFromPlayers) {
				setSearchResults(
					searchResultsFromPlayers.map((result) => ({
						type: "user",
						user: {
							id: result.id,
							name: result.name,
							tag: result.tag ?? "",
							image: result.image,
						},
						games: [],
					})),
				);
				return;
			}
		}

		if (searchResultsFromQuery) {
			setSearchResults(
				searchResultsFromQuery.flat().map((result) => ({
					type: "user",
					user: {
						id: result.id,
						name: result.name,
						tag: result.tag ?? "",
						image: result.image,
					},
					games: [],
				})),
			);
		}
	}, [debouncedSearch, searchResultsFromQuery]);

	useEffect(() => {
		const loadSearchHistory = async () => {
			try {
				const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);

				if (stored) {
					const parsed = JSON.parse(stored) as string[];
					setRecentSearches(parsed);
				}
			} catch (error) {
				console.error("Failed to load search history:", error);
			}
		};

		loadSearchHistory();
	}, []);

	const saveSearchToHistory = async (value: string) => {
		const normalized = value.trim();

		if (!normalized) return;

		try {
			const updated = [
				normalized,
				...recentSearches.filter(
					(item) => item.toLowerCase() !== normalized.toLowerCase(),
				),
			].slice(0, MAX_RECENT_SEARCHES);

			setRecentSearches(updated);
			await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
		} catch (error) {
			console.error("Failed to save search history:", error);
		}
	};

	const handleSubmitSearch = async () => {
		await saveSearchToHistory(search);
	};

	const handleClearSearchHistory = async () => {
		try {
			setRecentSearches([]);
			setSearch("");
			setSearchResults([]);
			await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
		} catch (error) {
			console.error("Failed to clear search history:", error);
		}
	};

	const handleSelectCategory = (category: string) => {
		setActiveCategory(category);
	};

	const handleClearCategory = () => {
		setActiveCategory("All");
	};

	const handleSelectRecentSearch = (value: string) => {
		setSearch(value);
		setDebouncedSearch(value);
	};

	const handleSearch = (text: string) => {
		setSearch(text);
	};

	return (
		<Screen>
			<ScreenTitle title="Search" />
			<View className="flex flex-1 flex-col gap-4">
				<View className="flex flex-row w-full items-center gap-2 justify-between">
					<View className="flex-1 w-full h-12 flex-row items-center gap-2 border border-border px-3">
						<MagnifyingGlassIcon size={20} color={colors.gray} />
						<TextInput
							placeholder="Search"
							placeholderTextColor={colors.gray}
							className="h-12 w-full flex-1 text-text"
							autoCorrect={false}
							autoCapitalize="none"
							value={search}
							onChangeText={handleSearch}
							onSubmitEditing={handleSubmitSearch}
							returnKeyType="search"
						/>
					</View>
					<TouchableOpacity
						activeOpacity={0.7}
						className="flex justify-center items-center size-12 border border-border"
					>
						<QrCodeIcon size={24} color={colors.text} />
					</TouchableOpacity>
				</View>

				<SearchSection
					title="Filter by category"
					actionLabel={activeCategory !== "All" ? "Reset" : undefined}
					onActionPress={
						activeCategory !== "All" ? handleClearCategory : undefined
					}
					collapsed={isFiltersCollapsed}
					onCollapsePress={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
				>
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
										onPress={() => handleSelectCategory(category.name)}
										selected={activeCategory === category.name}
									/>
								</View>
							))}
						</ScrollView>
					)}
				</SearchSection>

				{recentSearches.length > 0 && (
					<SearchSection
						title="Recent"
						actionLabel="Clear"
						onActionPress={handleClearSearchHistory}
					>
						<View className="flex flex-row gap-2">
							<View className="flex flex-row gap-2 flex-wrap">
								{recentSearches.map((item) => (
									<TouchableOpacity
										key={item}
										onPress={() => handleSelectRecentSearch(item)}
										className="flex flex-row border border-border p-2"
									>
										<Text className="text-text-muted">{item}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</SearchSection>
				)}

				{search.length === 0 ? (
					<View className="flex-1 justify-center items-center gap-2 mb-24">
						<MagnifyingGlassIcon size={32} color={colors.gray} />
						<Text className="text-base font-sans-medium text-text-muted">
							Start typing to search
						</Text>
					</View>
				) : (
					<View className="flex flex-col gap-2">
						<Text className="text-sm font-sans-medium text-text">
							Search results
						</Text>
						{searchResults.map((result) => (
							<SearchResultCard
								key={result.user.id}
								title={result.user.name}
								isLoading={isLoadingSearchResults}
							/>
						))}
					</View>
				)}
			</View>
		</Screen>
	);
}
