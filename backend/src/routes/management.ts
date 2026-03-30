import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const managementRouter = Router();

type DocumentLike = {
  status: string;
};

const deriveDocStatus = (documents: DocumentLike[]) => {
  if (documents.length === 0) return 'Pending';
  if (documents.every((doc) => doc.status === 'Verified')) return 'Verified';
  if (documents.every((doc) => doc.status === 'Submitted' || doc.status === 'Verified')) return 'Submitted';
  return 'Pending';
};

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

    const applicantsWithDocs = await prisma.applicant.findMany({
      include: {
        program: {
          select: { name: true }
        },
        documents: {
          select: { status: true }
        }
      }
    });

    const pendingDocs = applicantsWithDocs
      .map(({ documents, ...applicant }) => ({
        ...applicant,
        docStatus: deriveDocStatus(documents)
      }))
      .filter((applicant) => applicant.docStatus === 'Pending');

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
