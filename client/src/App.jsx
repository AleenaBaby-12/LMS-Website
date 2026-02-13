import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseList from './pages/CourseList';
import CourseCreate from './pages/CourseCreate';
import CourseEdit from './pages/CourseEdit';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import Progress from './pages/Progress';
import Assignments from './pages/Assignments';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentDetails from './pages/AssignmentDetails';
import AssignmentSubmissions from './pages/AssignmentSubmissions';
import PaymentSuccess from './pages/PaymentSuccess';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import CareerDashboard from './pages/CareerDashboard';
import MentorConnections from './pages/MentorConnections';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
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
        <Route path="/courses/edit/:id" element={
          <PrivateRoute>
            <CourseEdit />
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
        <Route path="/assignments" element={
          <PrivateRoute>
            <Assignments />
          </PrivateRoute>
        } />
        <Route path="/assignments/:id" element={
          <PrivateRoute>
            <AssignmentDetails />
          </PrivateRoute>
        } />
        <Route path="/assignments/:id/submissions" element={
          <PrivateRoute>
            <AssignmentSubmissions />
          </PrivateRoute>
        } />
        <Route path="/create-assignment" element={
          <PrivateRoute>
            <CreateAssignment />
          </PrivateRoute>
        } />
        <Route path="/assignments/edit/:id" element={
          <PrivateRoute>
            <CreateAssignment />
          </PrivateRoute>
        } />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/achievements" element={
          <PrivateRoute>
            <Achievements />
          </PrivateRoute>
        } />
        <Route path="/career" element={
          <PrivateRoute>
            <CareerDashboard />
          </PrivateRoute>
        } />
        <Route path="/mentor-connections" element={
          <PrivateRoute>
            <MentorConnections />
          </PrivateRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
