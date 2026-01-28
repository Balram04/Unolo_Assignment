## Bug #1: Login password comparison not awaited

**Location:** `backend/routes/auth.js` - Line 27  
**Severity:** Critical

**What was wrong:**
```javascript
const isValidPassword = bcrypt.compare(password, user.password);
```
The `bcrypt.compare()` function returns a Promise, but it wasn't being awaited. This means `isValidPassword` was always a Promise object (truthy), causing the password check to always pass.

**How I fixed it:**
```javascript
const isValidPassword = await bcrypt.compare(password, user.password);
```
Added `await` keyword to properly wait for the password comparison result.

**Why this is correct:**
bcrypt.compare() must be awaited to get a true/false value.
Without await, the condition always succeeds because a Promise is considered truthy, which breaks authentication security.

## Bug #2: JWT token contains sensitive data (password)
**Location:** `backend/routes/auth.js` - Line 33  
**Severity:** Critical (Security Issue)

**What was wrong:**
```javascript
const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, password: user.password },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
);
```
The JWT payload included the user's hashed password, which is a security vulnerability. JWTs are not encrypted, only base64 encoded, so anyone can decode and read the password hash.

**How I fixed it:**
```javascript
const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
);
```
Removed `password` from the JWT payload.

**Why this is correct:**
JWTs should contain only the minimum information needed to identify and authorize a user.
Even though the password is hashed, exposing it increases security risk because leaked tokens can be abused for offline attacks.
Sensitive data like passwords should never be included in JWTs Hackers can guess it .

---

## Bug #3: Check-in returns wrong HTTP status code on validation error
**Location:** `backend/routes/checkin.js` - Line 29  
**Severity:** Medium

**What was wrong:**
```javascript
if (!client_id) {
    return res.status(200).json({ success: false, message: 'Client ID is required' });
}
```
Returns HTTP 200 (OK) for a validation error, which is semantically incorrect.

**How I fixed it:**
```javascript
if (!client_id) {
    return res.status(400).json({ success: false, message: 'Client ID is required' });
}
```
Changed status code to 400 (Bad Request).

**Why this is correct:**
HTTP 400 is the correct status code for client-side validation errors. HTTP 200 should only be used for successful requests.

## Bug #4: SQL column names mismatch in check-in INSERT
**Location:** `backend/routes/checkin.js` - Line 56  
**Severity:** High

**What was wrong:**
```javascript
await pool.execute(
    `INSERT INTO checkins (employee_id, client_id, lat, lng, notes, status)
     VALUES (?, ?, ?, ?, ?, 'checked_in')`,
    [req.user.id, client_id, latitude, longitude, notes || null]
);
```
The SQL uses column names `lat` and `lng`, but the database schema defines them as `latitude` and `longitude`.

**How I fixed it:**
```javascript
await pool.execute(
    `INSERT INTO checkins (employee_id, client_id, latitude, longitude, notes, status)
     VALUES (?, ?, ?, ?, ?, 'checked_in')`,
    [req.user.id, client_id, latitude, longitude, notes || null]
);
```
Changed column names from `lat, lng` to `latitude, longitude` to match the schema.

**Why this is correct:**
Column names in SQL queries must match the actual database schema. The database table `checkins` has columns named `latitude` and `longitude`, not `lat` and `lng`.

---

## Bug #5: SQL injection vulnerability in history endpoint
**Location:** `backend/routes/checkin.js` - Lines 113-119  
**Severity:** Critical (Security Issue)

**What was wrong:**
```javascript
if (start_date) {
    query += ` AND DATE(ch.checkin_time) >= '${start_date}'`;
}
if (end_date) {
    query += ` AND DATE(ch.checkin_time) <= '${end_date}'`;
}
```
User input (`start_date` and `end_date`) is concatenated directly into the SQL query, creating a SQL injection vulnerability.

**How I fixed it:**
```javascript
if (start_date) {
    query += ` AND DATE(ch.checkin_time) >= ?`;
    params.push(start_date);
}
if (end_date) {
    query += ` AND DATE(ch.checkin_time) <= ?`;
    params.push(end_date);
}
```
Used parameterized queries with placeholders (?) and added values to params array.

**Why this is correct:**
Parameterized queries prevent SQL injection attacks by ensuring user input is properly escaped. Never concatenate user input directly into SQL strings.

---

## Bug #6: SQLite syntax error - Double quotes for string literals
**Location:** `backend/routes/checkin.js` - Line 45  
**Severity:** High

**What was wrong:**
```javascript
'SELECT * FROM checkins WHERE employee_id = ? AND status = "checked_in"'
```
Used double quotes for string literal "checked_in". In SQLite, double quotes denote column/table identifiers, causing error: "no such column: checked_in".

**How I fixed it:**
```javascript
'SELECT * FROM checkins WHERE employee_id = ? AND status = \'checked_in\''
```
Changed double quotes to single quotes (escaped with backslash).

**Why this is correct:**
SQLite interprets double quotes as identifiers (column names), single quotes as string literals. Using wrong quotes causes runtime error.

---
## Bug #8: Dashboard using hardcoded user ID instead of role
**Location:** `frontend/src/pages/Dashboard.jsx` - Line 15  
**Severity:** Medium

**What was wrong:**
```javascript
const endpoint = user.id === 1 ? '/dashboard/stats' : '/dashboard/employee';
```
Hardcoded check for user.id === 1 to determine if manager. Breaks if manager has different ID.

**How I fixed it:**
```javascript
const endpoint = user.role === 'manager' ? '/dashboard/stats' : '/dashboard/employee';
```
Changed to check user.role instead of ID.

**Why this is correct:**
Role-based checks are more flexible and maintainable. User IDs can change; roles represent actual permissions.

---

## Bug #10: Missing form preventDefault in CheckIn
**Location:** `frontend/src/pages/CheckIn.jsx` - Line 59  
**Severity:** Medium

**What was wrong:**
```javascript
const handleCheckIn = async (e) => {
    setError('');
    setSuccess('');
```
Form submit handler missing `e.preventDefault()`, causing page reload on submission.

**How I fixed it:**
```javascript
const handleCheckIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
```
Added `e.preventDefault()` at the start of the handler.

**Why this is correct:**
Prevents default form submission behavior that causes full page reload, allowing React to handle submission via AJAX.

---
## Bug #11: History page crashes on load - null state error
**Location:** `frontend/src/pages/History.jsx` - Lines 5, 43  
**Severity:** Critical

**What was wrong:**
```javascript
const [checkins, setCheckins] = useState(null);
// ...later...
const totalHours = checkins.reduce((total, checkin) => {
```
Initial state set to `null` instead of empty array. Calling `.reduce()` on `null` causes crash on component mount.

**How I fixed it:**
```javascript
const [checkins, setCheckins] = useState([]);
// ...later...
const totalHours = checkins?.reduce((total, checkin) => {
    // ...
}, 0) || 0;
```
Changed initial state to empty array and added optional chaining with fallback value.

**Why this is correct:**
Array methods like `reduce()` cannot be called on `null`. Initial state should match expected data type (array). Optional chaining prevents crashes if data is unexpectedly null.

---