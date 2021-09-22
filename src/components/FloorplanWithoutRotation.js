import React from "react";
import { select, scaleLinear, zoom } from "d3";

import {
  lerp,
  getRealPointCoordinateRelativeToDigitisationZone
} from "../utils";
import {
  renderTimerTop,
  renderTimerBottom,
  renderTimerLeft,
  renderTimerRight
} from "./timerRenderer";

export default function Floorplan({
  isGettingInitialState,
  floorplan,
  digitisationZone,
  currentRotation,
  unitsData,
  focusViews,
  selectedUnits,
  pathData,
  selectedStartPath,
  selectedEndPath,
  selectedPath
}) {
  React.useEffect(() => {
    if (!isGettingInitialState) {
      const D3SVG = select("#floorplan-container--no-rotation")
        .selectAll(".floorplan-svg--no-rotation")
        .data([floorplan])
        .join("svg")
        .attr("class", "floorplan-svg--no-rotation")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", (value) => `0 0 ${value.width} ${value.height}`);

      const groupElement = D3SVG.selectAll(".floorplan-svg-group--no-rotation")
        .data([floorplan])
        .join("g")
        .attr("class", "floorplan-svg-group--no-rotation");
      groupElement
        .selectAll(".floorplan-image")
        .data([floorplan])
        .join("image")
        .attr("class", "floorplan-image")
        .attr("xlink:href", (value) => value.floorplanPath)
        .attr("width", (value) => value.width)
        .attr("height", (value) => value.height);

      D3SVG.call(
        zoom().on("zoom", (ev) => {
          const transform = ev.transform;

          groupElement.attr(
            "transform",
            `translate(${transform.x}, ${transform.y}) scale(${transform.k})`
          );
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGettingInitialState, floorplan]);

  React.useEffect(() => {
    if (!isGettingInitialState) {
      const D3SVG = select(".floorplan-svg-group--no-rotation");

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

      D3SVG.selectAll(".digitisation-zone-rect")
        .data([digitisationZone])
        .join("rect")
        .attr("class", "digitisation-zone-rect")
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

      D3SVG.selectAll(".digitisation-zone-origin-point")
        .data([digitisationZone])
        .join("circle")
        .attr("class", "digitisation-zone-origin-point")
        .attr("r", "5")
        .attr("fill", "blue")
        .attr("cx", (value) => value.origin[0])
        .attr("cy", (value) => value.origin[1])
        .attr(
          "transform",
          `rotate(${currentRotation}, ${digitisationZoneOriginCoordinate[0]}, ${digitisationZoneOriginCoordinate[1]})`
        );
      D3SVG.selectAll(".digitisation-zone-right-bottom-point")
        .data([digitisationZone])
        .join("circle")
        .attr("class", "digitisation-zone-right-bottom-point")
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

  React.useEffect(() => {
    if (!isGettingInitialState) {
      const sizeScale = scaleLinear()
        .domain([0, 100])
        .range([0, (Math.abs(digitisationZone.width) * 10) / 100]);

      const D3SVG = select(".floorplan-svg-group--no-rotation");

      const rectShapedUnits = unitsData.filter((item) => item.shape === "rect");
      const circleShapedUnits = unitsData.filter(
        (item) => item.shape === "circle"
      );
      const diamondShapedUnits = unitsData.filter(
        (item) => item.shape === "diamond"
      );

      D3SVG.selectAll(".rect-units")
        .data(rectShapedUnits)
        .join("rect")
        .attr("class", "rect-units")
        .attr("id", (data) => `units-${data.id}`)
        .attr("width", sizeScale(40))
        .attr("height", sizeScale(40))
        .attr(
          "transform",
          `translate(-${sizeScale(40) / 2},-${sizeScale(40) / 2})`
        )
        .attr("fill", (value) => {
          if (selectedUnits.includes(value.id)) {
            return "blue";
          }

          if (value.status) {
            return "red";
          } else {
            return "green";
          }
        })
        .attr(
          "x",
          (value) =>
            getRealPointCoordinateRelativeToDigitisationZone(
              digitisationZone,
              currentRotation,
              value.coordinates[0],
              value.coordinates[1]
            )[0]
        )
        .attr(
          "y",
          (value) =>
            getRealPointCoordinateRelativeToDigitisationZone(
              digitisationZone,
              currentRotation,
              value.coordinates[0],
              value.coordinates[1]
            )[1]
        );
      D3SVG.selectAll(".circle-units")
        .data(circleShapedUnits)
        .join("circle")
        .attr("class", "circle-units")
        .attr("id", (data) => `units-${data.id}`)
        .attr("r", sizeScale(40) / 2)
        .attr("fill", (value) => {
          if (selectedUnits.includes(value.id)) {
            return "blue";
          }

          if (value.status) {
            return "red";
          } else {
            return "green";
          }
        })
        .attr(
          "cx",
          (value) =>
            getRealPointCoordinateRelativeToDigitisationZone(
              digitisationZone,
              currentRotation,
              value.coordinates[0],
              value.coordinates[1]
            )[0]
        )
        .attr(
          "cy",
          (value) =>
            getRealPointCoordinateRelativeToDigitisationZone(
              digitisationZone,
              currentRotation,
              value.coordinates[0],
              value.coordinates[1]
            )[1]
        );
      D3SVG.selectAll(".diamond-units")
        .data(diamondShapedUnits)
        .join(
          (enter) => {
            const g = enter.append("g");

            g.append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", sizeScale(40))
              .attr("height", sizeScale(40))
              .attr("transform", () => {
                return `rotate(45 ${sizeScale(40) / 2} ${sizeScale(40) / 2})`;
              });

            return g;
          },
          (update) => {
            update
              .selectAll("*")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", sizeScale(40))
              .attr("height", sizeScale(40))
              .attr("transform", () => {
                return `rotate(45 ${sizeScale(40) / 2} ${sizeScale(40) / 2})`;
              });

            return update;
          }
        )
        .attr("class", "diamond-units")
        .attr("id", (data) => `units-${data.id}`)
        .attr("transform", (value) => {
          const coordinates = getRealPointCoordinateRelativeToDigitisationZone(
            digitisationZone,
            currentRotation,
            value.coordinates[0],
            value.coordinates[1]
          );

          return `translate(${coordinates[0]},${coordinates[1]}) translate(-${
            sizeScale(40) / 2
          },-${sizeScale(40) / 2})`;
        })
        .attr("fill", (value) => {
          if (selectedUnits.includes(value.id)) {
            return "blue";
          }

          if (value.status) {
            return "red";
          } else {
            return "green";
          }
        });

      D3SVG.selectAll(".text-units")
        .data(unitsData)
        .join("text")
        .attr("class", "text-units")
        .attr(
          "x",
          (value) =>
            getRealPointCoordinateRelativeToDigitisationZone(
              digitisationZone,
              currentRotation,
              value.coordinates[0],
              value.coordinates[1]
            )[0]
        )
        .attr(
          "y",
          (value) =>
            getRealPointCoordinateRelativeToDigitisationZone(
              digitisationZone,
              currentRotation,
              value.coordinates[0],
              value.coordinates[1]
            )[1]
        )
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("dominant-baseline", "central")
        .attr("font-size", (value) =>
          value.text === "N/A" ? sizeScale(40) / 2 / 1.5 : sizeScale(40) / 2
        )
        .text((value) => value.text);

      [
        { direction: "top", renderTimerFunc: renderTimerTop },
        { direction: "bottom", renderTimerFunc: renderTimerBottom },
        { direction: "left", renderTimerFunc: renderTimerLeft },
        { direction: "right", renderTimerFunc: renderTimerRight }
      ].forEach((item) => {
        D3SVG.selectAll(`.units-timer-${item.direction}`)
          .data(
            unitsData.filter((unit) => unit.timerPosition === item.direction)
          )
          .join(
            (enter) => {
              const g = enter.append("g");

              item.renderTimerFunc(
                g,
                (value) =>
                  getRealPointCoordinateRelativeToDigitisationZone(
                    digitisationZone,
                    currentRotation,
                    value.coordinates[0],
                    value.coordinates[1]
                  )[0],
                (value) =>
                  getRealPointCoordinateRelativeToDigitisationZone(
                    digitisationZone,
                    currentRotation,
                    value.coordinates[0],
                    value.coordinates[1]
                  )[1],
                () => sizeScale(40) / 2,
                () => "00:00:00",
                digitisationZone
              );

              return g;
            },
            (update) => {
              update.selectAll("*").remove();

              item.renderTimerFunc(
                update,
                (value) =>
                  getRealPointCoordinateRelativeToDigitisationZone(
                    digitisationZone,
                    currentRotation,
                    value.coordinates[0],
                    value.coordinates[1]
                  )[0],
                (value) =>
                  getRealPointCoordinateRelativeToDigitisationZone(
                    digitisationZone,
                    currentRotation,
                    value.coordinates[0],
                    value.coordinates[1]
                  )[1],
                () => sizeScale(40) / 2,
                () => "00:00:00",
                digitisationZone
              );

              return update;
            }
          )
          .attr("class", `units-timer-${item.direction}`);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isGettingInitialState,
    floorplan,
    unitsData,
    selectedUnits,
    digitisationZone,
    currentRotation
  ]);

  // render focus view
  React.useEffect(() => {
    if (!isGettingInitialState) {
      const D3SVG = select(".floorplan-svg-group--no-rotation");

      D3SVG.selectAll(".floorplan-focus-view-polygon-units")
        .data(focusViews)
        .join("polygon")
        .attr("class", "floorplan-focus-view-polygon-units")
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
    focusViews,
    digitisationZone,
    currentRotation
  ]);

  // render path data
  React.useEffect(() => {
    const lineData = pathData
      .map((item) => {
        return item.neighbors
          .map((item1) => {
            if (item1.isParent) return null;
            return [
              item.coordinates[0],
              item.coordinates[1],
              item1.coordinates[0],
              item1.coordinates[1]
            ];
          })
          .filter((item1) => item1 !== null);
      })
      .flat();

    const sizeScale = scaleLinear()
      .domain([0, 100])
      .range([0, (Math.abs(digitisationZone.width) * 10) / 100]);
    const D3SVG = select(".floorplan-svg-group--no-rotation");

    D3SVG.selectAll(".line-path")
      .data(lineData)
      .join("line")
      .attr("class", "line-path")
      .attr("x1", (value) => {
        const coordinates = getRealPointCoordinateRelativeToDigitisationZone(
          digitisationZone,
          currentRotation,
          value[0],
          value[1]
        );

        return coordinates[0];
      })
      .attr("y1", (value) => {
        const coordinates = getRealPointCoordinateRelativeToDigitisationZone(
          digitisationZone,
          currentRotation,
          value[0],
          value[1]
        );

        return coordinates[1];
      })
      .attr("x2", (value) => {
        const coordinates = getRealPointCoordinateRelativeToDigitisationZone(
          digitisationZone,
          currentRotation,
          value[2],
          value[3]
        );

        return coordinates[0];
      })
      .attr("y2", (value) => {
        const coordinates = getRealPointCoordinateRelativeToDigitisationZone(
          digitisationZone,
          currentRotation,
          value[2],
          value[3]
        );

        return coordinates[1];
      })
      .attr("stroke", "red")
      .attr("stroke-width", () => sizeScale(5));

    D3SVG.selectAll(".path-point")
      .data(pathData)
      .join("circle")
      .attr("class", "path-point")
      .attr("r", sizeScale(5) / 2)
      .attr("fill", (value) => {
        if (selectedStartPath === value.id) {
          return "blue";
        }

        if (selectedEndPath === value.id) {
          return "green";
        }

        return "red";
      })
      .attr(
        "cx",
        (value) =>
          getRealPointCoordinateRelativeToDigitisationZone(
            digitisationZone,
            currentRotation,
            value.coordinates[0],
            value.coordinates[1]
          )[0]
      )
      .attr(
        "cy",
        (value) =>
          getRealPointCoordinateRelativeToDigitisationZone(
            digitisationZone,
            currentRotation,
            value.coordinates[0],
            value.coordinates[1]
          )[1]
      );
  }, [
    isGettingInitialState,
    floorplan,
    digitisationZone,
    currentRotation,
    pathData,
    selectedStartPath,
    selectedEndPath
  ]);

  React.useEffect(() => {
    const coordinatesData = selectedPath
      .map((item) => {
        const thisPathData = pathData.find((item1) => item1.id === item);
        const realCoordinates = getRealPointCoordinateRelativeToDigitisationZone(
          digitisationZone,
          currentRotation,
          thisPathData.coordinates[0],
          thisPathData.coordinates[1]
        );

        return realCoordinates.join(",");
      })
      .join(" ");

    const sizeScale = scaleLinear()
      .domain([0, 100])
      .range([0, (Math.abs(digitisationZone.width) * 10) / 100]);
    const D3SVG = select(".floorplan-svg-group--no-rotation");

    D3SVG.selectAll(".path-line-selected")
      .data([coordinatesData])
      .join("polyline")
      .attr("class", "path-line-selected")
      .attr("stroke", "blue")
      .attr("stroke-width", sizeScale(2))
      .attr("fill", "transparent")
      .attr("points", (value) => value);
  }, [
    isGettingInitialState,
    floorplan,
    digitisationZone,
    currentRotation,
    pathData,
    selectedStartPath,
    selectedEndPath,
    selectedPath
  ]);

  return <div id="floorplan-container--no-rotation"></div>;
}
