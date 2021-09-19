import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Redirect, Switch, Route, Link, useRoute } from 'wouter';
import { Router as WouterRouter } from 'wouter';

import { jsx } from '@emotion/core';
import * as THREE from 'three';

import useHashLocation from '../hooks/useHashLocation.jsx';

import { ThreeSceneComp, useThreeCBs } from '@jesseburke/three-scene-with-react';
import FreeDrawComp from '../components/FreeDrawComp.jsx';
import GraphDrawComp from '../components/GraphDrawComp.jsx';
import ClickablePlaneComp from '../components/ClickablePlaneComp.jsx';
import { FullScreenBaseComponent } from '@jesseburke/basic-react-components';
import Button from '../components/Button.jsx';
import FreeDrawOptions from '../components/FreeDrawOptions.jsx';

import LineFactory from '../factories/LineFactory.jsx';

import useGridAndOrigin from '../geometries/useGridAndOrigin.jsx';
import use2DAxes from '../geometries/use2DAxes.jsx';
import useExpandingMesh from '../geometries/useExpandingMesh.jsx';

import gsapRotate from '../animations/gsapRotate.jsx';
import gsapReflect from '../animations/gsapReflect.jsx';

import {
    fonts,
    halfXSize,
    halfYSize,
    initColors,
    initAxesData,
    initGridAndOriginData,
    labelStyle,
    initOrthographicData
} from './constants.jsx';

//------------------------------------------------------------------------

const reflectionLineColor = 'rgb(231, 71, 41)';
const reflectionLineMaterial = new THREE.MeshBasicMaterial({ color: reflectionLineColor });
const reflectionLineRadius = 0.1;

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = 0.35;
fixedMaterial.transparent = true;

const rotationDuration = 0.4;
const reflectionDuration = 0.5;

export default function App() {
    const [, navigate] = useHashLocation();

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const [animating, setAnimating] = useState(false);

    const cameraData = useRef(initOrthographicData, []);

    //------------------------------------------------------------------------
    //
    // starting effects

    const userMesh = useExpandingMesh({ threeCBs });
    const fixedMesh = useExpandingMesh({ threeCBs });

    useGridAndOrigin({ threeCBs, gridData: initGridAndOriginData });
    use2DAxes({ threeCBs, axesData: initAxesData });

    //------------------------------------------------------------------------

    const clearCB = useCallback(() => {
        if (!threeCBs) return;

        if (userMesh) {
            userMesh.clear();
        }

        if (fixedMesh) {
            fixedMesh.clear();
        }
    }, [threeCBs, userMesh, fixedMesh]);

    const freeDrawDoneCBs = [
        userMesh.expandCB,
        useCallback(
            (mesh) => {
                if (!mesh) return;
                mesh.material = fixedMaterial;
                fixedMesh.expandCB(mesh);
            },
            [fixedMesh]
        )
    ];

    const resetCB = useCallback(() => {
        if (!threeCBs) return;

        if (userMesh.getMesh()) {
            // rotate mesh back to original position
            gsapRotate({
                mesh: userMesh.getMesh(),
                delay: 0,
                duration: rotationDuration,
                quaternion: fixedMesh.getMesh().quaternion,
                renderFunc: threeCBs.render,
                clampToEnd: true,
                onStart: () => {
                    setAnimating(true);
                },
                onComplete: () => {
                    setAnimating(false);
                }
            });
        }

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh]);

    return (
        <FullScreenBaseComponent fonts={fonts}>
            <ThreeSceneComp ref={threeSceneRef} initCameraData={cameraData.current} />

            <WouterRouter hook={useHashLocation}>
                <Route path='/'>
                    <FreeDrawComp
                        threeCBs={threeCBs}
                        doneCBs={freeDrawDoneCBs}
                        clearCB={clearCB}
                        material={freeDrawMaterial}
                        fontSize={'1.25em'}
                        transforms={[]}
                    />
                    <div
                        css={{
                            position: 'absolute',
                            top: '5%',
                            left: '5%',
                            fontSize: '1.25em'
                        }}
                    >
                        <FreeDrawOptions>
                            <Link css={linkCss} href='/graph_draw'>
                                Change to Graph Draw
                            </Link>
                        </FreeDrawOptions>
                    </div>
                </Route>

                <Route path='/graph_draw'>
                    <GraphDrawComp
                        threeCBs={threeCBs}
                        doneCBs={freeDrawDoneCBs}
                        clearCB={clearCB}
                        material={freeDrawMaterial}
                        fontSize={'1.25em'}
                        transforms={[]}
                    />

                    <div
                        css={{
                            position: 'absolute',
                            top: '5%',
                            left: '5%',
                            fontSize: '1.25em'
                        }}
                    >
                        <Link css={linkCss} href='/'>
                            Change to Free Draw
                        </Link>
                    </div>
                </Route>
            </WouterRouter>
        </FullScreenBaseComponent>
    );
}

const linkCss = {
    paddingLeft: '1em',
    paddingRight: '1em',
    paddingTop: '.25em',
    paddingBottom: '.25em',
    border: '2px',
    borderStyle: 'solid',
    borderRadius: '.35em',
    fontSize: '1em',
    margin: 0,
    width: '10em',
    // next line stops cursor from changing to text selection on hover
    cursor: 'pointer',
    textAlign: 'center',
    userSelect: 'none',
    textDecoration: 'none',
    color: 'black',
    fontSize: '.75em'
};
