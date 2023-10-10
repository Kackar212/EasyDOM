const eventTypes = new Map();

eventTypes.set(
  [
    "click",
    "contextmenu",
    "dblclick",
    "mousedown",
    "mouseleave",
    "mousemove",
    "mouseover",
    "mouseout",
    "mouseup",
    "pointerlockchange",
    "pointerlockerror",
    "select",
    "wheel",
    "auxclick",
    "mouseenter",
  ],
  MouseEvent
);

eventTypes.set(["focus", "blur", "focusin", "focusout"], FocusEvent);

eventTypes.set(["keyup", "keydown", "keypress"], KeyboardEvent);

eventTypes.set(["input", "beforeinput"], InputEvent);

eventTypes.set(["wheel"], WheelEvent);

eventTypes.set(
  ["touchend", "touchmove", "touchstart", "touchcancel"],
  window.hasOwnProperty("TouchEvent") ? TouchEvent : Event
);

export default eventTypes;
