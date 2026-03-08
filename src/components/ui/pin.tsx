
'use client';
import React from 'react';
type PinProps = {
    background?: string,
    borderColor?: string,
    glyphColor?: string,
}
export const Pin = ({background, borderColor, glyphColor}: PinProps) => {
    return <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50% 50% 50% 0',
        background: background,
        border: `2px solid ${borderColor}`,
        transform: 'rotate(-45deg)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: glyphColor,
    }}>
    </div>;
}

    