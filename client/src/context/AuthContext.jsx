import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({
  user: null,
  setUser: (_user) => {},
});

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const chatAvailabilty = localStorage.getItem("chatAvailabilty");
    const userId = localStorage.getItem("userId");
    if (username && chatAvailabilty && userId) {
      setUser({ username, chatAvailabilty, userId });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
