import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

export const adminRouter = Router();
const prisma = new PrismaClient();

adminRouter.use(authenticate);
adminRouter.use(authorize(['ADMIN']));

// Define interface to work with typescript
type AsyncRequestHandler = (req: Request, res: Response) => Promise<void>;

// Master Setup endpoints
adminRouter.get('/setup-data', async (req: Request, res: Response): Promise<void> => {
  try {
    const institutions = await prisma.institution.findMany({ include: { campuses: { include: { departments: { include: { programs: true } } } } } });
    const academicYears = await prisma.academicYear.findMany();
    const programs= await prisma.program.findMany();
    res.json({ institutions, academicYears, programs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setup data' });
  }
});

adminRouter.post('/institution', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const institution = await prisma.institution.create({ data: { name } });
    res.json(institution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create institution' });
  }
});

adminRouter.post('/campus', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, institutionId } = req.body;
    const campus = await prisma.campus.create({ data: { name, institutionId: parseInt(institutionId) } });
    res.json(campus);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

adminRouter.post('/department', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, campusId } = req.body;
    const dept = await prisma.department.create({ data: { name, campusId: parseInt(campusId) } });
    res.json(dept);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

adminRouter.post('/program', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, departmentId, courseType, entryType, admissionMode } = req.body;
    const prog = await prisma.program.create({
      data: { name, departmentId: parseInt(departmentId), courseType, entryType, admissionMode }
    });
    res.json(prog);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Seat Matrix
adminRouter.get('/seat-matrix', async (req: Request, res: Response): Promise<void> => {
  try {
    const matrices = await prisma.seatMatrix.findMany({
      include: { program: true }
    });
    res.json(matrices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

adminRouter.post('/seat-matrix', async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId, totalIntake, quotas } = req.body;
    // expect quotas to be [{ quotaType: 'KCET', totalSeats: 30 }, ...]
    const sum = quotas.reduce((acc: number, q: any) => acc + Number(q.totalSeats), 0);
    if (sum !== Number(totalIntake)) {
      res.status(400).json({ error: `Sum of quotas (${sum}) must equal total intake (${totalIntake})` });
      return;
    }

    // Upsert each quota
    const results = await Promise.all(quotas.map(async (q: any) => {
      // Find existing
      const existing = await prisma.seatMatrix.findUnique({
        where: {
          programId_quotaType: { programId, quotaType: q.quotaType }
        }
      });
      if (existing) {
        return prisma.seatMatrix.update({
          where: { id: existing.id },
          data: { totalSeats: Number(q.totalSeats) }
        });
      } else {
        return prisma.seatMatrix.create({
          data: { programId, quotaType: q.quotaType, totalSeats: Number(q.totalSeats) }
        });
      }
    }));

    res.json(results);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to save seat matrix' });
  }
});
