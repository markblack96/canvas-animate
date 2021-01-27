import React, { useRef } from 'react';
import ReactDOM from 'react-dom';


function App() {
	let framesStore = []; // what we're going to use to hold our set of frames
	let brushSize = 10;
	let canvasRef = useRef(null);
	let currentFrame = null;

	function saveFrame() {
		let ctx = canvasRef.current.getContext('2d');
		console.log(ctx.imageData);
	}
	function drawBrush(canvasRef, x, y) {
		let ctx = canvasRef.current.getContext('2d');
		let offset = (brushSize/2) // offset for making paintbrush appear in the middle of click
		/*
		console.log(`Size: ${brushSize}, Offset: ${offset}`)
		console.log(`X: ${x}, Y: ${y}`)
		*/
		let boundingClientRect = canvasRef.current.getBoundingClientRect();
		x -= boundingClientRect.left;
		y -= boundingClientRect.top;
		ctx.fillRect(x-offset, y-offset, brushSize, brushSize);
	}
	function drawPhantomBrush(canvasRef, x, y) {
		let ctx = canvasRef.current.getContext('2d');
		
		let offset = (brushSize/2) // offset for making paintbrush appear in the middle of click
		let boundingClientRect = canvasRef.current.getBoundingClientRect();
		x -= boundingClientRect.left;
		y -= boundingClientRect.top;

		ctx.strokeRect(x-offset, y-offset, brushSize, brushSize);
	}
	function canvasClick(e) {
		drawBrush(canvasRef, e.clientX, e.clientY)
	}

	let mouseDown = false;

	function canvasMouseDown(e) {
		mouseDown = true;
		drawBrush(canvasRef, e.clientX, e.clientY)
	}
	let imageData = null;

	function canvasMouseMove(e) {
		let ctx = canvasRef.current.getContext('2d');
		if (imageData === null) {
			imageData = ctx.getImageData(0, 0, 600, 480);
		} else {
			ctx.putImageData(imageData, 0, 0)
		}
		console.log(imageData)
		if (mouseDown) {
			drawBrush(canvasRef, e.clientX, e.clientY)
			imageData = ctx.getImageData(0, 0, 600, 480);
		} else {
			// draw a "phantom" rectangle showing where the outlines of the brush would be
			drawPhantomBrush(canvasRef, e.clientX, e.clientY);
		}
	}
	function canvasMouseUp(e) {
		mouseDown = false;
	}
	function changeBrushSize(e) {
		// increase or decrease brush size with mouse wheel movement
		console.log(e)
		let delta = e.deltaY;
		if (delta > 0) {
			brushSize -= 1;
		} else {
			// assume delta was < 0
			brushSize += 1;
		}
	}
	console.log("The thing ran");
	return (<>
		<canvas 
			onClick={canvasClick} 
			onMouseDown={canvasMouseDown}
			onMouseMove={canvasMouseMove}
			onMouseUp={canvasMouseUp}
			onWheel={changeBrushSize}
			ref={canvasRef} id="active-frame" width="600" height="480"></canvas>
		<button onClick={saveFrame}>Save Frame</button>
	</>)
}

ReactDOM.render(
	<App/>,
	document.querySelector('#root')
)