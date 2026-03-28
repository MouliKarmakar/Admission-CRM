import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

export const officerRouter = Router();
const prisma = new PrismaClient();

officerRouter.use(authenticate);
officerRouter.use(authorize(['OFFICER']));

officerRouter.get('/setup-data', async (req: Request, res: Response): Promise<void> => {
  try {
    const institution = await prisma.institution.findFirst({
      include: {
        campuses: {
          include: {
            departments: {
              include: {
                programs: true
              }
            }
          }
        }
      }
    });
    const academicYears = await prisma.academicYear.findMany();
    res.json({ institution, academicYears });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setup data' });
  }
});

// List applicants
officerRouter.get('/applicants', async (req: Request, res: Response): Promise<void> => {
  try {
    const applicants = await prisma.applicant.findMany({
      include: { program: true }
    });
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// Create applicant
officerRouter.post('/applicants', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    // Map dates properly
    if (data.dob) {
      data.dob = new Date(data.dob);
    }
    data.marks = Number(data.marks);

    const docNames = ['10th Marks Card', '12th Marks Card', 'Transfer Certificate', 'Caste Certificate'];
    const docs = docNames.map(name => ({ docName: name }));

    const applicant = await prisma.applicant.create({
      data: {
        ...data,
        documents: {
          create: docs
        }
      }
    });
    res.json(applicant);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to create applicant' });
  }
});

// Get single applicant
officerRouter.get('/applicants/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id: Number(req.params.id) },
      include: { program: true, documents: true, admission: true }
    });
    if (!applicant) {
      res.status(404).json({ error: 'Applicant not found' });
      return;
    }
    
    // Also fetch the relevant seat matrix to show remaining seats
    const seatMatrix = await prisma.seatMatrix.findUnique({
      where: {
        programId_quotaType: { programId: applicant.programId, quotaType: applicant.quotaType }
      }
    });

    res.json({ applicant, seatMatrix });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applicant' });
  }
});

// Update document status
officerRouter.put('/documents/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const doc = await prisma.documentChecklist.update({
      where: { id: Number(req.params.id) },
      data: { status }
    });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Update fee status
officerRouter.put('/applicants/:id/fee', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const applicant = await prisma.applicant.update({
      where: { id: Number(req.params.id) },
      data: { feeStatus: status }
    });
    res.json(applicant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update fee status' });
  }
});

// Allocate seat
officerRouter.post('/applicants/:id/allocate', async (req: Request, res: Response): Promise<void> => {
  try {
    const applicantId = Number(req.params.id);
    
    // Use transaction to ensure thread safety
    const result = await prisma.$transaction(async (tx) => {
      const applicant = await tx.applicant.findUnique({ where: { id: applicantId } });
      if (!applicant) throw new Error('Applicant not found');
      if (applicant.admissionStatus !== 'Pending') throw new Error('Applicant already allocated or confirmed');

      const matrix = await tx.seatMatrix.findUnique({
        where: { programId_quotaType: { programId: applicant.programId, quotaType: applicant.quotaType } }
      });

      if (!matrix) throw new Error('Seat matrix not configured for this program and quota');
      if (matrix.allocatedSeats >= matrix.totalSeats) throw new Error('Quota is already full!');

      // Increment allocated seats
      await tx.seatMatrix.update({
        where: { id: matrix.id },
        data: { allocatedSeats: { increment: 1 } }
      });

      // Update applicant
      const app = await tx.applicant.update({
        where: { id: applicantId },
        data: { admissionStatus: 'Allocated' }
      });

      return app;
    });

    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Confirm Admission
officerRouter.post('/applicants/:id/confirm', async (req: Request, res: Response): Promise<void> => {
  try {
    const applicantId = Number(req.params.id);

    const result = await prisma.$transaction(async (tx) => {
      const applicant = await tx.applicant.findUnique({ where: { id: applicantId }, include: { program: { include: { department: true } } } });
      if (!applicant) throw new Error('Applicant not found');
      if (applicant.admissionStatus === 'Confirmed') throw new Error('Already confirmed');
      if (applicant.admissionStatus !== 'Allocated') throw new Error('Seat not allocated yet');
      if (applicant.feeStatus !== 'Paid') throw new Error('Fee must be paid to confirm admission');

      // Generate admission number
      // Format: INST/2026/UG/CSE/KCET/0001
      // For demo, we get latest admission count
      const admissionCount = await tx.admission.count();
      const sequence = String(admissionCount + 1).padStart(4, '0');
      
      const yearStr = new Date().getFullYear().toString();
      const deptName = applicant.program.department.name.substring(0, 3).toUpperCase();
      const admNo = `INST/${yearStr}/${applicant.program.courseType}/${deptName}/${applicant.quotaType}/${sequence}`;

      const admission = await tx.admission.create({
        data: {
          applicantId,
          admissionNumber: admNo,
          programId: applicant.programId,
          quotaType: applicant.quotaType,
          feeStatus: applicant.feeStatus
        }
      });

      await tx.applicant.update({
        where: { id: applicantId },
        data: { admissionStatus: 'Confirmed' }
      });

      return admission;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
