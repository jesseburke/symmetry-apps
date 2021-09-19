import React, { useState, useRef, useEffect, useCallback } from 'react';

import { ThreeSceneComp } from '@jesseburke/three-scene-with-react';
import { Grid } from '@jesseburke/three-scene-with-react';
import { Axes2D } from '@jesseburke/three-scene-with-react';
import { FreeDrawComp } from '@jesseburke/three-scene-with-react';

import { axesData, boundsData } from './App_freeDraw_atoms';

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

function App() {
    return (
        <div className='full-screen-base'>
            <ThreeSceneComp fixedCameraData={fixedCameraData} controlsData={initControlsData}>
                <Axes2D
                    tickDistance={1}
                    boundsAtom={boundsData.atom}
                    axesDataAtom={axesData.atom}
                />
                <Grid boundsAtom={boundsData.atom} gridShow={true} />
                <FreeDrawComp transforms={[]} />
            </ThreeSceneComp>
        </div>
    );
}

export default App;
