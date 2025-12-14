import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, Loader } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const sessionId = searchParams.get('session_id');
    const courseId = searchParams.get('course_id');

    useEffect(() => {
        if (!sessionId || !courseId) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await api.post('/payment/verify-payment', { sessionId, courseId });
                setStatus('success');
                // Optional: Redirect after delay
                // setTimeout(() => navigate(`/courses/${courseId}`), 3000);
            } catch (error) {
                console.error('Verification failed', error);
                setStatus('error');
            }
        };
        verify();
    }, [sessionId, courseId, navigate]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
            {status === 'verifying' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader className="animate-spin text-blue-600" size={48} />
                    <h2 className="text-2xl font-bold">Verifying your payment...</h2>
                    <p className="text-gray-500">Please do not close this window.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Payment Successful!</h2>
                    <p className="text-gray-600 max-w-md">
                        Thank you for your purchase. You have been successfully enrolled in the course.
                    </p>
                    <Link to={`/courses/${courseId}`} className="btn btn-primary mt-6 px-8">
                        Start Learning Now
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                        <span className="text-4xl font-bold">!</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
                    <p className="text-gray-600">
                        We couldn't verify your payment. If you were charged, please contact support.
                    </p>
                    <Link to="/dashboard" className="btn btn-outline mt-4">
                        Go to Dashboard
                    </Link>
                </div>
            )}
        </div>
    );
};

export default PaymentSuccess;
