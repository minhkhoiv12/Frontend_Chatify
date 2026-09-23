import { useEffect, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    getAllContacts,
    allContacts,
    searchUsers,
    searchResults,
    searchError,
    setSelectedUser,
    isUsersLoading,
    isSearchLoading,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const hasSearchQuery = searchQuery.trim().length > 0;

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const displayedUsers = hasSearchQuery ? searchResults : allContacts;

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          aria-label="Tìm kiếm người dùng theo tên hoặc email"
          className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-9 pr-9 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-500"
        />
        {hasSearchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute right-2 top-1/2 rounded p-1 -translate-y-1/2 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      {isUsersLoading && !hasSearchQuery ? (
        <UsersLoadingSkeleton />
      ) : isSearchLoading ? (
        <UsersLoadingSkeleton />
      ) : searchError ? (
        <p className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-300">{searchError}</p>
      ) : hasSearchQuery && displayedUsers.length === 0 ? (
        <p className="rounded-lg bg-slate-800/50 p-4 text-center text-sm text-slate-400">
          Không tìm thấy người dùng phù hợp với “{searchQuery.trim()}”.
        </p>
      ) : (
        displayedUsers.map((contact) => (
          <button
            key={contact._id}
            type="button"
            className="w-full rounded-lg bg-cyan-500/10 p-4 text-left transition-colors hover:bg-cyan-500/20"
            onClick={() => setSelectedUser(contact)}
          >
            <div className="flex items-center gap-3">
              <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                <div className="size-12 rounded-full">
                  <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="truncate font-medium text-slate-200">{contact.fullName}</h4>
                {hasSearchQuery && <p className="truncate text-xs text-slate-400">{contact.email}</p>}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

export default ContactList;