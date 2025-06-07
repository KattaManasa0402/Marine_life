import React from 'react';

const Spinner = ({ size = '8' }) => {
    return (
        <div className="flex justify-center items-center p-4">
            <div className={`w-${size} h-${size} border-[5px] border-t-transparent border-primary rounded-full animate-spin`}></div>
        </div>
    );
};

export default Spinner;