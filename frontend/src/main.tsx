import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { AuthProvider } from './auth/AuthContext'
import { RefreshPreferencesProvider } from './context/RefreshPreferencesContext'
import ProtectedRoute from './auth/ProtectedRoute'
import Root from './routes/root.tsx'
import LoginRoute from './routes/login.jsx'
import Feed from './routes/feed.tsx'
import Tweets from './routes/tweets.jsx'
import Users, { loader as usersLoader } from './routes/users.jsx'
import Hashtags, { loader as hashtagsLoader } from './routes/hashtags.jsx'
import Settings from './routes/settings.tsx'
import Profile from './routes/profile.tsx'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'login',
        element: <LoginRoute />,
      },
      {
        index: true,
        element: <Tweets />,
      },
      {
        path: 'feed',
        element: (
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tweets',
        element: <Tweets />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        ),
        loader: usersLoader,
      },
      {
        path: 'hashtags',
        element: (
          <ProtectedRoute>
            <Hashtags />
          </ProtectedRoute>
        ),
        loader: hashtagsLoader,
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to='/' replace />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RefreshPreferencesProvider>
        <RouterProvider router={router} />
      </RefreshPreferencesProvider>
    </AuthProvider>
  </StrictMode>,
)
