<template>
  <div
    role="application"
    aria-label="Sketch color picker"
    class="vc-sketch"
    id="modals"
    :class="[disableAlpha ? 'vc-sketch__disable-alpha' : '']"
  >
    <div class="vc-sketch-saturation-wrap">
      <Saturation :value="colors" @change="childChange" />
    </div>
    <div class="vc-sketch-controls">
      <!--      <button class="vc-controls-picker">-->
      <!--        <BaseIcon icon="canvas/panel/styles/color-picker/picker" />-->
      <!--      </button>-->
      <div class="vc-sketch-sliders">
        <div class="vc-sketch-hue-wrap">
          <Hue :value="colors" @change="childChange" />
        </div>
        <div v-if="!disableAlpha" class="vc-sketch-alpha-wrap">
          <Alpha :value="colors" @change="childChange" />
        </div>
      </div>
      <!--      <div class="vc-sketch-color-wrap">-->
      <!--        <div-->
      <!--          :aria-label="`Current color is ${activeColor}`"-->
      <!--          class="vc-sketch-active-color"-->
      <!--          :style="{ background: activeColor }"-->
      <!--        />-->
      <!--        <Checkboard />-->
      <!--      </div>-->
    </div>
    <div v-if="!disableFields" class="vc-sketch-field">
      <!-- rgba -->
      <div class="vc-sketch-field--double">
        <EdIn label="hex" :value="hex" @change="inputChange" />
      </div>
      <div class="vc-sketch-field--single">
        <EdIn label="r" :value="colors.rgba.r" @change="inputChange" />
      </div>
      <div class="vc-sketch-field--single">
        <EdIn label="g" :value="colors.rgba.g" @change="inputChange" />
      </div>
      <div class="vc-sketch-field--single">
        <EdIn label="b" :value="colors.rgba.b" @change="inputChange" />
      </div>
      <div v-if="!disableAlpha" class="vc-sketch-field--single">
        <EdIn
          label="a"
          :value="colors.a.toFixed(1)"
          :arrow-offset="0.1"
          :max="1"
          @change="inputChange"
        />
      </div>
    </div>
    <div class="saved__colors">
      <h6>Document Colors</h6>
      <div
        class="vc-sketch-presets"
        role="group"
        aria-label="A color preset, pick one to set as current color"
      >
        <template v-for="c in savedColors">
          <div
            v-if="!isTransparent(c)"
            :key="`!${c}`"
            class="vc-sketch-presets-color"
            :aria-label="`Color:${c}`"
            :style="{ background: c }"
            @click="handlePreset(c)"
          />
          <div
            v-else
            :key="c"
            :aria-label="`Color:${c}`"
            class="vc-sketch-presets-color"
            @click="handlePreset(c)"
          >
            <Checkboard />
          </div>
        </template>
        <button @click="addColor" class="add__color">
          <BaseIcon icon="canvas/panel/styles/color-picker/add" />
        </button>
      </div>
    </div>

    <!--    <div class="vc-add__color__picker">-->
    <!--      <div class="vc-add__color__picker__content">-->
    <!--        <h6>Add color</h6>-->
    <!--        <p>-->
    <!--          Create a new color swatch from current color. All instances of this-->
    <!--          color will update automatically if you edit it in the future-->
    <!--        </p>-->
    <!--      </div>-->
    <!--      <form class="vc-add__color__picker__form">-->
    <!--        <input class="canvas__input__text" />-->
    <!--        <button class="vc-add__color__picker__form__submit">Create</button>-->
    <!--        <button-->
    <!--          @click="$emit('cancel')"-->
    <!--          class="vc-add__color__picker__form__cancel"-->
    <!--        >-->
    <!--          Cancel-->
    <!--        </button>-->
    <!--      </form>-->
    <!--    </div>-->
  </div>
</template>

<script>
// import colorMixin from "@ckpack/vue-color/src/mixin/color";
import colorMixin from "@/packages/@ckpack/vue-color/src/mixin/color";
import editableInput from "@/packages/@ckpack/vue-color/src/components/editable-input";
import saturation from "@/packages/@ckpack/vue-color/src/components/saturation";
import hue from "@/packages/@ckpack/vue-color/src/components/hue";
import alpha from "@/packages/@ckpack/vue-color/src/components/alpha";
import checkboard from "@/packages/@ckpack/vue-color/src/components/checkboard";
import BaseIcon from "@/components/icon/BaseIcon";
import store from "@/store";

const presetColors = [
  "#FFFFFF",
  "#1E1F26",
  // "#F8E71C",
  // "#8B572A",
  // "#7ED321",
  // "#417505",
  // "#BD10E0",
  // "#9013FE",
  // "#4A90E2",
  // "#50E3C2",
  // "#B8E986",
  // "#000000",
  // "#4A4A4A",
  // "#9B9B9B",
  // "#FFFFFF",
  // "rgba(0,0,0,0)",
];

export default {
  name: "BaseColorPicker",
  components: {
    BaseIcon,
    Saturation: saturation,
    Hue: hue,
    Alpha: alpha,
    EdIn: editableInput,
    Checkboard: checkboard,
  },
  mixins: [colorMixin],
  props: {
    presetColors: {
      type: Array,
      default() {
        return presetColors;
      },
    },
    disableAlpha: {
      type: Boolean,
      default: false,
    },
    disableFields: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    hex() {
      let hex;
      if (this.colors.a < 1) hex = this.colors.hex8;
      else hex = this.colors.hex;

      return hex.replace("#", "");
    },
    activeColor() {
      const { rgba } = this.colors;
      return `rgba(${[rgba.r, rgba.g, rgba.b, rgba.a].join(",")})`;
    },
    savedColors() {
      const saved = store.getters["canvas/savedColors"];
      return presetColors.concat(saved);
    },
  },
  methods: {
    handlePreset(c) {
      this.colorChange(c);
    },
    childChange(data) {
      this.colorChange(data);
    },
    inputChange(data) {
      if (!data) return;
      if (data.hex) {
        this.isValidHex(data.hex) &&
          this.colorChange({
            hex: data.hex,
            source: "hex",
          });
      } else if (data.r || data.g || data.b || data.a !== undefined) {
        this.colorChange({
          r: data.r || this.colors.rgba.r,
          g: data.g || this.colors.rgba.g,
          b: data.b || this.colors.rgba.b,
          a: data.a !== undefined ? data.a : this.colors.rgba.a,
          source: "rgba",
        });
      }
    },
    addColor() {
      const saved = store.getters["canvas/savedColors"];
      if (saved.includes(this.colors.hex8)) return;
      saved.push(this.colors.hex8);
      store.commit("canvas/SET_SAVED_COLORS", saved);
    },
  },
};
</script>

<style>
.vc-sketch {
  width: 231px !important;
  position: relative;
  /*width: 200px;*/
  padding: 10px 10px 0;
  box-sizing: initial;
  background: #454856;
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.15);
}

.vc-sketch-saturation-wrap {
  width: 100%;
  padding-bottom: 75%;
  position: relative;
  overflow: hidden;
}

.vc-sketch-controls {
  margin-top: 4px;
  display: flex;
}

.vc-sketch-sliders {
  padding: 4px 0;
  flex: 1;
}

.vc-sketch-sliders .vc-hue,
.vc-sketch-sliders .vc-alpha-gradient {
  border-radius: 2px;
}

.vc-sketch-hue-wrap {
  position: relative;
  height: 10px;
}

.vc-sketch-alpha-wrap {
  position: relative;
  height: 10px;
  margin-top: 4px;
  overflow: hidden;
}

.vc-sketch-color-wrap {
  width: 24px;
  height: 24px;
  position: relative;
  margin-top: 4px;
  margin-left: 4px;
  border-radius: 3px;
}

.vc-sketch-active-color {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15),
    inset 0 0 4px rgba(0, 0, 0, 0.25);
  z-index: 2;
}

.vc-sketch-color-wrap .vc-checkerboard {
  background-size: auto;
}

.vc-sketch-field {
  display: flex;
  padding-top: 4px;
}

.vc-sketch-field .vc-input__input {
  width: 90%;
  padding: 4px 0 3px 10%;
  border: none;
  box-shadow: inset 0 0 0 1px #ccc;
  font-size: 10px;
}

/*.vc-sketch-field .vc-input__label {*/
/*  display: block;*/
/*  text-align: center;*/
/*  font-size: 11px;*/
/*  color: #222;*/
/*  padding-top: 3px;*/
/*  padding-bottom: 4px;*/
/*  text-transform: capitalize;*/
/*}*/

.vc-sketch-field--single {
  flex: 1;
  padding-left: 6px;
}

.vc-sketch-field--double {
  flex: 2;
}

.vc-sketch-presets {
  margin-right: -10px;
  margin-left: -10px;
  padding-left: 10px;
  padding-top: 10px;
  /*border-top: 1px solid #eee;*/
}

.vc-sketch-presets-color {
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  display: inline-block;
  /*margin: 0 10px 10px 0;*/
  vertical-align: top;
  cursor: pointer;
  /*width: 16px;*/
  /*height: 16px;*/
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
}

.vc-sketch-presets-color .vc-checkerboard {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.vc-sketch__disable-alpha .vc-sketch-color-wrap {
  height: 10px;
}
</style>
