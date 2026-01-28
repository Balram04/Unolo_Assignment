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