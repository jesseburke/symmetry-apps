import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Route, Link } from 'wouter';
import { Router as WouterRouter } from 'wouter';

import * as THREE from 'three';

import './styles.css';

import useHashLocation from '../../../hooks/useHashLocation.jsx';

import { ThreeSceneComp, useThreeCBs } from '@jesseburke/three-scene-with-react';
import { FreeDrawComp } from '@jesseburke/three-scene-with-react';
import ClickablePlaneComp from '../../../components/ClickablePlaneComp.jsx';

import { Line2dFactory } from '@jesseburke/jotai-data-setup';
import ReflectionFactory from '../../../factories/ReflectionFactory.jsx';

import useExpandingMesh from '../../../geometries/useExpandingMesh.jsx';
import useGridAndOrigin from '../../../geometries/useGridAndOrigin.jsx';
import use2DAxes from '../../../geometries/use2DAxes.jsx';

import FullScreenBaseComponent from '../../../components/FullScreenBaseComponent';
import Input from '../../../components/Input.jsx';

import { fonts, initAxesData, initGridAndOriginData, initOrthographicData } from '../constants.jsx';

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

const startingPt = [1, 1, 0];

export default function App() {
    const [, navigate] = useHashLocation();

    const threeSceneRef = useRef(null);

    const threeCBs = useThreeCBs(threeSceneRef);

    const [line, setLine] = useState(Line2dFactory(new THREE.Vector3(...startingPt)));

    const [transforms, setTransforms] = useState([ReflectionFactory(line).transformGeometry]);

    const [animating, setAnimating] = useState(false);

    const cameraData = useRef(initOrthographicData, []);

    //------------------------------------------------------------------------
    //
    // starting effects

    useGridAndOrigin({ threeCBs, gridData: initGridAndOriginData });
    use2DAxes({ threeCBs, axesData: initAxesData });

    //------------------------------------------------------------------------
    const userMesh = useExpandingMesh({ threeCBs });

    const freeDrawDoneCBs = [userMesh.expandCB];

    const clearCB = useCallback(() => {
        if (!threeCBs) return;

        if (userMesh) {
            userMesh.clear();
        }

        navigate('/');
    }, [threeCBs, userMesh]);

    useEffect(() => {
        if (!threeCBs || !line) {
            return;
        }

        const geom = line.makeGeometry({ radius: reflectionLineRadius });
        const mesh = new THREE.Mesh(geom, reflectionLineMaterial);

        threeCBs.add(mesh);

        setTransforms([ReflectionFactory(line)]);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [threeCBs, line]);

    const chooseLineCB = useCallback(() => {
        navigate('/chooseLine');
    }, []);

    // passed to ClickablePlaneComp
    const clickCB = useCallback((pt) => {
        setLine(Line2dFactory(pt));

        navigate('/');
    }, []);

    const xCB = useCallback((xValStr) => {
        const xVal = Number(xValStr);

        setLine((oldLine) => {
            const yVal = oldLine.getEquation().y;

            // if yVal is already 0, then whatever xVal is, force line to be the vertical line
            if (yVal === 0) return Line2dFactory(new THREE.Vector3(0, 1, 0));
            else if (xVal === 0) {
                return Line2dFactory(new THREE.Vector3(1, 0, 0));
            }

            return Line2dFactory(new THREE.Vector3(yVal / xVal, 1, 0));
        });
    }, []);

    const yCB = useCallback((yValStr) => {
        const yVal = Number(yValStr);

        setLine((oldLine) => {
            const xVal = oldLine.getEquation().x;

            // if xVal is already 0, then whatever yVal is, force line to be the horizontal line
            if (xVal === 0) return Line2dFactory(new THREE.Vector3(1, 0, 0));
            else if (yVal === 0) {
                return Line2dFactory(new THREE.Vector3(0, 1, 0));
            }

            return Line2dFactory(new THREE.Vector3(yVal / xVal, 1, 0));
        });
    }, []);

    return (
        <FullScreenBaseComponent fonts={fonts}>
            <ThreeSceneComp ref={threeSceneRef} initCameraData={cameraData.current} />

            <WouterRouter hook={useHashLocation}>
                <Route path='/'>
                    <FreeDrawComp
                        threeCBs={threeCBs}
                        doneCBs={freeDrawDoneCBs}
                        transforms={transforms}
                        clearCB={clearCB}
                        material={freeDrawMaterial}
                        fontSize='1.25em'
                    />
                    <div className='reflection-box'>
                        <div className='top-line-reflection-box'>
                            <span className='small-margin'> Reflecting about </span>
                            <span className='small-margin'> {line.isVertical() ? 0 : 'y'} = </span>
                            <Input
                                size={4}
                                onC={xCB}
                                initValue={line ? line.getEquation().x : null}
                            />
                            <span className='small-margin'>x</span>
                        </div>

                        <div className='med-margin'>
                            <Link className='lnkt' href='/chooseLine'>
                                Choose new line on graph
                            </Link>
                        </div>
                    </div>
                </Route>

                <Route path='/chooseLine'>
                    <div className='choose-line'>Click on plane to choose reflection line</div>
                    <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} paused={animating} />
                </Route>
            </WouterRouter>
        </FullScreenBaseComponent>
    );
}
