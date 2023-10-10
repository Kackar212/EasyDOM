import { attachEvent, trigger, on, off } from "./Event";
import * as domManipulation from "./DOMManipulation";
import * as attributes from "./Attributes";
import * as elements from "./Elements";
import * as elementContent from "./ElementContent";

const methods = {
  ...domManipulation,
  ...attributes,
  ...elementContent,
  ...elements,
  attachEvent,
  trigger,
  on,
  off,
};

export default methods;
