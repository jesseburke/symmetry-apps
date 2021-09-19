export const fonts = "'Helvetica', 'Hind', sans-serif";

// should adjust these based on aspect ratio of users screen
export const halfXSize = 20;
export const halfYSize = 14;
export const gridSize = 100;

export const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    testFunc: '#E16962', //#DBBBB0',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0'
};

export const labelStyle = {
    color: 'black',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

export const initAxesData = {
    radius: 0.02,
    color: initColors.axes,
    length: halfXSize,
    tickDistance: 1,
    tickRadius: 2.5,
    show: true,
    showLabels: false,
    labelStyle
};

export const initGridAndOriginData = {
    gridSqSize: 1,
    quadSize: halfXSize,
    show: true,
    originColor: 0x3f405c
};

export const initOrthographicData = {
    position: [0, 0, 10],
    up: [0, 0, 1],
    //fov: 75,
    near: -1,
    far: 50,
    orthographic: { left: -halfXSize, right: halfXSize, top: halfYSize, bottom: -halfYSize }
};
