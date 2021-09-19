import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';

import { ThreeSceneComp } from '@jesseburke/three-scene-with-react';
import { Grid } from '@jesseburke/three-scene-with-react';
import { Arrow } from '@jesseburke/three-scene-with-react';
import { Axes2D } from '@jesseburke/three-scene-with-react';
import { ClickablePlaneComp } from '@jesseburke/three-scene-with-react';
import { FreeDrawComp } from '@jesseburke/three-scene-with-react';
import { GraphDrawComp } from '@jesseburke/three-scene-with-react';
import { TranslateAnimWrapper } from '@jesseburke/three-scene-with-react';

import { Button } from '@jesseburke/components';

import { Route, Link } from '@jesseburke/wouter-minimal-fork';

import {
    boundsData,
    axesData,
    drawingAtom,
    animatingAtom,
    totalTranslationAtom,
    CurTranslationComp,
    TotalTranslationComp,
    translateStartPointAtom,
    translateEndPointAtom,
    resetAtom,
    addCurToTotalAtom
} from './App_graphDrawTranslation_atoms';

const aspectRatio = window.innerWidth / window.innerHeight;

const fixedCameraData = {
    up: [0, 1, 0],
    near: 0.1,
    far: 100,
    aspectRatio,
    orthographic: true
};

const initControlsData = {
    enabled: false
};

const translateBoxCss =
    'absolute top-10 left-10 p-4 flex flex-col justify-between content-between items-center select-none border-black rounded-md border-2';

export default function App() {
    const setDrawing = useAtom(drawingAtom)[1];

    const resetCB = useAtom(resetAtom)[1];

    const addCurToTotal = useAtom(addCurToTotalAtom)[1];
    const translateCB = useCallback(() => {
        addCurToTotal();
    }, [addCurToTotal]);

    return (
        <div className='full-screen-base'>
            <ThreeSceneComp fixedCameraData={fixedCameraData} controlsData={initControlsData}>
                <Axes2D
                    tickDistance={1}
                    boundsAtom={boundsData.atom}
                    axesDataAtom={axesData.atom}
                />
                <Grid boundsAtom={boundsData.atom} gridShow={true} />
                <TranslateAnimWrapper
                    translationAtom={totalTranslationAtom}
                    animatingAtom={animatingAtom}
                >
                    <GraphDrawComp transforms={[]} activeAtom={drawingAtom} />
                </TranslateAnimWrapper>
                <Arrow
                    startPointAtom={translateStartPointAtom}
                    endPointAtom={translateEndPointAtom}
                    notVisibleAtom={drawingAtom}
                />
                <ClickablePlaneComp
                    clickPointAtom={translateStartPointAtom}
                    pausedAtom={drawingAtom}
                />
            </ThreeSceneComp>
            <Route path='/'>
                <Link href='/not_drawing'>
                    <div className='absolute top-10 left-10'>
                        <Button onClick={() => setDrawing(false)}>Translate Figure</Button>
                    </div>
                </Link>
            </Route>

            <Route path='/not_drawing'>
                <div className={translateBoxCss}>
                    <div className='px-4 py-2 flex justify-around align-baseline'>
                        <span className='m-2'>
                            <Button onClick={translateCB}>Translate</Button>
                        </span>
                        <span className='m-2'> by </span>
                        <CurTranslationComp classNameStr='m-2' />
                    </div>

                    <div className='m-2'>
                        <span className='m-2'>Total translation: </span>
                        <TotalTranslationComp classNameStr='m-2' />
                    </div>
                </div>
                <Link href='/'>
                    <div className='absolute bottom-10 left-6 cursor-pointer'>
                        <Button onClick={resetCB}>Back to drawing</Button>
                    </div>
                </Link>
            </Route>
        </div>
    );
}
