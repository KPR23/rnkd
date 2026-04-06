import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import SearchCategoriesCard from "@/src/components/search/SearchCategoriesCard";
import UserSearchResultCard from "@/src/components/search/SearchResultCard";
import SearchSection from "@/src/components/search/SearchSection";
import { trpc } from "@/src/utils/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@repo/types/auth";
import { GameId } from "@repo/types/game";
import { type SearchProfileKind } from "@repo/types";
import { colors, tagColors } from "@repo/ui/colors";
import {
	AsteriskIcon,
	GameControllerIcon,
	MagnifyingGlassIcon,
	QrCodeIcon,
	UserIcon,
	UsersIcon,
} from "phosphor-react-native";
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	ActivityIndicator,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

const SEARCH_HISTORY_KEY = "search_history";
const MAX_RECENT_SEARCHES = 5;
const MIN_SEARCH_LENGTH = 2;

type ResultCategory = "All" | "Players" | "Teams" | "Games";

const resultCategories: {
	name: ResultCategory;
	icon: ReactNode;
	color: string;
}[] = [
	{
		name: "All",
		icon: <AsteriskIcon />,
		color: colors.gray,
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

export type SearchUserGame = {
	gameId: GameId;
	nickname: string;
};

type UserSearchResult = {
	type: SearchProfileKind;
	user: Pick<User, "id" | "name" | "tag" | "image">;
	games: SearchUserGame[];
};

type SearchResult = UserSearchResult;

export default function SearchTab() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const [activeCategory, setActiveCategory] = useState<ResultCategory>("All");

	const { data: searchUsersResults, isLoading: isLoadingSearchResults } =
		trpc.search.searchUsers.useQuery(debouncedSearch, {
			enabled: debouncedSearch.length >= MIN_SEARCH_LENGTH,
		});

	const searchResults = useMemo<SearchResult[]>(
		() =>
			(searchUsersResults ?? []).map((result) => ({
				type: result.type,
				user: {
					id: result.id,
					name: result.name,
					tag: result.tag ?? "",
					image: result.image,
				},
				games: result.games.map((game) => ({
					gameId: game.gameId,
					nickname: game.displayLabel,
				})),
			})),
		[searchUsersResults],
	);

	const filteredSearchResults = useMemo(() => {
		if (activeCategory === "All") {
			return searchResults;
		}

		if (activeCategory === "Players") {
			return searchResults.filter((result) => result.type === "player");
		}

		if (activeCategory === "Teams") {
			return searchResults.filter((result) => result.type === "team");
		}

		if (activeCategory === "Games") {
			return [];
		}

		return searchResults;
	}, [activeCategory, searchResults]);

	const hasActiveSearch = debouncedSearch.length >= MIN_SEARCH_LENGTH;
	const showRecentSearches = recentSearches.length > 0 && !hasActiveSearch;

	const saveSearchToHistory = useCallback(async (value: string) => {
		const normalized = value.trim();

		if (!normalized) return;

		try {
			setRecentSearches((prev) => {
				const updated = [
					normalized,
					...prev.filter(
						(item) => item.toLowerCase() !== normalized.toLowerCase(),
					),
				].slice(0, MAX_RECENT_SEARCHES);

				void AsyncStorage.setItem(
					SEARCH_HISTORY_KEY,
					JSON.stringify(updated),
				).catch((error) => {
					console.error("Failed to save search history:", error);
				});

				return updated;
			});
		} catch (error) {
			console.error("Failed to save search history:", error);
		}
	}, []);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedSearch(search.trim());
		}, 300);

		return () => clearTimeout(timeout);
	}, [search]);

	useEffect(() => {
		if (debouncedSearch.length < MIN_SEARCH_LENGTH) {
			return;
		}

		void saveSearchToHistory(debouncedSearch);
	}, [debouncedSearch, saveSearchToHistory]);

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

	const handleSubmitSearch = async () => {
		await saveSearchToHistory(search);
	};

	const handleClearSearchHistory = async () => {
		try {
			setRecentSearches([]);
			setSearch("");
			setDebouncedSearch("");
			await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
		} catch (error) {
			console.error("Failed to clear search history:", error);
		}
	};

	const handleSelectCategory = (category: ResultCategory) => {
		setActiveCategory(category);
	};

	const handleClearCategory = () => {
		setActiveCategory("All");
	};

	const handleSelectRecentSearch = (value: string) => {
		setSearch(value);
		setDebouncedSearch(value.trim());
	};

	const handleSearch = (text: string) => {
		setSearch(text);
	};

	return (
		<Screen>
			<ScreenTitle title="Search" />
			<View className="flex flex-1 flex-col gap-2">
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

				{showRecentSearches && (
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
				) : !hasActiveSearch ? (
					<View className="flex-1 justify-center items-center gap-2 mb-24">
						<MagnifyingGlassIcon size={32} color={colors.gray} />
						<Text className="text-base font-sans-medium text-text-muted">
							Type at least {MIN_SEARCH_LENGTH} characters to search
						</Text>
					</View>
				) : (
					<View className="flex flex-col gap-4">
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ gap: 10 }}
						>
							{resultCategories.map((category) => (
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
						<SearchSection
							title="Search results"
							actionLabel={activeCategory !== "All" ? "Reset" : undefined}
							onActionPress={
								activeCategory !== "All" ? handleClearCategory : undefined
							}
						>
							<View className="flex flex-col gap-2">
								{isLoadingSearchResults ? (
									// <SearchResultCard title="Loading" isLoading />
									<ActivityIndicator />
								) : filteredSearchResults.length > 0 ? (
									filteredSearchResults.map((result) => (
										<UserSearchResultCard
											key={result.user.id}
											user={result.user}
											type={result.type}
											games={result.games}
											isLoading={isLoadingSearchResults}
											onPress={() => {}}
										/>
									))
								) : (
									<View className="py-6 items-center">
										<Text className="text-sm font-sans-medium text-text-muted">
											No results found
										</Text>
									</View>
								)}
							</View>
						</SearchSection>
					</View>
				)}
			</View>
		</Screen>
	);
}
