import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Redirect, Switch, Route, Link, useRoute } from 'wouter';
import { Router as WouterRouter } from 'wouter';

import { jsx } from '@emotion/core';
import * as THREE from 'three';

import { ThreeSceneComp, useThreeCBs } from '@jesseburke/three-scene-with-react';
//import FreeDrawComp from '../../components/FreeDrawComp.jsx';
import { GraphDrawComp } from '@jesseburke/three-scene-with-react';
import ClickablePlaneComp from '../../components/ClickablePlaneComp.jsx';

import useExpandingMesh from '../../geometries/useExpandingMesh.jsx';
import useGridAndOrigin from '../../geometries/useGridAndOrigin.jsx';
import use2DAxes from '../../geometries/use2DAxes.jsx';
import { OriginLine } from '@jesseburke/three-scene-with-react';

import gsapRotate from '../../animations/gsapRotate.jsx';
import gsapReflect from '../../animations/gsapReflect.jsx';

import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import Button from '../../components/Button.jsx';

import useHashLocation from '../../hooks/useHashLocation.jsx';

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
const reflectionLineRadius = 0.05;

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = 0.15;
fixedMaterial.transparent = true;

const rotationDuration = 0.4;
const reflectionDuration = 0.5;

const gridSize = 100;

const controlBarHeightPerc = 10;

export default function App() {
    const [, navigate] = useHashLocation();

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const [linePt, setLinePt] = useState(null);
    const [lineMesh, setLineMesh] = useState(null);

    const [animating, setAnimating] = useState(false);

    const cameraData = useRef(initOrthographicData, []);

    //------------------------------------------------------------------------
    //
    // starting effects

    const userMesh = useExpandingMesh({ threeCBs });
    const fixedMesh = useExpandingMesh({ threeCBs });

    // adds the grid and origin to the ThreeScene
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

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh]);

    const graphDrawDoneCBs = [
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

    // passed to ClickablePlaneComp
    const clickCB = useCallback((pt) => {
        setLinePt(pt);
    }, []);

    useEffect(() => {
        if (!threeCBs || !linePt) return;

        const geom = OriginLine({ vec: linePt, radius: reflectionLineRadius });
        const mesh = new THREE.Mesh(geom, reflectionLineMaterial);
        setLineMesh(mesh);
        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [linePt, threeCBs]);

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
                onComplete: () => {
                    setAnimating(false);
                }
            });
        }

        if (lineMesh) {
            threeCBs.remove(lineMesh);
            lineMesh.geometry.dispose();
        }

        setLinePt(null);

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh, lineMesh]);

    const drawWithLineCB = useCallback(() => {
        if (!threeCBs) return;

        const userMeshQuat = new THREE.Quaternion();

        if (userMesh.getMesh()) {
            userMeshQuat.copy(userMesh.getMesh().quaternion);

            // rotate mesh back to original position
            gsapRotate({
                mesh: userMesh.getMesh(),
                delay: 0,
                duration: rotationDuration,
                quaternion: new THREE.Quaternion(0, 0, 0, 1),
                renderFunc: threeCBs.render,
                clampToEnd: true,
                onComplete: () => {
                    setAnimating(false);
                }
            });
        }

        // rotate the fixed mesh into position where user mesh was
        if (fixedMesh.getMesh()) {
            // rotate mesh back to original position
            gsapRotate({
                mesh: fixedMesh.getMesh(),
                delay: 0,
                duration: rotationDuration,
                quaternion: userMeshQuat,
                renderFunc: threeCBs.render,
                clampToEnd: true,
                onComplete: () => {
                    setAnimating(false);
                }
            });
        }

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh, lineMesh]);

    const reflectCB = useCallback(() => {
        if (!userMesh.getMesh() || !linePt || !threeCBs) return;

        gsapReflect({
            mesh: userMesh.getMesh(),
            axis: linePt.normalize(),
            delay: 0,
            renderFunc: threeCBs.render,
            duration: reflectionDuration,
            onStart: () => {
                setAnimating(true);
            },
            onComplete: () => {
                setAnimating(false);
            }
        });
    }, [userMesh, linePt, threeCBs]);

    return (
        <FullScreenBaseComponent fonts={fonts} backgroundColor={'#0A2C3C'}>
            <WouterRouter hook={useHashLocation}>
                <ControlBar height={controlBarHeightPerc} fontSize={'1em'}>
                    <div
                        css={{
                            fontSize: '1.25em',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-around'
                        }}
                    >
                        <ActiveLink href={'/'}>Draw</ActiveLink>
                        <ActiveLink href={'/reflect'}>Draw with symmetry</ActiveLink>
                        <ActiveLink href={'/reflect'}>Add symmetry</ActiveLink>
                        <ActiveLink href={'/reflect'}>Transform figure</ActiveLink>
                    </div>
                </ControlBar>

                <Main height={100 - controlBarHeightPerc} fontSize={'1em'}>
                    <ThreeSceneComp ref={threeSceneRef} initCameraData={cameraData.current} />

                    <Route path='/'>
                        <GraphDrawComp
                            threeCBs={threeCBs}
                            doneCBs={graphDrawDoneCBs}
                            clearCB={clearCB}
                            material={freeDrawMaterial}
                            fontSize='1.25em'
                        />

                        <Link href='/reflect'>
                            <div
                                css={{
                                    position: 'absolute',
                                    top: '10%',
                                    left: '10%',
                                    fontSize: '1.25em'
                                }}
                            >
                                <Button>Done drawing</Button>
                            </div>
                        </Link>
                    </Route>

                    <Route path='/reflect'>
                        <ClickablePlaneComp
                            threeCBs={threeCBs}
                            clickCB={clickCB}
                            paused={animating}
                        />
                        <div
                            css={{
                                position: 'absolute',
                                bottom: '5%',
                                width: '100%',
                                fontSize: '1.25em',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'space-around'
                            }}
                        >
                            <div
                                css={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '4em',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div css={{ cursor: 'pointer' }}>
                                    <Button onClickFunc={drawWithLineCB}>Draw with line</Button>
                                </div>
                                <div css={{ cursor: 'pointer' }}>
                                    <Button onClickFunc={resetCB}>Back to drawing</Button>
                                </div>
                            </div>

                            <div>Click on plane to choose reflection line</div>

                            <div>
                                <Button onClickFunc={reflectCB} active={!animating}>
                                    Reflect!
                                </Button>
                            </div>
                        </div>
                    </Route>
                </Main>
            </WouterRouter>
        </FullScreenBaseComponent>
    );
}

const ActiveLink = (props) => {
    const [isActive] = useRoute(props.href);

    //const linkCSS = isActive ? {color: 'red'} : {color: 'white'};

    const linkCSS = {
        paddingLeft: '1em',
        paddingRight: '1em',
        paddingTop: '.25em',
        paddingBottom: '.25em',
        //border: '2px',
        //borderStyle: 'solid',
        //borderRadius: '.35em',
        fontSize: '1em',
        margin: 0,
        width: '10em',
        // next line stops cursor from changing to text selection on hover
        cursor: 'pointer',
        textAlign: 'center',
        userSelect: 'none',
        textDecoration: 'none',
        color: isActive ? 'red' : 'white'
    };

    return (
        <Link {...props}>
            <a css={linkCSS}>{props.children}</a>
        </Link>
    );
};
