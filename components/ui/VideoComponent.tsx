import React, { memo } from 'react';

interface VideoComponentProps {
  file: File;
}

const VideoComponent: React.FC<VideoComponentProps> = ({ file }) => {
  return (
    <video 
      src={URL.createObjectURL(file)} 
      controls 
      className="max-h-[350px] max-w-full object-contain mb-4"
    />
  );
};

export default memo(VideoComponent);