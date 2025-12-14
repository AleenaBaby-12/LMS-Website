import { useAuth } from '../context/AuthContext';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'teacher') {
        return <TeacherDashboard />;
    }

    if (user?.role === 'student') {
        return <StudentDashboard />;
    }

    return (
        <div className="container mt-8 text-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 mt-4">
                Welcome, {user?.name}. Your role ({user?.role}) dashboard is under construction.
            </p>
        </div>
    );
};

export default Dashboard;
