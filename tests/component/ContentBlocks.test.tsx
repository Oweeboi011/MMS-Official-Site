import { fireEvent, render, screen } from '@testing-library/react';
import ContentBlocks from '../../src/components/ContentBlocks';
import type { ContentBlock } from '../../src/data/subpages';

const rows = Array.from({ length: 45 }, (_, i) => [`Peak ${i + 1}`, `${3000 - i} MASL`]);

describe('ContentBlocks', () => {
  it('renders every block type with its heading', () => {
    const blocks: ContentBlock[] = [
      { type: 'text', title: 'Text block', paragraphs: ['Hello'] },
      { type: 'stats', title: 'Stats block', items: [{ value: '1', label: 'One' }] },
      { type: 'cards', title: 'Cards block', items: [{ title: 'Card', description: 'D' }] },
      { type: 'steps', title: 'Steps block', items: [{ title: 'Step', description: 'D' }] },
      { type: 'table', title: 'Table block', columns: ['A'], rows: [['a']] },
      { type: 'timeline', title: 'Timeline block', items: [{ year: '1994', title: 'Founded', description: 'D' }] },
      { type: 'people', title: 'People block', items: [{ role: 'President', name: 'N' }] },
      { type: 'quotes', title: 'Quotes block', items: [{ quote: 'Q', name: 'N', meta: 'M' }] },
      { type: 'checklist', title: 'Checklist block', items: ['Item'] },
    ];
    render(<ContentBlocks blocks={blocks} />);
    blocks.forEach((b) => expect(screen.getByRole('heading', { name: b.title })).toBeInTheDocument());
  });

  it('shows all rows and no pager without pageSize', () => {
    render(<ContentBlocks blocks={[{ type: 'table', columns: ['Name', 'Elevation'], rows }]} />);
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1);
    expect(screen.queryByRole('navigation', { name: 'Table pages' })).not.toBeInTheDocument();
  });

  it('pages rows and disables prev/next at the ends', () => {
    render(<ContentBlocks blocks={[{ type: 'table', columns: ['Name', 'Elevation'], rows, pageSize: 20 }]} />);
    expect(screen.getByText('1–20 of 45')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByText('41–45 of 45')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(5 + 1);
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'true');
  });

  it('starts a new table at page 1 (no page carried over after navigating)', () => {
    const { rerender } = render(<ContentBlocks blocks={[{ type: 'table', columns: ['Name', 'Elevation'], rows, pageSize: 20 }]} />);
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    rerender(<ContentBlocks blocks={[{ type: 'table', columns: ['Name', 'Elevation'], rows: rows.slice(0, 3) }]} />);
    expect(screen.getAllByRole('row')).toHaveLength(3 + 1);
  });

  it('treats pageSize 0 and empty rows as a single page', () => {
    render(<ContentBlocks blocks={[{ type: 'table', columns: ['A'], rows, pageSize: 0 }, { type: 'table', columns: ['B'], rows: [] }]} />);
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 2);
    expect(screen.queryByRole('navigation', { name: 'Table pages' })).not.toBeInTheDocument();
  });
});
