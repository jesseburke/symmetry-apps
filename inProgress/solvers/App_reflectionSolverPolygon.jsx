import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { gsap } from 'gsap';

import './styles.css';

import gsapReflect from '../../../animations/gsapReflect.jsx';
import gsapTextAnimation from '../../../animations/gsapTextAnimation.jsx';

import { LineDataComp, OriginLineFromSlope } from '@jesseburke/jotai-data-setup';

import {
    ThreeSceneComp,
    useThreeCBs
} from '../../../../packages/three-scene-with-react/ThreeScene.js';
import ClickablePlaneComp from '../../../components/ClickablePlaneComp.jsx';

import useGridAndOrigin from '../../../geometries/useGridAndOrigin.jsx';
import use2DAxes from '../../../geometries/use2DAxes.jsx';
import LinePathGeom, {
    RegularNgonPts,
    RegularNgonSymmetrySlopes
} from '../../../../packages/three-scene-with-react/geometries/LinePathGeom.js';

import FullScreenBaseComponent from '../../../components/FullScreenBaseComponent';
import Button from '../../components/Button.jsx';

import { fonts, initOrthographicData } from '../constants.jsx';

//------------------------------------------------------------------------

const textDisplayStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '3em',
    top: '25%',
    left: '3%'
};

const size = 10;
const n = 8;
let figurePointArray = RegularNgonPts(n, size);
// each entry of figurePointArray has the form [x,y,z]
// we round each entry
figurePointArray = figurePointArray.map((p) => p.map((q) => round(q, 1)));

const symmetryArray = RegularNgonSymmetrySlopes(n); //.map( m => round(m,2) );
const newSymmArray = symmetryArray.map((m) => OriginLineFromSlope(m));

const figureRadius = 0.75;
const figureVertexSize = 1.5;
const figureMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});
const reflectionLineMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(231, 71, 41)' });
const symmLineMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(150, 150, 150)' });
symmLineMaterial.transparent = true;
const lineRadius = 0.1;

const EPSILON = 0.04;

const gridSize = 40;

export default function App() {
    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const [figureMesh, setFigureMesh] = useState(null);
    const [fixedMesh, setFixedMesh] = useState(null);

    const [line, setLine] = useState(null);

    // whether the current line is
    const [isSymmetry, setIsSymmetry] = useState(true);

    // this is the array of slopes of lines found by the user
    const [symmFoundArray, setSymmFoundArray] = useState([]);
    const [symmLineMeshArray, setSymmLineMeshArray] = useState([]);

    const [animating, setAnimating] = useState(false);

    const cameraData = useRef(initOrthographicData, []);

    // adds the grid and origin to the ThreeScene
    useGridAndOrigin({
        threeCBs
    });
    use2DAxes({ threeCBs });

    //------------------------------------------------------------------------
    //
    // draw two copies of figure, one will stay fixed, other will be reflected

    useEffect(() => {
        if (!threeCBs) return;

        const geom = LinePathGeom(figurePointArray, figureRadius, figureVertexSize);

        const mesh = new THREE.Mesh(geom, figureMaterial);

        threeCBs.add(mesh);
        setFigureMesh(mesh);

        const newMesh = new THREE.Mesh();
        const newMat = mesh.material.clone();

        newMat.opacity = 0.35;
        newMat.transparent = true;
        newMesh.material = newMat;
        newMesh.geometry = mesh.geometry.clone();

        setFixedMesh(newMesh);

        threeCBs.add(newMesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();

            threeCBs.remove(newMesh);
            newMat.dispose();
        };
    }, [threeCBs]);
    //------------------------------------------------------------------------

    //------------------------------------------------------------------------
    // checks whether line selected is within epsilon of a symmetry
    // line, so can snap to that line

    const clickCB = useCallback((pt) => {
        const l = Line2dFactory(pt);

        const matches = newSymmArray.filter((sl) => sl.angleWithinEpsilon(l, EPSILON));

        if (matches.length > 0) {
            console.log('is a symmetry');
            setIsSymmetry(true);
            setLine(matches[0]);
            return;
        }

        setIsSymmetry(false);
        setLine(l);
    }, []);

    // positions the current line depending on curLineSlope state
    useEffect(() => {
        if (!threeCBs || !line) return;

        const geom = line.makeGeometry({ radius: lineRadius });

        const mesh = new THREE.Mesh(geom, reflectionLineMaterial);
        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [threeCBs, line]);

    // called when 'Reflect' button is clicked

    const reflectCB = useCallback(() => {
        if (!figureMesh || !fixedMesh || !threeCBs) {
            return;
        }

        const tl = gsap.timeline({
            onStart: () => {
                setAnimating(true);
            },
            onComplete: () => {
                setAnimating(false);
            }
        });

        const reflectionDuration = 0.5;
        const textFadeDuration = 0.25;
        const textDisplayDuration = 0.5;

        if (isSymmetry) {
            tl.add(
                gsapReflect({
                    mesh: figureMesh,
                    axis: line.getDirection(),
                    delay: 0,
                    renderFunc: threeCBs.render,
                    duration: reflectionDuration
                })
            );

            tl.add(
                gsapTextAnimation({
                    parentNode: document.body,
                    style: textDisplayStyle,
                    entrySide: 'left',
                    duration: textFadeDuration,
                    displayTime: textDisplayDuration,
                    text: 'symmetry!',
                    ease: 'sine'
                })
            );

            // user has already found this line
            if (symmFoundArray.filter((sf) => sf.angleWithinEpsilon(line, 0)).length > 0) {
                // this is to make number of hook calls same each time
                setSymmFoundArray((curArr) => curArr);

                return;
            }

            setSymmFoundArray((curArr) => [...curArr, line]);

            // makes the line representing found symmetries
            const geom = line.makeGeometry({ radius: lineRadius });

            const mesh = new THREE.Mesh(geom, symmLineMaterial);
            threeCBs.add(mesh);
            setSymmLineMeshArray((a) => [...a, mesh]);
        } else {
            tl.add(
                gsapReflect({
                    mesh: figureMesh,
                    axis: line.getDirection(),
                    delay: 0,
                    renderFunc: threeCBs.render,
                    duration: reflectionDuration,
                    options: {
                        yoyo: true,
                        repeat: 1,
                        repeatDelay: textDisplayDuration + textFadeDuration
                    }
                })
            );

            tl.add(
                gsapTextAnimation({
                    parentNode: document.body,
                    style: textDisplayStyle,
                    entrySide: 'left',
                    duration: textFadeDuration,
                    displayTime: textDisplayDuration,
                    text: 'not a symmetry',
                    ease: 'sine'
                }),
                `-=${reflectionDuration + textDisplayDuration + textFadeDuration}`
            );

            // this is to make number of hook calls same each time
            setSymmFoundArray((curArr) => curArr);
        }
    }, [threeCBs, figureMesh, fixedMesh, line, symmFoundArray, isSymmetry]);

    let symmLinesFoundDisplay = symmFoundArray.length.toString();
    if (symmFoundArray.length === symmetryArray.length) symmLinesFoundDisplay += ` = all`;

    return (
        <FullScreenBaseComponent fonts={fonts}>
            <ThreeSceneComp ref={threeSceneRef} initCameraData={cameraData.current} />

            <div className='solver-box-right'>
                <Button onClickFunc={reflectCB} active={!animating}>
                    Reflect
                </Button>
            </div>

            <div className='solver-box-left'>Symmetry lines found: {symmLinesFoundDisplay}</div>

            <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} paused={animating} />
        </FullScreenBaseComponent>
    );
}

function round(x, n = 3) {
    // x = -2.336596841557143

    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}
