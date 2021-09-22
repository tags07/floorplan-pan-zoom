function renderTimer(
  element,
  unitX,
  unitY,
  timeText,
  digitisationSpace,
  rectTransform,
  gTransform,
  textTransform,
  isHorizontalTimer
) {
  // black bar
  element
    .append("rect")
    .attr("x", unitX)
    .attr("y", unitY)
    .attr("width", Math.abs(digitisationSpace.width) / 20)
    .attr("height", Math.abs(digitisationSpace.width) / 55)
    .attr("transform", rectTransform)
    .attr("fill", "black");

  // arrow pointer
  element
    .append("g")
    .attr("transform", gTransform)
    .append("rect")
    .attr("width", Math.abs(digitisationSpace.width) / 130)
    .attr("height", Math.abs(digitisationSpace.width) / 130)
    .attr("fill", "black")
    .attr("transform", "rotate(45)");

  // timer text
  element
    .append("text")
    .attr("x", unitX)
    .attr("y", unitY)
    .attr("transform", textTransform)
    .attr("text-anchor", () => {
      if (isHorizontalTimer) {
        return "start";
      }

      return "middle";
    })
    .attr("fill", "white")
    .attr("font-size", Math.abs(digitisationSpace.width) / 100)
    .text(timeText);
}

function renderTimerTop(
  element,
  unitX,
  unitY,
  unitSize,
  timeText,
  digitisationSpace
) {
  renderTimer(
    element,
    unitX,
    unitY,
    timeText,
    digitisationSpace,
    (value) =>
      `translate(-${Math.abs(digitisationSpace.width) / 20 / 2}, -${
        Math.abs(digitisationSpace.width) / 60 +
        unitSize(value) +
        Math.abs(digitisationSpace.width) / 130
      })`,
    (value) =>
      `translate(${unitX(value)}, ${
        unitY(value) -
        (Math.abs(digitisationSpace.width) / 130) * 1.5 -
        unitSize(value)
      })`,
    (value) =>
      `translate(0, -${
        Math.abs(digitisationSpace.width) / 80 + unitSize(value)
      })`,
    false
  );
}

function renderTimerBottom(
  element,
  unitX,
  unitY,
  unitSize,
  timeText,
  digitisationSpace
) {
  renderTimer(
    element,
    unitX,
    unitY,
    timeText,
    digitisationSpace,
    (value) =>
      `translate(-${Math.abs(digitisationSpace.width) / 20 / 2}, ${
        unitSize(value) + Math.abs(digitisationSpace.width) / 130 / 1.5
      })`,
    (value) => `translate(${unitX(value)}, ${unitY(value) + unitSize(value)})`,
    (value) =>
      `translate(0, ${
        unitSize(value) + Math.abs(digitisationSpace.width) / 55
      })`,
    false
  );
}

function renderTimerLeft(
  element,
  unitX,
  unitY,
  unitSize,
  timeText,
  digitisationSpace
) {
  renderTimer(
    element,
    unitX,
    unitY,
    timeText,
    digitisationSpace,
    (value) =>
      `translate(-${
        unitSize(value) +
        Math.abs(digitisationSpace.width) / 130 +
        Math.abs(digitisationSpace.width) / 20
      }, -${Math.abs(digitisationSpace.width) / 55 / 2})`,
    (value) =>
      `translate(${
        unitX(value) - unitSize(value) - Math.abs(digitisationSpace.width) / 140
      }, ${unitY(value) - Math.abs(digitisationSpace.width) / 130 / 1.5})`,
    (value) =>
      `translate(-${
        unitSize(value) +
        Math.abs(digitisationSpace.width) / 65 +
        Math.abs(digitisationSpace.width) / 28
      }, ${Math.abs(digitisationSpace.width) / 55 / 5})`,
    true
  );
}

function renderTimerRight(
  element,
  unitX,
  unitY,
  unitSize,
  timeText,
  digitisationSpace
) {
  renderTimer(
    element,
    unitX,
    unitY,
    timeText,
    digitisationSpace,
    (value) =>
      `translate(${
        unitSize(value) + Math.abs(digitisationSpace.width) / 130
      }, -${Math.abs(digitisationSpace.width) / 55 / 2})`,
    (value) =>
      `translate(${
        unitX(value) + unitSize(value) + Math.abs(digitisationSpace.width) / 135
      }, ${unitY(value) - Math.abs(digitisationSpace.width) / 130 / 1.5})`,
    (value) =>
      `translate(${unitSize(value) + Math.abs(digitisationSpace.width) / 65}, ${
        Math.abs(digitisationSpace.width) / 55 / 5
      })`,
    true
  );
}

export { renderTimerTop, renderTimerBottom, renderTimerLeft, renderTimerRight };
