import React, { createContext, useContext, ReactNode, useState } from "react";

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

  return (
    <RefreshFetchDataContext.Provider value={{ refreshSchedData, refresh }}>
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
