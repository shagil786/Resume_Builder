import type { CandidateProfile, CandidateFact, Job, FactProvenance } from '@resume-builder/domain';

export interface TestFixture {
  name: string;
  profile: CandidateProfile;
  facts: CandidateFact[];
  provenances: FactProvenance[];
  job: Job;
}

const baseDate = new Date('2024-01-01');

export const FIXTURES: TestFixture[] = [
  {
    name: 'Senior Frontend Engineer applying to Tech Corp',
    profile: {
      id: 'fixture-profile-1',
      userId: 'fixture-user-1',
      personalInfo: { firstName: 'Alice', lastName: 'Chen', email: 'alice@example.com', piiFields: [] },
      summary: 'Senior frontend engineer with 8 years experience building large-scale React applications.',
      visibility: 'PRIVATE',
      status: 'DRAFT',
      workExperience: [
        {
          id: 'exp-1', profileId: 'fixture-profile-1', company: 'BigTech Co', title: 'Senior Frontend Engineer',
          startDate: new Date('2021-03-01'), endDate: undefined, location: 'San Francisco',
          factIds: ['fact-1', 'fact-2', 'fact-3'], bulletPoints: [],
        },
        {
          id: 'exp-2', profileId: 'fixture-profile-1', company: 'Startup Inc', title: 'Frontend Engineer',
          startDate: new Date('2018-06-01'), endDate: new Date('2021-02-28'), location: 'Remote',
          factIds: ['fact-4', 'fact-5'], bulletPoints: [],
        },
      ],
      projects: [], skills: [
        { id: 'skill-1', profileId: 'fixture-profile-1', name: 'React', category: 'TECHNICAL', yearsOfExperience: 8 },
        { id: 'skill-2', profileId: 'fixture-profile-1', name: 'TypeScript', category: 'TECHNICAL', yearsOfExperience: 6 },
        { id: 'skill-3', profileId: 'fixture-profile-1', name: 'GraphQL', category: 'TECHNICAL', yearsOfExperience: 4 },
      ],
      education: [{
        id: 'edu-1', profileId: 'fixture-profile-1', institution: 'UC Berkeley',
        degree: 'BS', fieldOfStudy: 'Computer Science',
        startDate: new Date('2012-09-01'), endDate: new Date('2016-06-01'),
        factIds: [],
      }],
      certifications: [],
      sourceDocuments: [],
      createdAt: baseDate, updatedAt: baseDate,
    },
    facts: [
      { id: 'fact-1', sourceRef: 'resume.pdf', claim: 'Migrated a legacy Angular app to React, reducing page load time by 40%', context: 'Led frontend architecture migration at BigTech Co', confidence: 0.95, status: 'VERIFIED', category: 'WORK', timestamp: baseDate, version: 1 },
      { id: 'fact-2', sourceRef: 'resume.pdf', claim: 'Built a component library used by 12 teams across the organization', context: 'Standardized UI development at BigTech Co', confidence: 0.9, status: 'VERIFIED', category: 'WORK', timestamp: baseDate, version: 1 },
      { id: 'fact-3', sourceRef: 'resume.pdf', claim: 'Reduced CI pipeline from 25 minutes to 8 minutes using parallelization', context: 'Infrastructure improvement at BigTech Co', confidence: 0.85, status: 'VERIFIED', category: 'ACHIEVEMENT', timestamp: baseDate, version: 1 },
      { id: 'fact-4', sourceRef: 'resume.pdf', claim: 'Implemented real-time collaboration features using WebSockets and CRDTs', context: 'Product development at Startup Inc', confidence: 0.88, status: 'VERIFIED', category: 'PROJECT', timestamp: baseDate, version: 1 },
      { id: 'fact-5', sourceRef: 'resume.pdf', claim: 'Designed and built GraphQL API serving 50k requests per minute', context: 'Backend development at Startup Inc', confidence: 0.82, status: 'EXTRACTED', category: 'PROJECT', timestamp: baseDate, version: 1 },
    ],
    provenances: [
      { factId: 'fact-1', sourceId: 'resume.pdf', extractionMethod: 'PDF_PARSER', humanVerified: true, confidenceAtExtraction: 0.95 },
      { factId: 'fact-2', sourceId: 'resume.pdf', extractionMethod: 'PDF_PARSER', humanVerified: true, confidenceAtExtraction: 0.9 },
      { factId: 'fact-3', sourceId: 'resume.pdf', extractionMethod: 'DOCX_PARSER', humanVerified: false, confidenceAtExtraction: 0.85 },
      { factId: 'fact-4', sourceId: 'resume.pdf', extractionMethod: 'PDF_PARSER', humanVerified: true, confidenceAtExtraction: 0.88 },
      { factId: 'fact-5', sourceId: 'resume.pdf', extractionMethod: 'PDF_PARSER', humanVerified: false, confidenceAtExtraction: 0.82 },
    ],
    job: {
      id: 'job-1', userId: 'fixture-user-1', source: 'TEXT_INPUT',
      rawText: `Senior Frontend Engineer at Tech Corp
We are looking for a Senior Frontend Engineer with strong React and TypeScript skills.
Requirements:
- 5+ years of React experience
- Strong TypeScript skills
- Experience with GraphQL
- Experience building component libraries
- Knowledge of performance optimization
- CI/CD experience
- Nice to have: WebSocket experience, real-time collaboration features`,
      title: 'Senior Frontend Engineer', company: 'Tech Corp',
      location: 'San Francisco', status: 'ANALYZED',
    },
  },
];
