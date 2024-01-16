import { writable } from 'svelte/store';
import type { Puzzle } from '$utils/types';

const puzzle: Puzzle = {
	_id: 'abcdefg',
	title: 'Store Title',
	authorEmail: 'me@aol.com',
	dateCreated: 'January 15',
	publishStatus: 'draft',
	puzzleType: 'daily',
	grid: {
		acrossSpan: 15,
		downSpan: 15,
		cellMap: {
			'0:0': {
				x: 0,
				y: 0,
				id: '0:0',
				correctValue: 'L',
				value: '',
				displayNumber: 1
			},
			'1:0': {
				x: 1,
				y: 0,
				id: '1:0',
				correctValue: 'I',
				value: '',
				displayNumber: 2
			},
			'2:0': {
				x: 2,
				y: 0,
				id: '2:0',
				correctValue: 'P',
				value: '',
				displayNumber: 3
			},
			'0:1': {
				x: 0,
				y: 1,
				id: '0:1',
				correctValue: 'A',
				value: '',
				displayNumber: 4
			},
			'1:1': {
				x: 1,
				y: 1,
				id: '1:1',
				correctValue: 'P',
				value: '',
				displayNumber: 0
			},
			'2:1': {
				x: 2,
				y: 1,
				id: '2:1',
				correctValue: 'P',
				value: '',
				displayNumber: 0
			},
			'0:2': {
				x: 0,
				y: 2,
				id: '0:2',
				correctValue: 'S',
				value: '',
				displayNumber: 5
			},
			'1:2': {
				x: 1,
				y: 2,
				id: '1:2',
				correctValue: 'A',
				value: '',
				displayNumber: 0
			},
			'2:2': {
				x: 2,
				y: 2,
				id: '2:2',
				correctValue: 'M',
				value: '',
				displayNumber: 0
			}
		},
		acrossHints: [
			{ displayNumber: '1', hint: 'Sass', answer: 'LIP' },
			{
				displayNumber: '4',
				hint: 'you get it before the entree',
				answer: 'APP'
			},
			{
				displayNumber: '5',
				hint: 'Dr Seuss of this person said, "I am"',
				answer: 'SAM'
			}
		],
		downHints: [
			{ displayNumber: '1', hint: 'The (pl) (sp.)', answer: 'LAS' },
			{
				displayNumber: '2',
				hint: 'Heady Topper, Sip of Sunshine, etc.',
				answer: 'IPA'
			},
			{
				displayNumber: '3',
				hint: 'Quantity of items in a million (abv)',
				answer: 'PPM'
			}
		]
	}
};

const PuzzleStore = writable(puzzle);

export default PuzzleStore;
