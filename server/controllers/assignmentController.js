const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { createNotification } = require('./notificationController');
const { issueBadge } = require('./gamificationController');

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Teacher/Admin
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, courseId, dueDate, points, resources } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Verify instructor owns the course
        console.log('Assignment Creation Debug:', {
            courseId,
            courseInstructor: course.instructor.toString(),
            userId: req.user._id.toString(),
            userRole: req.user.role
        });

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            console.log('Authorization Failed: Instructor ID mismatch');
            return res.status(403).json({ message: 'Not authorized to add assignments to this course' });
        }

        const assignment = await Assignment.create({
            title,
            description,
            course: courseId,
            createdBy: req.user._id,
            dueDate,
            points,
            resources: resources || []
        });

        // Notify all enrolled students
        const enrolledStudents = course.studentsEnrolled || [];
        console.log(`[DEBUG] Assignment created. Course has ${enrolledStudents.length} enrolled students.`);
        console.log(`[DEBUG] IDs: ${enrolledStudents.map(id => id.toString()).join(', ')}`);



        // Batch create notifications (using loop for now, optimization: insertMany)
        for (const studentId of enrolledStudents) {
            await createNotification({
                recipient: studentId,
                message: `New assignment posted in ${course.title}: ${title}`,
                type: 'info',
                relatedId: assignment._id,
                onModel: 'Assignment'
            });
        }

        res.status(201).json(assignment);
    } catch (error) {
        console.error('Assignment Creation Error:', error);
        res.status(500).json({ message: error.message || 'Server error creating assignment' });
    }
};

// @desc    Get assignments for a specific course
// @route   GET /api/assignments/course/:courseId
// @access  Registered Users
exports.getAssignmentsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId })
            .sort({ dueDate: 1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching assignments' });
    }
};

// @desc    Get all assignments for the logged-in student (across all enrolled courses)
// @route   GET /api/assignments/my-assignments
// @access  Student/Teacher
exports.getMyAssignments = async (req, res) => {
    try {
        // If user is a teacher, return assignments they created
        if (req.user.role === 'teacher' || req.user.role === 'admin') {
            const assignments = await Assignment.find({ createdBy: req.user._id })
                .populate('course', 'title thumbnail')
                .sort({ createdAt: -1 });

            // Add dummy status for UI compatibility
            const result = assignments.map(a => ({
                ...a.toObject(),
                status: new Date() > new Date(a.dueDate) ? 'overdue' : 'active', // 'active' for teachers
                grade: null,
                submittedAt: null
            }));

            return res.json(result);
        }

        // 1. Find all courses the student is enrolled in
        const enrollments = await Enrollment.find({ student: req.user._id }).select('course');
        const courseIds = enrollments.map(e => e.course);

        // 2. Find all assignments for these courses
        const assignments = await Assignment.find({ course: { $in: courseIds } })
            .populate('course', 'title thumbnail') // Populate course info
            .sort({ dueDate: 1 }); // Sort by nearest due date

        // 3. Find submissions for these assignments by this student
        const submissions = await Submission.find({
            student: req.user._id,
            assignment: { $in: assignments.map(a => a._id) }
        });

        // 4. Merge assignment data with submission status
        const result = assignments.map(assignment => {
            const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
            let status = 'pending';

            if (submission) {
                status = submission.status; // 'submitted' or 'graded'
            } else if (new Date() > new Date(assignment.dueDate)) {
                status = 'overdue';
            }

            return {
                ...assignment.toObject(),
                status,
                grade: submission?.grade,
                submittedAt: submission?.submittedAt
            };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching student assignments' });
    }
};

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Student
exports.submitAssignment = async (req, res) => {
    try {
        const { content, attachments } = req.body;
        const assignmentId = req.params.id;

        const assignment = await Assignment.findById(assignmentId).populate('course'); // Populate course to access instructor
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if already submitted
        const existingSubmission = await Submission.findOne({
            assignment: assignmentId,
            student: req.user._id
        });

        if (existingSubmission) {
            // Update existing submission (resubmit)
            existingSubmission.content = content || existingSubmission.content;
            existingSubmission.attachments = attachments || existingSubmission.attachments;
            existingSubmission.submittedAt = Date.now();
            existingSubmission.status = 'submitted'; // Reset status if it was graded? Maybe keep as is.
            await existingSubmission.save();

            // Notify Teacher (Resubmission)
            if (assignment.course && assignment.course.instructor) {
                await createNotification({
                    recipient: assignment.course.instructor,
                    message: `Assignment resubmitted by ${req.user.name}: ${assignment.title}`,
                    type: 'info',
                    relatedId: assignment._id,
                    onModel: 'Assignment'
                });
            }

            return res.json(existingSubmission);
        }

        // Create new submission
        const submission = await Submission.create({
            assignment: assignmentId,
            student: req.user._id,
            content,
            attachments,
            status: 'submitted'
        });

        // Notify Teacher (New Submission)
        if (assignment.course && assignment.course.instructor) {
            await createNotification({
                recipient: assignment.course.instructor,
                message: `New assignment submission by ${req.user.name}: ${assignment.title}`,
                type: 'success', // or info
                relatedId: assignment._id,
                onModel: 'Assignment'
            });
        }

        res.status(201).json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error submitting assignment' });
    }
};

// @desc    Get all submissions for a specific assignment
// @route   GET /api/assignments/:id/submissions
// @access  Teacher/Admin
exports.getAssignmentSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Verify instructor owns the assignment
        if (assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view submissions for this assignment' });
        }

        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'name email profilePicture')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching submissions' });
    }
};

// @desc    Grade a submission
// @route   PUT /api/assignments/submission/:id/grade
// @access  Teacher/Admin
exports.gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await Submission.findById(req.params.id).populate('assignment');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check ownership via assignment
        if (submission.assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to grade this submission' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';
        await submission.save();

        // Check for high score badge (90%+)
        const percentage = (grade / submission.assignment.points) * 100;
        if (percentage >= 90) {
            await issueBadge(submission.student, 'score', { courseId: submission.assignment.course });
        }

        // Notify Student
        await createNotification({
            recipient: submission.student._id || submission.student,
            message: `Your assignment "${submission.assignment.title}" has been graded. Score: ${grade}/${submission.assignment.points}${percentage >= 90 ? ' - You earned a High Achiever badge!' : ''}`,
            type: 'success',
            relatedId: submission.assignment._id,
            onModel: 'Assignment'
        });

        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error grading submission' });
    }
};

// @desc    Update an assignment
// @route   PUT /api/assignments/:id
// @access  Teacher (Creator) / Admin
exports.updateAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, points, courseId } = req.body;
        let assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check ownership
        if (assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this assignment' });
        }

        assignment.title = title || assignment.title;
        assignment.description = description || assignment.description;
        assignment.dueDate = dueDate || assignment.dueDate;
        assignment.points = points || assignment.points;
        // assignment.course = courseId || assignment.course; // Typically course shouldn't change, but can allow if needed

        await assignment.save();
        res.json(assignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating assignment' });
    }
};

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Teacher (Creator) / Admin
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check ownership
        if (assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this assignment' });
        }

        // Ideally, also delete associated submissions
        await Submission.deleteMany({ assignment: req.params.id });
        await assignment.deleteOne();

        res.json({ message: 'Assignment removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting assignment' });
    }
};
