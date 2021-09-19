import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import { Input } from '@jesseburke/components';

import { MainDataComp } from '@jesseburke/jotai-data-setup';
import { LabelDataComp } from '@jesseburke/jotai-data-setup';
import { FunctionDataComp } from '@jesseburke/jotai-data-setup';
import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { BoundsDataComp } from '@jesseburke/jotai-data-setup';
import { AnimationData } from '@jesseburke/jotai-data-setup';
import { PerspCameraData } from '@jesseburke/jotai-data-setup';
import { OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';
import { PointDataComp } from '@jesseburke/jotai-data-setup';

//------------------------------------------------------------------------
//
// initial constants

export const halfXSize = 20;
export const halfYSize = 14;
export const gridSize = 100;

const initOrthographicData = {
    position: [0, 0, 10],
    up: [0, 0, 1],
    //fov: 75,
    near: -1,
    far: 50,
    orthographic: { left: -halfXSize, right: halfXSize, top: halfYSize, bottom: -halfYSize }
};

const initBounds = { xMin: -30, xMax: 30, yMin: -14, yMax: 14 };

const initCameraData = {
    center: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
};

const initAxesData = {
    radius: 0.02,
    show: true,
    showLabels: false,
    tickLabelDistance: 0
};

const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

const colors = {
    tick: '#cf6c28' //#e19662'
};

const tickLabelStyle = Object.assign(Object.assign({}, labelStyle), {
    fontSize: '1.5em',
    color: colors.tick
});

const initRotatePoint = { x: 2.5, y: 0 };

const startingAngle = 30;

const degToRad = (deg) => deg * 0.0174533;

const radToDeg = (rad) => rad * 57.2958;

function normalizeAngleDeg(angle) {
    const newAngle = angle % 360;

    if (newAngle > 180) {
        return newAngle - 360;
    } else if (newAngle < -180) {
        return newAngle + 360;
    }

    return newAngle;
}

function round(x, n = 3) {
    // x = -2.336596841557143

    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}

//------------------------------------------------------------------------
//
// atoms

export const boundsData = BoundsDataComp({
    initBounds
});

export const cameraData = OrthoCameraDataComp(initCameraData);

export const axesData = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});

export const rotatePointData = PointDataComp(initRotatePoint);

export const drawingAtom = atom(true);

export const curAngleAtom = atom(degToRad(startingAngle));

export const totalRotationAtom = atom(0.0);

const atomStoreAtom = atom({
    bd: boundsData.readWriteAtom,
    cd: cameraData.readWriteAtom,
    ad: axesData.readWriteAtom
});

//export const DataComp = MainDataComp(atomStoreAtom);

export function CurAngleComp({ classNameStr = '' }) {
    const [curAngle, setCurAngle] = useAtom(curAngleAtom);

    const curAngleCB = useCallback((value) => {
        setCurAngle(degToRad(normalizeAngleDeg(eval(value))));
    }, []);

    return (
        <span className={classNameStr}>
            <Input size={4} initValue={round(radToDeg(curAngle), 2)} onC={curAngleCB} />
            {`\u{00B0}`}
        </span>
    );
}

export function TotalRotationComp({ classNameStr = '' }) {
    const [tr, setTR] = useAtom(totalRotationAtom);

    const TRCB = useCallback((value) => {
        setTR(degToRad(normalizeAngleDeg(eval(value))));
    }, []);

    return (
        <span className={classNameStr}>
            <Input size={4} initValue={round(radToDeg(tr), 2)} onC={TRCB} />
            {`\u{00B0}`}
        </span>
    );
}
