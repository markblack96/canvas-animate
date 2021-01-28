import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';


function App() {
	let [framesStore, setFramesStore] = useState([]); // what we're going to use to hold our set of frames
	let brushSize = 10;
	let canvasRef = useRef(null);
	let mouseDown = false;
	let imageData = null;
	let color = '#000000';

	useEffect(()=>{
		clearFrame()
	},[])

	function saveFrame() {
		let ctx = canvasRef.current.getContext('2d');
		setFramesStore([...framesStore, ctx.getImageData(0, 0, 640, 480)])
		// framesStore.push(ctx.getImageData(0, 0, 640, 480));
		console.log(framesStore);
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
		ctx.fillStyle = color;
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


	function canvasMouseDown(e) {
		mouseDown = true;
		drawBrush(canvasRef, e.clientX, e.clientY)
	}

	function canvasMouseMove(e) {
		let ctx = canvasRef.current.getContext('2d');
		if (imageData === null) {
			imageData = ctx.getImageData(0, 0, 600, 480);
		} else {
			ctx.putImageData(imageData, 0, 0)
		}
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
		let ctx = canvasRef.current.getContext('2d');
		console.log(e)
		let delta = e.deltaY;
		if (delta > 0) {
			brushSize -= 1;
		} else {
			// assume delta was < 0
			brushSize += 1;
		}

		if (imageData !== null) {
			ctx.putImageData(imageData, 0, 0)
		} else {
			imageData = ctx.getImageData(0, 0, 600, 480);
		}
		drawPhantomBrush(canvasRef, e.clientX, e.clientY);
	}
	function changeColor(e) {
		console.log(e.target.value);
		color = e.target.value;
	}
	function clearFrame() {
		let ctx = canvasRef.current.getContext('2d');
		ctx.save()
		ctx.fillStyle = '#ffffff'
		ctx.fillRect(0, 0, 600, 480)
		ctx.restore()
		imageData = ctx.getImageData(0, 0, 600, 480);
	}
	/*
	let previews = framesStore.map((f, i)=>{
		let src = canvasRef.current.toDataURL("image/png");
		return <img src={src} key={i}/>
	})
	*/
	return (<div id="app">
		<canvas 
			onClick={canvasClick} 
			onMouseDown={canvasMouseDown}
			onMouseMove={canvasMouseMove}
			onMouseUp={canvasMouseUp}
			onWheel={changeBrushSize}
			ref={canvasRef} id="active-frame" width="600" height="480">
		</canvas>
		<div id="controls">
			<button onClick={clearFrame}>Clear</button>
			<button onClick={saveFrame}>Save Frame</button>
			<input onChange={changeColor} type="color"/>
		</div>
	</div>)
}

ReactDOM.render(
	<App/>,
	document.querySelector('#root')
)