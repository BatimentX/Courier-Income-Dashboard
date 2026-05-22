import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { UserProfile } from '../types';

// Standard styles for ATS-friendly courier resume
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1f2c',
    lineHeight: 1.5,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#2b3e6b',
    paddingBottom: 12,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    color: '#475569',
    fontSize: 9,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2b3e6b',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 3,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summary: {
    fontSize: 9.5,
    color: '#334155',
    lineHeight: 1.4,
  },
  experienceBlock: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    color: '#1e293b',
    fontSize: 10,
  },
  expSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#64748b',
    fontSize: 9,
    marginTop: 2,
    marginBottom: 4,
  },
  expRole: {
    fontWeight: 'bold',
    color: '#2b3e6b',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletPoint: {
    width: 6,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: '#334155',
  },
  gridTwoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    flex: 1,
    marginRight: 10,
  },
  badgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 8.5,
    color: '#334155',
  },
  certBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 8.5,
    color: '#1d4ed8',
    fontWeight: 'bold',
  },
  schoolName: {
    fontWeight: 'bold',
    color: '#1e293b',
    fontSize: 9.5,
  },
  schoolDegree: {
    color: '#475569',
    fontSize: 9,
    marginTop: 1,
  }
});

interface ResumeTemplateProps {
  profile: UserProfile;
}

export const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ profile }) => {
  const addressString = [profile.address, profile.city, profile.state, profile.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Name and contact information */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.full_name || 'COURIER APPLICATION'}</Text>
          <View style={styles.contactRow}>
            <Text>{profile.phone || '(443) 555-0199'}</Text>
            <Text>{profile.email || 'applicant@example.com'}</Text>
            <Text>{addressString || 'Baltimore, MD 21237'}</Text>
          </View>
        </View>

        {/* Professional Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{profile.summary || 'Reliable and punctual professional delivery courier with clean motor vehicle record and immediate route availability.'}</Text>
        </View>

        {/* Split Grid for Skills and Certifications */}
        <View style={[styles.section, styles.gridTwoCol]}>
          {/* Active Certifications */}
          <View style={styles.gridCol}>
            <Text style={styles.sectionTitle}>Professional Credentials</Text>
            <View style={styles.badgeList}>
              {profile.certifications_held && profile.certifications_held.length > 0 ? (
                profile.certifications_held.map((cert, i) => (
                  <Text key={i} style={styles.certBadge}>{cert}</Text>
                ))
              ) : (
                <Text style={{ fontStyle: 'italic', fontSize: 9, color: '#64748b' }}>
                  Standard Driver's License (Clean MVR)
                </Text>
              )}
            </View>
          </View>

          {/* Key Competencies */}
          <View style={styles.gridCol}>
            <Text style={styles.sectionTitle}>Core Competencies</Text>
            <View style={styles.badgeList}>
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, i) => (
                  <Text key={i} style={styles.badge}>{skill}</Text>
                ))
              ) : (
                ['Route Optimization', 'Defensive Driving', 'Cargo Safety', 'Time Management'].map((skill, i) => (
                  <Text key={i} style={styles.badge}>{skill}</Text>
                ))
              )}
            </View>
          </View>
        </View>

        {/* Professional Work Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work History</Text>
          {profile.work_history && profile.work_history.length > 0 ? (
            profile.work_history.map((job, idx) => (
              <View key={idx} style={styles.experienceBlock}>
                <View style={styles.expHeader}>
                  <Text style={styles.expRole}>
                    {job.title} {job.is_delivery_related ? ' (Delivery Role)' : ''}
                  </Text>
                  <Text style={{ fontWeight: 'bold' }}>{job.company}</Text>
                </View>
                <View style={styles.expSubHeader}>
                  <Text>Route Operations & Logistics</Text>
                  <Text>{job.start_date} - {job.end_date || 'Present'}</Text>
                </View>
                
                {/* Parse bullet points from description */}
                {job.description.split('\n').filter(Boolean).map((bullet, bIdx) => (
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{bullet.replace(/^[•\-\*\s]+/, '')}</Text>
                  </View>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.experienceBlock}>
              <View style={styles.expHeader}>
                <Text style={styles.expRole}>Independent Delivery Contractor</Text>
                <Text style={{ fontWeight: 'bold' }}>Baltimore/Laurel Area Courier</Text>
              </View>
              <View style={styles.expSubHeader}>
                <Text>Logistics, Dispatching, Transporting</Text>
                <Text>2022 - Present</Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>Safely operated private route delivery services spanning up to 150 miles daily, maintaining a 100% on-time completion record.</Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>Organized payload manifests, matched digital store delivery invoices, and executed safe cargo loading/unloading protocols.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Education History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education & Background</Text>
          {profile.education && profile.education.length > 0 ? (
            profile.education.map((edu, idx) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <Text style={styles.schoolName}>{edu.institution}</Text>
                <Text style={styles.schoolDegree}>{edu.degree} — Completed {edu.year}</Text>
              </View>
            ))
          ) : (
            <View>
              <Text style={styles.schoolName}>Maryland Secondary Education</Text>
              <Text style={styles.schoolDegree}>High School Diploma / General Equivalency — Clean Background & Clean MVR Status</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
