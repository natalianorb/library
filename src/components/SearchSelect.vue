<template>
  <div :class="['search-select', { open: isOpen && hasSuggesstions }]">
    <label>
      <span>{{ label }}</span>
      <input
        :placeholder="placeholder"
        :value="searchingValue"
        @blur="onBlur"
        @focus="onFocus"
        @input="onInput"
        @change="onChange"
        class="search-select__input"
      />
    </label>
    <button
      :class="{ 'search-select__clear': true, visible: searchingValue }"
      @click="onClear"
      type="button">
    </button>
    <div
      @blur="closeDropdown"
      @scroll="isScrolling = true"
      :class="['search-select__dropdown', { visible: isOpen && hasSuggesstions }]"
      tabindex="0"
    >
      <div
        :class="['search-select__item']"
        :key="i"
        @mousedown="select(option)"
        v-for="(option, i) in filteredOptions"
      >
        <slot :option="option">
          {{ option }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
function deepFind(obj, path) {
  const paths = path.split('.');
  let current = obj;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < paths.length; ++i) {
    if (!current[paths[i]]) {
      return current[paths[i]];
    }
    current = current[paths[i]];
  }
  return current;
}

export default {
  model: {
    prop: 'searchingValue',
    event: 'input',
  },
  props: {
    label: {
      type: String,
      default: '',
    },
    searchingValue: {
      type: String,
      default: '',
    },
    searchingProp: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    required: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    maxLength: {
      type: Number,
      default: 255,
    },
  },
  data() {
    return {
      isScrolling: false,
      isOpen: false,
      rules: {
        maxLength: value => !value || (value.length <= this.maxLength),
      },
      selected: null,
      isFocused: false,
    };
  },
  computed: {
    filteredOptions() {
      if (!this.searchingValue || !this.options) {
        return [];
      }
      const searchString = this.searchingValue.trim()
        .toLowerCase();
      if (this.searchingProp) {
        return this.options
          .filter(option => deepFind(option, this.searchingProp)
            .toLowerCase()
            .includes(searchString));
      }

      return this.options.filter(option => option.toLowerCase()
        .includes(searchString));
    },
    hasSuggesstions() {
      return this.filteredOptions && this.filteredOptions.length;
    },
  },
  methods: {
    closeDropdown() {
      this.isOpen = false;
      this.isScrolling = false;
    },
    onBlur(event) {
      this.validate(event.target.value);
      this.$emit('blur', event);
      setTimeout(() => {
        if (!this.isScrolling) {
          this.closeDropdown();
        }
      }, 50);
    },
    onClear() {
      this.$emit('input', '');
    },
    onChange(e) {
      this.$emit('change', e.target.value);
      this.closeDropdown();
    },
    onFocus() {
      this.$emit('focus');
      this.showDropdown();
    },
    onInput(e) {
      const { value } = e.target;
      this.isOpen = true;
      this.validate(value);
      this.$emit('input', value);
    },
    select(option) {
      this.closeDropdown();
      this.$emit('select', option);
    },
    validate(value) {
      if (this.required && !value) {
        this.$emit('error', 'Необходимо заполнить все обязательные поля');
        return false;
      }
      if (!this.rules.maxLength(value)) {
        this.$emit('error', 'Слишком длинный текст');
        return false;
      }
      this.$emit('error', '');
      return true;
    },
    showDropdown() {
      if (this.searchingValue && this.filteredOptions.length) {
        this.isOpen = true;
      }
    },
  },
};
</script>

<style lang="less">
  .search-select {
    position: relative;

    &__input {
      width: 100%;
      height: 44px;
      padding: 12px 42px 12px 12px;
      border: none;
      font-size: 17px;
    }
    &__clear {
      position: absolute;
      display: none;
      top: 10px;
      right: 10px;
      width: 20px;
      height: 20px;
      background: url('../assets/images/close.svg') center no-repeat transparent;
      border: none;

      &.visible {
        display: block;
      }
    }
    &__dropdown {
      display: none;
      position: absolute;
      padding: 6px 0;
      top: 100%;
      left: 0;
      width: 100%;
      max-height: 220px;
      overflow-y: auto;
      background: #fff;
      z-index: 1000000;
      border: 1px solid #7D8888;
      border-top: none;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      &.visible {
        display: block;
      }
    }
    &__item {
      padding: 10px 12px;
      cursor: pointer;
      text-align: left;
      background: #fff;
      font-size: 15px;
      line-height: 20px;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: #4B5959;
      transition: background-color 0.4s 0s;

      &:hover {
        background: #ddd;
      }
    }
    &.open {
      .search-select__input {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom-color: #E0E4E7;
      }
    }
  }
</style>
