import { createContext, useContext, useEffect, useState } from "react";
import { Auth, DataStore } from "aws-amplify";
import { User } from "../models";

const UserContext = createContext({
  sub: "",
  user: null,
  loading: true,
  refetchUser: () => {},
});

const UserContextProvider = ({ children }) => {
  const [sub, setSub] = useState("");
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    const authUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
    const dbUser = await DataStore.query(User, authUser.attributes.sub);
    setSub(authUser.attributes.sub);
    setUser(dbUser);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ sub, user, loading, refetchUser: fetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;

export const useUserContext = () => useContext(UserContext);
