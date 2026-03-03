import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * =====================================================
 * GENERATE PDF FROM WORD TEMPLATE (FINAL PRODUCTION SAFE VERSION)
 * =====================================================
 */
export const generatePdfFromWord = async (
  templatePath: string,
  data: any
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const absoluteTemplatePath = path.resolve(templatePath);

      if (!fs.existsSync(absoluteTemplatePath)) {
        return reject(
          new Error(`Template not found: ${absoluteTemplatePath}`)
        );
      }

      // 🔥 Read Template
      const content = fs.readFileSync(absoluteTemplatePath, "binary");
      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: "{{", end: "}}" },

        // 🔥 Case-insensitive matching
        parser: (tag: string) => ({
          get: (scope: any) => {
            const cleanTag = tag.trim();

            const key = Object.keys(scope).find(
              (k) =>
                k.replace(/\s+/g, "").toLowerCase() ===
                cleanTag.replace(/\s+/g, "").toLowerCase()
            );

            return key ? scope[key] : "";
          },
        }),

        nullGetter: () => "",
      });

      try {
        doc.render(data);
      } catch (error: any) {
        return reject(error);
      }

      // 🔥 Remove Word Auto Field Update (Prevents DATE override)
      try {
        const settingsFile = zip.file("word/settings.xml");
        if (settingsFile) {
          const updated = settingsFile
            .asText()
            .replace('<w:updateFields w:val="true"/>', "")
            .replace('<w:updateFields w:val="true"></w:updateFields>', "");

          zip.file("word/settings.xml", updated);
        }
      } catch (err) {
        console.warn("Could not modify Word settings:", err);
      }

      const filledDocBuffer = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      });

      // 🔥 Create Temp Directory
      const tempDir = path.resolve(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempDocxPath = path.join(tempDir, `${uuidv4()}.docx`);
      const tempPdfPath = path.join(tempDir, `${uuidv4()}.pdf`);

      fs.writeFileSync(tempDocxPath, filledDocBuffer);

      // 🔥 Absolute path to PowerShell script
      const scriptPath = path.resolve(
        process.cwd(),
        "convert_to_pdf.ps1"
      );

      if (!fs.existsSync(scriptPath)) {
        return reject(
          new Error(`PowerShell script not found: ${scriptPath}`)
        );
      }

      // ✅ FIXED: Hidden PowerShell Execution
      const ps = spawn(
        "powershell.exe",
        [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          scriptPath,
          "-inputFile",
          tempDocxPath,
          "-outputFile",
          tempPdfPath,
        ],
        {
          windowsHide: true, // 🔥 HIDES POWERHELL POPUP
          shell: false,
        }
      );

      let errorOutput = "";

      ps.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      ps.on("error", (err) => {
        reject(err);
      });

      ps.on("close", (code) => {
        try {
          if (code !== 0) {
            return reject(
              new Error(
                `PowerShell exited with code ${code}. Error: ${errorOutput}`
              )
            );
          }

          if (!fs.existsSync(tempPdfPath)) {
            return reject(new Error("PDF not generated"));
          }

          const pdfBuffer = fs.readFileSync(tempPdfPath);
          resolve(pdfBuffer);
        } catch (err) {
          reject(err);
        } finally {
          // 🔥 Clean temp files
          if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
          if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * =====================================================
 * PREPARE CERTIFICATE DATA (STRICT UTC SAFE)
 * =====================================================
 */

export const prepareCertificateData = (
  student: any,
  courseName: string,
  customDate?: string // Add optional custom date parameter
) => {
  if (!student) {
    throw new Error("Student data missing");
  }

  // Use custom date if provided, otherwise use student.completionDate
  const completionDate = customDate || student?.completionDate;

  if (!completionDate) {
    throw new Error(
      `Completion date not set for student ${student.name}`
    );
  }

  // ✅ STRICT: Use only DB uniqueId
  if (!student?.studentCode) {
    throw new Error(
      `Unique ID not found in DB for student ${student.name}`
    );
  }

  const finalUniqueId = student.uniqueId;

  const mark =
    student?.finalMark ??
    student?.mark ??
    student?.percentage ??
    "N/A";

  const formattedDate = new Date(completionDate).toLocaleDateString("en-GB", {
    timeZone: "UTC",
  });

  return {
    name: student?.name || "",

    // Unique ID (single source of truth)
    unique_id: finalUniqueId,
    uniqueId: finalUniqueId,
    UNIQUE_ID: finalUniqueId,
    "UNIQUE ID": finalUniqueId,

    // Date
    date: formattedDate,
    Date: formattedDate,
    DATE: formattedDate,

    // Marks
    per: mark,
    "per %": `${mark}%`,

    // Course
    course: courseName,
  };
};