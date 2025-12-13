# Online/Offline Status Feature - Backend Requirements

## 🐛 Issue
Users are showing as "Offline" in the chat even when they are:
- Currently logged in
- Typing messages
- Online and active

The frontend is correctly set up to receive and display online status, but the backend needs to properly track and broadcast user online/offline status.

---

## ✅ What Frontend Expects

### 1. REST API Endpoint
**Endpoint:** `GET /api/chat/online-status`  
**Auth:** Required (Bearer token)

**Expected Response:**
```json
{
  "status": true,
  "data": {
    "onlineStatus": {
      "1": true,   // userId: isOnline (boolean)
      "2": false,
      "3": true
    }
  }
}
```

**Requirements:**
- Only return status for users who have existing chats with the current user
- Keys should be user IDs (numbers)
- Values should be booleans (true = online, false = offline)

---

### 2. WebSocket Events

**Event Name:** `userOnlineStatusChanged`

**When to Emit:**
- When User A connects → Emit to ALL of User A's chat partners
- When User A disconnects (all devices closed) → Emit to ALL of User A's chat partners

**Event Payload:**
```json
{
  "userId": 123,
  "isOnline": true,
  "timestamp": "2024-01-01T00:00:00.000Z"  // optional
}
```

**Example Flow:**
1. User A (ID: 1) logs in and connects to WebSocket
2. User A has chats with User B (ID: 2) and User C (ID: 3)
3. Backend should emit to User B and User C:
   ```javascript
   socket.to(userB_socketId).emit('userOnlineStatusChanged', {
     userId: 1,
     isOnline: true
   });
   socket.to(userC_socketId).emit('userOnlineStatusChanged', {
     userId: 1,
     isOnline: true
   });
   ```

---

## 🔧 Backend Implementation Checklist

### WebSocket Gateway (`chat.gateway.ts` or similar)

- [ ] **Track user connections**
  - When user connects → Store their socket ID and mark as online
  - When user disconnects → Check if they have other active connections
  - If no other connections → Mark as offline

- [ ] **Get chat partners**
  - Implement method to get all users who have chats with a given user
  - Query should return user IDs of chat partners

- [ ] **Emit status changes**
  - On connect → Emit `userOnlineStatusChanged` to all chat partners
  - On disconnect (last device) → Emit `userOnlineStatusChanged` to all chat partners

- [ ] **Support multiple devices**
  - User should be "online" if ANY device is connected
  - User should be "offline" only when ALL devices disconnect

### REST API Controller (`chat.controller.ts` or similar)

- [ ] **Implement `/chat/online-status` endpoint**
  - Get current user's chat partners
  - Check online status for each partner
  - Return in expected format: `{ status: true, data: { onlineStatus: {...} } }`

---

## 🧪 Testing Checklist

1. **User A logs in**
   - [ ] User A's chat partners see User A as "Online"
   - [ ] `GET /chat/online-status` returns User A as online

2. **User A opens multiple tabs**
   - [ ] User A stays "Online" (multiple connections)
   - [ ] Closing one tab doesn't mark as offline

3. **User A closes all tabs/logs out**
   - [ ] User A's chat partners see User A as "Offline"
   - [ ] `GET /chat/online-status` returns User A as offline

4. **User A types a message**
   - [ ] Status remains "Online" (typing doesn't affect status)

5. **Multiple users scenario**
   - [ ] User A, B, C all online
   - [ ] Each can see others' online status correctly

---

## 📝 Code Example (Reference)

### WebSocket Gateway (NestJS example)
```typescript
@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway {
  private userSockets = new Map<number, Set<string>>(); // userId -> Set of socketIds

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromToken(client);
    if (!userId) return;

    // Track this connection
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    // If this is first connection, notify chat partners
    if (this.userSockets.get(userId)!.size === 1) {
      this.notifyChatPartners(userId, true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromToken(client);
    if (!userId) return;

    // Remove this connection
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      
      // If no more connections, mark as offline
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
        this.notifyChatPartners(userId, false);
      }
    }
  }

  private async notifyChatPartners(userId: number, isOnline: boolean) {
    const chatPartners = await this.getChatPartners(userId);
    
    chatPartners.forEach(partnerId => {
      const partnerSockets = this.userSockets.get(partnerId);
      if (partnerSockets) {
        partnerSockets.forEach(socketId => {
          this.server.to(socketId).emit('userOnlineStatusChanged', {
            userId,
            isOnline,
            timestamp: new Date().toISOString()
          });
        });
      }
    });
  }

  private async getChatPartners(userId: number): Promise<number[]> {
    // Query database to get all users who have chats with userId
    // Return array of user IDs
  }
}
```

### REST Controller (NestJS example)
```typescript
@Get('online-status')
async getOnlineStatus(@Request() req) {
  const currentUserId = req.user.id;
  const chatPartners = await this.getChatPartners(currentUserId);
  
  const onlineStatus: Record<number, boolean> = {};
  
  for (const partnerId of chatPartners) {
    // Check if partner has any active socket connections
    onlineStatus[partnerId] = this.chatGateway.isUserOnline(partnerId);
  }
  
  return {
    status: true,
    data: { onlineStatus }
  };
}
```

---

## ❓ Questions for Backend Team

1. **Is the WebSocket gateway currently tracking user connections?**
   - If yes, how is it implemented?
   - If no, can it be added?

2. **Is there a method to get chat partners for a user?**
   - If yes, what's the query/function?
   - If no, can it be added?

3. **Are WebSocket events being emitted on connect/disconnect?**
   - If yes, what events are currently emitted?
   - If no, can `userOnlineStatusChanged` be added?

4. **Does the `/chat/online-status` endpoint exist?**
   - If yes, what format does it return?
   - If no, can it be implemented?

5. **How are multiple device connections handled?**
   - Is there a way to track multiple socket connections per user?

---

## 🚀 Priority

**High** - This is a core chat feature that users expect to work. Currently, all users appear offline even when they're actively using the app.

---

## 📞 Frontend Contact

If you need clarification on the expected format or have questions about the frontend implementation, please reach out.

Frontend is ready and waiting for backend to provide:
1. ✅ WebSocket events (`userOnlineStatusChanged`)
2. ✅ REST API endpoint (`GET /chat/online-status`)

