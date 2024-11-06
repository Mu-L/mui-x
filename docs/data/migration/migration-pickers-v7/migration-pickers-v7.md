---
productId: x-date-pickers
---

# Migration from v7 to v8

<p class="description">This guide describes the changes needed to migrate the Date and Time Pickers from v7 to v8.</p>

## Introduction

This is a reference guide for upgrading `@mui/x-date-pickers` from v7 to v8.

## Start using the new release

In `package.json`, change the version of the date pickers package to `next`.

```diff
-"@mui/x-date-pickers": "7.x.x",
+"@mui/x-date-pickers": "next",
```

Using `next` ensures that it will always use the latest v8 pre-release version, but you can also use a fixed version, like `8.0.0-alpha.0`.

Since `v8` is a major release, it contains changes that affect the public API.
These changes were done for consistency, improved stability and to make room for new features.
Described below are the steps needed to migrate from v7 to v8.

## Run codemods

The `preset-safe` codemod will automatically adjust the bulk of your code to account for breaking changes in v8. You can run `v8.0.0/pickers/preset-safe` targeting only Date and Time Pickers or `v8.0.0/preset-safe` to target the other packages as well.

You can either run it on a specific file, folder, or your entire codebase when choosing the `<path>` argument.

<!-- #default-branch-switch -->

```bash
// Date and Time Pickers specific
npx @mui/x-codemod@latest v8.0.0/pickers/preset-safe <path>

// Target the other packages as well
npx @mui/x-codemod@latest v8.0.0/preset-safe <path>
```

:::info
If you want to run the transformers one by one, check out the transformers included in the [preset-safe codemod for pickers](https://github.com/mui/mui-x/blob/HEAD/packages/x-codemod/README.md#preset-safe-for-pickers-v800) for more details.
:::

Breaking changes that are handled by this codemod are denoted by a ✅ emoji in the table of contents on the right side of the screen.

If you have already applied the `v8.0.0/pickers/preset-safe` (or `v8.0.0/preset-safe`) codemod, then you should not need to take any further action on these items.

All other changes must be handled manually.

:::warning
Not all use cases are covered by codemods. In some scenarios, like props spreading, cross-file dependencies, etc., the changes are not properly identified and therefore must be handled manually.

For example, if a codemod tries to rename a prop, but this prop is hidden with the spread operator, it won't be transformed as expected.

```tsx
<DatePicker {...pickerProps} />
```

After running the codemods, make sure to test your application and that you don't have any console errors.

Feel free to [open an issue](https://github.com/mui/mui-x/issues/new/choose) for support if you need help to proceed with your migration.
:::

## New DOM structure for the field

Before version `v8.x`, the fields' DOM structure consisted of an `<input />`, which held the whole value for the component,
but unfortunately presents a few limitations in terms of accessibility when managing multiple section values.

Starting with version `v8.x`, all the field and picker components come with a new DOM structure that allows the field component to set aria attributes on individual sections, providing a far better experience with screen readers.

### Fallback to the non-accessible DOM structure

```tsx
<DateField enableAccessibleFieldDOMStructure={false} />
<DatePicker enableAccessibleFieldDOMStructure={false} />
<DateRangePicker enableAccessibleFieldDOMStructure={false} />
```

### Migrate `slotProps.field`

When using `slotProps.field` to pass props to your field component,
the field consumes some props (e.g: `shouldRespectLeadingZeros`) and forwards the rest to the `TextField`.

- For the props consumed by the field, the behavior should remain exactly the same with both DOM structures.

  Both components below will respect the leading zeroes on digit sections:

  ```js
  <DatePicker
    slotProps={{ field: { shouldRespectLeadingZeros: true } }}
    enableAccessibleFieldDOMStructure={false}
   />
  <DatePicker
    slotProps={{ field: { shouldRespectLeadingZeros: true } }}
  />
  ```

- For the props forwarded to the `TextField`,
  you can have a look at the next section to see how the migration impact them.

  Both components below will render a small size UI:

  ```js
  <DatePicker
    slotProps={{ field: { size: 'small' } }}
    enableAccessibleFieldDOMStructure={false}
   />
  <DatePicker
    slotProps={{ field: { size: 'small' } }}
  />
  ```

### Migrate `slotProps.textField`

If you are passing props to `slotProps.textField`,
these props will now be received by `PickersTextField` and should keep working the same way as before.

Both components below will render a small size UI:

```js
<DatePicker
  slotProps={{ textField: { size: 'small' } }}
  enableAccessibleFieldDOMStructure={false}
/>
<DatePicker
  slotProps={{ textField: { size: 'small' } }}
/>
```

:::info
If you are passing `inputProps` to `slotProps.textField`,
these props will now be passed to the hidden `<input />` element.
:::

### Migrate `slots.field`

If you are passing a custom field component to your pickers, you need to create a new one that is using the accessible DOM structure.
This new component will need to use the `PickersSectionList` component instead of an `<input />` HTML element.

You can have a look at the [Using a custom input](/x/react-date-pickers/custom-field/#using-a-custom-input) to have a concrete example.

:::info
If your custom field was used to create a Joy UI design component,
you may want to wait a few weeks for the release of an out-of-the-box Joy `PickersTextField` component instead of implementing it yourself.
:::

### Migrate `slots.textField`

If you are passing a custom `TextField` component to your fields and pickers,
you need to create a new one that is using the accessible DOM structure.

You can have a look at the second demo of the [Wrapping PickersTextField](/x/react-date-pickers/custom-field/#wrapping-pickerstextfield) to have a concrete example.

:::info
If your custom `TextField` was used to apply a totally different input that did not use `@mui/material/TextField`,
please consider having a look at the [Using a custom input](/x/react-date-pickers/custom-field/#using-a-custom-input) section which uses `slots.field`.
This approach can be more appropriate for deeper changes.
:::

### Migrate the theme

If you are using the theme to customize `MuiTextField`,
you need to pass the same config to `MuiPickersTextField`:

```js
const theme = createTheme({
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiInputLabel-outlined.Mui-focused': {
            color: 'red',
          },
        },
      },
    },
    MuiPickersTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiInputLabel-outlined.Mui-focused': {
            color: 'red',
          },
        },
      },
    },
  },
});
```

If you are using the theme to customize `MuiInput`, `MuiOutlinedInput` or `MuiFilledInput`,
you need to pass the same config to `MuiPickersInput`, `MuiPickersOutlinedInput` or `MuiPickersFilledInput`:

```js
const theme = createTheme({
  components: {
    // Replace with `MuiOutlinedInput` or `MuiFilledInput` if needed
    MuiInput: {
      defaultProps: {
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          color: 'red',
        },
      },
    },
    // Replace with `MuiPickersOutlinedInput` or `MuiPickersFilledInput` if needed
    MuiPickersInput: {
      defaultProps: {
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          color: 'red',
        },
      },
    },
  },
});
```

If you are using the theme to customize `MuiInputBase`,
you need to pass the same config to `MuiPickersInputBase`:

```js
const theme = createTheme({
  components: {
    MuiInputBase: {
      defaultProps: {
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          color: 'red',
        },
      },
    },
    MuiPickersInputBase: {
      defaultProps: {
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          color: 'red',
        },
      },
    },
  },
});
```

## Renamed variables

The following variables were renamed to have a coherent `Picker` / `Pickers` prefix:

- `usePickersTranslation`

  ```diff
  - import { usePickersTranslation } from '@mui/x-date-pickers/hooks';
  - import { usePickersTranslation } from '@mui/x-date-pickers';
  - import { usePickersTranslation } from '@mui/x-date-pickers-pro';

  + import { usePickerTranslation } from '@mui/x-date-pickers/hooks';
  + import { usePickerTranslation } from '@mui/x-date-pickers';
  + import { usePickerTranslation } from '@mui/x-date-pickers-pro';

  - const translations = usePickersTranslation();
  + const translations = usePickerTranslation();
  ```

  - `usePickersContext`

  ```diff
  - import { usePickersContext } from '@mui/x-date-pickers/hooks';
  - import { usePickersContext } from '@mui/x-date-pickers';
  - import { usePickersContext } from '@mui/x-date-pickers-pro';

  + import { usePickerContext } from '@mui/x-date-pickers/hooks';
  + import { usePickerContext } from '@mui/x-date-pickers';
  + import { usePickerContext } from '@mui/x-date-pickers-pro';

  - const pickersContext = usePickersContext();
  + const pickerContext = usePickerContext();
  ```

## Removed types

The following types are no longer exported by `@mui/x-date-pickers` and/or `@mui/x-date-pickers-pro`.
If you were using them, you need to replace them with the following code:

- `UseDateFieldComponentProps`

  ```ts
  import { UseDateFieldProps } from '@mui/x-date-pickers/DateField';
  import { PickerValidDate } from '@mui/x-date-pickers/models';

  type UseDateFieldComponentProps<
    TDate extends PickerValidDate,
    TEnableAccessibleFieldDOMStructure extends boolean,
    TChildProps extends {},
  > = Omit<
    TChildProps,
    keyof UseDateFieldProps<TDate, TEnableAccessibleFieldDOMStructure>
  > &
    UseDateFieldProps<TDate, TEnableAccessibleFieldDOMStructure>;
  ```

- `UseTimeFieldComponentProps`

  ```ts
  import { UseTimeFieldProps } from '@mui/x-date-pickers/TimeField';
  import { PickerValidDate } from '@mui/x-date-pickers/models';

  type UseTimeFieldComponentProps<
    TDate extends PickerValidDate,
    TEnableAccessibleFieldDOMStructure extends boolean,
    TChildProps extends {},
  > = Omit<
    TChildProps,
    keyof UseTimeFieldProps<TDate, TEnableAccessibleFieldDOMStructure>
  > &
    UseTimeFieldProps<TDate, TEnableAccessibleFieldDOMStructure>;
  ```

- `UseDateTimeFieldComponentProps`

  ```ts
  import { UseDateTimeFieldProps } from '@mui/x-date-pickers/DateTimeField';
  import { PickerValidDate } from '@mui/x-date-pickers/models';

  type UseDateTimeFieldComponentProps<
    TDate extends PickerValidDate,
    TEnableAccessibleFieldDOMStructure extends boolean,
    TChildProps extends {},
  > = Omit<
    TChildProps,
    keyof UseDateTimeFieldProps<TDate, TEnableAccessibleFieldDOMStructure>
  > &
    UseDateTimeFieldProps<TDate, TEnableAccessibleFieldDOMStructure>;
  ```

## Stop passing `utils` and the date object to some translation keys

Some translation keys no longer require `utils` and the date object as parameters, but only the formatted value as a string. The keys affected by this changes are: `clockLabelText`, `openDatePickerDialogue` and `openTimePickerDialogue`.
If you have customized those translation keys, you have to update them following the examples below:

- If you are setting a custom value in a picker component:

```diff
-clockLabelText: (view, time, utils) =>
-   `Select ${view}. ${
-     time === null || !utils.isValid(time)
-       ? 'No time selected'
-       : `Selected time is ${utils.format(time, 'fullTime')}`
-   }`
+clockLabelText: (view, formattedTime) =>
+   `Select ${view}. ${
+     formattedTime == null ? 'No time selected' : `Selected time is ${formattedTime}`
+   }`

-openDatePickerDialogue: (value, utils) =>
-  value !== null && utils.isValid(value)
-    ? `Choose date, selected date is ${utils.format(value, 'fullDate')}`
-    : 'Choose date',
+openDatePickerDialogue: (formattedDate) =>
+  formattedDate ? `Choose date, selected date is ${formattedDate}` : 'Choose date'

-openTimePickerDialogue: (value, utils) =>
-  value !== null && utils.isValid(value)
-    ? `Choose time, selected time is ${utils.format(value, 'fullTime')}`
-    : 'Choose time',
+openTimePickerDialogue: (formattedTime) =>
+  formattedTime ? `Choose time, selected time is ${formattedTime}` : 'Choose time'
```

- If you are setting a custom value in the `LocalizationProvider`:

```diff
 <LocalizationProvider localeText={{
-   clockLabelText: (view, time, utils) =>
-     `Select ${view}. ${
-       time === null || !utils.isValid(time)
-         ? 'No time selected'
-         : `Selected time is ${utils.format(time, 'fullTime')}`
-     }`
+   clockLabelText: (view, formattedTime) =>
+     `Select ${view}. ${
+       formattedTime == null ? 'No time selected' : `Selected time is ${formattedTime}`
+     }`
-   openDatePickerDialogue: (value, utils) =>
-     value !== null && utils.isValid(value)
-      ? `Choose date, selected date is ${utils.format(value, 'fullDate')}`
-      : 'Choose date',
+   openDatePickerDialogue: (formattedDate) =>
+     formattedDate ? `Choose date, selected date is ${formattedDate}` : 'Choose date'
-   openTimePickerDialogue: (value, utils) =>
-     value !== null && utils.isValid(value)
-       ? `Choose time, selected time is ${utils.format(value, 'fullTime')}`
-       : 'Choose time',
+   openTimePickerDialogue: (formattedTime) =>
+     formattedTime ? `Choose time, selected time is ${formattedTime}` : 'Choose time'
 }} >
```

- If you using this translation key in a custom component:

```diff
 const translations = usePickerTranslations();

-const clockLabelText = translations.clockLabelText(
-  view,
-  value,
-  {} as any,
-  value == null ? null : value.format('hh:mm:ss')
-);
+const clockLabelText = translations.clockLabelText(
+  view,
+  value == null ? null : value.format('hh:mm:ss')
+);

-const openDatePickerDialogue = translations.openDatePickerDialogue(
-  value,
-  {} as any,
-  value == null ? null : value.format('MM/DD/YYY')
-);
+const openDatePickerDialogue = translations.openDatePickerDialogue(
+  value == null ? null : value.format('MM/DD/YYY')
+);

-const openTimePickerDialogue = translations.openTimePickerDialogue(
-  value,
-  {} as any,
-  value == null ? null : value.format('hh:mm:ss')
-);
+const openTimePickerDialogue = translations.openTimePickerDialogue(
+  value == null ? null : value.format('hh:mm:ss')
+);
```

Also the following types and interfaces no longer receive a generic type parameter:

- `PickersComponentAgnosticLocaleText`
- `PickersInputComponentLocaleText`
- `PickersInputLocaleText`
- `PickersLocaleText`
- `PickersTranslationKeys`