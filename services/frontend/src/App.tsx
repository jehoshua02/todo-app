import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import TaskDetail from './pages/TaskDetail';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <main className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Lists />} />
            <Route path="/lists/:listId" element={<ListDetail />} />
            <Route path="/lists/:listId/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
