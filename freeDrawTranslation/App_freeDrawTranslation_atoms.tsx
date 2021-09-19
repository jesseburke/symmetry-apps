import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import { Input } from '@jesseburke/components';

import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { BoundsDataComp } from '@jesseburke/jotai-data-setup';
import { OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';
import { PointDataComp } from '@jesseburke/jotai-data-setup';

//------------------------------------------------------------------------
//
// initial constants

export const halfXSize = 20;
export const halfYSize = 14;
export const gridSize = 100;

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

const initTranslatePoint = { x: 2.0, y: 1.0 };

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

export const drawingAtom = atom(true);

const primAnimAtom = atom(false);

export const animatingAtom = atom(
    (get) => get(primAnimAtom),
    (get, set, val) => {
        //console.log('animatingAtom set called with val = ', val);
        set(primAnimAtom, val);
    }
);

export const curTranslationAtom = atom(initTranslatePoint);

export const totalTranslationAtom = atom({ x: 0.0, y: 0.0 });

export const translateStartPointAtom = atom(initTranslatePoint);
export const translateEndPointAtom = atom((get) => {
    const s = get(translateStartPointAtom);
    const t = get(curTranslationAtom);

    return { x: s.x + t.x, y: s.y + t.y };
});

export const resetAtom = atom(null, (get, set) => {
    set(curTranslationAtom, initTranslatePoint);
    set(totalTranslationAtom, { x: 0, y: 0 });
    set(drawingAtom, true);
});

export const addCurToTotalAtom = atom(null, (get, set) => {
    const ct = get(curTranslationAtom);
    const tt = get(totalTranslationAtom);

    const newTT = { x: ct.x + tt.x, y: ct.y + tt.y };
    set(totalTranslationAtom, newTT);
});

export function CurTranslationComp({ classNameStr = '' }) {
    const [curT, setCurT] = useAtom(curTranslationAtom);

    const xCB = useCallback(
        (value) =>
            setCurT((oldVal) => ({
                ...oldVal,
                x: parseFloat(value)
            })),
        []
    );

    const yCB = useCallback(
        (value) =>
            setCurT((oldVal) => ({
                ...oldVal,
                y: parseFloat(value)
            })),
        []
    );

    return (
        <span className={classNameStr}>
            <Input size={2} initValue={curT.x} onC={xCB} /> ,
            <Input size={2} initValue={curT.y} onC={yCB} />
        </span>
    );
}

export function TotalTranslationComp({ classNameStr = '' }) {
    const [tT, setTT] = useAtom(totalTranslationAtom);

    const xCB = useCallback(
        (value) =>
            setTT((oldVal) => ({
                ...oldVal,
                x: parseFloat(value)
            })),
        []
    );

    const yCB = useCallback(
        (value) =>
            setTT((oldVal) => ({
                ...oldVal,
                y: parseFloat(value)
            })),
        []
    );

    return (
        <span className={classNameStr}>
            <Input size={2} initValue={tT.x} onC={xCB} /> ,
            <Input size={2} initValue={tT.y} onC={yCB} />
        </span>
    );
}
