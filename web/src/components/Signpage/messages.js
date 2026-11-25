import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ref, push, onValue, update, remove } from 'firebase/database';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Send,
  Search,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  MessageSquare,
  LogIn,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, realtimeDb, db } from '../firebase';
import Navbar from '../layout/Navbar';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

function formatRelativeVi(ts) {
  if (!ts) return '';
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true, locale: vi });
  } catch {
    return '';
  }
}

/**
 * Realtime 1-to-1 Messaging View:
 * - 100% Vietnamese UI
 * - Proper Edit flow using RTDB update() (never pushes duplicates)
 * - Clean mobile list <-> chat switching
 * - Unsubscribes RTDB listeners cleanly on unmount/switch
 */
function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [otherUserProfile, setOtherUserProfile] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);

  const threadRef = useRef(null);

  // Track authentication + load directory
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setAuthLoading(false);
        return;
      }
      try {
        const [selfSnap, usersSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(collection(db, 'users')),
        ]);
        if (selfSnap.exists()) {
          setUserProfile(selfSnap.data());
        } else {
          setUserProfile({
            firstName: user.displayName || 'Thành viên',
            photo: user.photoURL || '',
          });
        }
        setAllUsers(
          usersSnap.docs
            .filter((d) => d.id !== user.uid)
            .map((d) => ({
              id: d.id,
              firstName: d.data().firstName || 'Thành viên',
              photo: d.data().photo || '',
            })),
        );
      } catch (err) {
        console.error('Error initializing chat users:', err);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Build user map for O(1) lookup in conversation list
  const userMap = useMemo(() => {
    const map = {};
    for (const u of allUsers) map[u.id] = u;
    return map;
  }, [allUsers]);

  // Subscribe to all user conversations
  useEffect(() => {
    if (!currentUser) return undefined;
    const allMsgRef = ref(realtimeDb, 'messages');
    const unsubscribeConvs = onValue(allMsgRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setConversations([]);
        return;
      }
      const latestMap = {};
      Object.values(data).forEach((chatMsgs) => {
        if (!chatMsgs || typeof chatMsgs !== 'object') return;
        Object.values(chatMsgs).forEach((m) => {
          const { sender, receiver, text, timestamp } = m;
          if (sender !== currentUser.uid && receiver !== currentUser.uid) return;
          const peerId = sender === currentUser.uid ? receiver : sender;
          if (!latestMap[peerId] || (latestMap[peerId].timestamp || 0) < (timestamp || 0)) {
            latestMap[peerId] = { text, timestamp, sender };
          }
        });
      });

      const list = await Promise.all(
        Object.keys(latestMap).map(async (peerId) => {
          let peer = userMap[peerId];
          if (!peer) {
            const snap = await getDoc(doc(db, 'users', peerId));
            peer = snap.exists()
              ? { firstName: snap.data().firstName || 'Thành viên', photo: snap.data().photo || '' }
              : { firstName: 'Thành viên', photo: '' };
          }
          return {
            id: peerId,
            name: peer.firstName,
            photo: peer.photo,
            latestMessage: latestMap[peerId].text,
            timestamp: latestMap[peerId].timestamp,
            sender: latestMap[peerId].sender,
          };
        }),
      );
      setConversations(list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
    });

    return () => unsubscribeConvs();
  }, [currentUser, userMap]);

  // Subscribe to selected conversation messages
  useEffect(() => {
    setEditingMessageId(null);
    setNewMessage('');
    if (!currentUser || !userId) {
      setOtherUserProfile(null);
      setMessages([]);
      return undefined;
    }

    let active = true;
    getDoc(doc(db, 'users', userId)).then((snap) => {
      if (active) {
        setOtherUserProfile(
          snap.exists() ? snap.data() : { firstName: 'Thành viên', photo: '' },
        );
      }
    });

    const chatId = [currentUser.uid, userId].sort().join('_');
    const chatRef = ref(realtimeDb, `messages/${chatId}`);
    const unsubscribeChat = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
        return;
      }
      const list = Object.entries(data)
        .map(([key, val]) => ({ id: key, ...val }))
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setMessages(list);
    });

    return () => {
      active = false;
      unsubscribeChat();
    };
  }, [currentUser, userId]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendOrUpdate = async () => {
    const trimmed = newMessage.trim();
    if (!currentUser || !userId || !trimmed) return;
    const chatId = [currentUser.uid, userId].sort().join('_');

    try {
      if (editingMessageId) {
        await update(ref(realtimeDb, `messages/${chatId}/${editingMessageId}`), {
          text: trimmed,
          edited: true,
        });
        setEditingMessageId(null);
        setNewMessage('');
      } else {
        await push(ref(realtimeDb, `messages/${chatId}`), {
          sender: currentUser.uid,
          receiver: userId,
          text: trimmed,
          timestamp: Date.now(),
        });
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending/editing message:', err);
      toast.error('Không thể gửi tin nhắn lúc này.');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!currentUser || !userId) return;
    const chatId = [currentUser.uid, userId].sort().join('_');
    try {
      await remove(ref(realtimeDb, `messages/${chatId}/${msgId}`));
      if (editingMessageId === msgId) {
        setEditingMessageId(null);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Không thể xóa tin nhắn.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendOrUpdate();
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return allUsers.filter((u) => u.firstName.toLowerCase().includes(q));
  }, [allUsers, searchTerm]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-heritage-cream pt-[72px] flex items-center justify-center text-sm text-heritage-muted">
        <Navbar />
        Đang tải hộp thư...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-heritage-cream pt-[72px] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <EmptyState
              icon={LogIn}
              title="Đăng nhập để sử dụng Hộp thư"
              description="Trò chuyện và trao đổi kiến thức Lịch Sử – GDĐP cùng các thành viên khác trên HTLVN."
              actionLabel="Đăng nhập ngay"
              actionTo="/login"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pt-[72px] bg-heritage-cream flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto p-0 sm:p-4 lg:p-6 overflow-hidden">
        <div className="h-full bg-white sm:rounded-2xl border-t sm:border border-heritage-border shadow-card flex overflow-hidden">
          {/* CONVERSATION SIDEBAR (hidden on mobile when chat active) */}
          <aside
            className={`${
              userId ? 'hidden md:flex' : 'flex'
            } w-full md:w-80 lg:w-96 border-r border-heritage-border flex-col bg-white shrink-0`}
          >
            <div className="p-4 border-b border-heritage-border space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-xl font-bold text-heritage-ink">Tin nhắn</h1>
                <span className="text-xs font-semibold text-heritage-muted">
                  {conversations.length} hội thoại
                </span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-heritage-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm thành viên để nhắn..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-heritage-border bg-heritage-cream/50 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-heritage-border/50">
              {searchTerm.trim() ? (
                filteredUsers.length === 0 ? (
                  <p className="p-5 text-sm text-heritage-muted text-center">Không tìm thấy thành viên.</p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        navigate(`/messages/${u.id}`);
                      }}
                      className="w-full p-3.5 flex items-center gap-3 hover:bg-heritage-paper text-left transition-colors cursor-pointer"
                    >
                      <img
                        src={u.photo || '/logo192.png'}
                        alt={u.firstName}
                        className="w-11 h-11 rounded-full object-cover border border-heritage-border shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-heritage-ink truncate">{u.firstName}</p>
                        <p className="text-xs text-heritage-jade">Nhấn để mở cuộc trò chuyện</p>
                      </div>
                    </button>
                  ))
                )
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <p className="text-sm font-semibold text-heritage-ink">Chưa có cuộc trò chuyện nào</p>
                  <p className="text-xs text-heritage-muted">
                    Gõ tên thành viên vào ô tìm kiếm phía trên để bắt đầu trò chuyện.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const active = conv.id === userId;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => navigate(`/messages/${conv.id}`)}
                      className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                        active ? 'bg-heritage-vermilion-soft/70' : 'hover:bg-heritage-paper/70'
                      }`}
                    >
                      <img
                        src={conv.photo || '/logo192.png'}
                        alt={conv.name}
                        className="w-11 h-11 rounded-full object-cover border border-heritage-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-heritage-ink truncate">{conv.name}</p>
                          <span className="text-[11px] text-heritage-muted shrink-0">
                            {formatRelativeVi(conv.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-heritage-muted truncate mt-0.5">
                          {conv.sender === currentUser.uid ? 'Bạn: ' : ''}
                          {conv.latestMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* CHAT PANE */}
          <main className={`${userId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-heritage-cream/40 min-w-0`}>
            {!userId ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <EmptyState
                  icon={MessageSquare}
                  title="Chọn một cuộc trò chuyện"
                  description="Chọn thành viên từ danh sách bên trái hoặc tìm tên bạn học để bắt đầu trao đổi."
                />
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="h-16 px-4 sm:px-5 bg-white border-b border-heritage-border flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => navigate('/messages')}
                      aria-label="Quay lại danh sách"
                      className="md:hidden p-2 -ml-2 rounded-lg text-heritage-muted hover:text-heritage-ink hover:bg-heritage-paper cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Link to={`/profile/${userId}`} className="flex items-center gap-3 min-w-0 group">
                      <img
                        src={otherUserProfile?.photo || '/logo192.png'}
                        alt={otherUserProfile?.firstName}
                        className="w-10 h-10 rounded-full object-cover border border-heritage-border shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-sm sm:text-base text-heritage-ink group-hover:text-heritage-vermilion truncate">
                          {otherUserProfile?.firstName || 'Thành viên'}
                        </p>
                        <p className="text-[11px] text-heritage-muted">Nhấn để xem hồ sơ</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Messages Thread */}
                <div ref={threadRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-heritage-muted">
                      Hãy gửi lời chào đầu tiên đến {otherUserProfile?.firstName || 'bạn ấy'}!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isSelf = msg.sender === currentUser.uid;
                      const avatar = isSelf ? userProfile?.photo : otherUserProfile?.photo;
                      return (
                        <div
                          key={msg.id}
                          className={`group flex items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isSelf && (
                            <img
                              src={avatar || '/logo192.png'}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border border-heritage-border shrink-0"
                            />
                          )}

                          {isSelf && (
                            <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-1 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setNewMessage(msg.text || '');
                                }}
                                aria-label="Sửa tin nhắn"
                                className="p-1 rounded-md text-heritage-muted hover:text-heritage-ink hover:bg-white cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                aria-label="Xóa tin nhắn"
                                className="p-1 rounded-md text-heritage-muted hover:text-red-600 hover:bg-white cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                              isSelf
                                ? 'bg-heritage-vermilion text-white rounded-br-sm'
                                : 'bg-white border border-heritage-border text-heritage-ink rounded-bl-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                            <div
                              className={`mt-1 flex items-center gap-1.5 text-[10px] ${
                                isSelf ? 'text-red-100 justify-end' : 'text-heritage-muted'
                              }`}
                            >
                              {msg.edited && <span>(đã chỉnh sửa) ·</span>}
                              <span>{formatRelativeVi(msg.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Editing Banner + Composer */}
                <div className="bg-white border-t border-heritage-border p-3 sm:p-4 shrink-0 space-y-2">
                  {editingMessageId && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-heritage-gold-soft text-xs font-semibold text-amber-900">
                      <span>Đang chỉnh sửa tin nhắn</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMessageId(null);
                          setNewMessage('');
                        }}
                        className="inline-flex items-center gap-1 text-red-700 hover:underline cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Hủy
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={editingMessageId ? 'Sửa nội dung tin nhắn...' : 'Nhập tin nhắn...'}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-heritage-border bg-heritage-cream/50 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
                    />
                    <Button
                      type="button"
                      variant={editingMessageId ? 'gold' : 'primary'}
                      size="md"
                      disabled={!newMessage.trim()}
                      onClick={handleSendOrUpdate}
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">{editingMessageId ? 'Cập nhật' : 'Gửi'}</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Messages;
