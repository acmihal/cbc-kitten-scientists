import { EngineSettings } from "../options/EngineSettings";
import { ucfirst } from "../tools/Format";
import { mustExist } from "../tools/Maybe";
import { UserScript } from "../UserScript";
import { SettingsSectionUi } from "./SettingsSectionUi";

export class EngineSettingsUi extends SettingsSectionUi<EngineSettings> {
  readonly element: JQuery<HTMLElement>;

  private readonly _options: EngineSettings;

  constructor(host: UserScript, options: EngineSettings = host.options.auto.engine) {
    super(host);

    this._options = options;

    const toggleName = "engine";

    const itext = ucfirst(this._host.i18n("ui.engine"));

    // Our main element is a list item.
    const element = $("<li/>", { id: `ks-${toggleName}` });

    const label = $("<label/>", {
      //for: "toggle-" + toggleName,
      text: itext,
    });

    const input = $("<input/>", {
      id: `toggle-${toggleName}`,
      type: "checkbox",
    });
    this._options.$enabled = input;

    element.append(input, label);

    input.on("change", () => {
      if (input.is(":checked") && options.enabled === false) {
        this._host.updateOptions(() => (options.enabled = true));
        this._host.engine.start(true);
      } else if (!input.is(":checked") && options.enabled === true) {
        this._host.updateOptions(() => (options.enabled = false));
        this._host.engine.stop(true);
      }
    });

    const toggleOptionsVisiblity = this._getItemsToggle(toggleName);
    element.append(toggleOptionsVisiblity);

    this.element = element;
  }

  getState(): EngineSettings {
    return {
      enabled: this._options.enabled,
    };
  }

  setState(state: EngineSettings): void {
    this._options.enabled = state.enabled;
  }

  refreshUi(): void {
    mustExist(this._options.$enabled).prop("checked", this._options.enabled);
  }
}
