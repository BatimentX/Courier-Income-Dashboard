import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1f2c',
    lineHeight: 1.6,
  },
  senderBlock: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  senderContact: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
  },
  date: {
    marginBottom: 20,
    color: '#475569',
  },
  recipientBlock: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  recipientName: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  recipientCompany: {
    color: '#475569',
    marginTop: 1,
  },
  subject: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#2b3e6b',
    textTransform: 'uppercase',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
  },
  bodyParagraph: {
    marginBottom: 12,
    textAlign: 'justify',
    color: '#334155',
  },
  signOff: {
    marginTop: 25,
  },
  signatureName: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
  }
});

interface CoverLetterTemplateProps {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;
  recipientName: string;
  recipientCompany: string;
  recipientLocation: string;
  dateStr: string;
  subjectLine: string;
  letterBody: string;
}

export const CoverLetterTemplate: React.FC<CoverLetterTemplateProps> = ({
  senderName,
  senderAddress,
  senderPhone,
  senderEmail,
  recipientName,
  recipientCompany,
  recipientLocation,
  dateStr,
  subjectLine,
  letterBody,
}) => {
  // Parse body text into individual paragraphs
  // Split by double newline or multiple spaces/newlines
  const paragraphs = letterBody
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  // If the body starts with header info (e.g. from generated raw string), skip until the greeting
  let salutationIndex = paragraphs.findIndex(p => p.startsWith('Dear'));
  let finalParagraphs = paragraphs;
  if (salutationIndex !== -1) {
    // Slice off any duplicate headers in generated text
    finalParagraphs = paragraphs.slice(salutationIndex);
  }

  const salutation = finalParagraphs[0] || 'Dear Hiring Team,';
  const bodyTexts = finalParagraphs.slice(1, finalParagraphs.length - 1);
  const closing = finalParagraphs[finalParagraphs.length - 1] || 'Sincerely,';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sender details */}
        <View style={styles.senderBlock}>
          <Text style={styles.senderName}>{senderName}</Text>
          <Text style={styles.senderContact}>{senderAddress}</Text>
          <Text style={styles.senderContact}>{senderPhone} | {senderEmail}</Text>
        </View>

        {/* Date */}
        <Text style={styles.date}>{dateStr}</Text>

        {/* Recipient details */}
        <View style={styles.recipientBlock}>
          <Text style={styles.recipientName}>{recipientName || 'Hiring Coordinator'}</Text>
          <Text style={styles.recipientCompany}>{recipientCompany}</Text>
          <Text style={styles.senderContact}>{recipientLocation}</Text>
        </View>

        {/* Subject */}
        <Text style={styles.subject}>{subjectLine}</Text>

        {/* Salutation */}
        <Text style={[styles.bodyParagraph, { fontWeight: 'bold' }]}>{salutation}</Text>

        {/* Body Paragraphs */}
        {bodyTexts.map((paragraphText, idx) => {
          // If paragraph is a sign off or greeting, handle separately
          if (paragraphText.startsWith('Sincerely') || paragraphText.startsWith('Best regards')) {
            return null;
          }
          return (
            <Text key={idx} style={styles.bodyParagraph}>
              {paragraphText}
            </Text>
          );
        })}

        {/* Closing */}
        <View style={styles.signOff}>
          <Text style={styles.bodyParagraph}>{closing.includes('Sincerely') ? 'Sincerely,' : closing}</Text>
          <Text style={styles.signatureName}>{senderName}</Text>
        </View>
      </Page>
    </Document>
  );
};
