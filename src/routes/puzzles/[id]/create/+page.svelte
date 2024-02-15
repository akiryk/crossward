<script lang="ts">
	// [id]/create/page.svelte
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { LoadData } from './+page.server.ts';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import GameStore from '../../../../stores/GameStore';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import PuzzleForm from '$lib/crossword/PuzzleForm.svelte';
	import HintsForm from '$lib/crossword/HintsForm.svelte';
	import EditPuzzleModalContent from '$lib/crossword/EditPuzzleModalContent.svelte';
	import { UserMode, type EditorPuzzle, type ID } from '$utils/types';
	import Modal from '$components/Modal.svelte';
	import type { ActionData } from './$types.js';
	import {
		getActiveCellIdsFromCellMap,
		togglePreview,
		validateGridIsReadyForHints,
		createHints,
		saveCellMap
	} from './editGridHelpers';
	import {
		saveAcrossHintInput,
		saveDownHintInput,
		revertToGrid,
		publish,
		validatePuzzleCanBePublished
	} from './editHintHelpers';
	import { EDIT_PUZZLE, REVERT_TO_GRID, PUBLISH_PUZZLE, MISSING_HINTS } from '$utils/constants';

	export let puzzle: EditorPuzzle;
	export let data: LoadData;
	export let isCreateSuccess: boolean;

	export let form: ActionData;

	let errorMessage: string = '';
	let lastSavedAtMessage: string = '';
	let isPreview = false;
	let showModal = false;
	let modalContentType = '';
	let percentOfCompleteCells: string;
	let userMode: UserMode;
	let showLinkToPlayPage = false;
	let successMessage: string = '';
	let showHintErrors: boolean = false;

	$: ({ puzzle, isCreateSuccess } = data);

	$: onMount(() => {
		if (puzzle) {
			userMode =
				puzzle.publishStatus === EDIT_PUZZLE ? UserMode.EDITING_CELLS : UserMode.EDITING_HINTS;
			PuzzleStore.set(puzzle);
			const cellMap = puzzle.cellMap;
			const activeCellIds: Array<ID> = getActiveCellIdsFromCellMap(cellMap);

			GameStore.update((current) => {
				return {
					...current,
					activeCellIds
				};
			});
		}
	});

	// Store Subscriptions

	const unsubscribePuzzleStore = PuzzleStore.subscribe((data) => {
		if (data) {
			puzzle = data;
		}
	});

	onDestroy(() => {
		unsubscribePuzzleStore();
	});

	const handleTogglePreview = (event: Event) => {
		isPreview = togglePreview({
			event,
			puzzle
		});
	};

	async function handleValidateGridIsReadyForHints() {
		const validation = await validateGridIsReadyForHints(puzzle);
		if (validation.showModal && validation.modalContentType) {
			showModal = true;
			modalContentType = validation.modalContentType;
			percentOfCompleteCells = validation.percentOfCompleteCells || '';
			return;
		}
		handleSaveGridAndCreateHints();
	}

	const handleSaveCellMap = async () => {
		if (!puzzle) {
			return;
		}
		const response = await saveCellMap({ puzzle, isPreview });
		if (response.errors.length > 0) {
			errorMessage = 'We had a problem saving your data. Perhaps try again later.';
		} else {
			lastSavedAtMessage = response.success;
		}
	};

	const updateUIWithSavedHintStatus = (response: { errors: string[]; successMessage: string }) => {
		if (response.errors.length > 0) {
			errorMessage = 'We had a problem saving your data. Perhaps try again later.';
		} else {
			lastSavedAtMessage = response.successMessage;
		}
	};

	const handleAcrossHintInput = async () => {
		const response = await saveAcrossHintInput(puzzle);
		updateUIWithSavedHintStatus(response);
	};

	const handleDownHintInput = async () => {
		const response = await saveDownHintInput(puzzle);
		updateUIWithSavedHintStatus(response);
	};

	const handleSaveHints = async () => {
		await handleDownHintInput();
		await handleAcrossHintInput();
	};

	const handleSubmit = () => {
		handleSaveCellMap();
	};

	const handleInput = () => {
		handleSaveCellMap();
		if (userMode === UserMode.EDITING_HINTS) {
			handleSaveHints();
		}
	};

	const handleCloseModal = () => (showModal = false);

	const handleRevertToGrid = async () => {
		const response = await revertToGrid(puzzle);
		if (response.success && response.cellMap) {
			puzzle.cellMap = response.cellMap;
			puzzle.acrossHints = [];
			puzzle.downHints = [];
			PuzzleStore.set(puzzle);
			userMode = UserMode.EDITING_CELLS;
		}
	};

	const handlePublish = async () => {
		const response = await publish(puzzle);
		if (response.success) {
			goto(`/?newPuzzle=true&newPuzzleId=${puzzle._id}`);
		}
		if (response.error) {
			errorMessage = response.error;
		}
	};

	const handleConfirmReturnToEditGrid = () => {
		showModal = true;
		modalContentType = REVERT_TO_GRID;
	};

	const handleConfirmPublish = () => {
		const { isValid } = validatePuzzleCanBePublished(puzzle);
		if (isValid) {
			showModal = true;
			modalContentType = PUBLISH_PUZZLE;
		} else {
			showModal = true;
			modalContentType = MISSING_HINTS;
			showHintErrors = true;
		}
	};

	async function handleSaveGridAndCreateHints() {
		await handleSaveCellMap();
		const result = await createHints(puzzle);
		if (result?.success) {
			userMode = UserMode.EDITING_HINTS;
			puzzle.acrossHints = result.data.acrossHints;
			puzzle.downHints = result.data.downHints;
			puzzle.cellMap = result.data.cellMap;
			puzzle.cellRows = result.data.cellRows;
			PuzzleStore.set(puzzle);
		} else {
			errorMessage = result?.message || '';
		}
	}

	function handleResetErrorMessage() {
		errorMessage = '';
	}
</script>

<PuzzleHeading
	isCreateSuccess={isCreateSuccess ? true : false}
	puzzleType={puzzle.puzzleType}
	{userMode}
	title={puzzle.title}
	{lastSavedAtMessage}
/>
{#if puzzle}
	<PuzzleForm
		onSubmit={handleSubmit}
		onInput={handleInput}
		onValidateGridIsReadyForHints={handleValidateGridIsReadyForHints}
		onTogglePreview={handleTogglePreview}
		id={puzzle._id}
		cellMap={puzzle.cellMap}
		{isPreview}
		{userMode}
		{errorMessage}
		onResetErrorMessage={handleResetErrorMessage}
	/>
{/if}
{#if userMode === UserMode.EDITING_HINTS}
	<HintsForm
		{puzzle}
		onAcrossHintInput={handleAcrossHintInput}
		onDownHintInput={handleDownHintInput}
		onConfirmPublish={handleConfirmPublish}
		onConfirmRevertToGrid={handleConfirmReturnToEditGrid}
		onSaveHints={handleSaveHints}
		{errorMessage}
		{successMessage}
		{showLinkToPlayPage}
		onResetErrorMessage={handleResetErrorMessage}
		{showHintErrors}
	/>
{/if}

<hr class="my-10" />
<EditPuzzleTitle {form} title={puzzle.title} id={puzzle._id} />
<Modal bind:showModal>
	<EditPuzzleModalContent
		onPublish={handlePublish}
		onRevertToGrid={handleRevertToGrid}
		onCloseModal={handleCloseModal}
		onSaveGridAndCreateHints={handleSaveGridAndCreateHints}
		{percentOfCompleteCells}
		{modalContentType}
	/>
</Modal>
