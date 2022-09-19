import {
  TradeAdditionSettings,
  TradingSettings,
  TradingSettingsItem,
} from "../options/TradingSettings";
import { objectEntries } from "../tools/Entries";
import { ucfirst } from "../tools/Format";
import { mustExist } from "../tools/Maybe";
import { Race, Season } from "../types";
import { UserScript } from "../UserScript";
import { SettingsSectionUi } from "./SettingsSectionUi";

export class TradingSettingsUi extends SettingsSectionUi<TradingSettings> {
  readonly element: JQuery<HTMLElement>;

  private readonly _options: TradingSettings;

  constructor(host: UserScript, upgradeOptions: TradingSettings = host.options.auto.trade) {
    super(host);

    this._options = upgradeOptions;

    const toggleName = "trade";
    const label = ucfirst(this._host.i18n("ui.trade"));

    // Create build items.
    // We create these in a list that is displayed when the user clicks the "items" button.
    const list = this._getOptionList(toggleName);

    // Our main element is a list item.
    const element = this._getSettingsPanel(toggleName, label, this._options, list);
    this._options.$enabled = element.checkbox;

    // Create "trigger" button in the item.
    this._options.$trigger = this._registerTriggerButton(toggleName, label, this._options);

    const optionButtons = [
      this._getTradeOption(
        "lizards",
        this._options.items.lizards,
        this._host.i18n("$trade.race.lizards")
      ),
      this._getTradeOption(
        "sharks",
        this._options.items.sharks,
        this._host.i18n("$trade.race.sharks")
      ),
      this._getTradeOption(
        "griffins",
        this._options.items.griffins,
        this._host.i18n("$trade.race.griffins")
      ),
      this._getTradeOption(
        "nagas",
        this._options.items.nagas,
        this._host.i18n("$trade.race.nagas")
      ),
      this._getTradeOption(
        "zebras",
        this._options.items.zebras,
        this._host.i18n("$trade.race.zebras")
      ),
      this._getTradeOption(
        "spiders",
        this._options.items.spiders,
        this._host.i18n("$trade.race.spiders")
      ),
      this._getTradeOption(
        "dragons",
        this._options.items.dragons,
        this._host.i18n("$trade.race.dragons")
      ),
      this._getTradeOption(
        "leviathans",
        this._options.items.leviathans,
        this._host.i18n("$trade.race.leviathans"),
        true
      ),
    ];

    list.append(...optionButtons);

    const additionOptions = this.getAdditionOptions(this._options.addition);
    list.append(additionOptions);

    element.panel.append(this._options.$trigger);
    element.panel.append(list);

    this.element = element.panel;
  }

  private _getTradeOption(
    name: Race,
    option: TradingSettingsItem,
    i18nName: string,
    delimiter = false
  ): JQuery<HTMLElement> {
    const element = this._getOption(name, option, i18nName, delimiter);
    element.css("borderTop", "1px solid rgba(185, 185, 185, 0.1)");

    //Limited Trading
    const label = $("<label/>", {
      for: `toggle-limited-${name}`,
      text: this._host.i18n("ui.limit"),
    });

    const input = $("<input/>", {
      id: `toggle-limited-${name}`,
      type: "checkbox",
    }).data("option", option);
    option.$limited = input;

    input.on("change", () => {
      if (input.is(":checked") && option.limited === false) {
        this._host.updateOptions(() => (option.limited = true));
        this._host.imessage("trade.limited", [i18nName]);
      } else if (!input.is(":checked") && option.limited === true) {
        this._host.updateOptions(() => (option.limited = false));
        this._host.imessage("trade.unlimited", [i18nName]);
      }
    });

    element.append(input, label);
    //Limited Trading End

    const button = $("<div/>", {
      id: `toggle-seasons-${name}`,
      text: "🗓",
      title: this._host.i18n("trade.seasons"),
      css: {
        cursor: "pointer",
        display: "inline-block",
        float: "right",
        paddingRight: "5px",
      },
    });

    const list = $("<ul/>", {
      id: `seasons-list-${name}`,
      css: { display: "none", paddingLeft: "20px" },
    });

    // fill out the list with seasons
    list.append(this._getSeason(name, "spring", option));
    list.append(this._getSeason(name, "summer", option));
    list.append(this._getSeason(name, "autumn", option));
    list.append(this._getSeason(name, "winter", option));

    button.on("click", function () {
      list.toggle();
    });

    element.append(button, list);

    return element;
  }

  private _getSeason(name: Race, season: Season, option: TradingSettingsItem): JQuery<HTMLElement> {
    const iname = ucfirst(this._host.i18n(`$trade.race.${name}` as const));
    const iseason = ucfirst(this._host.i18n(`$calendar.season.${season}` as const));

    const element = $("<li/>");

    const label = $("<label/>", {
      for: `toggle-${name}-${season}`,
      text: ucfirst(iseason),
    });

    const input = $("<input/>", {
      id: `toggle-${name}-${season}`,
      type: "checkbox",
    }).data("option", option);
    option[`$${season}` as const] = input;

    input.on("change", () => {
      if (input.is(":checked") && option[season] === false) {
        this._host.updateOptions(() => (option[season] = true));
        this._host.imessage("trade.season.enable", [iname, iseason]);
      } else if (!input.is(":checked") && option[season] === true) {
        this._host.updateOptions(() => (option[season] = false));
        this._host.imessage("trade.season.disable", [iname, iseason]);
      }
    });

    element.append(input, label);

    return element;
  }

  getAdditionOptions(addition: TradeAdditionSettings): Array<JQuery<HTMLElement>> {
    const nodeHeader = this._getHeader("Additional options");

    const nodeEmbassies = this._getOption(
      "embassies",
      addition.buildEmbassies,
      this._host.i18n("option.embassies"),
      false,
      {
        onCheck: () => {
          this._host.updateOptions(() => (this._options.addition.buildEmbassies.enabled = true));
          this._host.imessage("status.sub.enable", [this._host.i18n("option.embassies")]);
        },
        onUnCheck: () => {
          this._host.updateOptions(() => (this._options.addition.buildEmbassies.enabled = false));
          this._host.imessage("status.sub.disable", [this._host.i18n("option.embassies")]);
        },
      }
    );

    const nodeRaces = this._getOption(
      "races",
      addition.unlockRaces,
      this._host.i18n("ui.upgrade.races"),
      false,
      {
        onCheck: () => {
          this._host.updateOptions(() => (this._options.addition.unlockRaces.enabled = true));
          this._host.imessage("status.auto.enable", [this._host.i18n("ui.upgrade.races")]);
        },
        onUnCheck: () => {
          this._host.updateOptions(() => (this._options.addition.unlockRaces.enabled = false));
          this._host.imessage("status.auto.disable", [this._host.i18n("ui.upgrade.races")]);
        },
      }
    );

    return [nodeHeader, nodeRaces, nodeEmbassies];
  }

  getState(): TradingSettings {
    return {
      enabled: this._options.enabled,
      trigger: this._options.trigger,
      addition: this._options.addition,
      items: this._options.items,
    };
  }

  setState(state: TradingSettings): void {
    this._options.enabled = state.enabled;
    this._options.trigger = state.trigger;

    this._options.addition.buildEmbassies.enabled = state.addition.buildEmbassies.enabled;
    this._options.addition.unlockRaces.enabled = state.addition.unlockRaces.enabled;

    for (const [name, option] of objectEntries(this._options.items)) {
      option.enabled = state.items[name].enabled;
      option.limited = state.items[name].limited;

      option.autumn = state.items[name].autumn;
      option.spring = state.items[name].spring;
      option.summer = state.items[name].summer;
      option.winter = state.items[name].winter;
    }
  }

  refreshUi(): void {
    mustExist(this._options.$enabled).prop("checked", this._options.enabled);
    mustExist(this._options.$trigger)[0].title = this._renderPercentage(this._options.trigger);

    mustExist(this._options.addition.buildEmbassies.$enabled).prop(
      "checked",
      this._options.addition.buildEmbassies.enabled
    );
    mustExist(this._options.addition.unlockRaces.$enabled).prop(
      "checked",
      this._options.addition.unlockRaces.enabled
    );

    for (const [name, option] of objectEntries(this._options.items)) {
      mustExist(option.$enabled).prop("checked", this._options.items[name].enabled);
      mustExist(option.$limited).prop("checked", this._options.items[name].limited);

      mustExist(option.$autumn).prop("checked", this._options.items[name].autumn);
      mustExist(option.$spring).prop("checked", this._options.items[name].spring);
      mustExist(option.$summer).prop("checked", this._options.items[name].summer);
      mustExist(option.$winter).prop("checked", this._options.items[name].winter);
    }
  }
}
