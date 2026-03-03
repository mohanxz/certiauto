import express from 'express';
import * as studentController from './student.controller';
import { protect } from '../../middleware/auth.middleware';

// DEBUG: Add this at the top
console.log('=== DEBUG STUDENT ROUTES ===');
console.log('studentController type:', typeof studentController);
console.log('studentController keys:', Object.keys(studentController || {}));
console.log('studentController.createStudent:', studentController.createStudent);
console.log('typeof createStudent:', typeof studentController.createStudent);

const router = express.Router();

// Test with a simple function first
router.get('/test', (req, res) => {
  console.log('Test route working');
  res.json({ success: true, message: 'Test route works' });
});

// Then try your actual route
if (typeof studentController.createStudent === 'function') {
  router.post('/create-student', protect, studentController.createStudent);
} else {
  console.error('ERROR: createStudent is not a function!');
  router.post('/create-student', protect, (req, res) => {
    res.status(500).json({ error: 'Controller function not loaded' });
  });
}

router.get('/get-all-students', protect, studentController.getAllStudents);
router.get('/get-student/:id', protect, studentController.getStudentById);
router.post('/send-certificate/:id', protect, studentController.sendCertificate);
router.post('/send-email/:id', protect, studentController.sendEmailToStudent);
router.put('/update-student/:id', protect, studentController.updateStudent);
router.delete('/delete-student/:id', protect, studentController.deleteStudent);
// In your student routes file, add:
router.delete('/delete-all-students', protect, studentController.deleteAllStudents);

export default router;