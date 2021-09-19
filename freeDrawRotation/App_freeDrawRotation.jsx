import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';

import {
    ThreeSceneComp,
    useThreeCBs,
    Grid,
    Axes2D,
    ClickablePlaneComp,
    CircularArrow,
    FreeDrawComp
} from '@jesseburke/three-scene-with-react';

import { Button } from '@jesseburke/components';

import { Route, Link } from '@jesseburke/wouter-minimal-fork';

import { gsapRotate } from '@jesseburke/three-scene-with-react';

import {
    boundsData,
    axesData,
    drawingAtom,
    curAngleAtom,
    totalRotationAtom,
    CurAngleComp,
    TotalRotationComp,
    rotatePointData
} from './App_freeDrawRotation_atoms';

//------------------------------------------------------------------------

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

const rotationDuration = 0.4;

const startingAngle = 30;

const degToRad = (deg) => deg * 0.0174533;

const EPSILON = 0.00001;

const rotateBoxCss =
    'absolute top-10 left-10 p-4 flex flex-col justify-between content-between items-center select-none border-black rounded-md border-2';

//------------------------------------------------------------------------

export default function App() {
    const threeSceneRef = useRef(null);
    const threeCBs = useThreeCBs(threeSceneRef);

    // used for animations
    const meshRef = useRef(null);

    const setDrawing = useAtom(drawingAtom)[1];
    const [animating, setAnimating] = useState(false);

    const [curAngle, setCurAngle] = useAtom(curAngleAtom);
    const [totalRotation, setTotalRotation] = useAtom(totalRotationAtom);

    //------------------------------------------------------------------------

    const resetCB = useCallback(() => {
        setDrawing(true);
        setTotalRotation(0);
        setCurAngle(degToRad(startingAngle));
    }, []);

    const prevTRRef = useRef(0);

    useEffect(() => {
        const delta = totalRotation - prevTRRef.current;

        // this is so same number of hooks are called,
        // because gsapRotate is not calling the onComplete function if
        // delta is too small
        if (Math.abs((delta % 2) * Math.PI) < EPSILON) {
            setAnimating(false);
            setAnimating(false);
            return;
        }

        setAnimating(true);

        if (Math.abs(totalRotation) < EPSILON) {
            gsapRotate({
                mesh: meshRef.current.mainMesh,
                delay: 0,
                duration: rotationDuration,
                quaternion: meshRef.current.fixedMesh.quaternion,
                renderFunc: () => threeCBs.render(),
                clampToEnd: true,
                onStart: () => setAnimating(true),
                onComplete: () => setAnimating(false)
            });
        } else {
            gsapRotate({
                mesh: meshRef.current.mainMesh,
                delay: 0,
                duration: rotationDuration,
                angle: delta,
                renderFunc: () => threeCBs.render(),
                clampToEnd: true,
                onComplete: () => {
                    setAnimating(false);
                }
            });
        }

        prevTRRef.current = totalRotation;
    }, [meshRef, totalRotation]);

    const rotateCB = useCallback(() => {
        if (!meshRef.current.mainMesh || !threeCBs) {
            setAnimating(false);
            setTotalRotation((t) => t);
            setAnimating(false);
            return;
        }

        setAnimating(true);
        setTotalRotation((t) => (t + curAngle) % (2 * Math.PI));

        gsapRotate({
            mesh: meshRef.current.mainMesh,
            delay: 0,
            duration: rotationDuration,
            angle: curAngle,
            renderFunc: () => threeCBs.render(),
            clampToEnd: true,
            onComplete: () => {
                setAnimating(false);
            }
        });
    }, [meshRef, threeCBs, curAngle]);

    return (
        <div className='full-screen-base'>
            <ThreeSceneComp
                fixedCameraData={fixedCameraData}
                controlsData={initControlsData}
                ref={threeSceneRef}
            >
                <Axes2D
                    tickDistance={1}
                    boundsAtom={boundsData.atom}
                    axesDataAtom={axesData.atom}
                />
                <Grid boundsAtom={boundsData.atom} gridShow={true} />
                <FreeDrawComp ref={meshRef} transforms={[]} activeAtom={drawingAtom} />
                <CircularArrow
                    notVisibleAtom={drawingAtom}
                    pointAtom={rotatePointData.atom}
                    angleAtom={curAngleAtom}
                />
                <ClickablePlaneComp
                    clickPointAtom={rotatePointData.atom}
                    pausedAtom={drawingAtom}
                />
            </ThreeSceneComp>
            <Route path='/'>
                <Link href='/not_drawing'>
                    <div className='absolute top-10 left-10'>
                        <Button onClick={() => setDrawing(false)}>Rotate Figure</Button>
                    </div>
                </Link>
            </Route>

            <Route path='/not_drawing'>
                <div className={rotateBoxCss}>
                    <div className='px-4 py-2 flex justify-around align-baseline'>
                        <span className='m-2'>
                            <Button onClick={rotateCB} active={!animating}>
                                Rotate
                            </Button>
                        </span>
                        <span className='m-2'> by </span>
                        <CurAngleComp classNameStr='m-2' />
                    </div>

                    <div className='m-2'>
                        <span className='m-2'>Total rotation: </span>
                        <TotalRotationComp />
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
