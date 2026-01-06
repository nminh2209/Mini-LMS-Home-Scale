import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { GraduationCap, Loader2, Eye, EyeOff, User } from 'lucide-react'

export function Login() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        // "Cheat" to allow simple usernames: append a fake domain if no @ is present
        const emailToUse = username.includes('@') ? username : `${username}@lms.local`

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email: emailToUse,
                    password,
                })
                if (error) throw error
                setMessage({
                    type: 'success',
                    text: 'Account created! You can now sign in.'
                })
                // Switch to login mode for convenience
                setIsSignUp(false)
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: emailToUse,
                    password,
                })
                if (error) throw error
                // Login success - AuthContext will handle redirect
            }
        } catch (error: any) {
            console.error(error)
            setMessage({
                type: 'error',
                text: error.message || 'Authentication failed'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6 border border-gray-100">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-blue-50 rounded-full mb-2">
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isSignUp ? 'New Teacher' : 'Teacher Login'}
                    </h1>
                    <p className="text-gray-500">
                        {isSignUp ? 'Create a username to start' : 'Enter your credentials'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium text-gray-700 block">
                            Username
                        </label>
                        <div className="relative">
                            <input
                                id="username"
                                type="text"
                                placeholder="e.g. teacher1"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none pl-10"
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none pl-10 pr-10"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <span className="sr-only">Toggle password visibility</span>
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>{isSignUp ? 'Sign Up' : 'Sign In'}</>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {isSignUp ? 'Back to Login' : 'Create an account'}
                    </button>
                </div>
            </div>
        </div>
    )
}
