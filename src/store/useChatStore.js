import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { getUserErrorMessage } from "../lib/errorMessage";

const notificationSound = new Audio("/sounds/notification.mp3");

export const useChatStore = create((set, get) => ({
  allContacts: [],
  searchResults: [],
  searchError: null,
  lastSearchQuery: "",
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  loadedContacts: false,
  loadedChats: false,
  loadedMessagesUserId: null,
  isUsersLoading: false,
  isSearchLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    const nextValue = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(nextValue));
    set({ isSoundEnabled: nextValue });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async (forceRefresh = false) => {
    if (!forceRefresh && get().loadedContacts) return;

    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data, loadedContacts: true });
    } catch (error) {
      toast.error(getUserErrorMessage(error, "Không thể tải danh bạ."));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  searchUsers: async (query) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      set({ searchResults: [], searchError: null, isSearchLoading: false });
      return;
    }

    set({ isSearchLoading: true, searchError: null, lastSearchQuery: trimmedQuery });
    try {
      const res = await axiosInstance.get("/messages/search", { params: { query: trimmedQuery } });

      if (get().lastSearchQuery === trimmedQuery) {
        set({ searchResults: res.data });
      }
    } catch (error) {
      set({
        searchResults: [],
        searchError: getUserErrorMessage(error, "Không thể tìm kiếm người dùng."),
      });
    } finally {
      set({ isSearchLoading: false });
    }
  },

  getMyChatPartners: async (forceRefresh = false) => {
    if (!forceRefresh && get().loadedChats) return;

    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data, loadedChats: true });
    } catch (error) {
      toast.error(getUserErrorMessage(error, "Không thể tải cuộc trò chuyện."));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId, forceRefresh = false) => {
    if (!forceRefresh && get().loadedMessagesUserId === userId) return;

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data, loadedMessagesUserId: userId });
    } catch (error) {
      toast.error(getUserErrorMessage(error));
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser || !authUser) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    set((state) => ({ messages: [...state.messages, optimisticMessage] }));

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set((state) => ({
        messages: state.messages.map((message) => (message._id === tempId ? res.data : message)),
        loadedChats: false,
      }));
    } catch (error) {
      set((state) => ({ messages: state.messages.filter((message) => message._id !== tempId) }));
      toast.error(getUserErrorMessage(error));
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled } = get();
      const isMessageSentFromSelectedUser = selectedUser?._id === newMessage.senderId;

      if (isMessageSentFromSelectedUser) {
        set((state) => ({ messages: [...state.messages, newMessage] }));
      }

      set({ loadedChats: false });

      if (isSoundEnabled) {
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Phát âm thanh thất bại:", e));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  resetChatState: () =>
    set({
      allContacts: [],
      searchResults: [],
      searchError: null,
      lastSearchQuery: "",
      chats: [],
      messages: [],
      activeTab: "chats",
      selectedUser: null,
      loadedContacts: false,
      loadedChats: false,
      loadedMessagesUserId: null,
      isUsersLoading: false,
      isSearchLoading: false,
      isMessagesLoading: false,
    }),
}));