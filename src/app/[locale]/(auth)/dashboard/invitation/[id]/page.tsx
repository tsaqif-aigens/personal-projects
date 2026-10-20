import { eq } from 'drizzle-orm';
// @ts-ignore
import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';
import { db } from '@/libs/DB';
import { templateSchema } from '@/models/Schema';

export default async function InvitationPage({ params }: { params: { id: string } }) {
  // Fetch specific template from DB
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Template not found</h1>
        <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Return Home</Link>
      </div>
    );
  }

  const result = await db.select().from(templateSchema).where(eq(templateSchema.id, id));
  const template = result[0];

  if (!template) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Template not found</h1>
        <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Return Home</Link>
      </div>
    );
  }

  // Parse sampleData which is stored as JSON
  // In Drizzle, JSON fields are typed as 'unknown', so we cast it for TS safety
  const variables = template.sampleData as Record<string, string>;

  let htmlContent = template.content;

  // Dynamic Replacement
  Object.keys(variables).forEach((key) => {
    const value = variables[key];
    const regex = new RegExp(`{{${key}}}`, 'g');
    htmlContent = htmlContent.replace(regex, value ?? '');
  });

  const cleanHTML = DOMPurify.sanitize(htmlContent);

  return (
    <>
      <nav style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 999 }}>
        <Link
          href="/"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 16px',
            borderRadius: '20px',
            textDecoration: 'none',
            color: '#333',
            fontWeight: 'bold',
          }}
        >
          &larr; Choose Another
        </Link>
      </nav>

      <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
    </>
  );
}
