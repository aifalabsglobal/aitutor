'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, Search, UserPlus, Shield, Ban, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface User {
    id: string
    name: string
    email: string
    role: string
    status: string
    createdAt: string
}

export default function AdminUsersPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    useEffect(() => {
        if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
            fetchUsers()
        }
    }, [session])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users')
            const data = await response.json()
            setUsers(data)
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            fetchUsers()
        } catch (error) {
            console.error('Failed to update role:', error)
        }
    }

    const updateUserStatus = async (userId: string, newStatus: string) => {
        try {
            await fetch(`/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            fetchUsers()
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="max-w-md border-blue-100">
                        <CardContent className="p-8 text-center">
                            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-red-700 mb-2">Unauthorized</h2>
                            <p className="text-gray-600">Admin access required</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50"
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg"
                            >
                                <Users className="w-7 h-7 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">User Management</h1>
                                <p className="text-sm text-gray-600">Manage user roles and permissions</p>
                            </div>
                        </div>
                        <Link href="/admin">
                            <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                                Back to Admin
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 flex justify-between items-center"
                >
                    <div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                            User Management
                        </h2>
                        <p className="text-gray-600 text-lg">Manage all users and their permissions</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <Card className="border-blue-100 shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-blue-900">
                                    All Users ({users.length})
                                </CardTitle>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                    <Input
                                        placeholder="Search users..."
                                        className="pl-10 w-80 border-blue-200"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-blue-50">
                                                <TableCell className="font-medium text-blue-900">{user.name || 'N/A'}</TableCell>
                                                <TableCell className="text-gray-700">{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        user.role === 'ADMIN' ? 'bg-blue-600' :
                                                            user.role === 'TEACHER' ? 'bg-purple-600' : 'bg-gray-600'
                                                    }>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        user.status === 'ACTIVE' ? 'bg-green-600' : 'bg-red-600'
                                                    }>
                                                        {user.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedUser(user)}
                                                                className="border-blue-300 hover:bg-blue-50"
                                                            >
                                                                Manage
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="border-blue-100">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-blue-900">
                                                                    Manage User: {user.name}
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-700">Role</label>
                                                                    <Select
                                                                        value={user.role}
                                                                        onValueChange={(value) => updateUserRole(user.id, value)}
                                                                    >
                                                                        <SelectTrigger className="mt-2 border-blue-200">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="STUDENT">Student</SelectItem>
                                                                            <SelectItem value="TEACHER">Teacher</SelectItem>
                                                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                                                    <Select
                                                                        value={user.status}
                                                                        onValueChange={(value) => updateUserStatus(user.id, value)}
                                                                    >
                                                                        <SelectTrigger className="mt-2 border-blue-200">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                                                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
