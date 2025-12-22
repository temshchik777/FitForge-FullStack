import React from "react";

interface MainBackgroundImageProps {
    className?: string;
}

export const MainBackgroundImage: React.FC<MainBackgroundImageProps> = ({ className = "" }) => {
    return (
        <img
            src="/public/AppBackgroundImage.png"
            alt="App Background"
            className={`pointer-events-none select-none object-cover w-full h-full ${className}`}
            draggable={false}
        />
    );
};
