Real-Time Location Tracking – Architecture Recommendation

Unolo Full Stack Intern – Research Assignment

Overview

Unolo’s Field Force Tracker needs real-time location tracking to replace manual check-ins. The system should continuously receive location updates from mobile field employees and show them live on a manager’s dashboard.

This document compares multiple real-time communication approaches and recommends a practical architecture based on scale, cost, battery usage, reliability, and team size.

1. Technology Comparison
1.1 WebSockets

How it works:
WebSockets create a persistent, bidirectional connection between client and server. Once connected, both sides can send messages anytime without repeated HTTP requests.

Pros:

Very low latency

Efficient for frequent updates

Supports bidirectional communication

Works well for dashboards and live systems

Cons:

Requires managing long-lived connections

Slightly more complex to scale (needs Redis or sticky sessions)

Can disconnect on unstable mobile networks

When to use:
Chat apps, live dashboards, real-time tracking, collaborative tools.

1.2 Server-Sent Events (SSE)

How it works:
SSE keeps an HTTP connection open so the server can continuously push updates to the client. Communication is one-way (server → client).

Pros:

Simple to implement

Works over normal HTTP/HTTPS

Automatic reconnection supported by browsers

Less overhead than WebSockets for read-only updates

Cons:

Client cannot send data back

Limited browser connection count

Not suitable for mobile apps sending frequent data

When to use:
Live feeds, notifications, dashboards that only consume data.

1.3 Long Polling

How it works:
The client sends a request, the server waits until data is available, responds, and the client immediately sends another request.

Pros:

Works everywhere

Very simple setup

No special infrastructure

Cons:

Higher latency

Inefficient at scale

Wastes server and battery resources

When to use:
Fallback option or low-frequency updates.

1.4 Third-Party Services (Firebase, Pusher, Ably)

How it works:
A managed service handles real-time connections and scaling. Your backend publishes updates to their API.

Pros:

Fast to implement

No infrastructure management

SDKs for web and mobile

Cons:

Expensive at scale

Vendor lock-in

Less control over data flow

When to use:
Early MVPs, demos, or teams without backend expertise.

2. Recommended Approach
WebSockets (Primary) with HTTP/SSE Fallback

For Unolo’s use case, I recommend using WebSockets (via Socket.IO) as the primary transport, with HTTP or SSE fallback where WebSockets fail.

Why this works for Unolo:

Supports 10,000+ employees sending updates every 30 seconds

Keeps battery usage low with a single persistent connection

Handles flaky mobile networks with auto-reconnection

Much cheaper than third-party services at scale

Reasonable development effort for a small team

WebSockets are ideal for employees sending data and managers receiving live updates. Socket.IO also provides fallbacks like long polling, which improves reliability on unstable networks.

3. Trade-offs
What we sacrifice:

Development time: ~2–3 weeks instead of a few days with Firebase/Pusher

Operational complexity: Need to monitor servers and Redis

Some advanced features: Presence and replay need custom logic

When I would reconsider:

If Unolo needs to launch extremely fast (investor demo)

If the company expands globally very quickly

If the team has no backend or DevOps support

Where this breaks:

Around 100K+ concurrent employees

Redis Pub/Sub may become a bottleneck

PostgreSQL storage can grow too fast

At that point, Kafka and a time-series database would be needed. For now, this is overkill.

4. High-Level Implementation
Backend

Node.js + Express

Socket.IO for real-time communication

Redis for scaling WebSocket connections

PostgreSQL for storing location history

REST APIs for historical data

Mobile App

Background location tracking (Android/iOS)

Send updates every 30 seconds or on movement

Queue updates when offline and sync on reconnect

Manager Dashboard

WebSocket connection for live updates

Map UI (Google Maps / Leaflet)

Initial fetch of last known locations

Infrastructure

2–3 Node.js servers

Managed Redis

Managed PostgreSQL

NGINX load balancer

Estimated cost: ~$80–100/month

Conclusion

WebSockets with a fallback mechanism offer the best balance between performance, cost, reliability, and scalability for Unolo’s real-time location tracking. While third-party tools are faster to start, a self-hosted WebSocket solution gives long-term cost savings and full control, making it a strong choice for a growing startup.

References

https://socket.io/docs/v4/performance-tuning/

https://www.ably.com/blog/websockets-vs-sse

https://developer.android.com/guide/topics/location


