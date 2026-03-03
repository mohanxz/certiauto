import BulkUpload, { BulkUploadStatus } from './modules/student/bulk-upload/bulk-upload.model';
import * as xlsx from 'xlsx';
import Course from './modules/course/course.model';
import Batch from './modules/batch/batch.model';
import { createStudent } from './modules/student/student.service';

export const processBulkUploads = async () => {
    // Check for PENDING jobs
    const job = await BulkUpload.findOne({ status: BulkUploadStatus.PENDING });

    if (!job) return;

    try {
        console.log(`[Job Processor] Processing Job: ${job._id}`);
        job.status = BulkUploadStatus.PROCESSING;
        await job.save();

        const workbook = xlsx.readFile(job.filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data: any[] = xlsx.utils.sheet_to_json(sheet, { raw: false });

        job.totalRecords = data.length;

        let success = 0;
        let failure = 0;
        const logs: string[] = [];

        for (const row of data) {
            try {
                // 1. Resolve Batch
                // Use Global Target Batch if available (Priority)
                let batchId = job.targetBatchId;

                // Fallback to row if global not set (Backwards element?)
                // But we removed column from template. So assume global is required.
                if (!batchId) {
                    // Try row
                    if (row.batch) {
                        const batches = await Batch.find({ batchName: row.batch });
                        if (batches.length === 0) throw new Error(`Batch '${row.batch}' not found`);
                        batchId = batches[0]._id;
                    } else {
                        throw new Error('No Batch specified (Global or Row)');
                    }
                }

                // 2. Resolve Courses
                let enrolledCourseIds: string[] = [];
                if (job.targetCourseIds && job.targetCourseIds.length > 0) {
                    enrolledCourseIds = job.targetCourseIds.map(id => id.toString());
                } else {
                    // Fallback to row
                    if (row.courses) {
                        const courseNames = row.courses.split(',').map((c: string) => c.trim());
                        for (const cName of courseNames) {
                            const course = await Course.findOne({ courseName: cName }); // Course name unique? ideally.
                            // Warning: Course might depend on batch? 
                            // In our model, Course is independent entity, Batch links to Course.
                            // Logic: Student enrolled in Course X in Batch Y.
                            if (course) enrolledCourseIds.push(course._id.toString());
                        }
                    }
                }

               let formattedDate: string | undefined;

if (row.date) {
    const dateStr = String(row.date).trim(); // Example: 04-10-2025

    const [day, month, year] = dateStr.split("-");

    formattedDate = `${year}-${month}-${day}`; 
}
                // 3. Create Student
                await createStudent({
                    uniqueId: String(row.uniqueId),
                    name: row.name,
                    email: row.email,
                    phoneNumber: String(row.phoneNumber),
                    address: row.address,
                    finalMark: row.finalMark ? String(row.finalMark) : undefined,
                    completionDate: formattedDate,
                    enrolledCourseIds: enrolledCourseIds as any,
                    batchId: batchId as any,
                    isActive: row.isActive ?? true,
                }, job.createdBy.toString());

                success++;
            } catch (err) {
                failure++;
                logs.push(`Row Error (${row.uniqueId || row.email || 'Unknown'}): ${(err as Error).message}`);
            }
            job.processedRecords++;
        }

        job.status = BulkUploadStatus.COMPLETED;
        if (failure > 0) {
            job.status = success === 0 ? BulkUploadStatus.FAILED : BulkUploadStatus.PARTIAL_SUCCESS;
        }

        job.successCount = success;
        job.failureCount = failure;
        job.logs = logs;
        await job.save();
        console.log(`[Job Processor] Job ${job._id} Finished`);

    } catch (error) {
        console.error(`[Job Processor] Job ${job._id} Failed Systemically`, error);
        job.status = BulkUploadStatus.FAILED;
        job.logs.push(`System Error: ${(error as Error).message}`);
        await job.save();
    }
};
