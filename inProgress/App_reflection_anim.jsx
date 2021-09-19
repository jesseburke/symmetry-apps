import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { css } from 'emotion';

import { gsap } from 'gsap';

import { ThreeSceneComp, useThreeCBs } from '@jesseburke/three-scene-with-react';

import useGridAndOrigin from '../../geometries/useGridAndOrigin.jsx';
import use2DAxes from '../../geometries/use2DAxes.jsx';
import {LinePathGeom, RegularNgonPts, IrregularNgon } from '@jesseburke/three-scene-with-react';

import{ OriginLine} from '@jesseburke/three-scene-with-react';

import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';

import gsapRotate from '../../animations/gsapRotate.jsx';
import gsapTextAnimation from '../../animations/gsapTextAnimation.jsx';

import {
    fonts,
    halfXSize,
    halfYSize,
    initColors,
    initAxesData,
    initGridAndOriginData,
    labelStyle
} from './constants.jsx';

//------------------------------------------------------------------------

const symmLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '3em',
    top: '25%',
    left: '3%'
};

const transfLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '2em',
    top: '2.5%',
    left: '5%',
    opacity: 0
};

const reflectionLineColor = 'rgb(231, 71, 41)';

const startPaused = true;

export default function App() {
    // this is only used to define threeCBs (which are used everywhere)
    const threeSceneRef = useRef(null);

    const fullScreenRef = useRef(null);

    // following is passed to components that draw
    const threeCBs = useThreeCBs(threeSceneRef);

    // userMeshR(ed) and userMeshB(lue)
    const [squareMeshR, setSquareMeshR] = useState(null);
    const [squareMeshB, setSquareMeshB] = useState(null);

    const [timeLine, setTimeLine] = useState(null);

    const [paused, setPaused] = useState(startPaused);

    const cameraData = useRef({ position: [0, 0, 10], up: [0, 0, 1], fov: 75 }, []);

    const controlsData = useRef(
        {
            mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
            touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.PAN, THREE: THREE.MOUSE.PAN },
            enableRotate: true,
            enableKeys: true,
            enabled: true,
            keyPanSpeed: 50,
            maxDistance: 18
        },
        []
    );

    // adds the grid and origin to the ThreeScene
    useGridAndOrigin({ threeCBs, gridData: initGridAndOriginData });

    // add axes to the ThreeScene
    use2DAxes({ threeCBs, axesData: Object.assign(initAxesData, { length: 100 }) });

    //------------------------------------------------------------------------

    // draw two copies of square, one will stay fixed, other will be reflected

    useEffect(() => {
        if (!threeCBs) return;

        const scale = 6;

        const geom = LinePathGeom(RegularNgonPts(4), 0.025, 1)
            .rotateZ(-Math.PI / 4)
            .scale(scale, scale, scale);

        const redMat = new THREE.MeshBasicMaterial({ color: 'rgb(255, 0, 0)', opacity: 0.5 });
        redMat.transparent = true;

        const redMesh = new THREE.Mesh(geom, redMat);
        setSquareMeshR(redMesh);
        threeCBs.add(redMesh);

        const blueMat = new THREE.MeshBasicMaterial({ color: 'rgb(0, 0, 255)', opacity: 0.5 });
        blueMat.transparent = true;

        const blueMesh = new THREE.Mesh(geom, blueMat);
        setSquareMeshB(blueMesh);
        threeCBs.add(blueMesh);

        return () => ({
            threeCBs.remove(redMesh);
            redMat.dispose();
            threeCBs.remove(blueMesh);
            blueMat.dispose();
            geom.dispose();
        });
    }, [threeCBs]);
    //------------------------------------------------------------------------

    //------------------------------------------------------------------------
    //
    // sets up animations
    //

    const textFadeDuration = 0.5;
    const startStopDelay = 0.5;
    const reflectDuration = 1;
    const textDisplayDuration = 1.0;

    useEffect(() => {
        if (!squareMeshR || !threeCBs || !fullScreenRef) return;

        let planeFigLabel = threeCBs.addLabel({
            pos: [-3.5, -2, 0],
            text: ' \u{2B05} plane figure',
            style: labelStyle
        });
        threeCBs.drawLabels();

        const tl = gsap.timeline({
            repeat: 0,
            repeatDelay: 0.5,
            paused,
            onStart: () => {
                threeCBs.removeLabel(planeFigLabel);
                threeCBs.drawLabels();
            },
            onComplete: () => {
                planeFigLabel = threeCBs.addLabel({
                    pos: [-3.5, -2, 0],
                    text: ' \u{2B05} plane figure',
                    style: labelStyle
                });
                threeCBs.drawLabels();
                setPaused(true);
            }
        });
        setTimeLine(tl);

        tl.add(
            gsapAnimation1({
                threeCBs,
                startStopDelay,
                ref: fullScreenRef.current,
                mesh: squareMeshR
            })
        );

        tl.add(
            gsapAnimation2({
                threeCBs,
                startStopDelay,
                ref: fullScreenRef.current,
                mesh: squareMeshR
            }),
            `+=1`
        );
    }, [threeCBs, squareMeshR, fullScreenRef]);

    // this stops animation if paused changes
    useEffect(() => {
        if (!timeLine) {
            return;
        }

        if (paused) {
            timeLine.pause();
            return;
        }
        //timeLine.play();
        timeLine.restart();
    }, [timeLine, paused]);

    function gsapAnimation1({ threeCBs, startStopDelay = 0.5, ref, mesh }) {
        if (!threeCBs) return;

        const vec = new THREE.Vector3(1, 1, 0);
        const lineGeom = OriginLine({ radius: 0.04, vec });
        const lineMat = new THREE.MeshBasicMaterial({ color: reflectionLineColor, opacity: 1 });
        lineMat.transparent = true;
        const lineMesh = new THREE.Mesh(lineGeom, lineMat);

        let transfLabelDiv = makeDiv({
            text: 'reflection about y = x',
            id: 'reflectionDisplay',
            style: transfLabelStyle
        });
        document.body.append(transfLabelDiv);

        //------------------------------------------------------------------------
        //

        let tl = gsap.timeline();

        tl.to(transfLabelDiv, { duration: startStopDelay, opacity: 1 });
        tl.add(() => null, '+=.25');
        tl.add(() => threeCBs.add(lineMesh)); //`+=${startStopDelay/2}`);
        //tl.add( () => null, '+=.5' );

        // does reflection animation
        tl.add(
            gsapRotate({
                mesh,
                axis: vec.normalize(),
                delay: startStopDelay,
                angle: Math.PI,
                duration: reflectDuration,
                renderFunc: threeCBs.render,
                ease: 'pow4',
                clampToEnd: true
            })
        );

        // following makes text 'symmetry!' slide onto screen
        const textAnim = gsapTextAnimation({
            parentNode: ref,
            style: symmLabelStyle,
            entrySide: 'left',
            duration: textFadeDuration,
            displayTime: textDisplayDuration,
            text: 'symmetry!',
            ease: 'sine'
        });
        tl.add(() => null, '+=.25');
        tl.add(textAnim);
        tl.add(() => null, '+=.5');
        tl.add(() => threeCBs.remove(lineMesh));
        tl.to(transfLabelDiv, { duration: 0.5, opacity: 0 });

        return tl;
    };

    function makeDiv({ text = '', id, style, parentNode = document.body }) {
        let div = document.createElement('div');
        div.textContent = text;
        div.id = id;

        const cssClass = css`
            background-color: ${style.backgroundColor};
            border: ${style.border};
            color: ${style.color};
            padding: ${style.padding};
            position: absolute;
            margin: 0;
            left: ${style.left};
            top: ${style.top};
            opacity: ${style.opacity};
            font-size: ${style.fontSize};
            zindex: 100;
        `;
        div.classList.add(cssClass);

        return div;
    };

    function gsapAnimation2({ threeCBs, startStopDelay = 0.5, ref, mesh }) {
        if (!threeCBs) return;

        const vec = new THREE.Vector3(-2, -1, 0);

        const lineGeom = OriginLine({ radius: 0.04, vec });
        const lineMat = new THREE.MeshBasicMaterial({ color: reflectionLineColor, opacity: 1 });
        lineMat.transparent = true;
        const lineMesh = new THREE.Mesh(lineGeom, lineMat);

        let transfLabelDiv = makeDiv({
            text: 'reflection about 2y = x',
            id: 'reflectionDisplay',
            style: transfLabelStyle
        });
        document.body.append(transfLabelDiv);

        //------------------------------------------------------------------------
        //

        let tl = gsap.timeline();

        tl.to(transfLabelDiv, { duration: startStopDelay, opacity: 1 });
        //tl.add( () => null, '+=.5' );
        tl.add(() => threeCBs.add(lineMesh)); //`+=${startStopDelay/2}`);
        //tl.add( () => null, '+=.5' );

        const reflectAnim = gsapRotate({
            mesh,
            axis: vec.normalize(),
            delay: startStopDelay,
            angle: Math.PI,
            duration: reflectDuration,
            renderFunc: threeCBs.render,
            ease: 'pow4',
            options: { yoyo: true, repeat: 1, repeatDelay: textDisplayDuration + textFadeDuration }
        });
        tl.add(reflectAnim);

        // following makes text 'not a symmetry' slide onto screen
        const textAnim = gsapTextAnimation({
            parentNode: fullScreenRef.current,
            style: symmLabelStyle,
            entrySide: 'left',
            duration: textFadeDuration,
            displayTime: textDisplayDuration,
            delay: 0,
            text: 'not a symmetry'
        });
        tl.add(() => null, '+=.25');
        tl.add(textAnim, `-=${reflectDuration + textDisplayDuration + textFadeDuration}`);

        //tl.add( () => null, '+=.5' );
        tl.add(() => threeCBs.remove(lineMesh));
        tl.to(transfLabelDiv, { duration: 0.5, opacity: 0 });

        return (tl);
    };

    const playPauseCB = useCallback(() => {
        setPaused((p) => !p);
    }, []);

    return (
        <FullScreenBaseComponent fonts={fonts} ref={(elt) => (fullScreenRef.current = elt)}>
            <ThreeSceneComp
                ref={(elt) => (threeSceneRef.current = elt)}
                initCameraData={cameraData.current}
                controlsData={controlsData.current}
            />
            <PlayPauseButton paused={paused} onClickFunc={playPauseCB} />
        </FullScreenBaseComponent>
    );
}

function PlayPauseButton({ onClickFunc, fontSize = '1.75em', color = 'rgb(179,198,202)', paused }) {
    return (
        <div
            css={{
                position: 'absolute',
                top: '85%',
                left: '5%',
                padding: '1%',
                border: '1px',
                borderStyle: 'solid',
                borderRadius: '50%',
                fontSize: fontSize.toString() + 'em',
                // next line stops cursor from changing to text selection on hover
                cursor: 'pointer',
                backgroundColor: color
            }}
            onClick={onClickFunc}>
            <span css={{ padding: '.15em', fontSize }}>{paused ? '\u{25B6}' : '\u{23F8}'}</span>
        </div>
    );
}

const string = (q) => [q.x, q.y, q.z, q.w];
