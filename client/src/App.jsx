import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseList from './pages/CourseList';
import CourseCreate from './pages/CourseCreate';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import Progress from './pages/Progress';
import PaymentSuccess from './pages/PaymentSuccess';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="min-h-screen pb-10">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/create-course" element={
          <PrivateRoute>
            <CourseCreate />
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/my-courses" element={
          <PrivateRoute>
            <MyCourses />
          </PrivateRoute>
        } />
        <Route path="/my-learning" element={
          <PrivateRoute>
            <MyCourses />
          </PrivateRoute>
        } />
        <Route path="/progress" element={
          <PrivateRoute>
            <Progress />
          </PrivateRoute>
        } />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </div>
  );
}

export default App;
