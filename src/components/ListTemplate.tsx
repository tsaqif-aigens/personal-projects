import Link from 'next/link';
import { db } from '@/libs/DB';
import { templateSchema } from '@/models/Schema';

export const ListTemplate = async () => {
  const allTemplates = await db.select().from(templateSchema);

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your Wedding Template</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>Select a style to get started.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {allTemplates.map(t => (
          <div key={t.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.3s' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t.name}</h2>
            <Link
              href={`/dashboard/invitation/${t.id}`}
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                marginTop: '1rem',
              }}
            >
              Select Template
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
};
