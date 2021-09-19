import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { atom, useAtom } from 'jotai';

import { MainDataComp } from '@jesseburke/jotai-data-setup';
import { LabelDataComp } from '@jesseburke/jotai-data-setup';
import { FunctionDataComp } from '@jesseburke/jotai-data-setup';
import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { BoundsDataComp } from '@jesseburke/jotai-data-setup';
import { AnimationData } from '@jesseburke/jotai-data-setup';
import { PerspCameraData } from '@jesseburke/jotai-data-setup';
import { OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';
import { LineDataComp, Line2dFactory } from '@jesseburke/jotai-data-setup';

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

export const { pt1Atom: linePointAtom, lineDataAtom, component: LineInputComp } = LineDataComp();
