import * as xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import connectDB from '../../config/db';
import Course from '../course/course.model';
// Using global Blob and FormData in Node 20+
// globalThis.fetch and globalThis.FormData should be available in Node 20.
import Batch from '../batch/batch.model';
import Student from './student.model';
import BulkUpload, { BulkUploadStatus } from './bulk-upload/bulk-upload.model';

const BASE_URL = 'http://localhost:5000/api';

const run = async () => {
    try {
        console.log('--- Starting Bulk Upload Verification ---');
        await connectDB();

        // 1. Setup Data
        const unique = Date.now();
        // Create Course
        const cRes = await createReq('/course/create-course', {
            courseName: `BulkCourse${unique}`, description: 'Desc'
        });
        const course = cRes.data;
        console.log('Created Course:', course.courseCode);

        // Create Batch
        const bRes = await createReq('/batch/create-batch', {
            courseId: course._id, batchName: `BulkBatch${unique}`, description: 'Desc'
        });
        const batch = bRes.data;
        console.log('Created Batch:', batch.batchCode);

        // 2. Create Excel File
        const wb = xlsx.utils.book_new();
        const data = [
            {
                name: 'Bulk Student 1',
                email: `bulk1.${unique}@test.com`,
                phoneNumber: '9000000001',
                address: 'Address 1',
                courseCode: course.courseCode,
                batchCode: batch.batchCode,
            },
            {
                name: 'Bulk Student 2',
                email: `bulk2.${unique}@test.com`,
                phoneNumber: '9000000002',
                address: 'Address 2',
                courseCode: course.courseCode,
                batchCode: batch.batchCode,
            }
        ];
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
        const filePath = path.join(__dirname, 'test_bulk.xlsx');
        xlsx.writeFile(wb, filePath);
        console.log('Created Test Excel:', filePath);

        // 3. Login
        const loginRes = await fetch(`${BASE_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'superadmin@example.com', password: 'secretpass' }),
        });
        const loginData = await loginRes.json() as any;
        const token = loginData.data?.token;

        // 4. Upload File
        const fileBuffer = fs.readFileSync(filePath);
        const form = new FormData();
        const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        form.append('file', blob as any, 'test_bulk.xlsx');

        console.log('Uploading file...');
        let upRes;
        try {
            upRes = await fetch(`${BASE_URL}/student/bulk-upload/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // FormData sets boundary automatically
                body: form,
            });
        } catch (uploadErr) {
            console.error('Upload Fetch Failed:', uploadErr);
            throw uploadErr;
        }

        const upData = await upRes.json() as any;
        console.log('Upload Status:', upRes.status);
        if (upRes.status !== 201) {
            console.error('Upload API Error:', upData);
        }
        const jobId = upData.data?._id;
        console.log('Job ID:', jobId);

        if (!jobId) {
            console.error('Upload Failed', upData);
            process.exit(1);
        }

        // 5. Wait for Cron (Simulate or Wait)
        // Since we cannot easily force the cron in this process, we can manually trigger the logic
        // OR just wait if the cron is running in the server process.
        // Let's manually trigger the logic via a direct DB update check loop for 10 seconds.

        console.log('Waiting for Cron to process...');
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s
            const job = await BulkUpload.findById(jobId);
            console.log(`Job Status (${i}):`, job?.status);

            if (job?.status === BulkUploadStatus.COMPLETED) {
                console.log('Job Completed!');
                console.log('Logs:', job.logs);
                console.log('Success Count:', job.successCount);
                if (job.successCount !== 2) throw new Error('Expected 2 successes');
                break;
            }
            if (job?.status === BulkUploadStatus.FAILED) {
                console.error('Job Failed:', job.logs);
                process.exit(1);
            }
        }

        // 6. Verify Students Created
        const s1 = await Student.findOne({ email: `bulk1.${unique}@test.com` });
        const s2 = await Student.findOne({ email: `bulk2.${unique}@test.com` });

        if (s1 && s2) {
            console.log('Students Verified in DB!');
        } else {
            console.error('Students NOT found in DB');
            process.exit(1);
        }

        // Cleanup
        fs.unlinkSync(filePath);
        await Student.deleteMany({ email: { $regex: 'bulk' } });
        await BulkUpload.deleteMany({});
        await Batch.findByIdAndDelete(batch._id);
        await Course.findByIdAndDelete(course._id);

        process.exit(0);

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
};

async function createReq(url: string, body: any) {
    const loginRes = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'superadmin@example.com', password: 'secretpass' }),
    });
    const loginData = await loginRes.json() as any;
    const token = loginData.data?.token;

    const res = await fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    return await res.json() as any;
}

run();
