import React, { useState, useEffect, useRef } from 'react';
import { Progress, Button, Alert, Card, Typography, Space } from 'antd';

const { Title, Text } = Typography;

const StepCounter = ({ goal = 10000, onStepUpdate }) => {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const prevAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const stepDetectionThreshold = 1.2; // Threshold for detecting a step
  const stepCooldown = useRef(false);
  const stepCooldownTime = 300; // Cooldown in ms to prevent counting multiple steps

  // Check if device motion API is available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.DeviceMotionEvent) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
        setError('Device motion sensors are not available on this device');
      }
    }

    return () => {
      if (isActive) {
        stopTracking();
      }
    };
  }, []);

  // Notify parent component when steps change
  useEffect(() => {
    if (onStepUpdate && typeof onStepUpdate === 'function') {
      onStepUpdate(steps);
    }
  }, [steps, onStepUpdate]);

  const handleMotion = (event) => {
    if (stepCooldown.current) return;
    
    const { accelerationIncludingGravity } = event;
    
    if (!accelerationIncludingGravity) return;
    
    const { x, y, z } = accelerationIncludingGravity;
    const prev = prevAcceleration.current;
    
    // Calculate magnitude of acceleration change
    const deltaAccel = Math.sqrt(
      Math.pow(x - prev.x, 2) + 
      Math.pow(y - prev.y, 2) + 
      Math.pow(z - prev.z, 2)
    );
    
    // Detect step based on threshold
    if (deltaAccel > stepDetectionThreshold) {
      setSteps(prevSteps => prevSteps + 1);
      
      // Set cooldown to prevent multiple step counts for a single step
      stepCooldown.current = true;
      setTimeout(() => {
        stepCooldown.current = false;
      }, stepCooldownTime);
    }
    
    // Update previous acceleration values
    prevAcceleration.current = { x, y, z };
  };

  const startTracking = async () => {
    if (!isAvailable) return;
    
    try {
      // Request permission for iOS 13+ devices
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState !== 'granted') {
          setError('Permission to access motion sensors was denied');
          return;
        }
      }
      
      window.addEventListener('devicemotion', handleMotion);
      setIsActive(true);
      setError(null);
    } catch (error) {
      console.error('Error starting step counter:', error);
      setError(`Failed to start step tracking: ${error.message}`);
    }
  };

  const stopTracking = () => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsActive(false);
  };

  const resetSteps = () => {
    setSteps(0);
  };

  const calculatePercentage = () => {
    return Math.min((steps / goal) * 100, 100);
  };

  return (
    <Card className="step-counter" style={{ marginBottom: 20 }}>
      <Title level={4}>Step Counter</Title>
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {isAvailable === false && (
        <Alert
          message="Device Not Supported"
          description="Step tracking requires motion sensors which are not available on this device."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <div className="step-display" style={{ marginBottom: 16, textAlign: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>{steps.toLocaleString()}</Title>
        <Text type="secondary">of {goal.toLocaleString()} steps</Text>
      </div>
      
      <div className="progress-container" style={{ marginBottom: 16 }}>
        <Progress 
          percent={calculatePercentage()} 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          size="small"
        />
      </div>
      
      <div className="controls" style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        <Space>
          {!isActive ? (
            <Button
              type="primary"
              onClick={startTracking}
              disabled={!isAvailable}
            >
              Start Tracking
            </Button>
          ) : (
            <Button
              onClick={stopTracking}
              danger
            >
              Stop Tracking
            </Button>
          )}
          <Button onClick={resetSteps}>Reset</Button>
        </Space>
      </div>
    </Card>
  );
};

export default StepCounter;

