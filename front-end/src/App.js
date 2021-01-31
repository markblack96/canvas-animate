import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ImageOutput from './ImageOutput';

function App() {
	let [framesStore, setFramesStore] = useState([]); // what we're going to use to hold our set of frames
	let [exportedImageSrc, setExportedImageSrc] = useState(null);
	let [width, height] = [640, 480];
	let [brushSize, setBrushSize] = useState(10);
	let canvasRef = useRef(null);
	let [mouseDown, setMouseDown] = useState(false);
	let [imageData, setImageData] = useState(null);
	let [color, setColor] = useState('#000000');
	let [activeFrame, setActiveFrame] = useState(0);

	useEffect(()=>{
		clearFrame();
		canvasRef.current.addEventListener('wheel', e=>e.preventDefault()) // prevent scroll behavior on brush resize
	},[])

	function saveFrame() {
		if (imageData !== null) {
			let ctx = canvasRef.current.getContext('2d');
			ctx.putImageData(imageData, 0, 0)
		}
		let src = canvasRef.current.toDataURL();
		frames = framesStore;
		frames[activeFrame] = src;
		setFramesStore(frames)
		setActiveFrame(framesStore.length);
		// setFramesStore([...framesStore, src])
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
		setMouseDown(true);
		drawBrush(canvasRef, e.clientX, e.clientY)
	}

	function canvasMouseMove(e) {
		let ctx = canvasRef.current.getContext('2d');
		if (imageData === null) {
			setImageData(ctx.getImageData(0, 0, width, height));
		} else {
			ctx.putImageData(imageData, 0, 0)
		}
		if (mouseDown) {
			drawBrush(canvasRef, e.clientX, e.clientY)
			setImageData(ctx.getImageData(0, 0, width, height));
		} else {
			// draw a "phantom" rectangle showing where the outlines of the brush would be
			drawPhantomBrush(canvasRef, e.clientX, e.clientY);
		}
	}
	function canvasMouseUp(e) {
		setMouseDown(false);
	}
	function changeBrushSize(e) {
		// increase or decrease brush size with mouse wheel movement
		e.preventDefault();
		e.stopPropagation();
		let ctx = canvasRef.current.getContext('2d');
		let delta = e.deltaY;
		if (delta > 0) {
			setBrushSize(brushSize -= 1);
		} else {
			// assume delta was < 0
			setBrushSize(brushSize += 1);
		}

		if (imageData !== null) {
			ctx.putImageData(imageData, 0, 0)
		} else {
			setImageData(ctx.getImageData(0, 0, width, height));
		}
		drawPhantomBrush(canvasRef, e.clientX, e.clientY);
	}
	function changeColor(e) {
		console.log(e.target.value);
		setColor(e.target.value);
	}

	function clearFrame() {
		let ctx = canvasRef.current.getContext('2d');
		ctx.save()
		ctx.fillStyle = '#ffffff'
		ctx.fillRect(0, 0, width, height)
		ctx.restore()
		setImageData(ctx.getImageData(0, 0, width, height));
	}

	function exportAnimation() {
		fetch('/export', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(framesStore)
		})
		.then(r=>r.json())
		.then(json=>{
			let src = json.data;
			setExportedImageSrc(src);
		})
	}
	function previewClick(e) {
		let frameNumber = e.target.getAttribute('data-key');
		console.log(frameNumber)
		setActiveFrame(parseInt(frameNumber))
		let ctx = canvasRef.current.getContext('2d');
		let temp = new Image();
		temp.src = framesStore[parseInt(frameNumber)];
		ctx.drawImage(temp, 0, 0)
		setImageData(ctx.getImageData(0, 0, width, height))
		temp.remove()
	} 
	let previews = framesStore.map((src, i)=>{
		// scale appropriately
		return (
			<div key={i} data-key={i} className={`frame-preview ${activeFrame === i ? 'active' : null}`} onClick={previewClick}>
				<img data-key={i} src={src} width={width/8} height={height/8}/>
				<p data-key={i}>Frame {i}</p>
			</div>
		)
	})

	return (<div id="app">
		<div id="drawing-board">
			<canvas 
				onClick={canvasClick} 
				onMouseDown={canvasMouseDown}
				onMouseMove={canvasMouseMove}
				onMouseUp={canvasMouseUp}
				onWheel={changeBrushSize}
				onMouseOut={()=>{setMouseDown(false)}}
				ref={canvasRef} id="active-frame" width={width} height={height}>
			</canvas>
			<div id="controls">
				<button onClick={clearFrame}>Clear</button>
				<button onClick={saveFrame}>Save Frame</button>
				<button onClick={exportAnimation}>Export</button>
				<input onChange={changeColor} type="color"/>
			</div>
		</div>
		<div id="previews">
			Frames:
			{previews}
		</div>
		{exportedImageSrc !== null && 
		<ImageOutput src={exportedImageSrc}/>
		}
	</div>)
}

ReactDOM.render(
	<App/>,
	document.querySelector('#root')
)