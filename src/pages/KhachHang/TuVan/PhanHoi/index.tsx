import React, { useEffect, useState, useRef } from 'react';
import { history, Link, useLocation, useModel } from 'umi';
import { Avatar, Spin, message as antMessage } from 'antd';
import {
  ArrowLeft, Send, Smile, Paperclip, Image, MoreVertical, Phone, Video, X
} from 'lucide-react';
import {
  getConversationDetail,
  getConversationMessages,
  sendMessage,
  sendMessageWithAttachment,
} from '@/services/messageService';
import { ip3 } from '@/utils/ip';
import styles from './index.less';

const EMOJI_LIST = ['😀', '😂', '🥰', '😍', '😎', '😭', '😡', '👍', '👎', '❤️', '🔥', '🎉', '🐶', '🐱', '🏥'];

const PhanHoi: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const conversationId = query.get('id');

  const { initialState } = useModel('@@initialState');
  const currentUserId = initialState?.currentUser?.id;

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // File & Emoji states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    if (!conversationId) {
      antMessage.error('Không tìm thấy ID cuộc trò chuyện');
      return;
    }
    try {
      setLoading(true);
      const [convData, msgData] = await Promise.all([
        getConversationDetail(conversationId),
        getConversationMessages(conversationId, 1, 100),
      ]);
      setConversation(convData);
      setMessages(msgData.items || []);
    } catch (error) {
      console.error('Lỗi khi tải cuộc trò chuyện:', error);
      antMessage.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!conversationId) return;
    if (!replyText.trim() && !selectedFile) return;

    try {
      setSending(true);
      if (selectedFile) {
        await sendMessageWithAttachment(conversationId, selectedFile, replyText.trim());
      } else {
        await sendMessage(conversationId, replyText.trim());
      }
      
      setReplyText('');
      setSelectedFile(null);
      setShowEmojiPicker(false);
      
      const msgData = await getConversationMessages(conversationId, 1, 100);
      setMessages(msgData.items || []);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      antMessage.error('Lỗi khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const insertEmoji = (emoji: string) => {
    setReplyText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const getOtherParticipant = () => {
    const participants = conversation?.participants || [];
    return participants.find((p: any) => p.id !== currentUserId) || participants[0];
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { date: string; items: any[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = formatDate(msg.created_at);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.items.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, items: [msg] });
    }
  });

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const other = getOtherParticipant();

  return (
    <div className={styles.page}>
      <div className={styles.chatContainer}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.btnBack} onClick={() => history.push('/khach-hang/tu-van')}>
              <ArrowLeft size={20} />
            </button>
            <div className={styles.headerAvatar}>
              <Avatar
                size={44}
                src={other?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${other?.full_name || 'doc'}`}
              />
              <div className={styles.onlineDot}></div>
            </div>
            <div className={styles.headerInfo}>
              <h2>BS. {other?.full_name || 'Bác sĩ'}</h2>
              <span className={styles.statusText}>
                <span className={styles.greenCircle}></span>
                Đang hoạt động
              </span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.headerBtn}><Phone size={20} /></button>
            <button className={styles.headerBtn}><Video size={20} /></button>
            <button className={styles.headerBtn}><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Messages Area */}
        <div className={styles.messagesArea}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <h3>Bắt đầu cuộc trò chuyện</h3>
              <p>Gửi tin nhắn đầu tiên để nhận tư vấn từ bác sĩ thú y.</p>
            </div>
          ) : (
            groupedMessages.map((group, gi) => (
              <div key={gi}>
                <div className={styles.dateSeparator}>
                  <span>{group.date}</span>
                </div>
                {group.items.map((msg) => {
                  const isMe = msg.sender?.id === currentUserId;
                  const isImage = msg.message_type === 'image';
                  const isFile = msg.message_type === 'file';

                  return (
                    <div
                      key={msg.id}
                      className={`${styles.messageBubbleRow} ${isMe ? styles.mine : styles.theirs}`}
                    >
                      {!isMe && (
                        <Avatar
                          size={32}
                          src={other?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${other?.full_name || 'doc'}`}
                          className={styles.bubbleAvatar}
                        />
                      )}
                      <div className={`${styles.bubble} ${isMe ? styles.bubbleMine : styles.bubbleTheirs}`}>
                        <div className={styles.bubbleContent}>
                          {isImage && msg.attachments?.[0]?.file_url ? (
                            <div>
                                <img src={`${ip3}${msg.attachments[0].file_url.replace(/^\//, '')}`} alt="attachment" style={{ maxWidth: 200, borderRadius: 8, marginBottom: 8 }} />
                                {msg.content && <div>{msg.content}</div>}
                            </div>
                          ) : isFile && msg.attachments?.[0]?.file_url ? (
                            <div>
                                <a href={`${ip3}${msg.attachments[0].file_url.replace(/^\//, '')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.05)', padding: '8px 12px', borderRadius: 8, textDecoration: 'none', color: 'inherit' }}>
                                    <Paperclip size={16} /> {msg.attachments[0].file_name || 'Tải tệp đính kèm'}
                                </a>
                                {msg.content && <div style={{ marginTop: 8 }}>{msg.content}</div>}
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                        <div className={styles.bubbleTime}>
                          {formatTime(msg.created_at)}
                          {isMe && <span className={styles.checkMark}>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={styles.inputAreaWrapper}>
            {selectedFile && (
                <div className={styles.filePreviewBar}>
                    <div className={styles.fileInfo}>
                        <Paperclip size={16} />
                        <span>{selectedFile.name}</span>
                    </div>
                    <button onClick={() => setSelectedFile(null)}><X size={16} /></button>
                </div>
            )}
            
            {showEmojiPicker && (
                <div className={styles.emojiPicker}>
                    {EMOJI_LIST.map(em => (
                        <span key={em} onClick={() => insertEmoji(em)} className={styles.emojiItem}>{em}</span>
                    ))}
                </div>
            )}

            <div className={styles.inputArea}>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                />
                <div className={styles.inputActions}>
                    <button className={styles.attachBtn} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <Smile size={22} />
                    </button>
                    <button className={styles.attachBtn} onClick={() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.removeAttribute("accept");
                            fileInputRef.current.click();
                        }
                    }}>
                        <Paperclip size={20} />
                    </button>
                    <button className={styles.attachBtn} onClick={() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.accept = "image/*";
                            fileInputRef.current.click();
                        }
                    }}>
                        <Image size={20} />
                    </button>
                </div>
                <div className={styles.inputWrapper}>
                    <textarea
                        ref={inputRef}
                        className={styles.messageInput}
                        placeholder="Nhập tin nhắn..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                </div>
                <button
                    className={`${styles.sendBtn} ${(replyText.trim() || selectedFile) ? styles.active : ''}`}
                    onClick={handleSend}
                    disabled={sending || (!replyText.trim() && !selectedFile)}
                >
                    {sending ? <Spin size="small" /> : <Send size={20} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PhanHoi;
