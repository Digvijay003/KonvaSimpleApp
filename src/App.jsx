
import { useEffect, useRef, useState } from 'react'
import './App.css'
import Konva from 'konva';

function App() {
  const [input,setInput]=useState('')
  const [itemCount,setItemCount]=useState(0)
  const [selectedText, setSelectedText] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); 

 
  const stageRef = useRef(null);  
  const layerRef = useRef(null);  // Reference to the layer
  const imageObjRef = useRef(null);
  const transformerRef = useRef(null); 

  const videoRef = useRef(null);  // Reference to the video element
  const videoNodeRef = useRef(null);
  useEffect(() => {
    // Initialize Konva Stage
    const stage = new Konva.Stage({
      container: stageRef.current,  // Reference to HTML element
      width: window.innerWidth / 2,  // Half width for the canvas
      height: window.innerHeight,    // Full height for the canvas
    });

    // Initialize Konva Layer
    const layer = new Konva.Layer();
    stage.add(layer);
    layerRef.current = layer;

    const transformer = new Konva.Transformer();
    layer.add(transformer);
    transformerRef.current = transformer;

    // Video element setup
    const videoElement = document.createElement('video');
    videoElement.src = 'videoplayback.mp4';  // Set your video file path here
    videoElement.crossOrigin = 'anonymous'; // For CORS issues
    videoRef.current = videoElement;

    // Create a Konva Image to hold the video
    const konvaVideo = new Konva.Image({
      x: 300,
      y: 50,
      image: videoElement,
      width: 1200,
      height: window.innerHeight,
      draggable: true,
    });

    videoNodeRef.current = konvaVideo;
    layer.add(konvaVideo);

    // Update the video frame on each tick of the video
    videoElement.addEventListener('play', () => {
      const anim = new Konva.Animation(() => {
        // Redraw the video element on the canvas while it's playing
        layer.batchDraw();
      }, layer);
      anim.start();

      videoElement.addEventListener('pause', () => anim.stop());
    });

    return () => {
      videoElement.removeEventListener('play', () => anim.start());
      videoElement.removeEventListener('pause', () => anim.stop());
    };

  }, []);
  

  const handleFileUpload = (event) => {
    const file = event.target.files[0];  // Get the uploaded file
    const reader = new FileReader();

    reader.onload = () => {
      const imageObj = new window.Image();
      imageObj.src = reader.result;

      imageObj.onload = () => {
        // Calculate position to avoid overlap
        const yOffset = 50 * itemCount;

        // Create Konva Image instance
        const konvaImage = new Konva.Image({
          x: 50,
          y: yOffset,  // Offset vertically based on item count
          image: imageObj,
          width: 150,
          height: 150,
          draggable: true,  // Allow dragging the image
        });
        konvaImage.on('click', () => {
          transformerRef.current.nodes([konvaImage]);  // Attach the transformer to the clicked image
          layerRef.current.batchDraw();
        });

        // Add image to the layer and redraw
        layerRef.current.add(konvaImage);
        layerRef.current.batchDraw();  // Use batchDraw to avoid overwriting

        // Increment item count to avoid overlap for future elements
        setItemCount(itemCount + 1);
      };
    };

    if (file) {
      reader.readAsDataURL(file);  // Read the file as a data URL
    }
  };
  const handleAddText = () => {
    // Calculate position to avoid overlap
    const yOffset = 50 * itemCount;

    // Create Konva Text instance
    const konvaText = new Konva.Text({
      x: 200,  // Positioned differently than the image to avoid overlap
      y: yOffset,
      text: input,  // Set the text from input
      fontSize: 24,
      fontFamily: 'Calibri',
      fill: 'black',
      draggable: true,  // Allow dragging the text
    });

    // Add text to the layer and redraw
    layerRef.current.add(konvaText);
    layerRef.current.batchDraw();  // Use batchDraw to avoid overwriting
    konvaText.on('click', () => {
      transformerRef.current.nodes([konvaText]);  // Attach the transformer to the clicked text
      layerRef.current.batchDraw();
      setSelectedText(konvaText);
    });

    // Increment item count to avoid overlap for future elements
    setItemCount(itemCount + 1);
    setInput('')
  };
  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };
  const handleToggleVideo = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying); // Toggle the playing state
  };

  // Pause video
  const handlePauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const moveText = (dx, dy) => {
    if (selectedText) {
      const newX = selectedText.x() + dx;
      const newY = selectedText.y() + dy;
      selectedText.position({ x: newX, y: newY });
      layerRef.current.batchDraw();
    }
  };
  const handleRemoveText = () => {
    if (selectedText) {
      selectedText.destroy(); // Remove the text from the layer
      transformerRef.current.nodes([]); // Clear transformer nodes
      layerRef.current.batchDraw(); // Redraw the layer
      setSelectedText(null); // Clear selected text state
    }
  };
 

  return (
    <div className='container'>
    
    <div className='controls'>
      <input value={input}onChange={e=>setInput(e.target.value)}/>
      <button onClick={handleAddText}>Add text</button>
      <button onClick={handleRemoveText}>Remove Text</button>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      <div>

     
      <button onClick={handlePlayVideo}>Play</button>
      <button onClick={handlePauseVideo}>Stop</button><br/><br/>
      <button onClick={() => moveText(0, -10)}>Move Up</button>
        <button onClick={() => moveText(0, 10)}>Move Down</button>
        <button onClick={() => moveText(-10, 0)}>Move Left</button>
        <button onClick={() => moveText(10, 0)}>Move Right</button>
        <button onClick={handleToggleVideo}>{isPlaying ? 'Pause Video' : 'Play Video'}</button>
      </div>
    </div>
    <div className='canvas-container'ref={stageRef}>

    </div>
    </div>
  )
}

export default App
