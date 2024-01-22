import type { ID } from '$utils/types';

type Updater = (v: DynamicCell) => void;

export type DynamicCellMap = Record<ID, DynamicCell>;

export default class DynamicCell {
	x: number;
	y: number;
	hasFocus: boolean;
	isSymmetrical: boolean;
	isInSelectedRowOrColumn: boolean;
	id: string;
	correctValue: string;
	previousValue: string;
	value: string;
	acrossWord: string;
	downWord: string;
	displayNumber: number;
	firstCellInAcrossWordXCoord: number;
	lastCellInAcrossWordXCoord: number;
	firstCellInDownWordYCoord: number;
	lastCellInDownWordYCoord: number;
	updater: Updater | null;

	constructor({ x, y }: { x: number; y: number }) {
		this.x = x;
		this.y = y;
		this.id = `${x}:${y}`;
		this.correctValue = '';
		this.previousValue = '';
		this.value = '';
		this.initStartValues();
		this.isInSelectedRowOrColumn = false;
		this.displayNumber = 0;
		this.acrossWord = '';
		this.downWord = '';
		this.hasFocus = false;
		this.firstCellInAcrossWordXCoord = -1;
		this.lastCellInAcrossWordXCoord = -1;
		this.firstCellInDownWordYCoord = -1;
		this.lastCellInDownWordYCoord = -1;
		this.isSymmetrical = false;
		this.updater = null;
	}

	toggleActive() {}

	setValue(value = '') {
		const lastLetter = value.slice(-1).toUpperCase();
		if (lastLetter === this.previousValue) {
			// use the second to last letter if there is one
			this.value = value.slice(-2, -1).toUpperCase() || this.previousValue;
		} else {
			this.value = value.slice(-1).toUpperCase();
		}
		this.previousValue = this.value;
		this.update();
	}

	// unset value without updating. This should be performed once,
	// at the start of creating the player's puzzle
	setForPlayerMode() {
		this.isInSelectedRowOrColumn = false;
		this.value = '';
	}

	initStartValues() {
		this.value = '';
		this.correctValue = '';
		this.previousValue = '';
		this.displayNumber = 0;
		this.isInSelectedRowOrColumn = false;
		this.acrossWord = '';
		this.downWord = '';
		this.hasFocus = false;
		this.firstCellInAcrossWordXCoord = -1;
		this.lastCellInAcrossWordXCoord = -1;
		this.firstCellInDownWordYCoord = -1;
		this.lastCellInDownWordYCoord = -1;
		this.isSymmetrical = false;
	}

	reset() {
		this.initStartValues();
		this.update();
	}

	subscribe(updater: Updater) {
		this.updater = updater;
	}

	update() {
		if (this.updater) {
			this.updater(this);
		}
	}

	setDisplayNumber(number: number) {
		this.displayNumber = number;
		this.update();
	}

	toggleIsSymmetrical(isSymmetrical = false) {
		this.isSymmetrical = isSymmetrical;
		this.update();
	}

	setFinalValue() {
		this.correctValue = this.value;
		this.update();
	}

	enableFocus() {
		if (!this.hasFocus) {
			this.hasFocus = true;
			this.update();
		}
	}

	disableFocus() {
		if (this.hasFocus) {
			this.hasFocus = false;
			this.update();
		}
	}

	/**
	 *
	 * @param {boolean} isSelected
	 */
	setIsInSelectedRowOrColumn(isSelected: boolean) {
		// Don'e call update unless the value changes; otherwise, we get
		// into an infinite loop!
		if (isSelected !== this.isInSelectedRowOrColumn) {
			this.isInSelectedRowOrColumn = isSelected;
			this.update();
		}
	}

	setAcrossWordData({
		firstCellInAcrossWordXCoord,
		lastCellInAcrossWordXCoord,
		acrossWord
	}: {
		firstCellInAcrossWordXCoord: number;
		lastCellInAcrossWordXCoord: number;
		acrossWord: string;
	}) {
		this.lastCellInAcrossWordXCoord = lastCellInAcrossWordXCoord;
		this.firstCellInAcrossWordXCoord = firstCellInAcrossWordXCoord;
		this.acrossWord = acrossWord;
	}

	setDownWordData({
		firstCellInDownWordYCoord,
		lastCellInDownWordYCoord,
		downWord
	}: {
		firstCellInDownWordYCoord: number;
		lastCellInDownWordYCoord: number;
		downWord: string;
	}) {
		this.lastCellInDownWordYCoord = lastCellInDownWordYCoord;
		this.firstCellInDownWordYCoord = firstCellInDownWordYCoord;
		this.downWord = downWord;
	}
}
