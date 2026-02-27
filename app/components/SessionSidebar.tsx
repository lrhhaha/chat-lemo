'use client'

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Plus, Trash2, Edit2, Zap, User, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation'

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

function getSessionTitle(session: Session) {
    return session.name || `会话 ${session.id.slice(0, 8)}`;
}

const SessionSidebar = forwardRef(function SessionSidebar(
    { currentSessionId, onSelect, onNew }: SessionSidebarProps,
    ref
) {
    const router = useRouter();
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
            if (res.status === 401) router.push('/signin');
            const data = await res.json();
            if (Array.isArray(data.sessions)) {
                // 将历史对话信息渲染在侧边栏上
                setSessions(data.sessions);
            }
        } catch (e) {
            console.log('Error fetching sessions:', e)
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
        <aside className="w-64 bg-bg-component border-r border-border-secondary flex flex-col h-full z-20 relative hidden md:flex">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                    <Zap className="text-white w-4 h-4" />
                </div>
                <span className="font-bold text-lg tracking-tight text-text-main">chat-lemo<span className="text-primary text-xs align-top ml-1">AI</span></span>
            </div>

            <div className="px-4 mb-6">
                <button 
                    onClick={handleNew}
                    className="w-full py-3 px-4 rounded-lg bg-primary text-white font-medium shadow-sm hover:bg-primary-hover transition-all flex items-center justify-center gap-2 group"
                >
                    <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform" />
                    <span>新建对话</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-3">历史记录</div>
                <div>
                    {sessions.length === 0 ? (
                         <div className="p-4 text-center text-text-tertiary text-xs italic">
                            暂无历史会话
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer transition-colors relative mb-1 ${
                                    currentSessionId === session.id
                                        ? 'bg-primary-bg dark:bg-primary/20 text-primary font-medium'
                                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text-main'
                                }`}
                                onClick={() => onSelect(session.id)}
                            >
                                {currentSessionId === session.id && (
                                    <div className="w-1 h-5 bg-primary rounded-full absolute left-0.5" />
                                )}

                                {editingSessionId === session.id ? (
                                    <input
                                        type="text"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        onBlur={() => saveRename(session.id)}
                                        onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                                        className="flex-1 bg-bg-body text-text-main text-sm rounded px-2 py-1 outline-none border border-primary min-w-0"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="flex-1 truncate text-sm pl-2">{getSessionTitle(session)}</span>
                                )}

                                {editingSessionId !== session.id && (
                                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-bg-elevated shadow-sm rounded-md p-0.5 border border-border-secondary`}>
                                        <button
                                            onClick={(e) => handleRename(session.id, session.name, e)}
                                            className="p-1.5 text-text-tertiary hover:text-primary hover:bg-black/5 rounded transition-colors"
                                            title="重命名"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(session.id, e)}
                                            className="p-1.5 text-text-tertiary hover:text-error hover:bg-black/5 rounded transition-colors"
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

            <div className="p-4 border-t border-border-split">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-bg-elevated border border-border-secondary flex items-center justify-center text-text-tertiary">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-bg-component"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-main">Dev User</span>
                        <span className="text-xs text-primary">Premium Plan</span>
                    </div>
                </div>
            </div>
        </aside>
    );
});

export default SessionSidebar;
