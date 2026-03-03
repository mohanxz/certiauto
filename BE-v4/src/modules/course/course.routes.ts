import express from 'express';
import * as courseController from './course.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/create-course', protect, courseController.createCourse);
router.get('/get-all-courses', protect, courseController.getAllCourses);
router.get('/get-course/:id', protect, courseController.getCourseById);
router.put('/update-course/:id', protect, courseController.updateCourse);
router.delete('/delete-course/:id', protect, courseController.deleteCourse);

export default router;
