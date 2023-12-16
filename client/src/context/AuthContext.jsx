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
    if (username && chatAvailabilty) {
      setUser({ username, chatAvailabilty });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
