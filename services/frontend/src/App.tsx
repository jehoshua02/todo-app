import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/auth.context';
import Lists from './features/lists/Lists.page';
import ListDetail from './features/tasks/ListDetail.page';
import TaskDetail from './features/tasks/TaskDetail.page';
import Login from './features/auth/Login.page';
import Register from './features/auth/Register.page';

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
