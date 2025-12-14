import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container text-center mt-10">
            <h1 className="text-4xl font-bold mb-4">Welcome to our Learning Platform</h1>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
                Discover courses, track your progress, and learn new skills with our advanced LMS.
            </p>
            <div className="flex justify-center gap-4">
                <Link to="/register" className="btn btn-primary text-xl px-8 py-3">Get Started</Link>
                <Link to="/courses" className="btn btn-outline text-xl px-8 py-3">Browse Courses</Link>
            </div>
        </div>
    );
};

export default Home;
