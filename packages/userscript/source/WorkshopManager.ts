import { CacheManager } from "./CacheManager";
import { CraftSettingsItem } from "./options/CraftSettings";
import { TabManager } from "./TabManager";
import { objectEntries } from "./tools/Entries";
import { isNil, mustExist } from "./tools/Maybe";
import { Resource, ResourceCraftable } from "./types";
import { CraftableInfo, ResourceInfo } from "./types/craft";
import { VillageTab } from "./types/village";
import { UpgradeManager } from "./UpgradeManager";
import { UserScript } from "./UserScript";

export class WorkshopManager extends UpgradeManager {
  readonly manager: TabManager<VillageTab>;

  constructor(host: UserScript) {
    super(host);

    this.manager = new TabManager(this._host, "Workshop");
  }

  autoUnlock() {
    if (!this._host.gamePage.tabs[3].visible) {
      return;
    }

    this.manager.render();

    const workshopUpgrades = this._host.gamePage.workshop.upgrades;
    // TODO: Filter out upgrades that are not beneficial when using KS, like workshop automation.
    workLoop: for (const upgrade of workshopUpgrades) {
      // If the upgrade is already purchased or not available yet, continue with the next one.
      if (upgrade.researched || !upgrade.unlocked) {
        continue;
      }

      // Create a copy of the prices for this upgrade, so that we can apply effects to it.
      let prices = dojo.clone(upgrade.prices);
      prices = this._host.gamePage.village.getEffectLeader("scientist", prices);
      for (const resource of prices) {
        // If we can't afford this resource price, continue with the next upgrade.
        if (this.getValueAvailable(resource.name, true) < resource.val) {
          continue workLoop;
        }
      }

      // If we can afford all prices, purchase the upgrade.
      this.upgrade(upgrade, "workshop");
    }
  }

  /**
   * Try to craft as many of the passed resources as possible.
   * Usually, this is called at each iteration of the automation engine to
   * handle the crafting of items on the Workshop tab.
   *
   * @param crafts The resources to build.
   */
  autoCraft(
    crafts: Partial<Record<ResourceCraftable, CraftSettingsItem>> = this._host.options.auto.craft
      .items
  ) {
    // TODO: One of the core limitations here is that only a single resource
    //       is taken into account, the one set as `require` in the definition.
    const trigger = this._host.options.auto.craft.trigger;

    for (const [name, craft] of objectEntries(crafts)) {
      // This will always be `false` while `max` is hardcoded to `0`.
      // Otherwise, it would contain the current resource information.
      const current = !craft.max ? false : this.getResource(name);
      // The resource information for the requirement of this craft, if any.
      const require = !craft.require ? false : this.getResource(craft.require);
      let amount = 0;
      // Ensure that we have reached our cap
      // This will never happen as `current` is always `false`.
      if (current && current.value > craft.max) continue;

      // If we can't even craft a single item of the resource, skip it.
      if (!this.singleCraftPossible(name)) {
        continue;
      }

      // Craft the resource if it doesn't require anything or we hit the requirement trigger.
      if (!require || trigger <= require.value / require.maxValue) {
        amount = this.getLowestCraftAmount(name, craft.limited, craft.limRat, true);

        // If a resource DOES "require" another resource AND its trigger value has NOT been hit
        // yet AND it is limited... What?
      } else if (craft.limited) {
        amount = this.getLowestCraftAmount(name, craft.limited, craft.limRat, false);
      }

      // If we can craft any of this item, do it.
      if (amount > 0) {
        this.craft(name, amount);
      }
    }
  }

  /**
   * Craft a certain amount of items.
   *
   * @param name The resource to craft.
   * @param amount How many items of the resource to craft.
   */
  craft(name: ResourceCraftable, amount: number): void {
    amount = Math.floor(amount);

    if (!name || 1 > amount) {
      return;
    }
    if (!this._canCraft(name, amount)) {
      return;
    }

    const craft = this.getCraft(name);
    const ratio = this._host.gamePage.getResCraftRatio(craft.name);

    this._host.gamePage.craft(craft.name, amount);

    const iname = mustExist(this._host.gamePage.resPool.get(name)).title;

    // determine actual amount after crafting upgrades
    amount = parseFloat((amount * (1 + ratio)).toFixed(2));

    this._host.storeForSummary(iname, amount, "craft");
    this._host.iactivity(
      "act.craft",
      [this._host.gamePage.getDisplayValueExt(amount), iname],
      "ks-craft"
    );
  }

  private _canCraft(name: ResourceCraftable, amount: number): boolean {
    const craft = this.getCraft(name);
    const enabled = mustExist(this._host.options.auto.craft.items[name]).enabled;
    let result = false;

    if (craft.unlocked && enabled) {
      result = true;

      const prices = this._host.gamePage.workshop.getCraftPrice(craft);
      for (const price of prices) {
        const value = this.getValueAvailable(price.name);

        if (value < price.val * amount) {
          result = false;
        }
      }
    }

    return result;
  }

  /**
   * Retrieve the resource information object from the game.
   *
   * @param name The name of the craftable resource.
   * @returns The information object for the resource.
   */
  getCraft(name: ResourceCraftable): CraftableInfo {
    const craft = this._host.gamePage.workshop.getCraft(name);
    if (!craft) {
      throw new Error(`Unable to find craft '${name}'`);
    }
    return craft;
  }

  /**
   * Check if we have enough resources to craft a single craftable resource.
   *
   * @param name The name of the resource.
   * @returns `true` if the build is possible; `false` otherwise.
   */
  singleCraftPossible(name: ResourceCraftable): boolean {
    const materials = this.getMaterials(name);
    for (const [mat, amount] of objectEntries<Resource, number>(materials)) {
      if (this.getValueAvailable(mat, true) < amount) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine the limit of how many items to craft of a given resource.
   *
   * @param name The resource to craft.
   * @param limited Is the crafting of the resource currently limited?
   * @param limRat ?
   * @param requiredResourceAboveTrigger Is the resource that is required for
   * this craft currently above the trigger value?
   * @returns ?
   */
  getLowestCraftAmount(
    name: ResourceCraftable,
    limited: boolean,
    limRat: number,
    requiredResourceAboveTrigger: boolean
  ): number {
    const materials = this.getMaterials(name);

    const craft = this.getCraft(name);
    const ratio = this._host.gamePage.getResCraftRatio(craft.name);
    const trigger = this._host.options.auto.craft.trigger;

    // Safeguard if materials for craft cannot be determined.
    if (!materials) {
      return 0;
    }

    // This seems to be a (hopefully) finely balanced act to distribute iron
    // between plates and steel.
    // One resource will probably be preferred for periods of time, then the
    // other resource will take over.
    if (name === "steel" && limited) {
      // Under some condition, we don't want to craft any steel.
      const plateRatio = this._host.gamePage.getResCraftRatio("plate");
      // The left term will be larger than 1 if we have more plates than steel.
      // The right term is basically 1.25, the relation of iron costs between
      // plates and steel. Plates require 125 iron, steel 100.
      // This term is weighed in regards to the craft ratio of each resource.
      // If we get twice as many plates out of a craft than we would steel, the
      // right term is increased above 1.25.
      // What this all implies is, only craft steel if a reasonable amount of
      // plates are also already crafted.
      if (
        this.getValueAvailable("plate") / this.getValueAvailable("steel") <
        (plateRatio + 1) / 125 / ((ratio + 1) / 100)
      ) {
        return 0;
      }
    }

    // It's not clear *how* this is supposed to work.
    // What it tries to do is, if we have coal production, under some condition,
    // calculate an appropriate max value for plates to be crafted.
    // This amount would be lower than the max plates that could be crafted otherwise.
    let plateMax = Number.MAX_VALUE;
    if (name === "plate" && limited) {
      const steelRatio = this._host.gamePage.getResCraftRatio("steel");
      // If we're producing coal, then we could also make steel, and don't want
      // to use up all the iron.
      const coalPerTick = this._host.gamePage.getResourcePerTick("coal", true);
      if (coalPerTick > 0) {
        // Here we have the same check as above, but reversed.
        // So this would be the case where steel is preferred.
        if (
          this.getValueAvailable("plate") / this.getValueAvailable("steel") >
          (ratio + 1) / 125 / ((steelRatio + 1) / 100)
        ) {
          // The absolute trigger value for coal.
          const coalTriggerAmount = this.getResource("coal").maxValue * trigger;
          // How many units of coal are we away from the trigger.
          const distanceToCoalTrigger = coalTriggerAmount - this.getValue("coal");
          // How many ticks until we hit the trigger for coal.
          const ticksToCoalTrigger = distanceToCoalTrigger / coalPerTick;
          // How much iron will be produce in the time until we hit the trigger for coal.
          const ironInTime =
            ticksToCoalTrigger * Math.max(this._host.gamePage.getResourcePerTick("iron", true), 0);
          // This is some weird voodoo...
          plateMax =
            (this.getValueAvailable("iron") - Math.max(coalTriggerAmount - ironInTime, 0)) / 125;
        }
      }
    }

    // The ship override allows the user to treat ships as "unlimited" while there's less than 243.
    const shipOverride =
      this._host.options.auto.options.enabled &&
      this._host.options.auto.options.items.shipOverride.enabled;

    const res = this.getResource(name);

    // Iterate over the materials required for this craft.
    // We want to find the lowest amount of items we could craft, so start with the largest number possible.
    let amount = Number.MAX_VALUE;
    for (const [resource, materialAmount] of objectEntries(materials)) {
      // The delta is the smallest craft amount based on the current material.
      let delta = undefined;

      // Either if the build isn't limited, OR we're above the trigger value and have not hit
      // our storage limit, OR we're handling the ship override.
      if (
        !limited ||
        (requiredResourceAboveTrigger && 0 < this.getResource(resource).maxValue) ||
        (name === "ship" && shipOverride && this.getResource("ship").value < 243)
      ) {
        // If there is a storage limit, we can just use everything returned by getValueAvailable,
        // since the regulation happens there
        delta = this.getValueAvailable(resource) / materialAmount;
      } else {
        // Take the currently present amount of material to craft into account
        // Currently this determines the amount of resources that can be crafted such that base
        // materials are proportionally distributed across limited resources.
        // This base material distribution is governed by limRat "limited ratio" which defaults
        // to 0.5, corresponding to half of the possible components being further crafted.
        // If this were another value, such as 0.75, then if you had 10000 beams and 0 scaffolds,
        // 7500 of the beams would be crafted into scaffolds.
        delta =
          limRat *
            ((this.getValueAvailable(resource, true) +
              (materialAmount / (1 + ratio)) * this.getValueAvailable(res.name, true)) /
              materialAmount) -
          this.getValueAvailable(res.name, true) / (1 + ratio);
      }

      amount = Math.min(delta, amount, plateMax);
    }

    // If we have a maximum value, ensure that we don't produce more than
    // this value. This should currently only impact wood crafting, but is
    // written generically to ensure it works for any craft that produces a
    // good with a maximum value.
    if (res.maxValue > 0 && amount > res.maxValue - res.value) amount = res.maxValue - res.value;

    return Math.floor(amount);
  }

  /**
   * Returns a hash of the required source resources and their
   * amount to craft the given resource.
   *
   * @param name The resource to craft.
   * @returns The source resources you need and how many.
   */
  getMaterials(name: ResourceCraftable): Partial<Record<Resource, number>> {
    const materials: Partial<Record<Resource, number>> = {};
    const craft = this.getCraft(name);

    const prices = this._host.gamePage.workshop.getCraftPrice(craft);

    for (const price of prices) {
      materials[price.name] = price.val;
    }

    return materials;
  }

  /**
   * Determine how much of a resource is produced per tick. For craftable resources,
   * this also includes how many of them we *could* craft this tick.
   *
   * @param resource The resource to retrieve the production for.
   * @param cacheManager A `CacheManager` to use in the process.
   * @param preTrade ?
   * @returns The amount of resources produced per tick, adjusted arbitrarily.
   */
  getTickVal(
    resource: ResourceInfo,
    cacheManager?: CacheManager,
    preTrade: boolean | undefined = undefined
  ): number | "ignore" {
    let production = this._host.gamePage.getResourcePerTick(resource.name, true);

    // For craftable resources, we also want to take into account how much of them
    // we *could* craft.
    if (resource.craftable) {
      let minProd = Number.MAX_VALUE;
      const materials = this.getMaterials((resource as CraftableInfo).name);
      for (const [mat, amount] of objectEntries<Resource, number>(materials)) {
        const rat =
          (1 + this._host.gamePage.getResCraftRatio((resource as CraftableInfo).name)) / amount;
        // Currently preTrade is only true for the festival stuff, so including furs from hunting is ideal.
        const addProd = this.getTickVal(this.getResource(mat));
        if (addProd === "ignore") {
          continue;
        }
        minProd = Math.min(addProd * rat, minProd);
      }
      production += minProd !== Number.MAX_VALUE ? minProd : 0;
    }

    // If we have negative production (or none), and we're looking at either spice or
    // blueprints, return "ignore".
    // TODO: This special case seems to revolve around trading. As trading results in
    //       spice and blueprints.
    if (production <= 0 && (resource.name === "spice" || resource.name === "blueprint")) {
      return "ignore";
    }

    // If "preTrade" was set, increase the production. The "resValue" stored in the cache
    // makes no sense.
    // TODO: The only time this is used is for holding festivals.
    //       It's unclear why this would be necessary.
    if (!preTrade && !isNil(cacheManager)) {
      production += cacheManager.getResValue(resource.name);
    }
    return production;
  }

  /**
   * Determine the resources and their amount that would usually result from a hunt.
   *
   * @returns The amounts of resources usually gained from hunting.
   */
  getAverageHunt(): Partial<Record<Resource, number>> {
    const output: Partial<Record<Resource, number>> = {};
    const hunterRatio =
      this._host.gamePage.getEffect("hunterRatio") +
      this._host.gamePage.village.getEffectLeader("manager", 0);

    output["furs"] = 40 + 32.5 * hunterRatio;

    output["ivory"] =
      50 * Math.min(0.225 + 0.01 * hunterRatio, 0.5) +
      40 * hunterRatio * Math.min(0.225 + 0.01 * hunterRatio, 0.5);

    output["unicorns"] = 0.05;

    if (this.getValue("zebras") >= 10) {
      output["bloodstone"] = this.getValue("bloodstone") === 0 ? 0.05 : 0.0005;
    }

    if (this._host.gamePage.ironWill && this._host.gamePage.workshop.get("goldOre").researched) {
      output["gold"] = 0.625 + 0.625 * hunterRatio;
    }

    return output;
  }

  /**
   * Retrieve the information object for a resource.
   *
   * @param name The resource to retrieve info for.
   * @returns The information object for the resource.
   */
  getResource(name: Resource): ResourceInfo {
    if (name === "slabs") {
      name = "slab";
    }
    const res = this._host.gamePage.resPool.get(name);
    if (isNil(res)) {
      throw new Error(`Unable to find resource ${name}`);
    }
    return res;
  }

  /**
   * Determine how many items of a resource are currently available.
   *
   * @param name The resource.
   * @returns How many items are currently available.
   */
  getValue(name: Resource): number {
    return this.getResource(name).value;
  }

  /**
   * Determine how many items of the resource to always keep in stock.
   *
   * @param name The resource.
   * @returns How many items of the resource to always keep in stock.
   */
  getStock(name: Resource): number {
    const res = this._host.options.auto.craft.resources[name];
    const stock = res && res.enabled ? res.stock : 0;

    return !stock ? 0 : stock;
  }

  /**
   * Determine how much of a resource is available for a certain operation
   * to use.
   *
   * @param name The resource to check.
   * @param all ?
   * @param typeTrigger The trigger value associated with this check.
   * @returns The available amount of the resource.
   */
  getValueAvailable(
    name: Resource,
    all: boolean | undefined = undefined,
    typeTrigger: number | undefined = undefined
  ): number {
    // How many items to keep in stock.
    let stock = this.getStock(name);

    // If the resource is catnip, ensure to not use so much that we can't satisfy
    // consumption by kittens.
    if ("catnip" === name) {
      const pastureMeta = this._host.gamePage.bld.getBuildingExt("pasture").meta;
      const aqueductMeta = this._host.gamePage.bld.getBuildingExt("aqueduct").meta;
      const pastures = pastureMeta.stage === 0 ? pastureMeta.val : 0;
      const aqueducts = aqueductMeta.stage === 0 ? aqueductMeta.val : 0;
      // How many catnip per tick do we have available? This can be negative.
      const resPerTick = this.getPotentialCatnip(true, pastures, aqueducts);

      // If our stock is currently decreasing. Ensure we work with the value
      // where it should be in 5 ticks.
      // TODO: I'm assuming 202 is the catnip consumption per tick and the 5 are a
      //       magic value that just made sense, or the script assumes it runs every
      //       5 ticks. Which would mean it probably ignores the `interval` setting.
      if (resPerTick < 0) {
        stock -= resPerTick * 202 * 5;
      }
    }

    // How many items are currently available.
    let value = this.getValue(name);
    // Subtract the amount to keep in stock.
    value = Math.max(value - stock, 0);

    // If the user has not requested "all", and this is a capped resource.
    // TODO: This makes absolutely no sense. This should likely be a different method.
    if (!all && 0 < this.getResource(name).maxValue) {
      // Determine our de-facto trigger value to use.
      let trigger: number;
      if (!typeTrigger && typeTrigger !== 0) {
        trigger = this._host.options.auto.craft.trigger;
      } else {
        trigger = typeTrigger;
      }

      // Determine the consume rate. Either it's configured on the resource, or globally.
      // If the consume rate is 0.6, we'll always only make 60% of the resource available.
      const resourceSettings = this._host.options.auto.craft.resources[name];
      const consume =
        resourceSettings && resourceSettings.enabled && resourceSettings.consume !== undefined
          ? resourceSettings.consume
          : this._host.options.consume;

      value -= Math.min(this.getResource(name).maxValue * trigger, value) * (1 - consume);
    }

    return value;
  }

  /**
   * Determine how much catnip we have available to "work with" per tick.
   *
   * @param worstWeather Should the worst weather be assumed for this calculation?
   * @param pastures How many pastures to take into account.
   * @param aqueducts How many aqueducts to take into account
   * @returns The potential catnip per tick.
   */
  getPotentialCatnip(worstWeather: boolean, pastures: number, aqueducts: number): number {
    // Start of by checking how much catnip we produce per tick at base level.
    let productionField = this._host.gamePage.getEffect("catnipPerTickBase");

    if (worstWeather) {
      // Assume fields run at -90%
      productionField *= 0.1;
      // Factor in cold harshness.
      productionField *=
        1 + this._host.gamePage.getLimitedDR(this._host.gamePage.getEffect("coldHarshness"), 1);
    } else {
      productionField *=
        this._host.gamePage.calendar.getWeatherMod({ name: "catnip" }) +
        this._host.gamePage.calendar.getCurSeason().modifiers["catnip"];
    }

    // When the communism policy is active,
    if (this._host.gamePage.science.getPolicy("communism").researched) {
      productionField = 0;
    }

    // Get base production values for jobs.
    const resourceProduction = this._host.gamePage.village.getResProduction();
    // Check how much catnip we're producing through kitten jobs.
    const productionVillager = resourceProduction.catnip
      ? resourceProduction.catnip * (1 + this._host.gamePage.getEffect("catnipJobRatio"))
      : 0;

    // Base production is catnip fields + farmers.
    let baseProd = productionField + productionVillager;

    // Determine the effect of other buildings on the production value.
    let hydroponics = this._host.gamePage.space.getBuilding("hydroponics").val;
    // Index 21 is the "pawgan rituals" metaphysics upgrade. This makes no sense.
    // This likely wants index 22, which is "numeromancy", which has effects on
    // catnip production in cycles at index 2 and 7.
    // TODO: Fix this so the upgrade is properly taken into account.
    if (this._host.gamePage.prestige.meta[0].meta[21].researched) {
      if (this._host.gamePage.calendar.cycle === 2) {
        hydroponics *= 2;
      }
      if (this._host.gamePage.calendar.cycle === 7) {
        hydroponics *= 0.5;
      }
    }

    // Our base production value is boosted by our aqueducts and hydroponics accordingly.
    baseProd *= 1 + 0.03 * aqueducts + 0.025 * hydroponics;

    // Apply paragon bonus, except during the "winter is coming" challenge.
    const isWinterComing = this._host.gamePage.challenges.currentChallenge === "winterIsComing";
    const paragonBonus = isWinterComing
      ? 0
      : this._host.gamePage.prestige.getParagonProductionRatio();
    baseProd *= 1 + paragonBonus;

    // Apply faith bonus.
    baseProd *= 1 + this._host.gamePage.religion.getSolarRevolutionRatio();

    // Unless the user disabled the "global donate bonus", apply it.
    if (!this._host.gamePage.opts.disableCMBR) {
      baseProd *= 1 + this._host.gamePage.getCMBRBonus();
    }

    // Apply the effects of possibly running festival.
    baseProd = this._host.gamePage.calendar.cycleEffectsFestival({ catnip: baseProd })["catnip"];

    // Determine our demand for catnip. This is usually a negative value.
    let baseDemand = this._host.gamePage.village.getResConsumption()["catnip"];
    // Pastures and unicron pastures reduce catnip demand. Factor that in.
    const unicornPastures = this._host.gamePage.bld.getBuildingExt("unicornPasture").meta.val;
    baseDemand *=
      1 + this._host.gamePage.getLimitedDR(pastures * -0.005 + unicornPastures * -0.0015, 1.0);

    // If we have any kittens and happiness over 100%.
    if (
      this._host.gamePage.village.sim.kittens.length > 0 &&
      this._host.gamePage.village.happiness > 1
    ) {
      // How happy beyond 100% are we?
      const happyCon = this._host.gamePage.village.happiness - 1;
      const catnipDemandWorkerRatioGlobal = this._host.gamePage.getEffect(
        "catnipDemandWorkerRatioGlobal"
      );

      // Determine the effect of kittens without jobs.
      if (this._host.gamePage.challenges.currentChallenge === "anarchy") {
        // During anarchy, they have no effect. They eat all the catnip.
        baseDemand *= 1 + happyCon * (1 + catnipDemandWorkerRatioGlobal);
      } else {
        // During normal operation, reduce the demand proportionally.
        // TODO: This should probably be split up into 2 steps.
        baseDemand *=
          1 +
          happyCon *
            (1 + catnipDemandWorkerRatioGlobal) *
            (1 -
              this._host.gamePage.village.getFreeKittens() /
                this._host.gamePage.village.sim.kittens.length);
      }
    }

    // Subtract the demand from the production. Demand is negative.
    baseProd += baseDemand;

    // Subtract possible catnip consumers, like breweries.
    baseProd += this._host.gamePage.getResourcePerTickConvertion("catnip");

    // Might need to eventually factor in time acceleration using this._host.gamePage.timeAccelerationRatio().
    return baseProd;
  }
}
