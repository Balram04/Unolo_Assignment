import { useState, useEffect } from 'react';
import api from '../utils/api';

function Dashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const endpoint = user.role === 'manager' ? '/dashboard/stats' : '/dashboard/employee';
            const response = await api.get(endpoint);
            
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            setError('Failed to load dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    // Manager Dashboard
    if (user.role === 'manager') {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Team Overview</h2>
                        <p className="text-gray-600 mt-1">Real-time field force monitoring</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Today's Date</p>
                        <p className="text-lg font-semibold text-gray-700">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Team Size</p>
                                <p className="text-4xl font-bold mt-2">{stats?.team_size || 0}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Active Now</p>
                                <p className="text-4xl font-bold mt-2">{stats?.active_checkins || 0}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Today's Visits</p>
                                <p className="text-4xl font-bold mt-2">{stats?.today_checkins?.length || 0}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Completion Rate</p>
                                <p className="text-4xl font-bold mt-2">
                                    {stats?.today_checkins?.length > 0 
                                        ? Math.round((stats.today_checkins.filter(c => c.status === 'checked_out').length / stats.today_checkins.length) * 100) 
                                        : 0}%
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Activity Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                        <h3 className="text-xl font-bold text-gray-800">Today's Field Activity</h3>
                        <p className="text-sm text-gray-600 mt-1">Real-time employee check-ins and locations</p>
                    </div>
                    <div className="overflow-x-auto">
                        {stats?.today_checkins?.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Client Location
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Check-in Time
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Distance
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {stats.today_checkins.map((checkin) => {
                                        const checkinTime = new Date(checkin.checkin_time);
                                        const checkoutTime = checkin.checkout_time ? new Date(checkin.checkout_time) : null;
                                        const duration = checkoutTime 
                                            ? ((checkoutTime - checkinTime) / (1000 * 60 * 60)).toFixed(1) + 'h'
                                            : ((new Date() - checkinTime) / (1000 * 60 * 60)).toFixed(1) + 'h';
                                        
                                        return (
                                            <tr key={checkin.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {checkin.employee_name?.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {checkin.employee_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{checkin.client_name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center mt-1">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Field Location
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {checkinTime.toLocaleTimeString('en-US', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {checkinTime.toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {checkin.distance_from_client !== null ? (
                                                        <div className="flex items-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                                checkin.distance_from_client > 0.5 
                                                                    ? 'bg-yellow-100 text-yellow-800' 
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {checkin.distance_from_client > 0.5 && (
                                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                                {checkin.distance_from_client.toFixed(2)} km
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">{duration}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                        checkin.status === 'checked_in' 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                    }`}>
                                                        {checkin.status === 'checked_in' && (
                                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                                        )}
                                                        {checkin.status === 'checked_in' ? 'Active' : 'Completed'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">No check-ins recorded today</p>
                                <p className="text-xs text-gray-400 mt-1">Check back later for team activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Employee Dashboard
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Assigned Clients</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats?.assigned_clients?.length || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">This Week's Visits</h3>
                    <p className="text-3xl font-bold text-green-600">{stats?.week_stats?.total_checkins || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Today's Check-ins</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats?.today_checkins?.length || 0}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold p-4 border-b">My Clients</h3>
                <div className="p-4">
                    {stats?.assigned_clients?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.assigned_clients.map((client) => (
                                <div key={client.id} className="border rounded-lg p-4">
                                    <h4 className="font-semibold">{client.name}</h4>
                                    <p className="text-sm text-gray-500">{client.address}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No clients assigned</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
