import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import * as faceapi from 'face-api.js';
import './TryOn3D.css';

const TryOn3D = () => {
  const location = useLocation();
  const products = location.state?.products || [];

  const [image, setImage] = useState(null);
  const [selectedSpecs, setSelectedSpecs] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
        console.log("Models loaded successfully.");
      } catch (error) {
        console.error("Error loading models: ", error);
      }
    };
    loadModels();
  }, []);

  const handleStartCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(err => {
        console.error("Error accessing the camera: ", err);
      });
  };

  const handleCapturePhoto = async () => {
    if (!modelsLoaded) {
      console.error("Models are not loaded yet.");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png');
      setImage(imageData);
      setDetecting(true);

      const img = new Image();
      img.src = imageData;
      img.onload = async () => {
        try {
          const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
          setDetecting(false);
          if (detections.length > 0) {
            const { leftEye, rightEye } = detections[0].landmarks.getLeftEyeRightEye();
            overlaySpecs(leftEye, rightEye);
          }
        } catch (error) {
          console.error("Error during face detection: ", error);
          setDetecting(false);
        }
      };
    } else {
      console.error("Canvas or video is not available");
    }
  };

  const overlaySpecs = (leftEye, rightEye) => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;

    if (overlay && canvas && selectedSpecs) {
      const context = canvas.getContext('2d');
      const specsImage = new Image();
      specsImage.src = selectedSpecs;
      specsImage.onload = () => {
        const eyeWidth = rightEye[0].x - leftEye[0].x;
        const eyeHeight = (eyeWidth / specsImage.width) * specsImage.height;
        const x = leftEye[0].x;
        const y = leftEye[0].y - eyeHeight / 2;
        context.drawImage(specsImage, x, y, eyeWidth, eyeHeight);
      };
    }
  };

  const handleSelectSpecs = (specsUrl) => {
    setSelectedSpecs(specsUrl);
  };

  return (
    <div className="tryon3d-page">
      <h1>Try on 3D</h1>
      <div className="camera-section">
        <video ref={videoRef} className="camera-video" />
        <button onClick={handleStartCamera}>Start Camera</button>
        <button onClick={handleCapturePhoto} disabled={detecting}>Capture Photo</button>
        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
      </div>
      {image && (
        <div className="result-section">
          <h2>Your Photo</h2>
          <div className="photo-container">
            <img ref={overlayRef} src={image} alt="Captured" className="captured-image" />
          </div>
        </div>
      )}
      <div className="product-grid">
        <h2>Select Spectacles</h2>
        {products.map(product => (
          <div key={product.id} className="product-card" onClick={() => handleSelectSpecs(product.imageUrl)}>
            <img src={product.imageUrl} alt={product.name} />
            <h2>{product.name}</h2>
            <p>{product.price}</p>
            <p>{product.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

TryOn3D.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      products: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          price: PropTypes.string.isRequired,
          details: PropTypes.string.isRequired,
          imageUrl: PropTypes.string.isRequired,
        })
      ),
    }),
  }).isRequired,
};

export default TryOn3D;
