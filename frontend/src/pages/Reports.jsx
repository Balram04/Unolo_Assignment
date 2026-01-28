import { useState, useEffect } from 'react';
import api from '../utils/api';

function Reports({ user }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [reportData, setReportData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEmployees();
        fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            if (response.data.success) {
                setEmployees(response.data.data.team_members || []);
            }
        } catch (err) {
            console.error('Failed to fetch employees:', err);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `/reports/daily-summary?date=${selectedDate}`;
            if (selectedEmployee) {
                url += `&employee_id=${selectedEmployee}`;
            }

            const response = await api.get(url);
            
            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = (e) => {
        e.preventDefault();
        fetchReport();
    };

    if (loading && !reportData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Team Reports</h2>
                <p className="text-gray-600 mt-1">Daily activity and performance summary</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <form onSubmit={handleGenerateReport} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee (Optional)
                        </label>
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Employees</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {reportData && (
                <>
                    {/* Team Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                            <p className="text-blue-100 text-sm font-medium">Total Employees</p>
                            <p className="text-4xl font-bold mt-2">{reportData.team_summary.total_employees}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                            <p className="text-green-100 text-sm font-medium">Total Check-ins</p>
                            <p className="text-4xl font-bold mt-2">{reportData.team_summary.total_checkins}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                            <p className="text-purple-100 text-sm font-medium">Total Hours Worked</p>
                            <p className="text-4xl font-bold mt-2">{reportData.team_summary.total_working_hours}h</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
                            <p className="text-orange-100 text-sm font-medium">Clients Visited</p>
                            <p className="text-4xl font-bold mt-2">{reportData.team_summary.total_clients_visited}</p>
                        </div>
                    </div>

                    {/* Employee Breakdown */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Employee Performance</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Detailed breakdown for {new Date(selectedDate).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                        
                        {reportData.employee_breakdown.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {reportData.employee_breakdown.map((employee) => (
                                    <div key={employee.employee_id} className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {employee.employee_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">{employee.employee_name}</h4>
                                                    <p className="text-sm text-gray-500">{employee.employee_email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6 text-center">
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-600">{employee.total_checkins}</p>
                                                    <p className="text-xs text-gray-500">Check-ins</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-green-600">{employee.total_working_hours}h</p>
                                                    <p className="text-xs text-gray-500">Hours</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-purple-600">{employee.clients_visited}</p>
                                                    <p className="text-xs text-gray-500">Clients</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Individual Check-ins */}
                                        {employee.checkins.length > 0 && (
                                            <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                                <h5 className="text-sm font-semibold text-gray-700 mb-3">Check-in Details</h5>
                                                <div className="space-y-2">
                                                    {employee.checkins.map((checkin) => (
                                                        <div key={checkin.checkin_id} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{checkin.client_name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(checkin.checkin_time).toLocaleTimeString()} 
                                                                    {checkin.checkout_time && ` - ${new Date(checkin.checkout_time).toLocaleTimeString()}`}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {checkin.distance_from_client !== null && (
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                        checkin.distance_from_client > 0.5 
                                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                                            : 'bg-green-100 text-green-800'
                                                                    }`}>
                                                                        {checkin.distance_from_client.toFixed(2)} km
                                                                    </span>
                                                                )}
                                                                {checkin.hours !== null && (
                                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                                        {checkin.hours}h
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">No data available for selected date</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Reports;
