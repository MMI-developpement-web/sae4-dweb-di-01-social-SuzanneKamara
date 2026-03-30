# Analyse du Système de Login et Blocage

## 🔍 Flux Actuel du Login

### 1. **Backend - SecurityController.php** ✅

```php
POST /api/login_check
```

**Logique:**

1. Reçoit username + password
2. Symfony authentifie l'utilisateur via le système de sécurité
3. Si authentification réussie, `#[CurrentUser] ?User $user` reçoit l'utilisateur
4. **VÉRIFICATION DE BLOCAGE** ✅
   ```php
   if ($user->isBlocked()) {
       return $this->json(
           ['error' => 'Votre compte a été bloqué pour non respect des conditions d\'utilisation.'],
           403  // Status HTTP 403 Forbidden
       );
   }
   ```
5. Si pas bloqué:
   - Génère un JWT token via `ApiTokenManager::generateTokenForUser()`
   - Retourne 200 OK avec:
   ```json
   {
     "token": "eyJhbGc...",
     "user": {
       "id": 1,
       "username": "john",
       "email": "john@example.com",
       "is_blocked": false
     }
   }
   ```

### 2. **Frontend - AuthContext.tsx**

```javascript
POST / api / login_check;
```

**Logique:**

```javascript
const login = async ({ identifier, password }: LoginPayload) => {
  const response = await fetch(LOGIN_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: identifier,
      username: identifier,
      password,
    }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const backendMessage = extractErrorMessage(payload).toLowerCase()

    // PROBLÈME 1: Ne détecte pas "bloqué"
    if (backendMessage.includes('confirmer votre email') || backendMessage.includes('email')) {
      throw new Error('Vous n\'avez pas valide votre email...')
    }

    // PROBLÈME 2: Message générique
    throw new Error('Identifiants invalides.')
  }

  // Récupère le token
  const extractedToken = extractToken(responseData)

  // Sauvegarde le token dans le cookie
  setSessionCookie(TOKEN_COOKIE_KEY, extractedToken)
  setToken(extractedToken)

  // Fetch current user data
  const userResponse = await apiFetchJson<{ id: number }>(buildApiUrl('/users/me'))
  setUserId(userResponse.id)
  localStorage.setItem('userId', String(userResponse.id))
}
```

---

## 🐛 Problèmes Identifiés

### **Problème 1: MESSAGE DE BLOCAGE NON GÉRÉ** 🔴

**Situation:**

- Backend retourne 403 + message "Votre compte a été bloqué..."
- Frontend capture le 403 (`!response.ok` = true)
- Extrait le message d'erreur
- Vérifie qu'il ne contient pas "email"
- **Lance une erreur générique "Identifiants invalides"** ❌

**Résultat pour l'utilisateur:**

```
❌ Erreur: "Identifiants invalides."
```

**Attendu:**

```
⚠️ Erreur: "Votre compte a été bloqué pour non respect des conditions d'utilisation."
```

**Code manquant:**

```javascript
if (backendMessage.includes("bloqué") || backendMessage.includes("blocked")) {
  throw new Error(
    "Votre compte a été bloqué pour non respect des conditions d'utilisation.",
  );
}
```

---

### **Problème 2: `is_blocked` PAS RETOURNÉ PAR `/users/me`** 🔴

**Backend - UserController.php:**

```php
#[Route('/me', name: 'api_user_me', methods: ['GET'])]
public function me(): JsonResponse
{
    $user = $this->getUser();
    return $this->json($this->toArray($user));
}

private function toArray(User $user): array
{
    return [
        'id' => $user->getId(),
        'username' => $user->getUsername(),
        'email' => $user->getEmail(),
        'bio' => $user->getBio(),
        'avatar_url' => $user->getAvatarUrl(),
        'banner_url' => $user->getBannerUrl(),
        'location' => $user->getLocation(),
        'website_url' => $user->getWebsiteUrl(),
        'is_verified' => $user->isVerified(),
        // ❌ MANQUANT: 'is_blocked' => $user->isBlocked(),
    ];
}
```

**Résultat:**

```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "is_verified": true
  // ❌ is_blocked absent
}
```

**Frontend - userService.ts:**

```typescript
export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  website_url?: string;
  is_verified?: boolean;
  // ❌ is_blocked absent
}
```

---

### **Problème 3: VÉRIFICATION DE BLOCAGE LORS DE LA CONNEXION** 🟡

**Workflow actuel:**

```
1. POST /api/login_check
   ├─ Si bloqué → 403 ✅ (fonctionne)
   └─ Si pas bloqué → 200 OK (génère token)

2. Frontend reçoit 200 OK
   ├─ Sauvegarde le token dans le cookie
   ├─ Appelle GET /api/users/me
   └─ Récupère l'ID utilisateur

3. Utilisateur peut accéder à l'application
```

**Problème:**

- Si un utilisateur était bloqué, mais le backend retourne 403 ✅
- **MAIS** le frontend affiche le message générique "Identifiants invalides" ❌
- L'utilisateur ne sait pas POURQUOI il ne peut pas se connecter

---

## 📊 Matrice: Détection de Blocage

| Point de Contrôle             | Fonction                            | Statut      | Détails                          |
| ----------------------------- | ----------------------------------- | ----------- | -------------------------------- |
| **Backend - Login**           | Vérifier `isBlocked()`              | ✅ OK       | Retourne 403 si bloqué           |
| **Backend - Response**        | Inclure `is_blocked` dans user data | ✅ OK       | Présent dans `/login_check`      |
| **Backend - /users/me**       | Inclure `is_blocked` dans response  | ❌ MANQUANT | Utilisé après connexion réussie  |
| **Frontend - Error Handling** | Détecter message "bloqué"           | ❌ MANQUANT | Affiche "Identifiants invalides" |
| **Frontend - CurrentUser**    | Stocker `is_blocked`                | ❌ MANQUANT | Interface n'a pas le champ       |
| **Frontend - Session**        | Monitorer si bloqué pendant session | ❌ MANQUANT | Pas de hook useBlockedStatus     |

---

## 🔧 Solutions Recommandées

### **Solution 1: Gérer le Message de Blocage au Login** (URGENT)

**Frontend - AuthContext.tsx:**

```javascript
if (!response.ok) {
  const payload = await response.json().catch(() => null);
  const backendMessage = extractErrorMessage(payload).toLowerCase();

  // Ajouter la détection de blocage
  if (backendMessage.includes("bloqué") || backendMessage.includes("blocked")) {
    throw new Error(
      "Votre compte a été bloqué pour non respect des conditions d'utilisation.",
    );
  }

  if (
    backendMessage.includes("confirmer votre email") ||
    backendMessage.includes("email")
  ) {
    throw new Error(
      "Vous n'avez pas valide votre email. Veuillez consulter votre boite mail pour le faire.",
    );
  }

  throw new Error("Identifiants invalides.");
}
```

### **Solution 2: Inclure `is_blocked` dans `/users/me`** (URGENT)

**Backend - UserController.php:**

```php
private function toArray(User $user): array
{
    return [
        'id' => $user->getId(),
        'username' => $user->getUsername(),
        'email' => $user->getEmail(),
        'bio' => $user->getBio(),
        'avatar_url' => $user->getAvatarUrl(),
        'banner_url' => $user->getBannerUrl(),
        'location' => $user->getLocation(),
        'website_url' => $user->getWebsiteUrl(),
        'is_verified' => $user->isVerified(),
        'is_blocked' => $user->isBlocked(), // ✅ AJOUTER
    ];
}
```

**Frontend - userService.ts:**

```typescript
export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  website_url?: string;
  is_verified?: boolean;
  is_blocked?: boolean; // ✅ AJOUTER
}
```

### **Solution 3: Hook pour Monitorer le Blocage** (IMPORTANT)

Créer `/frontend/src/hooks/useBlockedStatus.ts`:

```typescript
export function useBlockedStatus(onBlocked: () => void) {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const user = await getCurrentUser();
        if (user.is_blocked && !wasBlocked) {
          onBlocked(); // Alerte l'utilisateur
        }
        setWasBlocked(user.is_blocked);
      } catch {
        // Ne rien faire
      }
    }, 30000); // Vérifie toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);
}
```

---

## 🎯 Résumé du Fonctionnement

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX COMPLET DE LOGIN                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣  Utilisateur tape identifiants                           │
│      ↓                                                       │
│  2️⃣  POST /api/login_check                                  │
│      ├─ Backend vérifie identifiants ✅                     │
│      ├─ Backend vérifie isBlocked() ✅                      │
│      │  ├─ Si bloqué → 403 + message ✅                    │
│      └─ Si pas bloqué → 200 + token + user data            │
│         ├─ ❌ Message générique au frontend                 │
│         └─ is_blocked présent dans response ✅              │
│      ↓                                                       │
│  3️⃣  Frontend traite response                               │
│      ├─ ❌ Ne détecte pas le message "bloqué"              │
│      ├─ Sauvegarde le token                                  │
│      └─ ❌ is_blocked pas stocké dans CurrentUser           │
│      ↓                                                       │
│  4️⃣  Frontend appelle GET /api/users/me                     │
│      └─ ❌ Backend ne retourne pas is_blocked               │
│      ↓                                                       │
│  5️⃣  Utilisateur connecté                                   │
│      └─ ❌ Pas d'info sur son statut de blocage             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Points Forts

✅ **Logic de blocage au login** - Le backend empêche effectivement la connexion  
✅ **Return des données utilisateur** - Le `is_blocked` est envoyé dans la réponse de `/login_check`  
✅ **Détection sur les tweets** - Le frontend affiche correctement les tweets bloqués

---

## ❌ Manques

❌ **UX du message d'erreur** - L'utilisateur bloqué reçoit "Identifiants invalides"  
❌ **Persistence de is_blocked** - Pas stocké dans CurrentUser après connexion  
❌ **Monitoring en session** - Pas de détection si bloqué pendant la session  
❌ **Endpoint /users/me** - N'inclut pas is_blocked
