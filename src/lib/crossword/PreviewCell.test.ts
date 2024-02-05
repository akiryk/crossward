import { it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import PreviewCell from '$lib/crossword/PreviewCell.svelte';

describe('PreviewCell', () => {
	it('Displays value passed by prop', () => {
		const { queryByText } = render(PreviewCell, { value: 'A' });
		expect(queryByText('A')).toBeInTheDocument();
	});

	it('Does not display other values', () => {
		const { queryByText, queryByTestId } = render(PreviewCell, { value: 'A' });
		expect(queryByText('X')).not.toBeInTheDocument();
		expect(queryByTestId('displayNumber')).not.toBeInTheDocument();
	});

	it('Shows displayNumber if present', () => {
		const { queryByTestId, queryByText } = render(PreviewCell, { value: 'A', displayNumber: 12 });
		expect(queryByTestId('displayNumber')).toBeInTheDocument();
		expect(queryByText(12)).toBeInTheDocument();
	});
});
