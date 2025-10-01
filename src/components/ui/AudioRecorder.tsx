'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export default function AudioRecorder({ onAudioRecorded, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSendRecording = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onAudioRecorded(audioBlob);
    }
  };

  const handleDeleteRecording = () => {
    setAudioURL(null);
    audioChunksRef.current = [];
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-secondary rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mic className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">Voice Message</span>
        </div>
        <button
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Cancel
        </button>
      </div>

      {!audioURL ? (
        <div className="space-y-3">
          {/* Recording controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 animate-pulse"
              >
                <Square className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Recording timer */}
          {isRecording && (
            <div className="text-center">
              <div className="text-2xl font-mono text-foreground">{formatTime(recordingTime)}</div>
              <p className="text-sm text-muted-foreground">Recording...</p>
            </div>
          )}

          {!isRecording && recordingTime === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Tap the microphone to start recording
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Audio playback */}
          <audio src={audioURL} controls className="w-full" />
          
          <div className="text-center text-sm text-muted-foreground">
            Duration: {formatTime(recordingTime)}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={handleDeleteRecording}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={handleSendRecording}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
            >
              <Mic className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

