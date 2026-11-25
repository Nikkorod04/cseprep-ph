import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  getMockResults,
  getOverview,
  getRecentSessions,
  getStreak,
  getTopicStats,
  type MockRow,
  type Overview,
  type SessionRow,
  type TopicStat,
} from "@/lib/db";

const EMPTY: Overview = { total: 0, correct: 0, today: 0, ms: 0 };

export function useDashboard() {
  const [overview, setOverview] = useState<Overview>(EMPTY);
  const [streak, setStreak] = useState(0);
  const [topics, setTopics] = useState<TopicStat[]>([]);
  const [mocks, setMocks] = useState<MockRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  const refresh = useCallback(() => {
    setOverview(getOverview());
    setStreak(getStreak());
    setTopics(getTopicStats());
    setMocks(getMockResults(5));
    setSessions(getRecentSessions(5));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const accuracy = overview.total > 0 ? (overview.correct / overview.total) * 100 : 0;

  return { overview, streak, topics, mocks, sessions, accuracy, refresh };
}
