import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

export const managementRouter = Router();
const prisma = new PrismaClient();

managementRouter.use(authenticate);
managementRouter.use(authorize(['MANAGEMENT', 'ADMIN']));

managementRouter.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    // Total Intake and Quotas
    const matrices = await prisma.seatMatrix.findMany({
      include: { program: true }
    });

    let totalIntake = 0;
    let totalAdmitted = 0; // Wait, total admit should be confirmed ones. Let's compute.

    const programsMap: any = {};

    matrices.forEach(m => {
      totalIntake += m.totalSeats;
      totalAdmitted += m.allocatedSeats; // Actually allocated seats means lock.
      // Quota wise fill per program
      if (!programsMap[m.programId]) {
        programsMap[m.programId] = {
          programName: m.program.name,
          quotas: []
        };
      }
      programsMap[m.programId].quotas.push({
        quotaType: m.quotaType,
        totalSeats: m.totalSeats,
        allocatedSeats: m.allocatedSeats,
        remainingSeats: m.totalSeats - m.allocatedSeats
      });
    });

    const pendingDocs = await prisma.applicant.findMany({
      where: { docStatus: 'Pending' },
      select: { id: true, fullName: true, program: { select: { name: true } }, docStatus: true }
    });

    const pendingFees = await prisma.applicant.findMany({
      where: { feeStatus: 'Pending' },
      select: { id: true, fullName: true, program: { select: { name: true } }, feeStatus: true, admissionStatus: true }
    });

    res.json({
      summary: {
        totalIntake,
        totalAdmitted,
        seatsRemaining: totalIntake - totalAdmitted
      },
      quotaWiseFill: Object.values(programsMap),
      pendingDocs,
      pendingFees
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});
