'use client';

import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import axios from 'axios';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import toast from 'react-hot-toast';

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Function to clear Clerk session + local storage + indexedDB
  const clearSession = useCallback(async () => {
    try {
      await signOut();
      localStorage.clear();
      if (window.indexedDB) {
        const dbs = await window.indexedDB.databases();
        dbs.forEach((db) => window.indexedDB.deleteDatabase(db.name));
      }
      console.log('Clerk session cleared.');
      toast.success('Session cleared. Please reload and sign in again.');
    } catch (err) {
      console.error('Error clearing session:', err);
    }
  }, [signOut]);

  // Helper: axios instance with token
  const axiosWithToken = async () => {
    const token = await getToken({ template: 'backend' });
    if (!token) throw new Error('User not authenticated');

    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  };

  // CREATE CHAT
  const createNewChat = async () => {
    try {
      const client = await axiosWithToken();
      const res = await client.post('/api/chat/create', {});
      if (res.data.success) await fetchUsersChats(false);
    } catch (error) {
      if (error.response?.status === 401) await clearSession();
      toast.error(error.message);
    }
  };

  // FETCH CHATS
  const fetchUsersChats = async (createIfEmpty = true) => {
    try {
      const client = await axiosWithToken();
      const { data } = await client.get('/api/chat/get');

      if (!data.success) {
        if (data?.status === 401) {
          await clearSession();
          return;
        }
        toast.error(data.message);
        return;
      }

      const allChats = data.chats || [];

      if (createIfEmpty && allChats.length === 0) {
        await createNewChat();
        return;
      }

      setChats(allChats);

      if (!selectedChat) {
        setSelectedChat(allChats[0] || null);
      } else {
        const exists = allChats.some((c) => c.id === selectedChat.id);
        if (!exists) setSelectedChat(allChats[0] || null);
      }

      setLoaded(true);
    } catch (error) {
      if (error.response?.status === 401) await clearSession();
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user && !loaded) fetchUsersChats();
  }, [user, loaded]);

  const value = {
    user,
    chats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
    setChats,
    clearSession, // optional: expose it to manually clear session if needed
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
