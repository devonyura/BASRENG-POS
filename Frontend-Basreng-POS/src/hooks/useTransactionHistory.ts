import { useState, useEffect, useMemo } from "react";
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
}

export const useTransactionHistory = ({
  role,
  branchID,
  selectedDateFilter,
  selectedBranchId,
  selectedKasirId,
}: Params) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ======================
  // Derive selected user INSIDE hook
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
  // Load Transactions
  // ======================
  const loadTransactions = async () => {
    if (!role) return;

    setIsLoading(true);
    try {
      const { startDate, endDate } = buildDate();

      const result = await getTransactionHistory({
        username: selectedUser?.username || "",
        branch: selectedBranchId
          ? parseInt(selectedBranchId)
          : undefined,
        start_date: startDate,
        end_date: endDate,
      });

      setTransactions(result);
    } catch (err) {
      console.error("Gagal load transaksi", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // Load Master
  // ======================
  const loadMasterData = async () => {
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
  };

  // ======================
  // Effects
  // ======================
  useEffect(() => {
    if (!role) return;
    loadMasterData();
  }, [role]);

  useEffect(() => {
    // tunggu usersList siap supaya selectedUser valid
    if (!role) return;

    loadTransactions();
  }, [role, selectedDateFilter, selectedBranchId, selectedKasirId, usersList]);

  return {
    transactions,
    branchList,
    usersList,
    isLoading,
    reload: loadTransactions,
  };
};