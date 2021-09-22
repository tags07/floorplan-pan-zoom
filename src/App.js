import React from "react";
import { scaleLinear, zoomIdentity } from "d3";
import dijkstrajs from "dijkstrajs";

import FloorplanImage from "./static/floorplan.png";
import FloorplanImage90 from "./static/floorplan90.png";
import FloorplanImage180 from "./static/floorplan180.png";
import FloorplanImage270 from "./static/floorplan270.png";
import FloorplanImageFlipX from "./static/floorplanFlipX.png";
import FloorplanImageFlipY from "./static/floorplanFlipY.png";

import Floorplan from "./components/Floorplan";
import FloorplanWithoutRotation from "./components/FloorplanWithoutRotation";
import FocusViewCreationFloorplan from "./components/FocusViewCreationFloorplan";
import PathCreationFloorplan from "./components/PathCreationFloorplan";

import { getRealPointCoordinateRelativeToDigitisationZone } from "./utils";

function getNaturalImageDimensions(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;

      resolve({
        width,
        height,
        floorplanPath: path
      });
    };
    image.onerror = (err) => reject(err);

    image.src = path;
  });
}

function getFloorplanImage(type) {
  switch (type) {
    case "90": {
      return FloorplanImage90;
    }
    case "180": {
      return FloorplanImage180;
    }
    case "270": {
      return FloorplanImage270;
    }
    case "flipX": {
      return FloorplanImageFlipX;
    }
    case "flipY": {
      return FloorplanImageFlipY;
    }
    default: {
      return FloorplanImage;
    }
  }
}

function getStatusText(indexNumber) {
  switch (indexNumber) {
    case 1: {
      return "A";
    }
    case 2: {
      return "N/A";
    }
    case 3: {
      return "SS";
    }
    default: {
      return "ES";
    }
  }
}

function getTimerPosition(indexNumber) {
  switch (indexNumber) {
    case 1: {
      return "top";
    }
    case 2: {
      return "bottom";
    }
    case 3: {
      return "left";
    }
    default: {
      return "right";
    }
  }
}

export default function App() {
  const [isGettingInitialState, setIsGettingInitalState] = React.useState(true);
  const [selectedNearbyDistance, setSelectedNearbyDistance] = React.useState(
    10
  );
  const [digitisationZone, setDigitisationZone] = React.useState({
    origin: [0, 0],
    width: 100,
    height: 100
  });
  const [currentRotation, setCurrentRotation] = React.useState(0);
  const [floorplan, setFloorplan] = React.useState({
    floorplanPath: "",
    width: 0,
    height: 0
  });
  const [
    digitisationZoneForNonRotate,
    setDigitisationZoneForNonRotate
  ] = React.useState({
    origin: [0, 0],
    width: 100,
    height: 100
  });
  const [currentRotationForNonRotate] = React.useState(0);
  const [floorplanForNonRotate, setFloorplanForNonRotate] = React.useState({
    floorplanPath: "",
    width: 0,
    height: 0
  });
  const [unitsCount, setUnitsCount] = React.useState(100);
  const [unitsData, setUnitsData] = React.useState([]);
  const [selectedUnits, setSelectedUnits] = React.useState([]);
  const [focusViews, setFocusViews] = React.useState([]);
  const [isCreatingFocusView, setIsCreatingFocusView] = React.useState(false);
  const [selectedFocusView, setSelectedFocusView] = React.useState(null);
  const [pathData, setPathData] = React.useState([
    {
      id: "path-0",
      coordinates: [0.20843593087553605, 0.059544485122709864],
      neighbors: [
        {
          id: "path-1",
          coordinates: [0.21237095240884862, 0.13533031478665564],
          distance: 0.07588791980493494
        }
      ]
    },
    {
      id: "path-1",
      coordinates: [0.21237095240884862, 0.13533031478665564],
      neighbors: [
        {
          id: "path-0",
          coordinates: [0.20843593087553605, 0.059544485122709864],
          distance: 0.07588791980493494,
          isParent: true
        },
        {
          id: "path-2",
          coordinates: [0.29107162399176023, 0.1466981882324281],
          distance: 0.07951744622584662
        }
      ]
    },
    {
      id: "path-2",
      coordinates: [0.29107162399176023, 0.1466981882324281],
      neighbors: [
        {
          id: "path-1",
          coordinates: [0.21237095240884862, 0.13533031478665564],
          distance: 0.07951744622584662,
          isParent: true
        },
        {
          id: "path-3",
          coordinates: [0.3015650456340117, 0.48962906060235006],
          distance: 0.34309138013386137
        }
      ]
    },
    {
      id: "path-3",
      coordinates: [0.3015650456340117, 0.48962906060235006],
      neighbors: [
        {
          id: "path-2",
          coordinates: [0.29107162399176023, 0.1466981882324281],
          distance: 0.34309138013386137,
          isParent: true
        },
        {
          id: "path-5",
          coordinates: [0.1926957891461334, 0.6620418179014265],
          distance: 0.20390849390766844,
          isParent: true
        },
        {
          id: "path-10",
          coordinates: [0.29458978247306633, 0.6573685804714406],
          distance: 0.1678844865438063
        },
        {
          id: "path-11",
          coordinates: [0.3727245987527998, 0.7172892139471695],
          distance: 0.23852217385612667,
          isParent: true
        }
      ]
    },
    {
      id: "path-5",
      coordinates: [0.1926957891461334, 0.6620418179014265],
      neighbors: [
        {
          id: "path-3",
          coordinates: [0.3015650456340117, 0.48962906060235006],
          distance: 0.20390849390766844
        },
        {
          id: "path-10",
          coordinates: [0.29458978247306633, 0.6573685804714406],
          distance: 0.1020011030537713,
          isParent: true
        }
      ]
    },
    {
      id: "path-7",
      coordinates: [0.2554149726386081, 0.8423605813216575],
      neighbors: [
        {
          id: "path-10",
          coordinates: [0.29458978247306633, 0.6573685804714406],
          distance: 0.18909443699943315,
          isParent: true
        }
      ]
    },
    {
      id: "path-10",
      coordinates: [0.29458978247306633, 0.6573685804714406],
      neighbors: [
        {
          id: "path-3",
          coordinates: [0.3015650456340117, 0.48962906060235006],
          distance: 0.1678844865438063,
          isParent: true
        },
        {
          id: "path-7",
          coordinates: [0.2554149726386081, 0.8423605813216575],
          distance: 0.18909443699943315
        },
        {
          id: "path-5",
          coordinates: [0.1926957891461334, 0.6620418179014265],
          distance: 0.1020011030537713
        },
        {
          id: "path-11",
          coordinates: [0.3727245987527998, 0.7172892139471695],
          distance: 0.09846589171484883
        }
      ]
    },
    {
      id: "path-11",
      coordinates: [0.3727245987527998, 0.7172892139471695],
      neighbors: [
        {
          id: "path-10",
          coordinates: [0.29458978247306633, 0.6573685804714406],
          distance: 0.09846589171484883,
          isParent: true
        },
        {
          id: "path-3",
          coordinates: [0.3015650456340117, 0.48962906060235006],
          distance: 0.23852217385612667
        },
        {
          id: "path-12",
          coordinates: [0.4497438378361143, 0.6860392139471695],
          distance: 0.08311754140356153
        }
      ]
    },
    {
      id: "path-12",
      coordinates: [0.4497438378361143, 0.6860392139471695],
      neighbors: [
        {
          id: "path-11",
          coordinates: [0.3727245987527998, 0.7172892139471695],
          distance: 0.08311754140356153,
          isParent: true
        },
        {
          id: "path-13",
          coordinates: [0.4384938309892218, 0.5110391998186612],
          distance: 0.1753612488522856
        }
      ]
    },
    {
      id: "path-13",
      coordinates: [0.4384938309892218, 0.5110391998186612],
      neighbors: [
        {
          id: "path-12",
          coordinates: [0.4497438378361143, 0.6860392139471695],
          distance: 0.1753612488522856,
          isParent: true
        },
        {
          id: "path-14",
          coordinates: [0.7292630656709626, 0.5285392118278933],
          distance: 0.2912953797397557
        }
      ]
    },
    {
      id: "path-14",
      coordinates: [0.7292630656709626, 0.5285392118278933],
      neighbors: [
        {
          id: "path-13",
          coordinates: [0.4384938309892218, 0.5110391998186612],
          distance: 0.2912953797397557,
          isParent: true
        },
        {
          id: "path-15",
          coordinates: [0.7171476849680879, 0.6322892287821034],
          distance: 0.10445500690524347
        },
        {
          id: "path-17",
          coordinates: [0.7232053508663376, 0.2960392238371255],
          distance: 0.23257889053901978
        },
        {
          id: "path-19",
          coordinates: [0.7699361259658719, 0.2910392241903382],
          distance: 0.2409575521987061,
          isParent: true
        },
        {
          id: "path-18",
          coordinates: [0.6738784297456696, 0.29978923019495424],
          distance: 0.23535932527445608,
          isParent: true
        }
      ]
    },
    {
      id: "path-15",
      coordinates: [0.7171476849680879, 0.6322892287821034],
      neighbors: [
        {
          id: "path-14",
          coordinates: [0.7292630656709626, 0.5285392118278933],
          distance: 0.10445500690524347,
          isParent: true
        }
      ]
    },
    {
      id: "path-17",
      coordinates: [0.7232053508663376, 0.2960392238371255],
      neighbors: [
        {
          id: "path-14",
          coordinates: [0.7292630656709626, 0.5285392118278933],
          distance: 0.23257889053901978,
          isParent: true
        },
        {
          id: "path-18",
          coordinates: [0.6738784297456696, 0.29978923019495424],
          distance: 0.049469260100878445
        },
        {
          id: "path-19",
          coordinates: [0.7699361259658719, 0.2910392241903382],
          distance: 0.046997503528071846
        }
      ]
    },
    {
      id: "path-18",
      coordinates: [0.6738784297456696, 0.29978923019495424],
      neighbors: [
        {
          id: "path-17",
          coordinates: [0.7232053508663376, 0.2960392238371255],
          distance: 0.049469260100878445,
          isParent: true
        },
        {
          id: "path-14",
          coordinates: [0.7292630656709626, 0.5285392118278933],
          distance: 0.23535932527445608
        }
      ]
    },
    {
      id: "path-19",
      coordinates: [0.7699361259658719, 0.2910392241903382],
      neighbors: [
        {
          id: "path-17",
          coordinates: [0.7232053508663376, 0.2960392238371255],
          distance: 0.046997503528071846,
          isParent: true
        },
        {
          id: "path-14",
          coordinates: [0.7292630656709626, 0.5285392118278933],
          distance: 0.2409575521987061
        }
      ]
    }
  ]);
  const [isCreatingPath, setIsCreatingPath] = React.useState(false);
  const [selectedStartPath, setSelectedStartPath] = React.useState("");
  const [selectedEndPath, setSelectedEndPath] = React.useState("");
  const [selectedPath, setSelectedPath] = React.useState([]);

  const svgElementRef = React.useRef(null);
  const svgZoomRef = React.useRef(null);

  function setupInitialData() {
    setIsGettingInitalState(true);
    getNaturalImageDimensions(FloorplanImage)
      .then((result) => {
        setFloorplan(result);
        setFloorplanForNonRotate(result);
        setDigitisationZone({
          origin: [0, 0],
          width: result.width,
          height: result.height
        });
        setDigitisationZoneForNonRotate({
          origin: [0, 0],
          width: result.width,
          height: result.height
        });
        setUnitsData(
          Array(unitsCount)
            .fill(0)
            .map((item, index) => {
              return {
                id: index + 1,
                coordinates: [0, 0],
                status: false,
                shape: "circle",
                text: getStatusText(index % 4),
                timerPosition: getTimerPosition(index % 4)
              };
            })
        );
        setIsGettingInitalState(false);
      })
      .catch((err) => console.log(err));
  }

  // -- floorplan and unit count update --

  function changeFloorplanData(type = "") {
    setDigitisationZone({ origin: [0, 0], width: 100, height: 100 });
    setSelectedFocusView(null);
    resetSelectedUnits();

    setIsGettingInitalState(true);
    getNaturalImageDimensions(getFloorplanImage(type))
      .then((result) => {
        setFloorplan(result);
        setDigitisationZone({
          origin: [0, 0],
          width: result.width,
          height: result.height
        });
        setIsGettingInitalState(false);
      })
      .catch((err) => console.log(err));
  }

  function changeUnitsCount(newUnitCount) {
    setSelectedFocusView(null);
    resetSelectedUnits();

    setUnitsData(
      Array(newUnitCount)
        .fill(0)
        .map((item, index) => {
          return {
            id: index + 1,
            coordinates: [0, 0],
            status: false,
            shape: "circle",
            text: getStatusText(index % 4),
            timerPosition: getTimerPosition(index % 4)
          };
        })
    );
  }

  // --- units data update ---

  function setAllUnitStatusToAvailable() {
    setUnitsData((value) =>
      value.map((item) => {
        return { ...item, status: false };
      })
    );
  }

  function setAllUnitStatusToUnavailable() {
    setUnitsData((value) =>
      value.map((item) => {
        return { ...item, status: true };
      })
    );
  }

  function setAllUnitStatusRandomly() {
    setUnitsData((value) =>
      value.map((item) => {
        return {
          ...item,
          status: Math.round(Math.random() * 10) > 5 ? true : false
        };
      })
    );
  }

  function changeAllUnitsShapeToRect() {
    resetSelectedUnits();

    setUnitsData((value) =>
      value.map((item) => {
        return {
          ...item,
          shape: "rect"
        };
      })
    );
  }

  function changeAllUnitsShapeToCircle() {
    resetSelectedUnits();

    setUnitsData((value) =>
      value.map((item) => {
        return {
          ...item,
          shape: "circle"
        };
      })
    );
  }

  function changeAllUnitsShapeToDiamond() {
    resetSelectedUnits();

    setUnitsData((value) =>
      value.map((item) => {
        return {
          ...item,
          shape: "diamond"
        };
      })
    );
  }

  function changeAllUnitsShapeRandomly() {
    resetSelectedUnits();

    setUnitsData((value) =>
      value.map((item) => {
        const rng = Math.round(Math.random() * 15);
        let shape = "rect";

        if (rng <= 5) {
          shape = "rect";
        }

        if (rng > 5 && rng <= 10) {
          shape = "circle";
        }

        if (rng > 10 && rng <= 15) {
          shape = "diamond";
        }

        return {
          ...item,
          shape: shape
        };
      })
    );
  }

  function moveAllUnitsRandomly() {
    setSelectedFocusView(null);
    resetSelectedUnits();

    setUnitsData((value) =>
      value.map((item) => {
        return {
          ...item,
          coordinates: [
            Math.round(Math.random() * digitisationZone.width) /
              digitisationZone.width,
            Math.round(Math.random() * digitisationZone.height) /
              digitisationZone.height
          ]
        };
      })
    );
  }

  // --- focus view creation ---

  function toggleFocusViewCreation() {
    setIsCreatingFocusView(!isCreatingFocusView);
  }

  // --- path creation ---

  function togglePathCreation() {
    setIsCreatingPath(!isCreatingPath);
  }

  // --- select unit and focus view ---

  function resetSelectedUnits() {
    setSelectedUnits([]);
    svgElementRef.current
      .selectAll(".floorplan-svg-group")
      .selectAll(".line-nearby-radius")
      .remove();
    svgElementRef.current
      .selectAll(".floorplan-svg-group")
      .selectAll(".circle-nearby-radius")
      .remove();
  }

  function zoomToUnitAndDetectNearby(id) {
    const sizeScale = scaleLinear()
      .domain([0, 100])
      .range([0, Math.abs(digitisationZone.width)]);

    setSelectedFocusView(null);
    resetSelectedUnits();

    const selectedCenterUnit = unitsData.find((item, index) => item.id === id);

    const centerCoordinates = getRealPointCoordinateRelativeToDigitisationZone(
      digitisationZone,
      currentRotation,
      selectedCenterUnit.coordinates[0],
      selectedCenterUnit.coordinates[1]
    );

    svgElementRef.current
      .selectAll(".floorplan-svg-group")
      .append("circle")
      .attr("class", "circle-nearby-radius")
      .attr("cx", centerCoordinates[0])
      .attr("cy", centerCoordinates[1])
      .attr("r", sizeScale(selectedNearbyDistance))
      .attr("fill", "black")
      .attr("opacity", "0.5")
      .attr("stroke", "red");

    let newSelectedUnits = [];
    unitsData.forEach((item) => {
      const currentUnitCoordinates = getRealPointCoordinateRelativeToDigitisationZone(
        digitisationZone,
        currentRotation,
        item.coordinates[0],
        item.coordinates[1]
      );

      const distanceFromCenter = Math.sqrt(
        (centerCoordinates[0] - currentUnitCoordinates[0]) ** 2 +
          (centerCoordinates[1] - currentUnitCoordinates[1]) ** 2
      );

      if (distanceFromCenter <= sizeScale(selectedNearbyDistance)) {
        newSelectedUnits = [...newSelectedUnits, item.id];

        svgElementRef.current
          .selectAll(".floorplan-svg-group")
          .append("line")
          .attr("class", "line-nearby-radius")
          .attr("x1", centerCoordinates[0])
          .attr("y1", centerCoordinates[1])
          .attr("x2", currentUnitCoordinates[0])
          .attr("y2", currentUnitCoordinates[1])
          .attr("style", "stroke:rgb(255,0,0);stroke-width:1");
      }
    });
    setSelectedUnits(newSelectedUnits);

    // zoom in

    const zoomLevelX = floorplan.width / sizeScale(selectedNearbyDistance * 2);
    const zoomLevelY = floorplan.height / sizeScale(selectedNearbyDistance * 2);
    const zoomLevel = Math.min(zoomLevelX, zoomLevelY);

    svgElementRef.current.transition().call(
      svgZoomRef.current.transform,
      zoomIdentity
        .translate(floorplan.width / 2, floorplan.height / 2)
        .scale(zoomLevel)
        .translate(-centerCoordinates[0], -centerCoordinates[1])
    );
  }

  function zoomToFocusView(id) {
    setSelectedFocusView(id);
    resetSelectedUnits();

    const widthSizeScale = scaleLinear()
      .domain([0, 1])
      .range([0, Math.abs(digitisationZone.width)]);
    const heightSizeScale = scaleLinear()
      .domain([0, 1])
      .range([0, Math.abs(digitisationZone.height)]);

    const selectedFV = focusViews.find((item, index) => index === id);

    const selectedFVX = selectedFV.map((item) => item[0]);
    const selectedFVY = selectedFV.map((item) => item[1]);

    const top = Math.min(...selectedFVY);
    const bottom = Math.max(...selectedFVY);
    const left = Math.min(...selectedFVX);
    const right = Math.max(...selectedFVX);

    const width = right - left;
    const height = bottom - top;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const realCenterCoordinate = getRealPointCoordinateRelativeToDigitisationZone(
      digitisationZone,
      currentRotation,
      centerX,
      centerY
    );

    const zoomLevelX = floorplan.width / widthSizeScale(width);
    const zoomLevelY = floorplan.height / heightSizeScale(height);
    const zoomLevel = Math.min(zoomLevelX, zoomLevelY);

    svgElementRef.current.transition().call(
      svgZoomRef.current.transform,
      zoomIdentity
        .translate(floorplan.width / 2, floorplan.height / 2)
        .scale(zoomLevel)
        .translate(-realCenterCoordinate[0], -realCenterCoordinate[1])
    );
  }

  // find path

  function findPath() {
    const simplifiedPathData = {};
    pathData.forEach((item) => {
      simplifiedPathData[item.id] = {};
      item.neighbors.forEach((item1) => {
        simplifiedPathData[item.id][item1.id] = item1.distance;
      });
    });

    console.log(JSON.stringify(simplifiedPathData), JSON.stringify(pathData));

    const result = dijkstrajs.find_path(
      simplifiedPathData,
      selectedStartPath,
      selectedEndPath
    );
    setSelectedPath(result);
  }

  // -- zoom and reset zoom pan --

  function zoomIn() {
    svgElementRef.current.transition().call(svgZoomRef.current.scaleBy, 2);
    setSelectedFocusView(null);
    resetSelectedUnits();
  }

  function zoomOut() {
    svgElementRef.current.transition().call(svgZoomRef.current.scaleBy, 0.5);
    setSelectedFocusView(null);
    resetSelectedUnits();
  }

  function resetZoomAndPosition() {
    svgElementRef.current
      .transition()
      .call(
        svgZoomRef.current.transform,
        zoomIdentity.translate(0, 0).scale(1)
      );
    setSelectedFocusView(null);
    resetSelectedUnits();
  }

  React.useEffect(() => {
    setupInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isGettingInitialState) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <h3>d3.js Floorplan Experiment</h3>
      <div className="input-container">
        <button onClick={changeFloorplanData}>change floorplan</button>
        <button onClick={() => changeFloorplanData("90")}>
          change to 90 degree floorplan
        </button>
        <button onClick={() => changeFloorplanData("180")}>
          change to 180 degree floorplan
        </button>
        <button onClick={() => changeFloorplanData("270")}>
          change to 270 degree floorplan
        </button>
        <button onClick={() => changeFloorplanData("flipX")}>
          change to horizontal flipped floorplan
        </button>
        <button onClick={() => changeFloorplanData("flipY")}>
          change to vertical flipped floorplan
        </button>

        <div>
          <div>
            <span>digitisation zone origin x:</span>
            <input
              type="range"
              min="-2000"
              max="2000"
              value={digitisationZone.origin[0]}
              onChange={(ev) => {
                resetSelectedUnits();
                setSelectedFocusView(null);
                setDigitisationZone({
                  origin: [
                    parseInt(ev.target.value, 10),
                    digitisationZone.origin[1]
                  ],
                  width: digitisationZone.width,
                  height: digitisationZone.height
                });
              }}
            />
            <input
              type="number"
              min="-2000"
              max="2000"
              value={digitisationZone.origin[0]}
              onChange={(ev) => {
                resetSelectedUnits();
                setSelectedFocusView(null);
                setDigitisationZone({
                  origin: [
                    parseInt(ev.target.value, 10),
                    digitisationZone.origin[1]
                  ],
                  width: digitisationZone.width,
                  height: digitisationZone.height
                });
              }}
            />
          </div>
          <div>
            <span>digitisation zone origin y:</span>
            <input
              type="range"
              min="-2000"
              max="2000"
              value={digitisationZone.origin[1]}
              onChange={(ev) => {
                resetSelectedUnits();
                setSelectedFocusView(null);
                setDigitisationZone({
                  origin: [
                    digitisationZone.origin[0],
                    parseInt(ev.target.value, 10)
                  ],
                  width: digitisationZone.width,
                  height: digitisationZone.height
                });
              }}
            />
            <input
              type="number"
              min="-2000"
              max="2000"
              value={digitisationZone.origin[1]}
              onChange={(ev) => {
                resetSelectedUnits();
                setSelectedFocusView(null);
                setDigitisationZone({
                  origin: [
                    digitisationZone.origin[0],
                    parseInt(ev.target.value, 10)
                  ],
                  width: digitisationZone.width,
                  height: digitisationZone.height
                });
              }}
            />
          </div>
          <div>
            <span>digitisation zone width:</span>
            <input
              type="range"
              min="-2000"
              max="2000"
              value={digitisationZone.width}
              onChange={(ev) => {
                resetSelectedUnits();
                setSelectedFocusView(null);
                setDigitisationZone({
                  origin: [
                    digitisationZone.origin[0],
                    digitisationZone.origin[1]
                  ],
                  width: parseInt(ev.target.value, 10),
                  height: digitisationZone.height
                });
              }}
            />
            <input
              type="number"
              min="-2000"
              max="2000"
              value={digitisationZone.width}
              onChange={(ev) => {
                resetSelectedUnits();
                setSelectedFocusView(null);
                setDigitisationZone({
                  origin: [
                    digitisationZone.origin[0],
                    digitisationZone.origin[1]
                  ],
                  width: parseInt(ev.target.value, 10),
                  height: digitisationZone.height
                });
              }}
            />
          </div>
          <div>
            <span>digitisation zone height:</span>
            <input
              type="range"
              min="-2000"
              max="2000"
              value={digitisationZone.height}
              onChange={(ev) => {
                resetSelectedUnits();
                setSelectedFocusView(null);
                setDigitisationZone({
                  origin: [
                    digitisationZone.origin[0],
                    digitisationZone.origin[1]
                  ],
                  width: digitisationZone.width,
                  height: parseInt(ev.target.value, 10)
                });
              }}
            />
            <input
              type="number"
              min="-2000"
              max="2000"
              value={digitisationZone.height}
              onChange={(ev) => {
                resetSelectedUnits();
                setSelectedFocusView(null);
                setDigitisationZone({
                  origin: [
                    digitisationZone.origin[0],
                    digitisationZone.origin[1]
                  ],
                  width: digitisationZone.width,
                  height: parseInt(ev.target.value, 10)
                });
              }}
            />
          </div>
        </div>
        <div className="input">
          <input
            type="range"
            min="0"
            max="360"
            value={currentRotation}
            onChange={(ev) => {
              resetSelectedUnits();
              setSelectedFocusView(null);
              const value = parseInt(ev.target.value, 10);
              if (value >= 0) {
                setCurrentRotation(value);
              }
            }}
          />
          <input
            type="number"
            min="0"
            max="360"
            value={currentRotation}
            onChange={(ev) => {
              resetSelectedUnits();
              setSelectedFocusView(null);
              const value = parseInt(ev.target.value, 10);
              if (value >= 0) {
                setCurrentRotation(value);
              }
            }}
          />
          <span> digitisation zone rotation</span>
        </div>
        <div className="input">
          <input
            type="number"
            value={unitsCount}
            onChange={(ev) => {
              const value = parseInt(ev.target.value, 10);

              if (value >= 0) {
                setUnitsCount(value);
              }
            }}
          />
          <button onClick={() => changeUnitsCount(unitsCount)}>
            change units count
          </button>
        </div>
        <div className="input">
          <input
            type="number"
            value={selectedNearbyDistance}
            onChange={(ev) => {
              const value = parseInt(ev.target.value, 10);

              if (value >= 0) {
                setSelectedNearbyDistance(value);
              }
            }}
          />
          <span>change nearby distance radius</span>
        </div>
      </div>
      <div className="button-container-1">
        <button onClick={setAllUnitStatusToAvailable}>
          set all units status to available
        </button>
        <button onClick={setAllUnitStatusToUnavailable}>
          set all units status to unavailable
        </button>
        <button onClick={setAllUnitStatusRandomly}>
          set all units status randomly
        </button>
        <button onClick={changeAllUnitsShapeToRect}>
          set all units shape to rectangle
        </button>
        <button onClick={changeAllUnitsShapeToCircle}>
          set all units shape to circle
        </button>
        <button onClick={changeAllUnitsShapeToDiamond}>
          set all units shape to diamond
        </button>
        <button onClick={changeAllUnitsShapeRandomly}>
          set all units shape randomly
        </button>
        <button onClick={moveAllUnitsRandomly}>move all units randomly</button>
      </div>
      <div className="button-container-1">
        <div>
          <span>start point</span>
          <select
            value={selectedStartPath}
            onChange={(ev) => {
              setSelectedStartPath(ev.target.value);
              setSelectedEndPath("");
              setSelectedPath([]);
            }}
          >
            <option value="0">No start point selected</option>
            {pathData.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span>end point</span>
          <select
            value={selectedEndPath}
            onChange={(ev) => {
              setSelectedEndPath(ev.target.value);
              setSelectedPath([]);
            }}
          >
            <option value="0">No end point selected</option>
            {pathData
              .filter((item) => item.id !== selectedStartPath)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id}
                </option>
              ))}
          </select>
        </div>
        <button onClick={findPath}>find path</button>
      </div>
      <div className="floorplan-container">
        <FloorplanWithoutRotation
          isGettingInitialState={isGettingInitialState}
          floorplan={floorplanForNonRotate}
          digitisationZone={digitisationZoneForNonRotate}
          currentRotation={currentRotationForNonRotate}
          unitsData={unitsData}
          focusViews={focusViews}
          selectedUnits={selectedUnits}
          pathData={pathData}
          selectedStartPath={selectedStartPath}
          selectedEndPath={selectedEndPath}
          selectedPath={selectedPath}
        />
        <Floorplan
          isGettingInitialState={isGettingInitialState}
          svgElementRef={svgElementRef}
          svgZoomRef={svgZoomRef}
          floorplan={floorplan}
          digitisationZone={digitisationZone}
          currentRotation={currentRotation}
          unitsData={unitsData}
          focusViews={focusViews}
          resetSelectedFocusView={() => setSelectedFocusView(null)}
          resetSelectedUnits={resetSelectedUnits}
          selectedUnits={selectedUnits}
          pathData={pathData}
          selectedStartPath={selectedStartPath}
          selectedEndPath={selectedEndPath}
          selectedPath={selectedPath}
          zoomToUnit={zoomToUnitAndDetectNearby}
        />
      </div>
      <div className="button-container-2">
        <button onClick={zoomIn}>zoom in</button>
        <button onClick={zoomOut}>zoom out</button>
        <button onClick={resetZoomAndPosition}>zoom and pan reset</button>
      </div>
      <div className="focus-view-container">
        <h4>Focus View(Zoning)</h4>
        <div className="zoom-to-focus-view-buttons-container">
          {focusViews.map((item, index) => {
            return (
              <div key={index}>
                <button onClick={() => zoomToFocusView(index)}>
                  zoom to focus view {index}
                </button>
                <span>{selectedFocusView === index ? "selected" : ""}</span>
              </div>
            );
          })}
        </div>
        {!isCreatingFocusView ? (
          <button
            id="create-focus-view-button"
            onClick={toggleFocusViewCreation}
          >
            create focus view
          </button>
        ) : null}
        {isCreatingFocusView ? (
          <FocusViewCreationFloorplan
            isGettingInitialState={isGettingInitialState}
            floorplan={floorplan}
            digitisationZone={digitisationZone}
            currentRotation={currentRotation}
            toggleFocusViewCreation={toggleFocusViewCreation}
            setFocusViews={setFocusViews}
          />
        ) : null}
      </div>
      <div className="path-floorplan-container">
        <h4>Path</h4>
        {!isCreatingPath ? (
          <button id="create-path-button" onClick={togglePathCreation}>
            create path
          </button>
        ) : null}
        {isCreatingPath ? (
          <PathCreationFloorplan
            isGettingInitialState={isGettingInitialState}
            floorplan={floorplan}
            digitisationZone={digitisationZone}
            currentRotation={currentRotation}
            togglePathCreation={togglePathCreation}
            setPath={(data) => setPathData(data)}
          />
        ) : null}
      </div>
    </div>
  );
}
