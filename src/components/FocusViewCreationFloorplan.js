import React from "react";
import { select, pointer, zoom, scaleLinear } from "d3";

import {
  lerp,
  getRealPointCoordinateRelativeToDigitisationZone,
  getPercentageCoordinateRelativeToDigitisationZone
} from "../utils";

export default function Floorplan({
  isGettingInitialState,
  floorplan,
  digitisationZone,
  currentRotation,
  toggleFocusViewCreation,
  setFocusViews
}) {
  const [focusViewData, setFocusViewData] = React.useState([]);

  const translationRef = React.useRef([0, 0]);
  const scaleRef = React.useRef(1);

  function saveFocusView() {
    if (focusViewData.length < 4) return;

    setFocusViews((value) => [...value, focusViewData]);
    toggleFocusViewCreation();
  }

  React.useEffect(() => {
    if (!isGettingInitialState) {
      const svg = select("#focus-view-floorplan-container")
        .selectAll(".focus-view-floorplan-svg")
        .data([floorplan])
        .join("svg")
        .attr("class", "focus-view-floorplan-svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", (value) => `0 0 ${value.width} ${value.height}`);

      const groupElement = svg
        .selectAll(".focus-view-floorplan-svg-group")
        .data([floorplan])
        .join("g")
        .attr("class", "focus-view-floorplan-svg-group");
      groupElement
        .selectAll(".focus-view-floorplan-image")
        .data([floorplan])
        .join("image")
        .attr("class", "focus-view-floorplan-image")
        .attr("xlink:href", (value) => value.floorplanPath)
        .attr("width", (value) => value.width)
        .attr("height", (value) => value.height);

      svg.call(
        zoom().on("zoom", (ev) => {
          const transform = ev.transform;

          translationRef.current = [transform.x, transform.y];
          scaleRef.current = transform.k;

          groupElement.attr(
            "transform",
            `translate(${transform.x}, ${transform.y}) scale(${transform.k})`
          );
        })
      );

      svg.on("click", function (event) {
        const coordinates = pointer(event);

        const xCoordinate =
          (coordinates[0] - translationRef.current[0]) / scaleRef.current;
        const yCoordinate =
          (coordinates[1] - translationRef.current[1]) / scaleRef.current;

        const scaledCoordinates = getPercentageCoordinateRelativeToDigitisationZone(
          digitisationZone,
          currentRotation,
          xCoordinate,
          yCoordinate
        );

        setFocusViewData((focusViewData) => {
          if (focusViewData.length >= 4) {
            return [scaledCoordinates];
          }

          return [...focusViewData, scaledCoordinates];
        });
      });
    }
  }, [isGettingInitialState, floorplan, digitisationZone, currentRotation]);

  React.useEffect(() => {
    if (!isGettingInitialState) {
      const D3SVG = select(".focus-view-floorplan-svg-group");

      const digitisationZoneOriginCoordinate = [
        lerp(
          digitisationZone.origin[0],
          digitisationZone.origin[0] + digitisationZone.width,
          0
        ),
        lerp(
          digitisationZone.origin[1],
          digitisationZone.origin[1] + digitisationZone.height,
          0
        )
      ];

      D3SVG.selectAll(".focus-view-digitisation-zone-rect")
        .data([digitisationZone])
        .join("rect")
        .attr("class", "focus-view-digitisation-zone-rect")
        .attr("x", (value) =>
          Math.min(value.origin[0], value.origin[0] + value.width)
        )
        .attr("y", (value) =>
          Math.min(value.origin[1], value.origin[1] + value.height)
        )
        .attr("width", (value) => Math.abs(value.width))
        .attr("height", (value) => Math.abs(value.height))
        .attr("fill", "black")
        .attr("opacity", "0.8")
        .attr("stroke-width", 2)
        .attr("stroke", "blue")
        .attr(
          "transform",
          `rotate(${currentRotation}, ${digitisationZoneOriginCoordinate[0]}, ${digitisationZoneOriginCoordinate[1]})`
        );

      D3SVG.selectAll(".focus-view-digitisation-zone-origin-point")
        .data([digitisationZone])
        .join("circle")
        .attr("class", "focus-view-digitisation-zone-origin-point")
        .attr("r", "5")
        .attr("fill", "blue")
        .attr("cx", (value) => value.origin[0])
        .attr("cy", (value) => value.origin[1])
        .attr(
          "transform",
          `rotate(${currentRotation}, ${digitisationZoneOriginCoordinate[0]}, ${digitisationZoneOriginCoordinate[1]})`
        );
      D3SVG.selectAll(".focus-view-digitisation-zone-right-bottom-point")
        .data([digitisationZone])
        .join("circle")
        .attr("class", "focus-view-digitisation-zone-right-bottom-point")
        .attr("r", "5")
        .attr("fill", "green")
        .attr("cx", (value) => value.origin[0] + value.width)
        .attr("cy", (value) => value.origin[1] + value.height)
        .attr(
          "transform",
          `rotate(${currentRotation}, ${digitisationZoneOriginCoordinate[0]}, ${digitisationZoneOriginCoordinate[1]})`
        );
    }
  }, [isGettingInitialState, digitisationZone, currentRotation]);

  // render focus view
  React.useEffect(() => {
    if (!isGettingInitialState) {
      const sizeScale = scaleLinear()
        .domain([0, 100])
        .range([0, (Math.abs(digitisationZone.width) * 10) / 100]);

      const D3SVG = select(".focus-view-floorplan-svg-group");

      D3SVG.selectAll(".focus-view-circle-units")
        .data(focusViewData)
        .join("circle")
        .attr("class", "focus-view-circle-units")
        .attr("r", sizeScale(10) / 2)
        .attr("fill", "red")
        .attr(
          "cx",
          (value) =>
            getRealPointCoordinateRelativeToDigitisationZone(
              digitisationZone,
              currentRotation,
              value[0],
              value[1]
            )[0]
        )
        .attr(
          "cy",
          (value) =>
            getRealPointCoordinateRelativeToDigitisationZone(
              digitisationZone,
              currentRotation,
              value[0],
              value[1]
            )[1]
        );
      D3SVG.selectAll(".focus-view-polygon-units")
        .data([focusViewData])
        .join("polygon")
        .attr("class", "focus-view-polygon-units")
        .attr("fill", "black")
        .attr("opacity", "0.8")
        .attr("stroke", "red")
        .attr("stroke-width", "2")
        .attr("points", (value) =>
          value
            .map((item) =>
              getRealPointCoordinateRelativeToDigitisationZone(
                digitisationZone,
                currentRotation,
                item[0],
                item[1]
              ).join(",")
            )
            .join(" ")
        );
    }
  }, [
    isGettingInitialState,
    floorplan,
    focusViewData,
    digitisationZone,
    currentRotation
  ]);

  return (
    <React.Fragment>
      <div className="focus-view-save-cancel-button-container">
        <button onClick={toggleFocusViewCreation}>cancel</button>
        <button onClick={saveFocusView}>save</button>
      </div>
      <div id="focus-view-floorplan-container"></div>
    </React.Fragment>
  );
}
