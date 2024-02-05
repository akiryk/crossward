export const clickOutside = (node: HTMLDivElement, { callback }: { callback: () => void }) => {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node) && !event.defaultPrevented) {
			callback();
		}
	};

	function update() {
		document.addEventListener('click', handleClick, true); // Use capture phase
	}

	update();

	return {
		update,
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
};
