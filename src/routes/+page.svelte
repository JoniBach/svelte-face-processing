<script>
	import { createThreeDScene } from '$lib/ThreeDScene.js';
	import { onMount } from 'svelte';

	let canvas;

	onMount(() => {
		createThreeDScene({
			canvas, // Use the existing canvas from Svelte
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0x202020
		});
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
	}
	canvas {
		display: block;
		width: 100vw;
		height: 100vh;
	}
</style>
