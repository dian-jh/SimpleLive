import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, Edit3, Home, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { useProfileLists } from '@/features/User/hooks/useProfileLists'
import { useUserProfile } from '@/features/User/hooks/useUserProfile'
import { FollowCard, HistoryCard } from '@/features/User/components/ProfileCards'
import { updateMyProfileApi, type UserProfileDto } from '@/api/User/profileApi'

type MenuType = 'info' | 'history'
type ListTabType = 'follows' | 'history'

const GENDER_MAP: Record<number, string> = { 0: '保密', 1: '男', 2: '女' }

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))

// 💡 教学点：将极其复杂的编辑表单抽离为独立组件，防止其庞大的 state 污染主页面，实现“高内聚低耦合”。
// ---------------- 编辑表单子组件 ----------------
const EditProfileForm = ({ profile, onCancel, onSuccess }: { profile: UserProfileDto, onCancel: () => void, onSuccess: () => void }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 1. 初始化数据拆解
    // 生日：YYYY-MM-DD -> [YYYY, MM, DD]
    const defaultDate = profile.dateOfBirth ? profile.dateOfBirth.split('-') : ['2000', '01', '01']

    const [form, setForm] = useState({
        nickName: profile.nickName,
        signature: profile.signature || '',
        gender: profile.gender,
        year: defaultDate[0],
        month: defaultDate[1],
        day: defaultDate[2],
        location: profile.location || '', // 💡 现在的所在地是直接的字符串
    })

    // 2. 提交逻辑
    const handleSubmit = async () => {
        if (!form.nickName.trim()) return alert('昵称不能为空')

        setIsSubmitting(true)
        try {
            // 💡 教学点：我们将前端分散的 UI 状态重新聚合为后端需要的 DTO 格式
            await updateMyProfileApi({
                nickName: form.nickName.trim(),
                signature: form.signature.trim() || null,
                gender: form.gender,
                dateOfBirth: `${form.year}-${form.month}-${form.day}`, // 组装为 C# DateOnly 字符串
                location: form.location.trim() || null, // 💡 直接发送用户填写的地址字符串
            })
            alert('保存成功！')
            onSuccess()
        } catch (error: any) {
            alert('保存失败：' + (error.message || '未知错误'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-[540px]"
        >
            {/* 顶部标题栏 */}
            <button onClick={onCancel} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 mb-8 transition-colors text-[14px] font-medium group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[18px] font-bold text-slate-900 ml-1">编辑资料</span>
            </button>

            <div className="space-y-6">
                {/* 昵称 */}
                <div className="flex items-center gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 text-right">昵称</label>
                    <input
                        type="text"
                        value={form.nickName}
                        onChange={e => setForm(f => ({ ...f, nickName: e.target.value }))}
                        placeholder="起个好听的名字吧"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-50 outline-none transition-all"
                    />
                </div>

                {/* 个性签名 */}
                <div className="flex items-start gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 pt-3 text-right">个性签名</label>
                    <textarea
                        rows={3}
                        value={form.signature}
                        onChange={e => setForm(f => ({ ...f, signature: e.target.value }))}
                        placeholder="写点什么介绍一下自己..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-50 outline-none transition-all resize-none"
                    />
                </div>

                {/* 性别 */}
                <div className="flex items-center gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 text-right">性别</label>
                    <div className="flex items-center gap-6 flex-1 py-2">
                        {[1, 2, 0].map(val => (
                            <label key={val} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    checked={form.gender === val}
                                    onChange={() => setForm(f => ({ ...f, gender: val }))}
                                    className="accent-slate-900 w-4 h-4 cursor-pointer"
                                />
                                <span className="text-[14px] text-slate-700 group-hover:text-slate-900">
                                    {val === 1 ? '男' : val === 2 ? '女' : '保密'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 生日：保持下拉框形式，严格控制数据输入 */}
                <div className="flex items-center gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 text-right">生日</label>
                    <div className="flex items-center gap-2 flex-1">
                        <select
                            value={form.year}
                            onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] outline-none cursor-pointer hover:border-slate-300 transition-colors"
                        >
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <span className="text-[14px] text-slate-500">年</span>

                        <select
                            value={form.month}
                            onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] outline-none cursor-pointer hover:border-slate-300 transition-colors"
                        >
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <span className="text-[14px] text-slate-500">月</span>

                        <select
                            value={form.day}
                            onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] outline-none cursor-pointer hover:border-slate-300 transition-colors"
                        >
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <span className="text-[14px] text-slate-500">日</span>
                    </div>
                </div>

                {/* 所在地：💡 按照要求，修改为单一行文本框 */}
                <div className="flex items-center gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 text-right">所在地</label>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={form.location}
                            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                            placeholder="例如：陕西 西安"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-50 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* 保存按钮 */}
                <div className="flex pl-[88px] pt-6">
                    <button
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-10 py-3 bg-slate-900 text-white rounded-xl text-[14px] font-semibold hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        保存
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// ---------------- 主页面 ----------------
const ProfilePage = () => {
    const [activeMenu, setActiveMenu] = useState<MenuType>('info')
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState<ListTabType>('follows')

    const { profile, isLoading: isProfileLoading, refresh: refreshProfile } = useUserProfile()
    const { isLoading: isListLoading, follows, histories, error: listError } = useProfileLists(activeTab)

    const groupedHistory = useMemo(() => {
        // 按天分组逻辑保持不变...
        const groups: Record<string, typeof histories> = {}
        histories.forEach((h) => {
            const d = new Date(h.lastWatchTime)
            const dateKey = `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
            if (!groups[dateKey]) groups[dateKey] = []
            groups[dateKey].push(h)
        })
        return Object.entries(groups).map(([date, items]) => ({ date, items }))
    }, [histories])

    return (
        <div className="min-h-screen bg-[#FDFDFE]">
            <Navbar />
            <div className="flex justify-center pt-24 pb-12 px-6">
                <div className="w-full max-w-[1200px] flex gap-8">

                    {/* 左侧侧边栏保持不变... */}
                    <div className="w-[200px] shrink-0 flex flex-col gap-6">
                        <div className="px-4"><h1 className="text-[18px] font-bold text-slate-900 tracking-tight">个人中心</h1></div>
                        <nav className="flex flex-col gap-1 relative">
                            <motion.div className="absolute left-0 w-1 bg-slate-900 rounded-r-full transition-all duration-300" initial={false} animate={{ top: activeMenu === 'info' ? '4px' : '56px', height: '40px' }} />
                            <button onClick={() => { setActiveMenu('info'); setIsEditing(false) }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 ${activeMenu === 'info' ? 'text-slate-900 bg-slate-50/80' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'}`}>我的信息</button>
                            <button onClick={() => setActiveMenu('history')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 ${activeMenu === 'history' ? 'text-slate-900 bg-slate-50/80' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'}`}>关注与历史</button>
                        </nav>
                        <div className="mt-auto px-4 pb-4"><Link to="/" className="flex items-center gap-2 text-[13px] text-slate-400 hover:text-slate-900"><Home className="w-4 h-4" /> 返回首页</Link></div>
                    </div>

                    <div className="flex-1 bg-white border border-slate-100/60 shadow-[0_4px_30px_rgb(0,0,0,0.02)] rounded-[32px] p-10 min-h-[600px] relative overflow-hidden">
                        {isProfileLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {/* 1. 个人信息查看视角 */}
                                {activeMenu === 'info' && !isEditing && profile && (
                                    <motion.div key="info-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="max-w-[800px]">
                                        <div className="flex items-center gap-6 mb-12">
                                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
                                                <img src={profile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="avatar" className="w-full h-full object-cover bg-slate-50" />
                                            </div>
                                            <h2 className="text-[26px] font-bold text-slate-900">{profile.nickName}</h2>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4 mb-6">
                                                <h3 className="text-[14px] font-semibold text-slate-900 shrink-0">基础信息</h3>
                                                <div className="flex-1 h-px bg-slate-100/80" />
                                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors shrink-0"><Edit3 className="w-3.5 h-3.5" /> 编辑资料</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-6 gap-x-12 px-2">
                                                <div className="text-[14px]"><span className="text-slate-500 mr-4">年龄:</span> <span className="text-slate-900 font-medium">{profile.age !== null ? `${profile.age} 岁` : '未知'}</span></div>
                                                <div className="text-[14px]"><span className="text-slate-500 mr-4">性别:</span> <span className="text-slate-900 font-medium">{GENDER_MAP[profile.gender] ?? '保密'}</span></div>
                                                <div className="text-[14px]"><span className="text-slate-500 mr-4">所在地:</span> <span className="text-slate-900 font-medium">{profile.location || '未设置'}</span></div>
                                                <div className="text-[14px]"><span className="text-slate-500 mr-4">个性签名:</span> <span className="text-slate-900 font-medium">{profile.signature || '这个人很懒，什么都没写。'}</span></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 2. 引入独立拆分出的个人信息编辑表单 */}
                                {activeMenu === 'info' && isEditing && profile && (
                                    <EditProfileForm
                                        key="info-edit"
                                        profile={profile}
                                        onCancel={() => setIsEditing(false)}
                                        onSuccess={() => { refreshProfile(); setIsEditing(false); }}
                                    />
                                )}

                                {/* 3. 关注与历史视角 (保持不变...) */}
                                {activeMenu === 'history' && profile && (
                                    <motion.div key="history-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">
                                        <div className="flex items-baseline gap-4 mb-8">
                                            <h2 className="text-[24px] font-bold text-slate-900">关注与观看历史</h2>
                                            <span className="text-[13px] text-slate-500">
                                                关注了 {profile.followingCount ?? 0} 个主播
                                            </span>
                                        </div>
                                        {/* 省略中间相似部分，避免代码过长，与上次一致即可 */}
                                        <div className="flex gap-8 border-b border-slate-100 mb-8 relative">
                                            <button onClick={() => setActiveTab('follows')} className={`pb-3 text-[15px] font-medium transition-colors ${activeTab === 'follows' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>关注</button>
                                            <button onClick={() => setActiveTab('history')} className={`pb-3 text-[15px] font-medium transition-colors ${activeTab === 'history' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>观看历史</button>
                                            <motion.div
                                                className="absolute bottom-0 h-[2px] bg-slate-900 rounded-t-full"
                                                initial={false}
                                                animate={{ left: activeTab === 'follows' ? '0px' : '64px', width: activeTab === 'follows' ? '32px' : '64px' }}
                                            />
                                        </div>
                                        {isListLoading ? <Loader2 className="animate-spin text-slate-400 mx-auto mt-10" /> : (
                                            <>
                                                {activeTab === 'follows' && <div className="grid grid-cols-2 gap-5">{follows.map(u => <FollowCard key={u.hostId} user={u} />)}</div>}
                                                {activeTab === 'history' && <div>{groupedHistory.map(g => <div key={g.date} className="mb-10"><div className="font-medium text-slate-600 mb-4">{g.date}</div><div className="grid grid-cols-2 gap-5">{g.items.map(h => <HistoryCard key={h.roomNumber} history={h} />)}</div></div>)}</div>}
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage