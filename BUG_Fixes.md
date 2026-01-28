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