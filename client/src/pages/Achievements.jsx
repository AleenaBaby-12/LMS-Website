import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, FileText, Download, Share2, Linkedin, ExternalLink, Calendar, User } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from "react-qr-code";

const Achievements = () => {
    const { user: authUser } = useAuth();
    const [achievements, setAchievements] = useState({ badges: [], certificates: [] });
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef(null);
    const [selectedCert, setSelectedCert] = useState(null);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const { data } = await api.get('/gamification/my-achievements');
                setAchievements(data);
            } catch (error) {
                console.error('Error fetching achievements:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    const downloadPDF = async (cert) => {
        try {
            setSelectedCert(cert);
            // Wait for state update and render (increased timeout for reliability)
            setTimeout(async () => {
                try {
                    const element = certificateRef.current;
                    if (!element) {
                        throw new Error("Certificate template not found in DOM");
                    }

                    const canvas = await html2canvas(element, {
                        scale: 2,
                        useCORS: true, // Handle potential cross-origin images
                        logging: true
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('landscape', 'mm', 'a4');
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`Certificate-${cert.course.title.replace(/\s+/g, '-')}.pdf`);
                } catch (innerError) {
                    console.error("Error generating PDF:", innerError);
                    alert(`Failed to generate certificate: ${innerError.message}`);
                } finally {
                    setSelectedCert(null);
                }
            }, 500); // Increased from 100ms to 500ms
        } catch (error) {
            console.error("Error initiating download:", error);
        }
    };

    const shareToLinkedIn = (cert) => {
        const title = encodeURIComponent(`Certificate of Completion: ${cert.course.title}`);
        const orgName = encodeURIComponent("SkillSpire LMS"); // Updated organization name
        const issueDate = new Date(cert.issueDate);
        const year = issueDate.getFullYear();
        const month = issueDate.getMonth() + 1;

        // LinkedIn requires a valid public URL. Localhost won't work for validation.
        // If we are on localhost, use a placeholder. If hosted, use the real domain.
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalhost ? "https://skillspire-lms.com" : window.location.origin;

        const certUrl = encodeURIComponent(`${baseUrl}/certificates/${cert.serialNumber}`);

        const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${title}&organizationName=${orgName}&issueYear=${year}&issueMonth=${month}&certUrl=${certUrl}&certId=${cert.serialNumber}`;

        window.open(linkedInUrl, '_blank');
    };

    if (loading) return <div className="text-center mt-20">Loading your achievements...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Award className="text-blue-600" size={40} />
                My Achievements
            </h1>

            {/* Badges Section */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Award className="text-indigo-500" size={24} />
                    Digital Badges
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {achievements.badges.map((eb) => (
                        <div key={eb._id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-all transform hover:-translate-y-1 group">
                            <div className="w-20 h-20 mb-4 relative">
                                <img src={eb.badge.icon} alt={eb.badge.title} className="w-full h-full object-contain filter group-hover:drop-shadow-lg transition-all" />
                                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                    <Award size={12} />
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{eb.badge.title}</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">{eb.badge.criteriaType.replace('_', ' ')}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-2">{eb.badge.description}</p>
                            {eb.course && <p className="mt-2 text-[9px] font-bold text-indigo-600 truncate w-full">{eb.course.title}</p>}
                        </div>
                    ))}
                    {achievements.badges.length === 0 && (
                        <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">No badges earned yet. Keep learning!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Certificates Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="text-blue-500" size={24} />
                    My Certificates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {achievements.certificates.map((cert) => (
                        <div key={cert._id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col group">
                            <div className="h-40 bg-gradient-to-br from-blue-600 to-indigo-800 p-6 flex items-center justify-center relative overflow-hidden">
                                <Award className="text-white/20 absolute -right-4 -bottom-4" size={120} />
                                <div className="z-10 text-center">
                                    <h4 className="text-white font-black text-xl leading-tight line-clamp-2">{cert.course.title}</h4>
                                    <p className="text-white/70 text-xs mt-2">Issued on {new Date(cert.issueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div className="mb-6">
                                    <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-1">Serial Number</p>
                                    <p className="font-mono text-[10px] text-gray-400 select-all truncate">{cert.serialNumber}</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => downloadPDF(cert)}
                                        className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
                                    >
                                        <Download size={18} /> Download Certificate
                                    </button>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => shareToLinkedIn(cert)}
                                            className="flex-1 bg-white border border-blue-200 text-[#0a66c2] rounded-xl py-2 flex items-center justify-center gap-2 font-bold text-sm hover:bg-blue-50 transition-colors"
                                        >
                                            <Linkedin size={18} /> LinkedIn
                                        </button>
                                        <button className="p-2 border border-gray-200 text-gray-400 rounded-xl hover:bg-gray-50 transition-colors">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {achievements.certificates.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 font-medium">Complete a course to unlock your first certificate!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Hidden Certificate Template for PDF generation */}
            {selectedCert && (
                <div className="fixed top-[5000px] left-0">
                    <div
                        ref={certificateRef}
                        className="w-[1000px] h-[707px] p-12 relative flex flex-col items-center justify-center border-[20px] border-double"
                        style={{ backgroundColor: '#ffffff', borderColor: '#1e3a8a' }}
                    >
                        <div className="absolute inset-4 border pointer-events-none" style={{ borderColor: '#dbeafe' }} />

                        <Award className="absolute top-10 right-10" size={200} style={{ color: 'rgba(30, 58, 138, 0.1)' }} />

                        <div className="text-center z-10 w-full px-12">
                            <h3 className="font-serif text-3xl italic mb-4" style={{ color: '#1e3a8a' }}>Certificate of Completion</h3>
                            <div className="w-32 h-1 mx-auto mb-8" style={{ backgroundColor: '#1e3a8a' }} />

                            <p className="text-xl font-light mb-8" style={{ color: '#4b5563' }}>This is to certify that</p>

                            <h2 className="text-5xl font-black mb-8 border-b-2 inline-block px-8 pb-2" style={{ color: '#111827', borderColor: '#f3f4f6' }}>
                                {authUser?.name || 'LMS LEARNER'}
                            </h2>

                            <p className="text-xl font-light mb-8" style={{ color: '#4b5563' }}>has successfully completed the course</p>

                            <h1 className="text-4xl font-bold mb-12 italic" style={{ color: '#1e3a8a' }}>
                                "{selectedCert.course.title}"
                            </h1>

                            <div className="flex justify-between items-end mt-12 px-12">
                                <div className="text-center">
                                    <div className="w-48 h-px mb-2" style={{ backgroundColor: '#d1d5db' }} />
                                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Date Issued</p>
                                    <p className="text-sm font-bold" style={{ color: '#1f2937' }}>{new Date(selectedCert.issueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    {/* QR Code for Verification */}
                                    <div className="bg-white p-2 mb-2" style={{ border: '4px solid #1e3a8a' }}> {/* border-blue-900 */}
                                        <QRCode
                                            value={`${window.location.origin}/verify/${selectedCert.serialNumber}`}
                                            size={80}
                                            fgColor="#1e3a8a" // QR Code color matching theme
                                        />
                                    </div>
                                    <p className="text-xs font-mono select-none" style={{ color: '#9ca3af' }}>Verify: {selectedCert.serialNumber.substring(0, 8)}</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-48 h-px mb-2" style={{ backgroundColor: '#d1d5db' }} />
                                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>LMS Signature</p>
                                    <p className="text-2xl font-serif italic" style={{ color: '#1e3a8a', fontFamily: "'Dancing Script', cursive, serif" }}>John Doe</p> {/* Simplified signature style */}
                                    <p className="text-xs font-bold" style={{ color: '#1f2937' }}>Learning Director</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Achievements;
