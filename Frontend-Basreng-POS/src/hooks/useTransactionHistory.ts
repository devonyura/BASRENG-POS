import { useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";

import { getTransactionHistory } from "./restAPIRequest";
import { getUsers } from "./restAPIUsers";
import { getBranches } from "./restAPIBranch";

interface Params {
  role?: string | null;
  branchID?: string | number | null;

  selectedDateFilter: string;
  selectedBranchId: string | null;
  selectedKasirId: string | null;

  enabled?: boolean; // ✅ tambahan penting
}

export const useTransactionHistory = ({
  role,
  branchID,
  selectedDateFilter,
  selectedBranchId,
  selectedKasirId,
  enabled = true,
}: Params) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ======================
  // Selected user
  // ======================
  const selectedUser = useMemo(() => {
    return usersList.find((u) => u.id === selectedKasirId);
  }, [usersList, selectedKasirId]);

  // ======================
  // Build Date
  // ======================
  const buildDate = () => {
    let startDate: string | undefined;
    let endDate: string = dayjs().format("YYYY-MM-DD");

    if (!isNaN(Number(selectedDateFilter))) {
      startDate = dayjs()
        .subtract(Number(selectedDateFilter), "day")
        .format("YYYY-MM-DD");
    } else if (selectedDateFilter === "today") {
      startDate = "today";
    }

    return { startDate, endDate };
  };

  // ======================
  // Load Master Data
  // ======================
  const loadMasterData = useCallback(async () => {
    if (!enabled || !role) return;

    try {
      const [branches, users] = await Promise.all([
        getBranches(),
        getUsers(),
      ]);

      setBranchList(branches);
      setUsersList(users);
    } catch (err) {
      console.error("Gagal load master", err);
    }
  }, [enabled, role]);

  // ======================
  // Load Transactions
  // ======================
  const loadTransactions = useCallback(async () => {
    if (!enabled || !role) return;

    // ⛔ cegah fetch sebelum data siap
    if (selectedBranchId === null && role !== "admin") return;

    try {
      setIsLoading(true);

      const { startDate, endDate } = buildDate();

      const result = await getTransactionHistory({
        username: selectedUser?.username || "",
        branch: selectedBranchId
          ? parseInt(selectedBranchId)
          : undefined,
        start_date: startDate,
        end_date: endDate,
      });

      setTransactions(result || []); // 🔥 amanin null
    } catch (err) {
      console.error("Gagal load transaksi", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    role,
    selectedBranchId,
    selectedUser,
    selectedDateFilter,
  ]);

  // ======================
  // Effects
  // ======================
  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  useEffect(() => {
    if (!enabled || !role) return;

    // ⛔ tunggu semua param siap
    if (role === "kasir") {
      if (!selectedBranchId || !selectedKasirId) return;
    }

    loadTransactions();
  }, [
    enabled,
    role,
    selectedBranchId,
    selectedKasirId,
    selectedDateFilter,
    loadTransactions,
  ]);

  return {
    transactions,
    branchList,
    usersList,
    isLoading,
    reload: loadTransactions,
  };
};