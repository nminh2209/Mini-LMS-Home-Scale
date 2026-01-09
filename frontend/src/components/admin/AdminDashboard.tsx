import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Profile } from "../../types/database";
import { Loader2, Shield, User, GraduationCap, Search } from "lucide-react";

export function AdminDashboard() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'teacher' | 'student') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            // Update local state
            setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role. You might not have permission.");
        }
    };

    const filteredProfiles = profiles.filter(p =>
        (p.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (p.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        p.role.includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-8 h-8 text-indigo-600" />
                    Quản Trị Hệ Thống
                </h1>
                <p className="text-gray-500">Quản lý người dùng, phân quyền và trạng thái hệ thống.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h2 className="font-bold text-lg text-gray-800">Danh Sách Người Dùng ({profiles.length})</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Người dùng</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Vai trò</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProfiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                                            ${profile.role === 'admin' ? 'bg-indigo-600' : profile.role === 'teacher' ? 'bg-blue-600' : 'bg-green-500'}
                                        `}>
                                                    {profile.full_name ? profile.full_name[0].toUpperCase() : <User className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{profile.full_name || "Chưa đặt tên"}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{profile.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {profile.email || "Không có email"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={profile.role}
                                                onChange={(e) => handleRoleChange(profile.id, e.target.value as any)}
                                                className={`
                                            px-3 py-1 rounded-full text-xs font-bold border-0 focus:ring-2 cursor-pointer
                                            ${profile.role === 'admin' ? 'bg-indigo-100 text-indigo-700 focus:ring-indigo-500' :
                                                        profile.role === 'teacher' ? 'bg-blue-100 text-blue-700 focus:ring-blue-500' :
                                                            'bg-green-100 text-green-700 focus:ring-green-500'}
                                        `}
                                            >
                                                <option value="student">Học viên</option>
                                                <option value="teacher">Giáo viên</option>
                                                <option value="admin">Quản trị viên</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                Hoạt động
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
