const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireManager } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/daily-summary
// Daily summary report for managers
router.get('/daily-summary', authenticateToken, requireManager, async (req, res) => {
    try {
        const { date, employee_id } = req.query;

        // Validate required date parameter
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required (format: YYYY-MM-DD)'
            });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        // Validate that the date is a valid date
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date value'
            });
        }

        // Build WHERE clause based on filters
        let whereClause = 'u.manager_id = ?';
        const queryParams = [req.user.id];

        if (employee_id) {
            whereClause += ' AND u.id = ?';
            queryParams.push(employee_id);
        }

        // Efficient single query to get all data (avoid N+1 queries)
        const [checkins] = await pool.execute(
            `SELECT 
                u.id as employee_id,
                u.name as employee_name,
                u.email as employee_email,
                ch.id as checkin_id,
                ch.checkin_time,
                ch.checkout_time,
                ch.distance_from_client,
                ch.notes,
                c.id as client_id,
                c.name as client_name
             FROM users u
             LEFT JOIN checkins ch ON u.id = ch.employee_id AND date(ch.checkin_time) = ?
             LEFT JOIN clients c ON ch.client_id = c.id
             WHERE ${whereClause}
             ORDER BY u.name, ch.checkin_time`,
            [date, ...queryParams]
        );

        // Process data to create per-employee breakdown
        const employeeMap = new Map();
        const teamStats = {
            total_employees: 0,
            total_checkins: 0,
            total_working_hours: 0,
            total_clients_visited: 0
        };

        checkins.forEach(row => {
            // Initialize employee entry if not exists
            if (!employeeMap.has(row.employee_id)) {
                employeeMap.set(row.employee_id, {
                    employee_id: row.employee_id,
                    employee_name: row.employee_name,
                    employee_email: row.employee_email,
                    checkins: [],
                    total_checkins: 0,
                    total_working_hours: 0,
                    clients_visited: new Set()
                });
                teamStats.total_employees++;
            }

            const employee = employeeMap.get(row.employee_id);

            // Add checkin data if exists (LEFT JOIN may return null for employees with no checkins)
            if (row.checkin_id) {
                const checkinTime = new Date(row.checkin_time);
                const checkoutTime = row.checkout_time ? new Date(row.checkout_time) : null;
                
                // Calculate working hours for completed checkins
                let hours = 0;
                if (checkoutTime) {
                    hours = (checkoutTime - checkinTime) / (1000 * 60 * 60);
                }

                employee.checkins.push({
                    checkin_id: row.checkin_id,
                    client_name: row.client_name,
                    checkin_time: row.checkin_time,
                    checkout_time: row.checkout_time,
                    hours: checkoutTime ? parseFloat(hours.toFixed(2)) : null,
                    distance_from_client: row.distance_from_client,
                    notes: row.notes
                });

                employee.total_checkins++;
                employee.total_working_hours += hours;
                employee.clients_visited.add(row.client_id);

                teamStats.total_checkins++;
                teamStats.total_working_hours += hours;
            }
        });

        // Convert Map to array and finalize employee data
        const employeeBreakdown = Array.from(employeeMap.values()).map(emp => {
            const clientsVisitedCount = emp.clients_visited.size;
            teamStats.total_clients_visited += clientsVisitedCount;
            
            return {
                employee_id: emp.employee_id,
                employee_name: emp.employee_name,
                employee_email: emp.employee_email,
                total_checkins: emp.total_checkins,
                total_working_hours: parseFloat(emp.total_working_hours.toFixed(2)),
                clients_visited: clientsVisitedCount,
                checkins: emp.checkins
            };
        });

        // Round team stats
        teamStats.total_working_hours = parseFloat(teamStats.total_working_hours.toFixed(2));

        // Handle case when no data exists for the date
        if (employeeBreakdown.every(emp => emp.total_checkins === 0)) {
            return res.json({
                success: true,
                message: 'No check-in data found for the specified date',
                data: {
                    date: date,
                    employee_id_filter: employee_id || null,
                    team_summary: teamStats,
                    employee_breakdown: employeeBreakdown
                }
            });
        }

        res.json({
            success: true,
            data: {
                date: date,
                employee_id_filter: employee_id || null,
                team_summary: teamStats,
                employee_breakdown: employeeBreakdown
            }
        });

    } catch (error) {
        console.error('Daily summary report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate daily summary report'
        });
    }
});

module.exports = router;
