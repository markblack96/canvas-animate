/**
 * Used to display a preview image
 */
import React from 'react';

export default function ImageOutput(imageSrc) {
    // imageSrc: prop passed in by App, represents data (base64) from successful fetch to /export
    return (
        <div id="image-output">
            <h3>Image Output</h3>
            <img src={String(imageSrc.src)}/>
        </div>
    )
}