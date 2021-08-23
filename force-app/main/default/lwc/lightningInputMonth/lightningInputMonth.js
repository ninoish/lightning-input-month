import { LightningElement, api } from "lwc";
import FORM_FACTOR from "@salesforce/client/formFactor";

export default class LightningInputMonth extends LightningElement {
  @api
  value = "";
  @api
  label = "";
  @api
  isRequired = false;
  @api
  disabled;
  @api
  readonly;
  @api
  placeholder = "";
  @api
  variant = "label-stacked";
  @api
  monthStyle = "long";
  @api
  name;

  // TODO: Auto detect
  @api
  locale;

  @api
  min;
  @api
  max;

  year = "";
  month = "";
  _value = "";

  inputtedValue = "";

  get displayValue() {
    if (this.inputtedValue) {
      return this.inputtedValue;
    }
    const [y, m] = this.value.split("-");
    if (!y || !m) {
      return "";
    }
    return `${y}年${m}月`;
  }

  isCalendarOpen = false;

  // todo: validate on blur
  // locale detection
  // input or calendar select (desktop)
  // use device input ui when mobile.

  inputId;

  // Todo : lang & locale
  monthes = [];
  years = [];

  connectedCallback() {
    // todo
    this.inputId = "generaterandomchars";

    this.monthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
      return {
        label: `${m}月`,
        value: `${this.leftPad(m, 2)}`,
        variant: "neutral"
      };
    });

    const today = new Date();
    const thisYear = today.getFullYear();

    // todo: apply min & max (yyyy-mm format input)
    const startYear = thisYear - 100;
    for (let i = startYear; i < startYear + 200; i++) {
      this.years.push({
        value: i,
        selected: false
      });
    }

    console.log("value", this.value);

    // has assigned value?
    if (!this.hasValidValue()) {
      // set default year as todays
      this.year = thisYear;
    } else {
      const [vy, vm] = this.value.split("-");
      console.log(vy, vm);
      if (vy && parseInt(vy, 10)) {
        this.year = parseInt(vy, 10);
      } else {
        this.year = thisYear;
      }

      // todo preset month with vm
      if (vm) {
        this.month = vm;
        this.monthes.forEach((m) => {
          m.variant =
            parseInt(m.value, 10) === parseInt(vm, 10) ? "brand" : "neutral";
        });
      }
    }

    this.years.forEach((y) => {
      y.selected = y.value === this.year;
    });

    this.inputtedValue = "";
    this._value = this.value;
  }

  renderedCallback() {
    console.log("rendered", this.value);
    if (this.value !== this._value) {
      console.log("upd ui");
      this.reflectValueToUi();
    }
  }

  reflectValueToUi() {
    if (!this.hasValidValue()) {
      return;
    }
    console.log(this.value);
    const [vy, vm] = this.value.split("-");
    this.year = parseInt(vy, 10);
    this.month = parseInt(vm, 10);
    console.log(this.year, this.month);

    this.years.forEach((y) => {
      y.selected = y.value === this.year;
    });
    this.monthes.forEach((m) => {
      m.variant =
        parseInt(m.value, 10) === parseInt(this.month, 10)
          ? "brand"
          : "neutral";
    });

    this._value = this.value;
  }

  get isDesktop() {
    return FORM_FACTOR === "Large";
  }

  get _variant() {
    switch (this.variant) {
      case "label-hidden":
      case "label-inline":
        return this.variant;
      default:
        return "label-stacked";
    }
  }

  get isLabelHidden() {
    return this._variant === "label-hidden";
  }

  hasValidValue() {
    console.log("isvalid?", !!this.value);
    return !!this.value;
  }

  leftPad(v, d) {
    const vs = "" + v;
    if (vs.length >= d) {
      return vs;
    }
    let zeros = "";
    for (let i = 0; i < d - vs.length; i++) {
      zeros += "0";
    }
    return zeros + vs;
  }

  onClickMonth(e) {
    const m = e.currentTarget.dataset.value;
    this.month = m;
    this.inputtedValue = "";
    this.isCalendarOpen = false;
    this.notifyValueChange();
  }
  onChangeYear(e) {
    this.year = e.currentTarget.value;
    this.inputtedValue = "";
    if (this.month) {
      this.notifyValueChange();
    }
  }
  onFocusInput(e) {
    this.isCalendarOpen = true;
  }
  onChangeInput(e) {
    this.inputtedValue = e.currentTarget.value;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: e.currentTarget.value
      })
    );
    if (this.inputtedValue === "") {
      this.isCalendarOpen = false;
    }
  }

  notifyValueChange() {
    const v = this.year && this.month ? `${this.year}-${this.month}` : null;
    console.log(v);
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: v
      })
    );
  }
}
