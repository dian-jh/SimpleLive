import { createBrowserRouter, Navigate } from 'react-router-dom'
import HomePage from '@/pages/Live/HomePage'
import LiveRoomPage from '@/pages/Live/LiveRoomPage'
import AuthPage from '@/pages/User/AuthPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/live" replace />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/live',
    element: <HomePage />,
  },
  {
    path: '/live/start',
    element: <LiveRoomPage />,
  },
  {
    path: '/live/:roomNumber',
    element: <LiveRoomPage />,
  },
  {
    path: '*',
    element: <Navigate to="/live" replace />,
  },
])
