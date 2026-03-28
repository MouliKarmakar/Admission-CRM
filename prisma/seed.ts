import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const officerPassword = await bcrypt.hash('officer123', 10);
  const mgmtPassword = await bcrypt.hash('mgmt123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: adminPassword, role: 'ADMIN' }
  });

  const officer = await prisma.user.upsert({
    where: { username: 'officer' },
    update: {},
    create: { username: 'officer', password: officerPassword, role: 'OFFICER' }
  });

  const mgmt = await prisma.user.upsert({
    where: { username: 'management' },
    update: {},
    create: { username: 'management', password: mgmtPassword, role: 'MANAGEMENT' }
  });

  // Create Academic Year
  const year = await prisma.academicYear.upsert({
    where: { year: '2025-26' },
    update: {},
    create: { year: '2025-26' }
  });

  // Create Master Setup
  const institution = await prisma.institution.create({
    data: { name: 'Example Engineering College' }
  });

  const campus = await prisma.campus.create({
    data: { name: 'Main Campus', institutionId: institution.id }
  });

  const dept = await prisma.department.create({
    data: { name: 'Computer Science', campusId: campus.id }
  });

  const progCSE = await prisma.program.create({
    data: {
      name: 'B.Tech CSE',
      departmentId: dept.id,
      courseType: 'UG',
      entryType: 'Regular',
      admissionMode: 'Government'
    }
  });

  const progECE = await prisma.program.create({
    data: {
      name: 'B.Tech ECE',
      departmentId: dept.id,
      courseType: 'UG',
      entryType: 'Regular',
      admissionMode: 'Government'
    }
  });

  // Add Seat Matrix
  await prisma.seatMatrix.createMany({
    data: [
      { programId: progCSE.id, quotaType: 'KCET', totalSeats: 30 },
      { programId: progCSE.id, quotaType: 'COMEDK', totalSeats: 20 },
      { programId: progCSE.id, quotaType: 'Management', totalSeats: 10 },
      { programId: progECE.id, quotaType: 'KCET', totalSeats: 30 },
      { programId: progECE.id, quotaType: 'COMEDK', totalSeats: 20 },
      { programId: progECE.id, quotaType: 'Management', totalSeats: 10 },
    ]
  });

  // Sample Applicant
  await prisma.applicant.create({
    data: {
      fullName: 'John Doe',
      dob: new Date('2004-05-15'),
      gender: 'Male',
      mobile: '9876543210',
      email: 'john@example.com',
      category: 'GM',
      entryType: 'Regular',
      admissionMode: 'Government',
      quotaType: 'KCET',
      programId: progCSE.id,
      academicYear: '2025-26',
      allotmentNumber: 'AL-1001',
      qualifyingExam: 'PUC',
      marks: 85.5,
      address: '123 Main St, Bangalore',
      documents: {
        create: [
          { docName: '10th Marks Card' },
          { docName: '12th Marks Card' },
          { docName: 'Transfer Certificate' }
        ]
      }
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
