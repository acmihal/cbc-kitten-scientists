import { objectEntries } from "../tools/Entries";
import { Resource, TimeItemVariant, UnicornItemVariant } from "../types";
import { BonfireItem } from "./BonfireSettings";
import { FaithItem, UnicornItem } from "./ReligionSettings";
import { SettingsSection, SettingToggle } from "./SettingsSection";
import { KittenStorageType } from "./SettingsStorage";
import { SpaceItem } from "./SpaceSettings";
import { TimeItem } from "./TimeSettings";

export type CycleIndices = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type TimeControlItem = "accelerateTime" | "reset" | "timeSkip";
export type TimeControlBuildSettingsItem = {
  checkForReset: boolean;
  $checkForReset?: JQuery<HTMLElement>;

  triggerForReset: number;
  $triggerForReset?: JQuery<HTMLElement>;
};
export type TimeControlResourcesSettingsItem = {
  checkForReset: boolean;
  $checkForReset?: JQuery<HTMLElement>;

  stockForReset: number;
  $stockForReset?: JQuery<HTMLElement>;
};
export class TimeControlSettings extends SettingsSection {
  buildItems: {
    // unicornPasture is handled in the Religion section.
    [item in Exclude<BonfireItem, "unicornPasture">]: TimeControlBuildSettingsItem;
  } = {
    hut: { checkForReset: true, triggerForReset: -1 },
    logHouse: { checkForReset: true, triggerForReset: -1 },
    mansion: { checkForReset: true, triggerForReset: -1 },

    workshop: { checkForReset: true, triggerForReset: -1 },
    factory: { checkForReset: true, triggerForReset: -1 },

    field: { checkForReset: true, triggerForReset: -1 },
    pasture: { checkForReset: true, triggerForReset: -1 },
    solarFarm: { checkForReset: true, triggerForReset: -1 },
    mine: { checkForReset: true, triggerForReset: -1 },
    lumberMill: { checkForReset: true, triggerForReset: -1 },
    aqueduct: { checkForReset: true, triggerForReset: -1 },
    hydroPlant: { checkForReset: true, triggerForReset: -1 },
    oilWell: { checkForReset: true, triggerForReset: -1 },
    quarry: { checkForReset: true, triggerForReset: -1 },

    smelter: { checkForReset: true, triggerForReset: -1 },
    biolab: { checkForReset: true, triggerForReset: -1 },
    calciner: { checkForReset: true, triggerForReset: -1 },
    reactor: { checkForReset: true, triggerForReset: -1 },
    accelerator: { checkForReset: true, triggerForReset: -1 },
    steamworks: { checkForReset: true, triggerForReset: -1 },
    magneto: { checkForReset: true, triggerForReset: -1 },

    library: { checkForReset: true, triggerForReset: -1 },
    dataCenter: { checkForReset: true, triggerForReset: -1 },
    academy: { checkForReset: true, triggerForReset: -1 },
    observatory: { checkForReset: true, triggerForReset: -1 },

    amphitheatre: { checkForReset: true, triggerForReset: -1 },
    broadcastTower: { checkForReset: true, triggerForReset: -1 },
    tradepost: { checkForReset: true, triggerForReset: -1 },
    chapel: { checkForReset: true, triggerForReset: -1 },
    temple: { checkForReset: true, triggerForReset: -1 },
    mint: { checkForReset: true, triggerForReset: -1 },
    ziggurat: { checkForReset: true, triggerForReset: -1 },
    chronosphere: { checkForReset: true, triggerForReset: -1 },
    aiCore: { checkForReset: true, triggerForReset: -1 },
    brewery: { checkForReset: true, triggerForReset: -1 },

    barn: { checkForReset: true, triggerForReset: -1 },
    harbor: { checkForReset: true, triggerForReset: -1 },
    warehouse: { checkForReset: true, triggerForReset: -1 },

    zebraOutpost: { checkForReset: true, triggerForReset: -1 },
    zebraWorkshop: { checkForReset: true, triggerForReset: -1 },
    zebraForge: { checkForReset: true, triggerForReset: -1 },
  };

  religionItems: {
    [item in FaithItem | UnicornItem]: TimeControlBuildSettingsItem & {
      variant: UnicornItemVariant;
    };
  } = {
    unicornPasture: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.UnicornPasture,
    },
    unicornTomb: { checkForReset: true, triggerForReset: -1, variant: UnicornItemVariant.Ziggurat },
    ivoryTower: { checkForReset: true, triggerForReset: -1, variant: UnicornItemVariant.Ziggurat },
    ivoryCitadel: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Ziggurat,
    },
    skyPalace: { checkForReset: true, triggerForReset: -1, variant: UnicornItemVariant.Ziggurat },
    unicornUtopia: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Ziggurat,
    },
    sunspire: { checkForReset: true, triggerForReset: -1, variant: UnicornItemVariant.Ziggurat },

    marker: { checkForReset: true, triggerForReset: -1, variant: UnicornItemVariant.Ziggurat },
    unicornGraveyard: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Ziggurat,
    },
    unicornNecropolis: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Ziggurat,
    },
    blackPyramid: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Ziggurat,
    },

    solarchant: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },
    scholasticism: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },
    goldenSpire: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },
    sunAltar: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },
    stainedGlass: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },
    solarRevolution: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },
    basilica: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },
    templars: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },
    apocripha: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },
    transcendence: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.OrderOfTheSun,
    },

    blackObelisk: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Cryptotheology,
    },
    blackNexus: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Cryptotheology,
    },
    blackCore: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Cryptotheology,
    },
    singularity: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Cryptotheology,
    },
    blackLibrary: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Cryptotheology,
    },
    blackRadiance: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Cryptotheology,
    },
    blazar: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Cryptotheology,
    },
    darkNova: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Cryptotheology,
    },
    holyGenocide: {
      checkForReset: true,
      triggerForReset: -1,
      variant: UnicornItemVariant.Cryptotheology,
    },
  };

  spaceItems: {
    [item in SpaceItem]: TimeControlBuildSettingsItem;
  } = {
    // Cath
    spaceElevator: { checkForReset: true, triggerForReset: -1 },
    sattelite: { checkForReset: true, triggerForReset: -1 },
    spaceStation: { checkForReset: true, triggerForReset: -1 },

    // Moon
    moonOutpost: { checkForReset: true, triggerForReset: -1 },
    moonBase: { checkForReset: true, triggerForReset: -1 },

    // Dune
    planetCracker: { checkForReset: true, triggerForReset: -1 },
    hydrofracturer: { checkForReset: true, triggerForReset: -1 },
    spiceRefinery: { checkForReset: true, triggerForReset: -1 },

    // Piscine
    researchVessel: { checkForReset: true, triggerForReset: -1 },
    orbitalArray: { checkForReset: true, triggerForReset: -1 },

    // Helios
    sunlifter: { checkForReset: true, triggerForReset: -1 },
    containmentChamber: { checkForReset: true, triggerForReset: -1 },
    heatsink: { checkForReset: true, triggerForReset: -1 },
    sunforge: { checkForReset: true, triggerForReset: -1 },

    // T-Minus
    cryostation: { checkForReset: true, triggerForReset: -1 },

    // Kairo
    spaceBeacon: { checkForReset: true, triggerForReset: -1 },

    // Yarn
    terraformingStation: { checkForReset: true, triggerForReset: -1 },
    hydroponics: { checkForReset: true, triggerForReset: -1 },

    // Umbra
    hrHarvester: { checkForReset: true, triggerForReset: -1 },

    // Charon
    entangler: { checkForReset: true, triggerForReset: -1 },

    // Centaurus
    tectonic: { checkForReset: true, triggerForReset: -1 },
    moltenCore: { checkForReset: true, triggerForReset: -1 },
  };

  timeItems: {
    [item in TimeItem]: TimeControlBuildSettingsItem & { variant: TimeItemVariant };
  } = {
    temporalBattery: {
      checkForReset: true,
      triggerForReset: -1,
      variant: TimeItemVariant.Chronoforge,
    },
    blastFurnace: {
      checkForReset: true,
      triggerForReset: -1,
      variant: TimeItemVariant.Chronoforge,
    },
    timeBoiler: {
      checkForReset: true,
      triggerForReset: -1,
      variant: TimeItemVariant.Chronoforge,
    },
    temporalAccelerator: {
      checkForReset: true,
      triggerForReset: -1,
      variant: TimeItemVariant.Chronoforge,
    },
    temporalImpedance: {
      checkForReset: true,
      triggerForReset: -1,
      variant: TimeItemVariant.Chronoforge,
    },
    ressourceRetrieval: {
      checkForReset: true,
      triggerForReset: -1,
      variant: TimeItemVariant.Chronoforge,
    },

    cryochambers: { checkForReset: true, triggerForReset: -1, variant: TimeItemVariant.VoidSpace },
    voidHoover: { checkForReset: true, triggerForReset: -1, variant: TimeItemVariant.VoidSpace },
    voidRift: { checkForReset: true, triggerForReset: -1, variant: TimeItemVariant.VoidSpace },
    chronocontrol: { checkForReset: true, triggerForReset: -1, variant: TimeItemVariant.VoidSpace },
    voidResonator: { checkForReset: true, triggerForReset: -1, variant: TimeItemVariant.VoidSpace },
  };

  resources: {
    [item in Resource]?: TimeControlResourcesSettingsItem;
  } = {};

  items: {
    accelerateTime: SettingToggle & {
      subTrigger: number;
      $subTrigger?: JQuery<HTMLElement>;
    };
    timeSkip: SettingToggle & {
      subTrigger: number;
      $subTrigger?: JQuery<HTMLElement>;

      maximum: number;
      $maximum?: JQuery<HTMLElement>;

      spring: boolean;
      $spring?: JQuery<HTMLElement>;
      summer: boolean;
      $summer?: JQuery<HTMLElement>;
      autumn: boolean;
      $autumn?: JQuery<HTMLElement>;
      winter: boolean;
      $winter?: JQuery<HTMLElement>;

      0: boolean;
      1: boolean;
      2: boolean;
      3: boolean;
      4: boolean;
      5: boolean;
      6: boolean;
      7: boolean;
      8: boolean;
      9: boolean;
      $0?: JQuery<HTMLElement>;
      $1?: JQuery<HTMLElement>;
      $2?: JQuery<HTMLElement>;
      $3?: JQuery<HTMLElement>;
      $4?: JQuery<HTMLElement>;
      $5?: JQuery<HTMLElement>;
      $6?: JQuery<HTMLElement>;
      $7?: JQuery<HTMLElement>;
      $8?: JQuery<HTMLElement>;
      $9?: JQuery<HTMLElement>;
    };
    reset: SettingToggle;
  } = {
    accelerateTime: { enabled: true, subTrigger: 1 },
    timeSkip: {
      enabled: false,
      subTrigger: 5,
      maximum: 50,

      autumn: false,
      summer: false,
      spring: true,
      winter: false,

      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
    },
    reset: {
      enabled: false,
    },
  };

  static toLegacyOptions(settings: TimeControlSettings, subject: KittenStorageType) {
    subject.toggles.timeCtrl = settings.enabled;

    subject.items["toggle-accelerateTime"] = settings.items.accelerateTime.enabled;
    subject.items["set-accelerateTime-subTrigger"] = settings.items.accelerateTime.subTrigger;

    subject.items["toggle-reset"] = settings.items.reset.enabled;

    subject.items["toggle-timeSkip"] = settings.items.timeSkip.enabled;
    subject.items["set-timeSkip-subTrigger"] = settings.items.timeSkip.subTrigger;
    subject.items["toggle-timeSkip-autumn"] = settings.items.timeSkip.autumn;
    subject.items["toggle-timeSkip-spring"] = settings.items.timeSkip.spring;
    subject.items["toggle-timeSkip-summer"] = settings.items.timeSkip.summer;
    subject.items["toggle-timeSkip-winter"] = settings.items.timeSkip.winter;

    for (let cycleIndex = 0; cycleIndex < 10; ++cycleIndex) {
      subject.items[`toggle-timeSkip-${cycleIndex as CycleIndices}` as const] =
        settings.items.timeSkip[cycleIndex as CycleIndices];
    }

    for (const [name, item] of objectEntries(settings.buildItems)) {
      subject.items[`toggle-reset-build-${name}` as const] = item.checkForReset;
      subject.items[`set-reset-build-${name}-min` as const] = item.triggerForReset;
    }
    for (const [name, item] of objectEntries(settings.religionItems)) {
      subject.items[`toggle-reset-faith-${name}` as const] = item.checkForReset;
      subject.items[`set-reset-faith-${name}-min` as const] = item.triggerForReset;
    }
    for (const [name, item] of objectEntries(settings.spaceItems)) {
      subject.items[`toggle-reset-space-${name}` as const] = item.checkForReset;
      subject.items[`set-reset-space-${name}-min` as const] = item.triggerForReset;
    }
    for (const [name, item] of objectEntries(settings.timeItems)) {
      subject.items[`toggle-reset-time-${name}` as const] = item.checkForReset;
      subject.items[`set-reset-time-${name}-min` as const] = item.triggerForReset;
    }

    for (const [name, item] of objectEntries(settings.resources)) {
      subject.resources[name] = {
        checkForReset: item.checkForReset,
        stockForReset: item.stockForReset,
        consume: 0,
        enabled: false,
        stock: 0,
      };
    }
  }

  static fromLegacyOptions(subject: KittenStorageType) {
    const options = new TimeControlSettings();
    options.enabled = subject.toggles.timeCtrl;
    for (const [name, item] of objectEntries(options.items)) {
      item.enabled = subject.items[`toggle-${name}` as const] ?? item.enabled;
    }

    options.items.accelerateTime.enabled =
      subject.items["toggle-accelerateTime"] ?? options.items.accelerateTime.enabled;
    options.items.accelerateTime.subTrigger =
      subject.items["set-accelerateTime-subTrigger"] ?? options.items.accelerateTime.subTrigger;

    options.items.reset.enabled = subject.items["toggle-reset"] ?? options.items.reset.enabled;

    options.items.timeSkip.enabled =
      subject.items["toggle-timeSkip"] ?? options.items.timeSkip.enabled;
    options.items.timeSkip.subTrigger =
      subject.items["set-timeSkip-subTrigger"] ?? options.items.timeSkip.subTrigger;
    options.items.timeSkip.autumn =
      subject.items["toggle-timeSkip-autumn"] ?? options.items.timeSkip.autumn;
    options.items.timeSkip.spring =
      subject.items["toggle-timeSkip-spring"] ?? options.items.timeSkip.spring;
    options.items.timeSkip.summer =
      subject.items["toggle-timeSkip-summer"] ?? options.items.timeSkip.summer;
    options.items.timeSkip.winter =
      subject.items["toggle-timeSkip-winter"] ?? options.items.timeSkip.winter;

    for (let cycleIndex = 0; cycleIndex < 10; ++cycleIndex) {
      options.items.timeSkip[cycleIndex as CycleIndices] =
        subject.items[`toggle-timeSkip-${cycleIndex as CycleIndices}` as const] ??
        options.items.timeSkip[cycleIndex as CycleIndices];
    }

    for (const [name, item] of objectEntries(options.buildItems)) {
      item.checkForReset =
        subject.items[`toggle-reset-build-${name}` as const] ?? item.checkForReset;
      item.triggerForReset =
        subject.items[`set-reset-build-${name}-min` as const] ?? item.triggerForReset;
    }
    for (const [name, item] of objectEntries(options.religionItems)) {
      item.checkForReset =
        subject.items[`toggle-reset-faith-${name}` as const] ?? item.checkForReset;
      item.triggerForReset =
        subject.items[`set-reset-faith-${name}-min` as const] ?? item.triggerForReset;
    }
    for (const [name, item] of objectEntries(options.spaceItems)) {
      item.checkForReset =
        subject.items[`toggle-reset-space-${name}` as const] ?? item.checkForReset;
      item.triggerForReset =
        subject.items[`set-reset-space-${name}-min` as const] ?? item.triggerForReset;
    }
    for (const [name, item] of objectEntries(options.timeItems)) {
      item.checkForReset =
        subject.items[`toggle-reset-time-${name}` as const] ?? item.checkForReset;
      item.triggerForReset =
        subject.items[`set-reset-time-${name}-min` as const] ?? item.triggerForReset;
    }

    options.resources = {};
    for (const [name, item] of objectEntries(subject.resources)) {
      if (!item.checkForReset) {
        continue;
      }
      options.resources[name] = {
        checkForReset: item.checkForReset,
        stockForReset: item.stockForReset,
      };
    }

    return options;
  }
}
