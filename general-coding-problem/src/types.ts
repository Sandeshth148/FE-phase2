/** Defines a numeric range with min and max values. */
export interface Range {
  min: number;
  max: number;
}

/** Represents a hardware camera with distance and light range support. */
export interface Camera {
  distance: Range;
  light: Range;
}

/** Desired software camera configuration to be supported. */
export interface SoftwareCamera {
  distance: Range;
  light: Range;
}
