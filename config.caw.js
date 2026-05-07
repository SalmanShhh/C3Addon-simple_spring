import {
  ADDON_CATEGORY,
  ADDON_TYPE,
  PLUGIN_TYPE,
  PROPERTY_TYPE,
} from "./template/enums.js";
import _version from "./version.js";
export const addonType = ADDON_TYPE.BEHAVIOR;
export const type = PLUGIN_TYPE.OBJECT;
export const id = "salmanshh_simple_spring";
export const name = "Simple Spring";
export const version = _version;
export const minConstructVersion = undefined;
export const author = "SalmanShh";
export const website = "https://www.construct.net";
export const documentation = "https://www.construct.net";
export const description = "Simple numeric spring physics with multiple named springs per behavior instance, plus object-level mesh effects.";
export const category = ADDON_CATEGORY.GENERAL;

export const hasDomside = false;
export const files = {
  extensionScript: {
    enabled: false, // set to false to disable the extension script
    watch: true, // set to true to enable live reload on changes during development
    targets: ["x86", "x64"],
    // you don't need to change this, the build step will rename the dll for you. Only change this if you change the name of the dll exported by Visual Studio
    name: "MyExtension",
  },
  fileDependencies: [],
  remoteFileDependencies: [
    // {
    //   src: "https://example.com/api.js", // Must use https:// or same-protocol // URLs. http:// is not allowed.
    //   type: "" // Optional: "" or "module". Empty string or omit for classic script.
    // }
  ],
  cordovaPluginReferences: [],
  cordovaResourceFiles: [],
};

// categories that are not filled will use the folder name
export const aceCategories = {
  Core_Spring_DEPRECATED: "Core Spring (DEPRECATED)",
  Multi_Spring: "Spring Values",
  Multi_Spring_Playback: "Springs Playback",
  Colour_Spring: "Colour Spring",
  Spring_Position: "Spring Position",
  Spring_Size: "Spring Size",
  Spring_Angle: "Spring Angle",
  Mesh_Setup: "Mesh Setup",
  Mesh_Effects: "Mesh Effects",
  Mesh_State: "Mesh State",
};

export const info = {
  // icon: "icon.svg",
  // PLUGIN world only
  // defaultImageUrl: "default-image.png",
  Set: {
    // COMMON to all
    CanBeBundled: true,
    IsDeprecated: false,
    GooglePlayServicesEnabled: false,

    // BEHAVIOR only
    IsOnlyOneAllowed: false,

    // PLUGIN world only
    IsResizable: false,
    IsRotatable: false,
    Is3D: false,
    HasImage: false,
    IsTiled: false,
    SupportsZElevation: false,
    SupportsColor: false,
    SupportsEffects: false,
    MustPreDraw: false,

    // PLUGIN object only
    IsSingleGlobal: true,
  },
  // PLUGIN only
  AddCommonACEs: {
    Position: false,
    SceneGraph: false,
    Size: false,
    Angle: false,
    Appearance: false,
    ZOrder: false,
  },
};

export const properties = [
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "stiffness",
    name: "Default Stiffness",
    desc: "Default stiffness applied to newly created springs. How quickly the spring responds - increase for faster response.",
    options: {
      initialValue: 1.25,
      minValue: 0.,
    },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "damping",
    name: "Default Damping",
    desc: "Default damping applied to newly created springs (0-1). Increase to reduce overshoot and oscillation.",
    options: {
      initialValue: 0.9,
      minValue: 0,
      maxValue: 1,
    },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "precision",
    name: "Default Precision",
    desc: "Default precision applied to newly created springs. Threshold to consider animation complete - lower values require closer proximity to target.",
    options: {
      initialValue: 0.01,
      minValue: 0.0001,
      maxValue: 1,
    },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "enabled",
    name: "Enabled",
    desc: "Enable or disable the spring behavior.",
    options: {
      initialValue: true,
    },
  },
];
