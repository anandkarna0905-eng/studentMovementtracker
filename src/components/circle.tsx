
'use client';
import {useEffect, useState} from 'react';
import {useMap} from '@vis.gl/react-google-maps';

type CircleProps = {
    center: google.maps.LatLngLiteral;
    radius: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    fillColor?: string;
    fillOpacity?: number;
};

export const Circle = (props: CircleProps) => {
    const map = useMap();
    const [circle, setCircle] = useState<google.maps.Circle | null>(null);

    useEffect(() => {
        if (!map) return;
        if (!circle) {
            setCircle(new google.maps.Circle({...props, map}));
        } else {
            circle.setOptions(props)
        }
        return () => {
            if (circle) {
                circle.setMap(null);
            }
        }
    }, [map, circle, props]);

    return null;
}
