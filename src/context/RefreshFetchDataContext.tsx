import React, { createContext, useContext, ReactNode, useState } from "react";
import { getCurrentDatePH } from "../utils/dateUtils";

const RefreshFetchDataContext = createContext<
  RefreshFetchDataContextProps | undefined
>(undefined);

export const RefreshFetchDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  let [refresh, setShouldRefresh] = useState(0);

  const refreshSchedData = () => {
    console.log("Refreshing schedule data...");
    setShouldRefresh(refresh + 1);
  };

  const getCurrentDate = async () => {
    return await getCurrentDatePH();
  };

  return (
    <RefreshFetchDataContext.Provider
      value={{ refreshSchedData, getCurrentDate, refresh }}>
      {children}
    </RefreshFetchDataContext.Provider>
  );
};

export const useRefreshFetchDataContext = () => {
  const context = useContext(RefreshFetchDataContext);
  if (!context) {
    throw new Error(
      "userefreshFetchDataContext must be used within an RefreshFetchDataProvider"
    );
  }
  return context;
};
