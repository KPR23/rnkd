import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  AsteriskIcon,
  GameControllerIcon,
  UserIcon,
  UsersIcon,
} from "phosphor-react-native";

import { colors, tagColors } from "@repo/ui/colors";
import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import SearchCategoriesCard from "@/src/components/search/SearchCategoriesCard";
import SearchEmptyState from "@/src/components/search/SearchEmptyState";
import SearchInputBar from "@/src/components/search/SearchInputBar";
import SearchRecentPreview from "@/src/components/search/SearchRecentPreview";
import SearchResultCard from "@/src/components/search/SearchResultCard";
import SearchSection from "@/src/components/search/SearchSection";
import { trpc } from "@/src/utils/trpc";

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

export default function SearchTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<ResultCategory>("All");

  const { data: searchResults = [], isLoading: isLoadingSearchResults } =
    trpc.search.searchAll.useQuery(debouncedSearch, {
      enabled: debouncedSearch.length >= MIN_SEARCH_LENGTH,
    });

  const router = useRouter();

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
      return searchResults.filter((result) => result.type === "game");
    }

    return searchResults;
  }, [activeCategory, searchResults]);

  const hasActiveSearch = debouncedSearch.length >= MIN_SEARCH_LENGTH;
  const showRecentSearches =
    recentSearches.length > 0 && search.length === 0 && !hasActiveSearch;
  const showEmptyState = search.length === 0 && !showRecentSearches;

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
    const normalized = search.trim();
    if (normalized.length < MIN_SEARCH_LENGTH) return;
    await saveSearchToHistory(normalized);
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
      <View className="flex flex-1 flex-col">
        <ScreenTitle title="Search" globalRs={3443} showRsBadge />
        <View className="flex flex-1 flex-col gap-3">
          <SearchInputBar
            value={search}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmitSearch}
            onClear={() => setSearch("")}
          />

          {showRecentSearches ? (
            <SearchRecentPreview
              recentSearches={recentSearches}
              onSelectSearch={handleSelectRecentSearch}
            />
          ) : null}

          {showEmptyState ? (
            <SearchEmptyState
              title="Start typing to search"
              subtitle="Players, teams or games"
            />
          ) : !hasActiveSearch ? (
            <SearchEmptyState
              title={`Type at least ${MIN_SEARCH_LENGTH} characters to search`}
            />
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
                onActionPress={
                  activeCategory !== "All" ? handleClearCategory : undefined
                }
              >
                <View className="flex flex-col gap-2">
                  {isLoadingSearchResults ? (
                    <View className="items-center py-6">
                      <ActivityIndicator />
                    </View>
                  ) : filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((result) => (
                      <SearchResultCard
                        key={`${result.type}:${result.id}`}
                        result={result}
                        onPress={() => {
                          router.push(`/${result.type}/${result.id}`);
                        }}
                      />
                    ))
                  ) : (
                    <View className="items-center py-6">
                      <Text className="font-sans-medium text-text-muted text-sm">
                        No results found
                      </Text>
                    </View>
                  )}
                </View>
              </SearchSection>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
