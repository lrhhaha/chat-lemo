import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Zap, User } from 'lucide-react';

interface Session {
    id: string;
    name: string;
    created_at: string;
}

interface SessionSidebarProps {
    currentSessionId: string;
    onSelect: (id: string) => void;
    onNew: (id?: string) => void;
}

// Rename function (helper)
function getSessionTitle(session: Session) {
    return session.name || `会话 ${session.id.slice(0, 8)}`;
}

const SessionSidebar = forwardRef(function SessionSidebar(
    { currentSessionId, onSelect, onNew }: SessionSidebarProps,
    ref
) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [newSessionName, setNewSessionName] = useState('');

    useImperativeHandle(ref, () => ({ fetchSessions }), []);

    useEffect(() => {
        fetchSessions();
    }, []);

    /**
     * 调用接口获取所有session信息
     * 并将信息展示在侧边栏中
     */
    async function fetchSessions() {
        try {
            // 获取所有历史对话信息
            const res = await fetch('/api/chat/sessions');
            const data = await res.json();
            if (Array.isArray(data.sessions)) {
                // 将历史对话信息渲染在侧边栏上
                setSessions(data.sessions);
            }
        } catch {
            // ignore
        }
    }

    async function handleNew() {
        onNew();
    }

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation();

        
        await fetch('/api/chat/sessions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchSessions();
        // If current session deleted, might want to redirect or clear (parent specific)
    }

    function handleRename(id: string, currentName: string, e: React.MouseEvent) {
        e.stopPropagation();
        setEditingSessionId(id);
        setNewSessionName(currentName);
    }

    async function saveRename(id: string) {
        if (!newSessionName.trim()) {
            setEditingSessionId(null);
            return;
        }
        await fetch('/api/chat/sessions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name: newSessionName.trim() })
        });
        setEditingSessionId(null);
        setNewSessionName('');
        fetchSessions();
    }

    function handleRenameKeyDown(e: React.KeyboardEvent, id: string) {
        if (e.key === 'Enter') {
            saveRename(id);
        } else if (e.key === 'Escape') {
            setEditingSessionId(null);
            setNewSessionName('');
        }
    }

    return (
        <aside className="w-64 glass-panel flex flex-col h-full z-20 relative border-r-0 hidden md:flex">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Zap className="text-white w-4 h-4" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">ChatAPP<span className="text-blue-400 text-xs align-top ml-1">AI</span></span>
            </div>

            <div className="px-4 mb-6">
                <button 
                    onClick={handleNew}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 font-medium transition-all flex items-center justify-center gap-2 group"
                >
                    <Plus className="w-4 h-4 text-blue-400 group-hover:rotate-90 transition-transform" />
                    <span>新建对话</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-3">历史记录</div>
                <div>
                    {sessions.length === 0 ? (
                         <div className="p-4 text-center text-slate-500 text-xs italic">
                            暂无历史会话
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group flex items-center gap-3 py-1 px-2 rounded-lg cursor-pointer transition-colors relative ${
                                    currentSessionId === session.id
                                        ? 'bg-white/10 text-slate-200 shadow-sm border border-white/5'
                                        : 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                                }`}
                                onClick={() => onSelect(session.id)}
                            >
                                <div className={`w-1 h-8 rounded-full absolute left-0 transition-all duration-300 ${
                                    currentSessionId === session.id ? 'bg-blue-500 opacity-100' : 'bg-transparent opacity-0'
                                }`} />

                                {editingSessionId === session.id ? (
                                    <input
                                        type="text"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        onBlur={() => saveRename(session.id)}
                                        onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                                        className="flex-1 bg-black/20 text-white text-sm rounded px-2 py-1 outline-none border border-blue-500/50 min-w-0"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="flex-1 truncate text-sm">{getSessionTitle(session)}</span>
                                )}

                                {/* Hover Actions */}
                                {editingSessionId !== session.id && (
                                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-[#050509]/80 backdrop-blur shadow-sm rounded-lg p-0.5 border border-white/10`}>
                                        <button
                                            onClick={(e) => handleRename(session.id, session.name, e)}
                                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-white/10 rounded-md transition-colors"
                                            title="重命名"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(session.id, e)}
                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B0E14]"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200">Dev User</span>
                        <span className="text-[10px] text-blue-400/80">Premium Plan</span>
                    </div>
                </div>
            </div>
        </aside>
    );
});

export default SessionSidebar;
